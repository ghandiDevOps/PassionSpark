"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import jsQR from "jsqr";
import { feedbackSuccess, feedbackError, feedbackWarning } from "@/lib/feedback";
import { useBookingsRealtime } from "@/hooks/use-bookings-realtime";

type Booking = {
  id:               string;
  qrToken:          string;
  participantName:  string;
  participantEmail: string;
  status:           "confirmed" | "attended";
  scannedAt:        string | null;
};

type ApiOk = {
  success:         true;
  participantName: string;
  scannedAt:       string;
};
type ApiErr = {
  error:           string;
  code?:           "INVALID_TOKEN" | "WRONG_SESSION" | "ALREADY_SCANNED" | "NOT_CONFIRMED";
  scannedAt?:      string;
  participantName?: string;
};

type ScanResult =
  | { kind: "success"; participantName: string }
  | { kind: "warning"; title: string; subtitle?: string }
  | { kind: "error";   title: string; subtitle?: string };

type CameraState = "idle" | "starting" | "running" | "denied" | "error";
type CameraErrorReason =
  | "insecure-context"
  | "no-mediadevices"
  | "no-camera"
  | "in-use"
  | "overconstrained"
  | "unknown";
type Tab = "scan" | "list";

const SCAN_INTERVAL_MS = 100;       // 10 fps â€” divise par 6 la conso vs requestAnimationFrame 60fps
const TOKEN_COOLDOWN_MS = 3000;     // anti-double-scan sur le MÃŠME token
const RESULT_DURATION_MS = 1800;

interface Props {
  sessionId:       string;
  sessionTitle:    string;
  initialBookings: Booking[];
}

// Type augmentÃ© pour la lampe torche (non standard TS DOM)
type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean };
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };

