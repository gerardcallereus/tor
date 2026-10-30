// ============================================================================
// SISTEMA D'ÀUDIO PROCEDURAL (WEB AUDIO API) - METAL GEAR LOGIC: SHADOW CIRCUIT
// ============================================================================

class TacticalAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientGain = null;
        this.ambientStarted = false;
        this.lastStepTime = 0;
        this.lastPushTime = 0;
        this.alarmSirenInterval = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.ambientGain && this.ctx) {
            this.ambientGain.gain.setTargetAtTime(this.muted ? 0 : 0.035, this.ctx.currentTime, 0.2);
        }
        return this.muted;
    }

    startAmbientDrone() {
        if (this.ambientStarted) return;
        this.init();
        if (!this.ctx) return;
        this.ambientStarted = true;

        try {
            // Low industrial military ventilation hum + subtle digital surveillance tone
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            this.ambientGain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.value = 46.25; // F#1 low machinery rumble
            osc2.type = 'sine';
            osc2.frequency.value = 110.0; // Sub-generator tone

            filter.type = 'lowpass';
            filter.frequency.value = 140;

            this.ambientGain.gain.value = this.muted ? 0 : 0.035;

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            osc1.start();
            osc2.start();
        } catch (e) {
            this.ambientStarted = false;
        }
    }

    // Iconic MGS Alert sting [!]
    playAlert() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Classic sharp, piercing dual-frequency burst
        osc.frequency.setValueAtTime(880, t); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.07); // A6 sharp rise
        osc.frequency.setValueAtTime(1480, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.35);

        gain.gain.setValueAtTime(0.32, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.4);
    }

    // Pulsating MGS Emergency Alert Siren Loop
    startAlarmSiren() {
        if (this.muted || this.alarmSirenInterval) return;
        this.init();
        if (!this.ctx) return;

        const pulseSiren = () => {
            if (!this.ctx || this.muted) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(620, t);
            osc.frequency.exponentialRampToValueAtTime(940, t + 0.32);
            osc.frequency.exponentialRampToValueAtTime(580, t + 0.65);

            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.68);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.7);
        };

        pulseSiren();
        this.alarmSirenInterval = setInterval(pulseSiren, 720);
    }

    stopAlarmSiren() {
        if (this.alarmSirenInterval) {
            clearInterval(this.alarmSirenInterval);
            this.alarmSirenInterval = null;
        }
    }

    // FA-MAS Assault Rifle Gunfire Burst
    playAssaultRifleBurst() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // 3-round rapid tactical burst
        for (let b = 0; b < 3; b++) {
            const delay = b * 0.085;
            const t = this.ctx.currentTime + delay;

            // 1. Punchy gunshot noise crack
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(800, t);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.24, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(t);
            noise.stop(t + 0.09);

            // 2. Heavy muzzle explosion body
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(65, t + 0.07);

            gain.gain.setValueAtTime(0.26, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.08);
        }
    }

    // Bullet ricochet / Impact sound
    playBulletImpact() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.12);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    // Snake hit / grunt impact shock
    playPlayerHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.22);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
    }

    // High-tech rapid aerial drone laser pulse
    playDroneLaser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

        gain.gain.setValueAtTime(0.19, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    // Drone turbine deploy / hover spin-up sound
    playDroneDeploy() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(1750, t + 0.45);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.52);
    }

    // Iconic MGS Codec call tone (beep-beep, beep-beep)
    playCodecCall() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const beeps = [0, 0.12, 0.45, 0.57];
        beeps.forEach(offset => {
            const t = this.ctx.currentTime + offset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1244.51, t); // D#6

            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.09);
        });
    }

    // Tactical Sneaking Footstep
    playStep() {
        if (this.muted) return;
        const now = performance.now();
        if (now - this.lastStepTime < 240) return;
        this.lastStepTime = now;

        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Soft rubber combat boot on metal grate / concrete
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90 + Math.random() * 20, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.05);

        gain.gain.setValueAtTime(0.045, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(580, t + 0.16);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.19);
    }

    playPush() {
        if (this.muted) return;
        const now = performance.now();
        if (now - this.lastPushTime < 160) return;
        this.lastPushTime = now;

        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Heavy steel cargo container sliding on metal floor
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, t);
        osc.frequency.linearRampToValueAtTime(48, t + 0.12);

        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.14);
    }

    // Supply crate opening chirp
    playChestOpen() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 659.25, 880, 1318.5]; // A4 E5 A5 E6
        notes.forEach((freq, i) => {
            const t = this.ctx.currentTime + i * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.29);
        });
    }

    // Keycard / Encrypted data disc pickup chirp
    playPickup() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [587.33, 880, 1174.66]; // D5, A5, D6
        notes.forEach((freq, i) => {
            const t = this.ctx.currentTime + i * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.26);
        });
    }

    // Terminal logic gate bypass success
    playLogicSuccess() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.5]; // C major high
        notes.forEach((freq, i) => {
            const t = this.ctx.currentTime + i * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.16, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.42);
        });
    }

    // Heavy hydraulic security blast door opening
    playGateOpen() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Pneumatic air hiss + heavy metallic motorized gear sliding
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.linearRampToValueAtTime(140, t + 0.5);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.56);

        setTimeout(() => this.playLogicSuccess(), 350);
    }

    // Security alarm / logic error buzzer
    playErrorPenalty() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(175, t);
        osc1.frequency.linearRampToValueAtTime(110, t + 0.35);
        osc2.frequency.setValueAtTime(165, t);
        osc2.frequency.linearRampToValueAtTime(105, t + 0.35);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.4);
        osc2.stop(t + 0.4);
    }

    playTrapOrEnemyHit() {
        this.playAlert();
    }

    playVictoryFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Tactical mission accomplished jingle
        const melody = [
            { f: 440.00, d: 0.15, t: 0 },
            { f: 554.37, d: 0.15, t: 0.14 },
            { f: 659.25, d: 0.15, t: 0.28 },
            { f: 880.00, d: 0.35, t: 0.42 },
            { f: 783.99, d: 0.15, t: 0.80 },
            { f: 880.00, d: 0.65, t: 0.98 }
        ];

        melody.forEach(n => {
            const start = this.ctx.currentTime + n.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, start);
            gain.gain.setValueAtTime(0.18, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + n.d + 0.02);
        });
    }

    // High voltage laser beam zap and electrical shock
    playLaserZap() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.22);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
    }

    // Mechanical security breaker switch throw
    playSwitchToggle() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'square';
        osc1.frequency.setValueAtTime(420, t);
        osc1.frequency.exponentialRampToValueAtTime(80, t + 0.08);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(980, t + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(220, t + 0.14);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t + 0.04);
        osc1.stop(t + 0.1);
        osc2.stop(t + 0.16);
    }

    // Floor pressure plate activation
    playPressurePlate() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.15);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // Sub-security door opening / closing
    playSubDoorOpen() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(260, t + 0.25);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
    }

    // Industrial Hydraulic Cargo Lift / Elevator sound
    playElevatorMove() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        // Heavy hydraulic motor hum
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(75, t);
        osc.frequency.linearRampToValueAtTime(90, t + 0.4);
        osc.frequency.linearRampToValueAtTime(75, t + 0.9);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.05);

        // Chime arrival tone
        setTimeout(() => {
            if (this.muted || !this.ctx) return;
            const t2 = this.ctx.currentTime;
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(587.33, t2); // D5
            osc2.frequency.setValueAtTime(880, t2 + 0.08); // A5
            gain2.gain.setValueAtTime(0.12, t2);
            gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.35);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t2);
            osc2.stop(t2 + 0.38);
        }, 850);
    }

    // Steam vent burst hiss
    playSteamHiss() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.Q.value = 3.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + 0.26);
    }
}

window.castleAudio = new TacticalAudioEngine();

