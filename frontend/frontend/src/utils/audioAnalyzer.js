// Web Audio API Real-Time Microphone Analyzer & Decibel Monitor
// Works 100% locally and offline without external network dependencies

let audioContext = null;
let analyserNode = null;
let microphoneStream = null;
let sourceNode = null;
let animationFrameId = null;
let isAnalyzing = false;

export async function startAudioAnalysis(onVolumeChange, onFrequencyData) {
  if (typeof window === 'undefined') return false;

  // Prevent multiple duplicate analyzers
  if (isAnalyzing) {
    return true;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported in this browser.");
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("navigator.mediaDevices.getUserMedia not supported.");
      return false;
    }

    // Request microphone with high-gain processing for quiet/low-pitch voices
    microphoneStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 48000
      } 
    });

    audioContext = new AudioContextClass();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    sourceNode = audioContext.createMediaStreamSource(microphoneStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.7; // Faster response to soft vocal bursts

    sourceNode.connect(analyserNode);
    isAnalyzing = true;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!isAnalyzing || !analyserNode) return;

      analyserNode.getByteFrequencyData(dataArray);

      // Compute volume with sensitivity boost for low frequencies (male/deep/quiet voices: 80Hz - 300Hz)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        // Apply 1.5x gain multiplier to low-frequency speech bins (bins 1-12)
        const weight = (i <= 12) ? 1.6 : 1.0;
        sum += dataArray[i] * weight;
      }
      const average = sum / bufferLength;
      // High-sensitivity scaling: amplifies quiet & low-pitch speech into visible 0-100% telemetry
      const volumeLevel = Math.min(100, Math.round((average / 85) * 100));

      if (onVolumeChange) {
        onVolumeChange(volumeLevel);
      }

      if (onFrequencyData) {
        onFrequencyData(Array.from(dataArray.slice(0, 8))); // Send top 8 frequency bins for visual equalizer
      }

      // Broadcast globally for any component
      window.dispatchEvent(new CustomEvent('ultron-mic-level', {
        detail: { 
          volume: volumeLevel,
          frequencies: Array.from(dataArray.slice(0, 8))
        }
      }));

      animationFrameId = requestAnimationFrame(checkAudio);
    };

    checkAudio();
    return true;
  } catch (error) {
    console.warn("[AUDIO ANALYZER] Failed to access microphone:", error);
    isAnalyzing = false;
    return false;
  }
}

export function stopAudioAnalysis() {
  isAnalyzing = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (sourceNode) {
    try { sourceNode.disconnect(); } catch {}
    sourceNode = null;
  }

  if (analyserNode) {
    try { analyserNode.disconnect(); } catch {}
    analyserNode = null;
  }

  if (microphoneStream) {
    try {
      microphoneStream.getTracks().forEach(track => track.stop());
    } catch {}
    microphoneStream = null;
  }

  if (audioContext) {
    try { audioContext.close(); } catch {}
    audioContext = null;
  }
}

export function isAudioAnalyzerActive() {
  return isAnalyzing;
}
