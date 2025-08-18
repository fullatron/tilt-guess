/**
 * Sound effects for the game using Web Audio API
 * All sounds are generated programmatically without external assets
 */

// Lazily initialize audio context when first needed
let audioContext: AudioContext | null = null;
let muted = false;

// Initialize audio context (must be called in response to user gesture)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Get current mute state
 */
export function getMuted(): boolean {
  return muted;
}

/**
 * Set mute state for all sounds
 */
export function setMuted(value: boolean): void {
  muted = value;
}

/**
 * Play a correct answer sound (short ascending beeps)
 */
export function playCorrect(): void {
  if (muted) return;
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create oscillator for first beep (higher pitch)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 880; // A5
  
  // Create oscillator for second beep (even higher pitch)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 1320; // E6
  
  // Create gain node for envelope shaping
  const gain = ctx.createGain();
  gain.gain.value = 0;
  
  // Connect nodes
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  
  // Schedule envelope
  const duration = 0.08; // 80ms per beep
  const gap = 0.04; // 40ms gap between beeps
  const totalDuration = duration * 2 + gap;
  
  // First beep
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  
  // Second beep
  gain.gain.setValueAtTime(0, now + duration + gap);
  gain.gain.linearRampToValueAtTime(0.5, now + duration + gap + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + totalDuration);
  
  // Schedule oscillators
  osc1.start(now);
  osc1.stop(now + duration);
  osc2.start(now + duration + gap);
  osc2.stop(now + totalDuration);
}

/**
 * Play a pass sound (short downward tone)
 */
export function playPass(): void {
  if (muted) return;
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create oscillator
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, now); // A4
  osc.frequency.linearRampToValueAtTime(220, now + 0.2); // A3
  
  // Create gain node for envelope shaping
  const gain = ctx.createGain();
  gain.gain.value = 0;
  
  // Connect nodes
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Schedule envelope
  const duration = 0.2; // 200ms
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  
  // Schedule oscillator
  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Play a time up sound (descending siren)
 */
export function playTimeUp(): void {
  if (muted) return;
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create oscillator
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  
  // Start at a high frequency and descend
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.8); // A2
  
  // Create gain node for envelope shaping
  const gain = ctx.createGain();
  gain.gain.value = 0;
  
  // Create filter to soften the sawtooth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1500;
  filter.Q.value = 5;
  
  // Connect nodes
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  // Schedule envelope
  const duration = 0.8; // 800ms
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
  gain.gain.setValueAtTime(0.4, now + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  
  // Schedule oscillator
  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Play a countdown beep (for 3-2-1 countdown)
 * @param isLast Whether this is the final beep in the countdown
 */
export function playCountdown(isLast: boolean = false): void {
  if (muted) return;
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create oscillator
  const osc = ctx.createOscillator();
  osc.type = isLast ? 'square' : 'sine';
  osc.frequency.value = isLast ? 880 : 440; // Higher pitch for last beep
  
  // Create gain node for envelope shaping
  const gain = ctx.createGain();
  gain.gain.value = 0;
  
  // Connect nodes
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Schedule envelope
  const duration = isLast ? 0.3 : 0.1; // Longer for last beep
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  
  // Schedule oscillator
  osc.start(now);
  osc.stop(now + duration);
}
