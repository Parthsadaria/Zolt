let audioCtx, bassEQ, trebleEQ, proxyAudio, proxySource;
const bassBoostToggle = document.getElementById('bassBoostToggle');
const bassBoostSlider = document.getElementById('bassBoostSlider');
const trebleBoostToggle = document.getElementById('trebleBoostToggle');
const trebleBoostSlider = document.getElementById('trebleBoostSlider');
const audioEl = document.getElementById('audioPlayer');

const eqToggle = document.getElementById('eqToggle');
const eqSliders = document.getElementById('eqSliders');
const eqBands = [
    { freq: 60, type: 'peaking' },
    { freq: 230, type: 'peaking' },
    { freq: 910, type: 'peaking' },
    { freq: 3600, type: 'peaking' },
    { freq: 14000, type: 'peaking' }
];
let proxyReady = false;
let eqFilters = eqBands.map(() => null); // Always keep 5 filters

// Equalizer Visualizer
const eqVisualizer = document.getElementById('eqVisualizer');
let analyser, animationId;

function removeProxyAudio() {
    if (proxyAudio) {
        proxyAudio.pause();
        proxyAudio.remove();
        proxyAudio = null;
        proxySource = null;
        proxyReady = false;
        stopEQVisualizer();
    }
}

async function setupProxyAudio() {
    try {
        removeProxyAudio();

        // Create a new audio context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create audio element and source node directly from original audio
        proxySource = audioCtx.createMediaElementSource(audioEl);

        // Bass EQ
        bassEQ = audioCtx.createBiquadFilter();
        bassEQ.type = "lowshelf";
        bassEQ.frequency.value = 100;
        bassEQ.gain.value = bassBoostToggle.checked ? parseFloat(bassBoostSlider.value) : 0;

        // Treble EQ
        trebleEQ = audioCtx.createBiquadFilter();
        trebleEQ.type = "highshelf";
        trebleEQ.frequency.value = 3000;
        trebleEQ.gain.value = trebleBoostToggle.checked ? parseFloat(trebleBoostSlider.value) : 0;

        // Equalizer filters (always create them)
        eqFilters = eqBands.map((band, i) => {
            const filter = audioCtx.createBiquadFilter();
            filter.type = band.type;
            filter.frequency.value = band.freq;
            filter.Q.value = 1.0;
            // Set gain based on toggle and slider
            filter.gain.value = eqToggle.checked
                ? parseFloat(eqSliders.querySelector(`.eq-band[data-band="${i}"]`).value)
                : 0;
            return filter;
        });

        // Connect nodes: proxySource -> bassEQ -> trebleEQ -> [eqFilters...] -> destination
        let nodeChain = [proxySource, bassEQ, trebleEQ, ...eqFilters];
        for (let i = 0; i < nodeChain.length - 1; i++) {
            nodeChain[i].connect(nodeChain[i + 1]);
        }
        // Connect the last node to destination
        nodeChain[nodeChain.length - 1].connect(audioCtx.destination);

        proxyReady = true;

        // Setup visualizer
        setupEQVisualizer();

    } catch (error) {
        console.error("Audio setup failed:", error);
        // alert("Could not enable audio effects. Please try again.");
        removeProxyAudio();
    }
}

// Enable/disable effects - FIXED VERSION
function updateEffects() {
    const anyEffectEnabled = bassBoostToggle.checked || trebleBoostToggle.checked || eqToggle.checked;
    
    if (anyEffectEnabled) {
        // If any effect is enabled, setup the proxy audio chain
        if (!proxyReady) {
            setupProxyAudio();
        } else {
            // Update existing effects
            if (bassEQ) bassEQ.gain.value = bassBoostToggle.checked ? parseFloat(bassBoostSlider.value) : 0;
            if (trebleEQ) trebleEQ.gain.value = trebleBoostToggle.checked ? parseFloat(trebleBoostSlider.value) : 0;
            eqFilters.forEach((filter, i) => {
                if (filter) {
                    filter.gain.value = eqToggle.checked
                        ? parseFloat(eqSliders.querySelector(`.eq-band[data-band="${i}"]`).value)
                        : 0;
                }
            });
        }
    } else {
        // If no effects are enabled, remove proxy audio entirely
        // This allows the original audio element to play normally
        removeProxyAudio();
    }
}

// Event listeners
bassBoostToggle.addEventListener('change', () => {
    bassBoostSlider.style.display = bassBoostToggle.checked ? 'inline-block' : 'none';
    updateEffects();
});

trebleBoostToggle.addEventListener('change', () => {
    trebleBoostSlider.style.display = trebleBoostToggle.checked ? 'inline-block' : 'none';
    updateEffects();
});

bassBoostSlider.addEventListener('input', () => {
    if (bassEQ && proxyReady) bassEQ.gain.value = parseFloat(bassBoostSlider.value);
});

trebleBoostSlider.addEventListener('input', () => {
    if (trebleEQ && proxyReady) trebleEQ.gain.value = parseFloat(trebleBoostSlider.value);
});

// Show/hide EQ sliders
eqToggle.addEventListener('change', () => {
    eqSliders.style.display = eqToggle.checked ? 'inline-block' : 'none';
    eqFilters.forEach((filter, i) => {
        if (filter) {
            filter.gain.value = eqToggle.checked
                ? parseFloat(eqSliders.querySelector(`.eq-band[data-band="${i}"]`).value)
                : 0;
        }
    });
    updateEffects();
});

// EQ slider logic
eqSliders.querySelectorAll('.eq-band').forEach((slider, idx) => {
    slider.addEventListener('input', () => {
        if (eqFilters[idx]) {
            eqFilters[idx].gain.value = eqToggle.checked
                ? parseFloat(slider.value)
                : 0;
        }
    });
});

// Handle song changes
function onSongChangeForEffects() {
    if (bassBoostToggle.checked || trebleBoostToggle.checked || eqToggle.checked) {
        setTimeout(setupProxyAudio, 100);
    }
}

// Equalizer Visualizer
function setupEQVisualizer() {
    if (!eqVisualizer) return;
    if (analyser) return; // Only create once

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Low for bar style
    // Connect analyser after EQ chain if present, else after trebleEQ
    if (eqFilters.length > 0) {
        eqFilters[eqFilters.length - 1].connect(analyser);
    } else if (trebleEQ) {
        trebleEQ.connect(analyser);
    }
    analyser.connect(audioCtx.destination);

    drawEQBars();
}

function drawEQBars() {
    if (!analyser) return;
    const ctx = eqVisualizer.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, eqVisualizer.width, eqVisualizer.height);

        const barWidth = (eqVisualizer.width / bufferLength) * 1.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `hsl(${120 + i * 5}, 80%, 50%)`;
            ctx.fillRect(x, eqVisualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        animationId = requestAnimationFrame(draw);
    }
    draw();
}

function stopEQVisualizer() {
    if (animationId) cancelAnimationFrame(animationId);
    if (analyser) analyser.disconnect();
    analyser = null;
    if (eqVisualizer) {
        const ctx = eqVisualizer.getContext('2d');
        ctx.clearRect(0, 0, eqVisualizer.width, eqVisualizer.height);
    }
}

// Initialize audio context on first user interaction
document.addEventListener('click', function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    document.removeEventListener('click', initAudioContext);
}, { once: true });