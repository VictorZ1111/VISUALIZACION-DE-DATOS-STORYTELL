/* =====================================================
 * AUDIO.JS — Background audio con fade
 * ===================================================== */

import { CONFIG } from './config.js';

let bgAudio = null;
let currentTrackUrl = null;
let audioUnlocked = false;
let pendingTrackUrl = null;

function ensureAudio() {
  if (!bgAudio) {
    bgAudio = new Audio();
    bgAudio.loop = true;
    bgAudio.preload = "auto";
    bgAudio.volume = 0;
  }
}

function fadeTo(targetVol, ms = 600) {
  if (!bgAudio) return;
  const start = bgAudio.volume;
  const steps = 20;
  const stepMs = Math.max(10, Math.floor(ms / steps));
  let i = 0;

  const id = setInterval(() => {
    i++;
    const t = i / steps;
    bgAudio.volume = start + (targetVol - start) * t;
    if (i >= steps) clearInterval(id);
  }, stepMs);
}

export function requestTrack(url) {
  if (!url) return;
  pendingTrackUrl = url;
  if (!audioUnlocked) return;
  playTrack(url);
}

export function playTrack(url) {
  if (!url) return;
  ensureAudio();

  if (!audioUnlocked) {
    pendingTrackUrl = url;
    return;
  }

  const startNew = () => {
    currentTrackUrl = url;
    bgAudio.src = url;
    bgAudio.currentTime = 0;
    bgAudio.play()
      .then(() => fadeTo(CONFIG.AUDIO_TARGET_VOL, 700))
      .catch((err) => console.warn("Audio error:", url, err));
  };

  if (currentTrackUrl === url && bgAudio && !bgAudio.paused) return;

  if (bgAudio && !bgAudio.paused && bgAudio.volume > 0.02) {
    fadeTo(0, 350);
    setTimeout(startNew, 380);
  } else {
    startNew();
  }
}

export function stopTrack() {
  if (!bgAudio) return;
  fadeTo(0, 400);
  setTimeout(() => bgAudio.pause(), 420);
}

export function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  ensureAudio();
  if (pendingTrackUrl) playTrack(pendingTrackUrl);
}

// Listeners para unlock
window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
window.addEventListener("keydown", unlockAudioOnce, { once: true });

// Exportar estado para resetear
export function resetAudio() {
  stopTrack();
  currentTrackUrl = null;
}
