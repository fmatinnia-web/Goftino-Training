/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SoundType = 'classic' | 'soft_bell' | 'modern_ping' | 'water_drop';

export interface SoundOption {
  id: SoundType;
  name: string;
  description: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'classic', name: 'چایم کلاسیک گفتینو', description: 'دو نغمه ملایم و آشنا' },
  { id: 'soft_bell', name: 'زنگ ملایم (Soft Bell)', description: 'صدای ملایم و آرامش‌بخش' },
  { id: 'modern_ping', name: 'پینگ دیجیتال مدرن', description: 'صدای سریع و کریستالی' },
  { id: 'water_drop', name: 'قطره آب (Bubble Drop)', description: 'صدای ارگانیک و دلنشین' },
];

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public currentSound: SoundType = 'classic';
  public volume: number = 0.8;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playIncomingNotification(typeOverride?: SoundType) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const sound = typeOverride || this.currentSound;
      const now = this.ctx.currentTime;

      if (sound === 'classic') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.0, now + 0.08); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (sound === 'soft_bell') {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, now + 0.05); // B5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now + 0.05);
        osc1.stop(now + 0.52);
        osc2.stop(now + 0.52);
      } else if (sound === 'modern_ping') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.5, now); // C6
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.07); // E6

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14 * this.volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (sound === 'water_drop') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playSentPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
