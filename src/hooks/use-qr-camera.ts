'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

export type CameraState      = 'idle' | 'starting' | 'running' | 'denied' | 'error';
export type CameraErrorReason =
  | 'insecure-context'
  | 'no-mediadevices'
  | 'no-camera'
  | 'in-use'
  | 'overconstrained'
  | 'unknown';

type TorchConstraint   = MediaTrackConstraintSet & { torch?: boolean };
type TorchCapabilities = MediaTrackCapabilities  & { torch?: boolean };

const SCAN_INTERVAL_MS  = 100;   // 10 fps
const TOKEN_COOLDOWN_MS = 3000;  // anti-double-scan sur le même token

interface UseQRCameraOptions {
  enabled:      boolean;
  onCodeScanned: (token: string) => void;
  /** bloque le scan si `true` (ex: requête en cours) */
  isPaused?: boolean;
}

export function useQRCamera({ enabled, onCodeScanned, isPaused = false }: UseQRCameraOptions) {
  const [cameraState, setCamera] = useState<CameraState>('idle');
  const [cameraError, setCameraErr] = useState<{ reason: CameraErrorReason; detail: string } | null>(null);
  const [torchOn,        setTorchOn] = useState(false);
  const [torchAvailable, setTorchA]  = useState(false);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const recentToken = useRef<{ token: string; at: number } | null>(null);

  const startCamera = useCallback(async () => {
    setCamera('starting');
    setCameraErr(null);

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraErr({ reason: 'insecure-context', detail: `Origine non sécurisée (${window.location.origin}). getUserMedia exige HTTPS hors localhost.` });
      setCamera('error');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErr({ reason: 'no-mediadevices', detail: 'navigator.mediaDevices.getUserMedia indisponible dans ce navigateur.' });
      setCamera('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
      const video  = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        setCameraErr({ reason: 'unknown', detail: 'videoRef non monté au moment du démarrage.' });
        setCamera('error');
        return;
      }
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const caps  = track.getCapabilities() as TorchCapabilities;
      setTorchA(Boolean(caps.torch));
      setCamera('running');
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCamera('denied');
        setCameraErr({ reason: 'unknown', detail: `${e.name}: ${e.message}` });
        return;
      }
      let reason: CameraErrorReason = 'unknown';
      if (e.name === 'NotFoundError'           || e.name === 'DevicesNotFoundError')      reason = 'no-camera';
      else if (e.name === 'NotReadableError'   || e.name === 'TrackStartError')           reason = 'in-use';
      else if (e.name === 'OverconstrainedError'|| e.name === 'ConstraintNotSatisfiedError') reason = 'overconstrained';
      setCameraErr({ reason, detail: `${e.name}: ${e.message}` });
      setCamera('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    setTorchOn(false);
    setTorchA(false);
  }, []);

  const toggleTorch = useCallback(async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track  = stream?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraint] });
      setTorchOn(next);
    } catch {
      setTorchA(false);
    }
  }, [torchOn]);

  // Démarrer/arrêter selon `enabled`
  useEffect(() => {
    if (enabled) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [enabled, startCamera, stopCamera]);

  // Boucle de scan à 10 fps
  useEffect(() => {
    if (cameraState !== 'running' || !enabled || isPaused) return;

    const id = setInterval(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
      if (!code?.data) return;

      const now    = Date.now();
      const recent = recentToken.current;
      if (recent && recent.token === code.data && now - recent.at < TOKEN_COOLDOWN_MS) return;
      recentToken.current = { token: code.data, at: now };

      onCodeScanned(code.data);
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(id);
  }, [cameraState, enabled, isPaused, onCodeScanned]);

  return {
    videoRef, canvasRef,
    cameraState, cameraError,
    torchOn, torchAvailable, toggleTorch,
    retry: startCamera,
  };
}