export function ScanClient({ sessionId, sessionTitle, initialBookings }: Props) {
  const [tab, setTab]               = useState<Tab>("scan");
  const [bookings, setBookings]     = useState<Booking[]>(initialBookings);
  const [cameraState, setCamera]    = useState<CameraState>("idle");
  const [cameraError, setCameraErr] = useState<{ reason: CameraErrorReason; detail: string } | null>(null);
  const [result, setResult]         = useState<ScanResult | null>(null);
  const [torchOn, setTorchOn]       = useState(false);
  const [torchAvailable, setTorchA] = useState(false);
  const [pendingId, setPendingId]   = useState<string | null>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const recentToken = useRef<{ token: string; at: number } | null>(null);
  const isPosting   = useRef(false);

  const onBookingUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      const b = payload.new;
      setBookings((prev) => {
        if (prev.some((existing) => existing.id === b.id)) return prev;
        return [...prev, {
          id: b.id,
          qrToken: b.qrToken,
          participantName: b.participantName,
          participantEmail: b.participantEmail,
          status: b.status,
          scannedAt: b.scannedAt
        }].sort((a, b) => {
           if (a.status !== b.status) return a.status === 'confirmed' ? -1 : 1;
           return 0;
        });
      });
    } else if (payload.eventType === 'UPDATE') {
      const b = payload.new;
      setBookings((prev) => prev.map((old) => old.id === b.id ? {
        ...old,
        status: b.status,
        scannedAt: b.scannedAt
      } : old));
    } else if (payload.eventType === 'DELETE') {
      setBookings((prev) => prev.filter((old) => old.id !== payload.old.id));
    }
  }, []);

  useBookingsRealtime(sessionId, onBookingUpdate);

  const total      = bookings.length;
  const validated  = bookings.filter((b) => b.status === "attended").length;

  // â”€â”€â”€ Camera lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startCamera = useCallback(async () => {
    setCamera("starting");
    setCameraErr(null);

    // Contexte sÃ©curisÃ© requis hors localhost (HTTPS obligatoire pour getUserMedia)
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCameraErr({
        reason: "insecure-context",
        detail: `Origine non sÃ©curisÃ©e (${window.location.origin}). getUserMedia exige HTTPS hors localhost.`,
      });
      setCamera("error");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErr({
        reason: "no-mediadevices",
        detail: "navigator.mediaDevices.getUserMedia indisponible dans ce navigateur.",
      });
      setCamera("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        setCameraErr({ reason: "unknown", detail: "videoRef non montÃ© au moment du dÃ©marrage." });
        setCamera("error");
        return;
      }
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const caps  = track.getCapabilities() as TorchCapabilities;
      setTorchA(Boolean(caps.torch));

      setCamera("running");
    } catch (err) {
      const e = err as Error;
      console.error("[scan] startCamera failed:", e.name, e.message, err);
      let reason: CameraErrorReason = "unknown";
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setCamera("denied");
        setCameraErr({ reason: "unknown", detail: `${e.name}: ${e.message}` });
        return;
      }
      if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") reason = "no-camera";
      else if (e.name === "NotReadableError" || e.name === "TrackStartError") reason = "in-use";
      else if (e.name === "OverconstrainedError" || e.name === "ConstraintNotSatisfiedError") reason = "overconstrained";
      setCameraErr({ reason, detail: `${e.name}: ${e.message}` });
      setCamera("error");
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

  useEffect(() => {
    if (tab === "scan") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [tab, startCamera, stopCamera]);

  // â”€â”€â”€ Torche â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Validation API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validateToken = useCallback(async (qrToken: string, fromList = false) => {
    if (isPosting.current) return;
    isPosting.current = true;
    if (fromList) setPendingId(qrToken);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/scan`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qrToken }),
      });
      const data: ApiOk | ApiErr = await res.json();

      if ("success" in data && data.success) {
        feedbackSuccess();
        setResult({ kind: "success", participantName: data.participantName });
        setBookings((prev) =>
          prev.map((b) =>
            b.qrToken === qrToken
              ? { ...b, status: "attended", scannedAt: data.scannedAt }
              : b,
          ),
        );
      } else {
        const err = data as ApiErr;
        if (err.code === "ALREADY_SCANNED") {
          feedbackWarning();
          const time = err.scannedAt ? formatTime(err.scannedAt) : null;
          setResult({
            kind: "warning",
            title: `DÃ©jÃ  scannÃ©${err.participantName ? ` â€” ${err.participantName}` : ""}`,
            subtitle: time ? `ValidÃ© Ã  ${time}` : undefined,
          });
        } else if (err.code === "WRONG_SESSION") {
          feedbackError();
          setResult({ kind: "error", title: "Mauvaise session", subtitle: "Ce QR est pour un autre Ã©vÃ©nement" });
        } else if (err.code === "NOT_CONFIRMED") {
          feedbackError();
          setResult({ kind: "error", title: "RÃ©servation non confirmÃ©e", subtitle: "Paiement en attente" });
        } else {
          feedbackError();
          setResult({ kind: "error", title: "QR code inconnu" });
        }
      }
    } catch {
      feedbackError();
      setResult({ kind: "error", title: "Erreur rÃ©seau", subtitle: "RÃ©essaie" });
    } finally {
      isPosting.current = false;
      setPendingId(null);
      setTimeout(() => setResult(null), RESULT_DURATION_MS);
    }
  }, [sessionId]);

  // â”€â”€â”€ Boucle scan throttlÃ©e Ã  10 fps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (cameraState !== "running" || tab !== "scan") return;

    const id = setInterval(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      if (isPosting.current || result) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (!code?.data) return;

      const now = Date.now();
      const recent = recentToken.current;
      if (recent && recent.token === code.data && now - recent.at < TOKEN_COOLDOWN_MS) return;
      recentToken.current = { token: code.data, at: now };

      validateToken(code.data);
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(id);
  }, [cameraState, tab, result, validateToken]);

  // â”€â”€â”€ Couleurs de fond selon le rÃ©sultat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const bgClass =
    result?.kind === "success" ? "bg-[#10b981]"
    : result?.kind === "warning" ? "bg-[#FFB700]"
    : result?.kind === "error" ? "bg-[#FF3D00]"
    : "bg-black";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200 flex flex-col`}>

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => window.history.back()} className="text-white text-sm font-medium">
          â† Retour
        </button>
        <p className="text-white/90 text-xs font-display-md tracking-widest truncate max-w-[40%]">
          {sessionTitle}
        </p>
        <div className="bg-white/20 text-white text-sm font-display-md px-3 py-1">
          {validated}/{total}
        </div>
      </div>

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="px-4 mb-2 flex gap-2">
        <TabButton active={tab === "scan"} onClick={() => setTab("scan")}>ðŸ“· SCAN</TabButton>
        <TabButton active={tab === "list"} onClick={() => setTab("list")}>ðŸ“‹ LISTE ({total})</TabButton>
      </div>

      {/* â”€â”€ Contenu â”€â”€ */}
      {tab === "scan" ? (
        <ScanView
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraState={cameraState}
          cameraError={cameraError}
          result={result}
          torchAvailable={torchAvailable}
          torchOn={torchOn}
          onToggleTorch={toggleTorch}
          onRetry={startCamera}
        />
      ) : (
        <ListView
          bookings={bookings}
          pendingId={pendingId}
          onMarkPresent={(token) => validateToken(token, true)}
        />
      )}
    </div>
  );
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 font-display-md text-xs tracking-widest py-2 transition-colors ${
        active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

interface ScanViewProps {
  videoRef:       React.RefObject<HTMLVideoElement>;
  canvasRef:      React.RefObject<HTMLCanvasElement>;
  cameraState:    CameraState;
  cameraError:    { reason: CameraErrorReason; detail: string } | null;
  result:         ScanResult | null;
  torchAvailable: boolean;
  torchOn:        boolean;
  onToggleTorch:  () => void;
  onRetry:        () => void;
}

function ScanView({ videoRef, canvasRef, cameraState, cameraError, result, torchAvailable, torchOn, onToggleTorch, onRetry }: ScanViewProps) {
  if (cameraState === "denied" || cameraState === "error") {
    const title =
      cameraState === "denied"               ? "ACCÃˆS CAMÃ‰RA REFUSÃ‰"
      : cameraError?.reason === "insecure-context" ? "HTTPS REQUIS"
      : cameraError?.reason === "no-mediadevices"  ? "NAVIGATEUR INCOMPATIBLE"
      : cameraError?.reason === "no-camera"        ? "AUCUNE CAMÃ‰RA TROUVÃ‰E"
      : cameraError?.reason === "in-use"           ? "CAMÃ‰RA DÃ‰JÃ€ UTILISÃ‰E"
      : cameraError?.reason === "overconstrained"  ? "CONTRAINTE CAMÃ‰RA"
      : "ERREUR CAMÃ‰RA";

    const help =
      cameraState === "denied"
        ? "Autorise la camÃ©ra dans les rÃ©glages du navigateur, puis rÃ©essaie. Tu peux aussi utiliser l'onglet LISTE."
        : cameraError?.reason === "insecure-context"
        ? "Mobile : ouvre le site en HTTPS (ou tunnel ngrok / vercel preview). Sur localhost Ã§a marche."
        : cameraError?.reason === "in-use"
        ? "Une autre app utilise dÃ©jÃ  la camÃ©ra. Ferme-la et rÃ©essaie."
        : cameraError?.reason === "no-camera"
        ? "Aucun appareil camÃ©ra dÃ©tectÃ© sur ce pÃ©riphÃ©rique."
        : "CamÃ©ra inaccessible. Bascule sur l'onglet LISTE pour valider manuellement.";

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <div className="text-6xl">ðŸ“·</div>
        <p className="font-display text-2xl text-white">{title}</p>
        <p className="text-white/70 text-sm">{help}</p>
        {cameraError?.detail && (
          <p className="text-white/40 text-[11px] font-mono break-all max-w-md">{cameraError.detail}</p>
        )}
        <button onClick={onRetry} className="btn-passion px-6 mt-2">RÃ‰ESSAYER</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-4">
          {result.kind === "success" ? "âœ…" : result.kind === "warning" ? "âš ï¸" : "âŒ"}
        </div>
        <p className="text-3xl sm:text-4xl font-display text-white">
          {result.kind === "success" ? `Bienvenue ${result.participantName} !` : result.title}
        </p>
        {"subtitle" in result && result.subtitle && (
          <p className="text-white/80 mt-3 text-base">{result.subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Cadre de visÃ©e */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white" />
        </div>
      </div>

      {/* Toolbar bas */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-6 flex items-center justify-center gap-4">
        {torchAvailable && (
          <button
            type="button"
            onClick={onToggleTorch}
            aria-pressed={torchOn}
            className={`flex items-center gap-2 px-4 py-2 font-display-md text-xs tracking-widest transition-colors ${
              torchOn ? "bg-[#FFB700] text-black" : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {torchOn ? "ðŸ’¡ LAMPE ON" : "ðŸ”¦ LAMPE"}
          </button>
        )}
      </div>

      {cameraState !== "running" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-white text-center px-8 font-display-md text-sm tracking-widest">
            DÃ‰MARRAGE CAMÃ‰RA...
          </p>
        </div>
      )}
    </div>
  );
}

interface ListViewProps {
  bookings:      Booking[];
  pendingId:     string | null;
  onMarkPresent: (qrToken: string) => void;
}

function ListView({ bookings, pendingId, onMarkPresent }: ListViewProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <div className="text-5xl">ðŸ“‹</div>
        <p className="font-display text-xl text-white">AUCUN INSCRIT</p>
        <p className="text-white/70 text-sm">Personne n&apos;a encore rÃ©servÃ© cette session.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {bookings.map((b, i) => {
        const isAttended = b.status === "attended";
        const isPending  = pendingId === b.qrToken;
        return (
          <div
            key={b.id}
            className={`bg-black/40 backdrop-blur-sm border px-4 py-3 flex items-center gap-3 ${
              isAttended ? "border-[#10b981]/40" : "border-white/15"
            }`}
          >
            <span className="font-display text-base text-white/40 w-6 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-display-md truncate">{b.participantName}</p>
              <p className="text-white/50 text-xs truncate">{b.participantEmail}</p>
              {isAttended && b.scannedAt && (
                <p className="text-[#10b981] text-[10px] mt-0.5">âœ“ {formatTime(b.scannedAt)}</p>
              )}
            </div>
            <div className="shrink-0">
              {isAttended ? (
                <span className="font-display-md text-[10px] px-2 py-1.5 bg-[#10b981]/20 text-[#10b981] tracking-widest">
                  PRÃ‰SENT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkPresent(b.qrToken)}
                  disabled={isPending}
                  className="font-display-md text-[10px] tracking-widest px-3 py-1.5 bg-white text-black hover:bg-[#FFB700] transition-colors disabled:opacity-50"
                >
                  {isPending ? "..." : "MARQUER âœ“"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

