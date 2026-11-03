"use strict";

// Generate a quiet ocean wash locally with Web Audio; no audio file/network needed.
// Browsers require a user gesture before audio can start, so this stays off by default.
const toggle = document.querySelector("#ocean-audio-toggle");
const soundPreferenceKey = "oche-ocean-sound-enabled-v1";
let audioContext = null;
let masterGain = null;
let activeNodes = [];
let isPlaying = false;

function makeNoiseBuffer(context, duration) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;

    for (let index = 0; index < channel.length; index += 1) {
        const white = Math.random() * 2 - 1;
        // A gentle brown-noise blend sounds softer than unfiltered white noise.
        previous = (previous + 0.025 * white) / 1.025;
        channel[index] = previous * 3.5;
    }

    return buffer;
}

function startOceanSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        toggle.textContent = "♫ Ocean sound unavailable";
        toggle.disabled = true;
        return;
    }

    try {
        if (!audioContext) {
            audioContext = new AudioContextClass();
            masterGain = audioContext.createGain();
            masterGain.gain.value = 0;
            masterGain.connect(audioContext.destination);

            const noise = audioContext.createBufferSource();
            noise.buffer = makeNoiseBuffer(audioContext, 4);
            noise.loop = true;

            const lowPass = audioContext.createBiquadFilter();
            lowPass.type = "lowpass";
            lowPass.frequency.value = 620;
            lowPass.Q.value = 0.55;

            const seaGain = audioContext.createGain();
            seaGain.gain.value = 0.42;
            noise.connect(lowPass);
            lowPass.connect(seaGain);
            seaGain.connect(masterGain);
            noise.start();
            activeNodes.push(noise, lowPass, seaGain);

            // Slow gain modulation gives the noise a wave-like swell and retreat.
            const swell = audioContext.createOscillator();
            const swellDepth = audioContext.createGain();
            swell.type = "sine";
            swell.frequency.value = 0.11;
            swellDepth.gain.value = 0.16;
            swell.connect(swellDepth);
            swellDepth.connect(seaGain.gain);
            swell.start();
            activeNodes.push(swell, swellDepth);

            // A very quiet high-frequency wash adds a little surf shimmer.
            const surfNoise = audioContext.createBufferSource();
            surfNoise.buffer = noise.buffer;
            surfNoise.loop = true;
            const highPass = audioContext.createBiquadFilter();
            highPass.type = "highpass";
            highPass.frequency.value = 1450;
            const surfGain = audioContext.createGain();
            surfGain.gain.value = 0.018;
            surfNoise.connect(highPass);
            highPass.connect(surfGain);
            surfGain.connect(masterGain);
            surfNoise.start();
            activeNodes.push(surfNoise, highPass, surfGain);
        }

        audioContext.resume();
        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setTargetAtTime(0.65, now, 0.8);
        isPlaying = true;
        toggle.setAttribute("aria-pressed", "true");
        toggle.textContent = "♫ Ocean sound: On";
        toggle.classList.add("is-on");
        try { localStorage.setItem(soundPreferenceKey, "on"); } catch { /* Optional preference only. */ }
    } catch {
        isPlaying = false;
        toggle.textContent = "♫ Could not start ocean sound";
        toggle.setAttribute("aria-pressed", "false");
    }
}

function stopOceanSound() {
    if (audioContext && masterGain) {
        const now = audioContext.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setTargetAtTime(0, now, 0.18);
    }
    isPlaying = false;
    toggle.setAttribute("aria-pressed", "false");
    toggle.textContent = "♫ Ocean sound: Off";
    toggle.classList.remove("is-on");
    try { localStorage.setItem(soundPreferenceKey, "off"); } catch { /* Optional preference only. */ }
}

toggle.addEventListener("click", () => {
    if (isPlaying) stopOceanSound();
    else startOceanSound();
});

document.addEventListener("visibilitychange", () => {
    if (!audioContext) return;
    if (document.hidden) audioContext.suspend();
    else if (isPlaying) audioContext.resume();
});

// Respect the saved preference as a visual choice, but still wait for a click
// because autoplay audio is blocked by most browsers.
try {
    if (localStorage.getItem(soundPreferenceKey) === "on") {
        toggle.textContent = "♫ Ocean sound: Tap to enable";
        toggle.classList.add("is-remembered");
    }
} catch { /* Audio remains available without local storage. */ }
