/**
 * Web Audio API Emergency Siren & Medical Alert Synthesizer
 * Works 100% reliably in all modern browsers without external audio files.
 */

class EmergencyAudioPlayer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!this.ctx || this.ctx.state === "closed") {
        this.ctx = new AudioContextClass();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Play urgent High-Priority Code Red Trauma Siren
   * Rapid alternating two-tone hospital emergency siren (960Hz <-> 770Hz)
   */
  public async playRedAlertSiren(durationSeconds = 2.5): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.connect(ctx.destination);

      // Create dual-tone alternating emergency siren
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";

      // 4 rapid cycles of 960Hz -> 770Hz alternating siren
      const cycleLength = 0.25;
      const numCycles = Math.floor(durationSeconds / cycleLength);

      for (let i = 0; i < numCycles; i++) {
        const t = now + i * cycleLength;
        osc.frequency.setValueAtTime(960, t);
        osc.frequency.setValueAtTime(770, t + cycleLength / 2);
      }

      // Envelope fade out at end
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.gain.setValueAtTime(0.4, now + durationSeconds - 0.2);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + durationSeconds);
    } catch (e) {
      console.warn("Emergency Audio Player notice:", e);
    }
  }

  /**
   * Play standard Medical Notification Chime
   */
  public async playMedicalChime(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Chime Audio notice:", e);
    }
  }
}

export const emergencyAudio = new EmergencyAudioPlayer();

export function playEmergencyRedAlertSound(durationSeconds = 2.5) {
  return emergencyAudio.playRedAlertSiren(durationSeconds);
}

export function playMedicalChimeSound() {
  return emergencyAudio.playMedicalChime();
}

