'use client';

import { useState, useCallback, useRef } from 'react';
import { feedbackSuccess, feedbackError, feedbackWarning } from '@/lib/feedback';
import { useBookingsRealtime } from '@/hooks/use-bookings-realtime';
import { useQRCamera, type CameraState, type CameraErrorReason } from '@/hooks/use-qr-camera';

// ─── Types ───────────────────────────────────────────────────────────────────

type Booking = {
  id:               string;
  qrToken:          string;
  participantName:  string;
  participantEmail: string;
  status:           'confirmed' | 'attended';
  scannedAt:        string | null;
};

type ScanResult =
  | { kind: 'success'; participantName: string }
  | { kind: 'warning'; title: string; subtitle?: string }
  | { kind: 'error';   title: string; subtitle?: string };

type Tab = 'scan' | 'list';

const RESULT_DURATION_MS = 1800;

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  sessionId:       string;
  sessionTitle:    string;
  initialBookings: Booking[];
}

export function ScanClient({ sessionId, sessionTitle, initialBookings }: Props) {
  const [tab,      setTab]      = useState<Tab>('scan');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const isPosting = useRef(false);

  // ── Realtime bookings ──────────────────────────────────────────────────────
  const onBookingUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      const b = payload.new;
      setBookings((prev) => {
        if (prev.some((e) => e.id === b.id)) return prev;
        return [...prev, { id: b.id, qrToken: b.qrToken, participantName: b.participantName, participantEmail: b.participantEmail, status: b.status, scannedAt: b.scannedAt }]
          .sort((a, b) => (a.status !== b.status ? (a.status === 'confirmed' ? -1 : 1) : 0));
      });
    } else if (payload.eventType === 'UPDATE') {
      setBookings((prev) => prev.map((old) => old.id === payload.new.id ? { ...old, status: payload.new.status, scannedAt: payload.new.scannedAt } : old));
    } else if (payload.eventType === 'DELETE') {
      setBookings((prev) => prev.filter((old) => old.id !== payload.old.id));
    }
  }, []);

  useBookingsRealtime(sessionId, onBookingUpdate);

  // ── Validation API ─────────────────────────────────────────────────────────
  const validateToken = useCallback(async (qrToken: string, fromList = false) => {
    if (isPosting.current) return;
    isPosting.current = true;
    if (fromList) setPendingId(qrToken);

    try {
      const res  = await fetch(`/api/sessions/${sessionId}/scan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ qrToken }),
      });
      const data = await res.json();

      if (data.success) {
        feedbackSuccess();
        setResult({ kind: 'success', participantName: data.participantName });
        setBookings((prev) => prev.map((b) => b.qrToken === qrToken ? { ...b, status: 'attended', scannedAt: data.scannedAt } : b));
      } else {
        if (data.code === 'ALREADY_SCANNED') {
          feedbackWarning();
          setResult({ kind: 'warning', title: `Déjà scanné${data.participantName ? ` — ${data.participantName}` : ''}`, subtitle: data.scannedAt ? `Validé à ${formatTime(data.scannedAt)}` : undefined });
        } else if (data.code === 'WRONG_SESSION') {
          feedbackError();
          setResult({ kind: 'error', title: 'Mauvaise session', subtitle: 'Ce QR est pour un autre événement' });
        } else if (data.code === 'NOT_CONFIRMED') {
          feedbackError();
          setResult({ kind: 'error', title: 'Réservation non confirmée', subtitle: 'Paiement en attente' });
        } else {
          feedbackError();
          setResult({ kind: 'error', title: 'QR code inconnu' });
        }
      }
    } catch {
      feedbackError();
      setResult({ kind: 'error', title: 'Erreur réseau', subtitle: 'Réessaie' });
    } finally {
      isPosting.current = false;
      setPendingId(null);
      setTimeout(() => setResult(null), RESULT_DURATION_MS);
    }
  }, [sessionId]);

  // ── Camera hook ────────────────────────────────────────────────────────────
  const camera = useQRCamera({
    enabled:       tab === 'scan',
    onCodeScanned: (token) => validateToken(token),
    isPaused:      Boolean(result),
  });

  const total     = bookings.length;
  const validated = bookings.filter((b) => b.status === 'attended').length;

  const bgClass =
    result?.kind === 'success' ? 'bg-[#10b981]'
    : result?.kind === 'warning' ? 'bg-[#FFB700]'
    : result?.kind === 'error'   ? 'bg-[#FF3D00]'
    : 'bg-black';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200 flex flex-col`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => window.history.back()} className="text-white text-sm font-medium">
          ← Retour
        </button>
        <p className="text-white/90 text-xs font-display-md tracking-widest truncate max-w-[40%]">
          {sessionTitle}
        </p>
        <div className="bg-white/20 text-white text-sm font-display-md px-3 py-1">
          {validated}/{total}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-2 flex gap-2">
        <TabButton active={tab === 'scan'} onClick={() => setTab('scan')}>📷 SCAN</TabButton>
        <TabButton active={tab === 'list'} onClick={() => setTab('list')}>📋 LISTE ({total})</TabButton>
      </div>

      {/* Contenu */}
      {tab === 'scan' ? (
        <ScanView
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          cameraState={camera.cameraState}
          cameraError={camera.cameraError}
          result={result}
          torchAvailable={camera.torchAvailable}
          torchOn={camera.torchOn}
          onToggleTorch={camera.toggleTorch}
          onRetry={camera.retry}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 font-display-md text-xs tracking-widest py-2 transition-colors ${
        active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
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
  if (cameraState === 'denied' || cameraState === 'error') {
    const title =
      cameraState === 'denied'                         ? 'ACCÈS CAMÉRA REFUSÉ'
      : cameraError?.reason === 'insecure-context'     ? 'HTTPS REQUIS'
      : cameraError?.reason === 'no-mediadevices'      ? 'NAVIGATEUR INCOMPATIBLE'
      : cameraError?.reason === 'no-camera'            ? 'AUCUNE CAMÉRA TROUVÉE'
      : cameraError?.reason === 'in-use'               ? 'CAMÉRA DÉJÀ UTILISÉE'
      : cameraError?.reason === 'overconstrained'      ? 'CONTRAINTE CAMÉRA'
      : 'ERREUR CAMÉRA';

    const help =
      cameraState === 'denied'
        ? "Autorise la caméra dans les réglages du navigateur, puis réessaie. Tu peux aussi utiliser l'onglet LISTE."
        : cameraError?.reason === 'insecure-context'
        ? 'Mobile : ouvre le site en HTTPS (ou tunnel ngrok / vercel preview). Sur localhost ça marche.'
        : cameraError?.reason === 'in-use'
        ? 'Une autre app utilise déjà la caméra. Ferme-la et réessaie.'
        : cameraError?.reason === 'no-camera'
        ? 'Aucun appareil caméra détecté sur ce périphérique.'
        : "Caméra inaccessible. Bascule sur l'onglet LISTE pour valider manuellement.";

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <div className="text-6xl">📷</div>
        <p className="font-display text-2xl text-white">{title}</p>
        <p className="text-white/70 text-sm">{help}</p>
        {cameraError?.detail && (
          <p className="text-white/40 text-[11px] font-mono break-all max-w-md">{cameraError.detail}</p>
        )}
        <button onClick={onRetry} className="btn-passion px-6 mt-2">RÉESSAYER</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-4">
          {result.kind === 'success' ? '✅' : result.kind === 'warning' ? '⚠️' : '❌'}
        </div>
        <p className="text-3xl sm:text-4xl font-display text-white">
          {result.kind === 'success' ? `Bienvenue ${result.participantName} !` : result.title}
        </p>
        {'subtitle' in result && result.subtitle && (
          <p className="text-white/80 mt-3 text-base">{result.subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Cadre de visée */}
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
              torchOn ? 'bg-[#FFB700] text-black' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {torchOn ? '💡 LAMPE ON' : '🔦 LAMPE'}
          </button>
        )}
      </div>

      {cameraState !== 'running' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-white text-center px-8 font-display-md text-sm tracking-widest">
            DÉMARRAGE CAMÉRA...
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
        <div className="text-5xl">📋</div>
        <p className="font-display text-xl text-white">AUCUN INSCRIT</p>
        <p className="text-white/70 text-sm">Personne n&apos;a encore réservé cette session.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {bookings.map((b, i) => {
        const isAttended = b.status === 'attended';
        const isPending  = pendingId === b.qrToken;
        return (
          <div
            key={b.id}
            className={`bg-black/40 backdrop-blur-sm border px-4 py-3 flex items-center gap-3 ${
              isAttended ? 'border-[#10b981]/40' : 'border-white/15'
            }`}
          >
            <span className="font-display text-base text-white/40 w-6 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-display-md truncate">{b.participantName}</p>
              <p className="text-white/50 text-xs truncate">{b.participantEmail}</p>
              {isAttended && b.scannedAt && (
                <p className="text-[#10b981] text-[10px] mt-0.5">✓ {formatTime(b.scannedAt)}</p>
              )}
            </div>
            <div className="shrink-0">
              {isAttended ? (
                <span className="font-display-md text-[10px] px-2 py-1.5 bg-[#10b981]/20 text-[#10b981] tracking-widest">
                  PRÉSENT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkPresent(b.qrToken)}
                  disabled={isPending}
                  className="font-display-md text-[10px] tracking-widest px-3 py-1.5 bg-white text-black hover:bg-[#FFB700] transition-colors disabled:opacity-50"
                >
                  {isPending ? '...' : 'MARQUER ✓'}
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
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
