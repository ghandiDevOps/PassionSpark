/**
 * Feedback utilisateur cross-device : vibration + bip sonore court.
 * Aucune dépendance — Web Audio API + Vibration API natives.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  // Safari peut suspendre le contexte hors interaction utilisateur
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(frequency: number, durationMs: number, volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type            = "sine";
  osc.frequency.value = frequency;
  gain.gain.value     = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  // Fade out pour éviter le pop
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch { /* iOS silencieux */ }
}

export function feedbackSuccess() {
  vibrate(80);
  beep(880, 120);
  setTimeout(() => beep(1320, 100), 90);
}

export function feedbackError() {
  vibrate([60, 40, 60]);
  beep(220, 200, 0.18);
}

export function feedbackWarning() {
  vibrate(40);
  beep(440, 100);
}
