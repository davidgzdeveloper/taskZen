/**
 * Session-end sounds and notifications for the Pomodoro timer.
 *
 * The chime is synthesized with Web Audio (no external file to break) and is
 * scheduled on the audio clock when a session starts. The audio clock keeps
 * time in background tabs, where JS timers get throttled, so the chime rings
 * on time even if the page is hidden.
 */

let ctx: AudioContext | null = null;

/** Browsers only allow audio after a user gesture: call this from a click/keypress. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch {
    ctx = null;
  }
}

export type ChimeKind = "work" | "break";

// Focus over: three rising notes. Break over: two notes, back to work.
const NOTES: Record<ChimeKind, number[]> = {
  work: [659.25, 830.61, 987.77], // E5, G#5, B5
  break: [987.77, 659.25], // B5, E5
};

/**
 * Schedules the chime `delaySeconds` from now. Returns a cancel function
 * (for pause/reset). Does nothing if audio was never unlocked.
 */
export function scheduleChime(delaySeconds: number, kind: ChimeKind): () => void {
  if (!ctx) return () => {};
  const audio = ctx;
  const master = audio.createGain();
  master.gain.value = 0.35;
  master.connect(audio.destination);

  const start = audio.currentTime + Math.max(0, delaySeconds);
  NOTES[kind].forEach((freq, i) => {
    const t = start + i * 0.32;
    const osc = audio.createOscillator();
    const overtone = audio.createOscillator();
    const env = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    overtone.type = "sine";
    overtone.frequency.value = freq * 2.01; // slight detune gives a bell-like shimmer
    const overtoneGain = audio.createGain();
    overtoneGain.gain.value = 0.18;

    // Soft attack, long bell decay
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1, t + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    osc.connect(env);
    overtone.connect(overtoneGain).connect(env);
    env.connect(master);
    osc.start(t);
    overtone.start(t);
    osc.stop(t + 1.7);
    overtone.stop(t + 1.7);
  });

  // Cancel only a chime that hasn't started: when a session ends the timer moves on
  // (and cleans up) while the chime is ringing, and that one must play out.
  // Disconnecting silences pending notes without touching stopped nodes.
  return () => {
    if (audio.currentTime < start - 0.5) master.disconnect();
  };
}

/** Ask once, from a user gesture, so notifications can be shown later. */
export function requestNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
}

/** Shows a system notification only when the page is hidden (otherwise the in-app toast is enough). */
export function notifySessionEnd(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;
  try {
    const n = new Notification(title, { body, icon: "/favicon.ico", tag: "taskzen-timer" });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
  }
}
