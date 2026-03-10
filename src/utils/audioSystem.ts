export const playBootSequence = (isMuted: boolean) => {
    if (isMuted) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.15; // Start low to be safe
        masterGain.connect(ctx.destination);

        const playTone = (freq: number, type: OscillatorType, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(1, startTime + 0.02);
            gain.gain.setValueAtTime(1, startTime + duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(startTime);
            osc.stop(startTime + duration);
        }

        const playNoise = (startTime: number, duration: number) => {
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 500; // Lowered from 800 to make static 'warmer' and less harsh

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.5, startTime + 0.1);
            gain.gain.linearRampToValueAtTime(0.5, startTime + duration - 0.1);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);

            noiseSrc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            noiseSrc.start(startTime);
        }

        const now = ctx.currentTime;

        // 0.0s Handshake beep 1 (Lowered from 1600)
        playTone(900, 'square', now, 0.15);
        // 0.2s Handshake beep 2 (Lowered from 2100)
        playTone(1200, 'square', now + 0.2, 0.15);

        // 0.5s Negotiation tones (Lowered from 1100, 2300, 1800)
        playTone(600, 'sawtooth', now + 0.5, 0.3);
        playTone(1400, 'sawtooth', now + 0.8, 0.2);
        playTone(1000, 'sawtooth', now + 1.0, 0.3);

        // Add a bit of noise under negotiation
        playNoise(now + 0.5, 0.8);

        // 1.4s Main static burst (Dial-up crunch)
        playNoise(now + 1.4, 1.2);

        // 2.7s Connection success chime (pleasant 80s arcade sound, slightly deeper)
        playTone(660, 'sine', now + 2.7, 0.1);
        playTone(990, 'sine', now + 2.85, 0.2);
        playTone(1320, 'sine', now + 3.1, 0.4);

    } catch (e) {
        console.error("Boot Audio error", e);
    }
}

let customAudioBuffer: AudioBuffer | null = null;
let customAudioContext: AudioContext | null = null;

// Preload the MP3 file when the app starts
export const loadCustomBootAudio = async (url: string) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        customAudioContext = new AudioContext();

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        customAudioBuffer = await customAudioContext.decodeAudioData(arrayBuffer);
        console.log("Custom boot audio preloaded successfully.");
    } catch (e) {
        console.error("Failed to load custom boot audio:", e);
    }
}

let currentCustomSource: AudioBufferSourceNode | null = null;
let currentCustomGain: GainNode | null = null;

export const playBootCustom = (isMuted: boolean) => {
    if (isMuted || !customAudioBuffer || !customAudioContext) {
        // Fallback to the synthesized sequence if the custom audio isn't available
        console.warn("Custom audio not ready or muted, falling back to synth.");
        if (!isMuted) playBootSequence(isMuted);
        return;
    }

    try {
        if (customAudioContext.state === 'suspended') {
            customAudioContext.resume();
        }

        const source = customAudioContext.createBufferSource();
        source.buffer = customAudioBuffer;

        const masterGain = customAudioContext.createGain();
        masterGain.gain.value = 0.5; // Custom files might need a higher base volume

        source.connect(masterGain);
        masterGain.connect(customAudioContext.destination);
        source.start(0);

        currentCustomSource = source;
        currentCustomGain = masterGain;

    } catch (e) {
        console.error("Custom Boot Audio error", e);
    }
}

// Safely fade out and stop the custom audio when onboarding finishes
export const stopBootCustom = () => {
    if (!customAudioContext || !currentCustomGain || !currentCustomSource) return;

    try {
        const now = customAudioContext!.currentTime;
        // Quick 0.5s fade out to avoid a hard pop
        currentCustomGain.gain.setValueAtTime(currentCustomGain.gain.value, now);
        currentCustomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        currentCustomSource.stop(now + 0.6);

        // Clean up references
        setTimeout(() => {
            currentCustomSource = null;
            currentCustomGain = null;
        }, 1000);
    } catch (e) { }
}
