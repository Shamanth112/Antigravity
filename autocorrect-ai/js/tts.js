/**
 * AutoCorrect AI — Text-to-Speech Module
 * Uses Web Speech API (SpeechSynthesis)
 */

const TTS = (() => {
  let utterance = null;
  let isSpeaking = false;
  let isPaused = false;
  let voices = [];

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        populateVoiceSelect();
      };
    } else {
      populateVoiceSelect();
    }
  }

  function populateVoiceSelect() {
    const select = document.getElementById('tts-voice-select');
    if (!select) return;
    select.innerHTML = '';
    voices.forEach((voice, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${voice.name} (${voice.lang})`;
      if (voice.lang.startsWith('en') && voice.default) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function speak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-Speech is not supported in your browser.', 'error');
      return;
    }

    stop();

    const {
      voiceIndex = 0,
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      onStart,
      onEnd,
      onError,
    } = options;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (voices[voiceIndex]) utterance.voice = voices[voiceIndex];

    utterance.onstart = () => {
      isSpeaking = true;
      isPaused = false;
      updateTTSButton('pause');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      updateTTSButton('play');
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      isSpeaking = false;
      isPaused = false;
      updateTTSButton('play');
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
  }

  function pause() {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      isPaused = true;
      updateTTSButton('resume');
    }
  }

  function resume() {
    if (isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
      updateTTSButton('pause');
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    updateTTSButton('play');
  }

  function toggle(text, options) {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text, options);
    }
  }

  function updateTTSButton(state) {
    const btn = document.getElementById('tts-btn');
    if (!btn) return;
    const icons = { play: '🔊 Read Aloud', pause: '⏸ Pause', resume: '▶ Resume' };
    btn.textContent = icons[state] || icons.play;
  }

  function getOptions() {
    const voiceSelect = document.getElementById('tts-voice-select');
    const rateSlider = document.getElementById('tts-rate');
    const pitchSlider = document.getElementById('tts-pitch');

    return {
      voiceIndex: voiceSelect ? parseInt(voiceSelect.value) : 0,
      rate: rateSlider ? parseFloat(rateSlider.value) : 1.0,
      pitch: pitchSlider ? parseFloat(pitchSlider.value) : 1.0,
    };
  }

  // Helper to show toast (assumes global showToast function)
  function showToast(msg, type) {
    if (window.showToast) window.showToast(msg, type);
    else console.log(`[TTS] ${type}: ${msg}`);
  }

  return { speak, pause, resume, stop, toggle, loadVoices, getOptions };
})();

window.TTS = TTS;

// ============================================================
// Voice Typing Module (Speech-to-Text)
// ============================================================

const VoiceTyping = (() => {
  let recognition = null;
  let isListening = false;
  let onResult = null;
  let onError = null;

  function isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  function init(resultCallback, errorCallback) {
    if (!isSupported()) return;
    onResult = resultCallback;
    onError = errorCallback;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      updateVoiceBtn(true);
      // Toast fires here — only after mic permission is actually granted
      if (window.showToast) window.showToast('🎤 Voice typing started — speak now', 'info');
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        try { recognition.start(); } catch {}
      }
    };

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      if (onResult) onResult({ final, interim });
    };

    recognition.onerror = (event) => {
      isListening = false;
      updateVoiceBtn(false);
      // Friendly error messages per error type
      const errorMessages = {
        'not-allowed':    '🔴 Microphone access denied. Please allow mic access in your browser settings.',
        'no-speech':      '🔇 No speech detected. Try speaking louder or closer to the mic.',
        'audio-capture':  '🎤 No microphone found. Please connect a mic and try again.',
        'network':        '🌐 Network error during voice recognition. Check your connection.',
        'aborted':        null, // silent — user cancelled
      };
      const msg = errorMessages[event.error];
      if (msg && window.showToast) window.showToast(msg, 'error');
      else if (msg === undefined && window.showToast) window.showToast(`Voice error: ${event.error}`, 'error');
      if (onError) onError(event.error);
    };
  }

  function start(lang = 'en-US') {
    if (!isSupported()) {
      if (window.showToast) window.showToast('Voice typing not supported in this browser.', 'error');
      return;
    }
    if (!recognition) init();
    if (!recognition) return;

    recognition.lang = lang;
    // Note: isListening is set to true inside recognition.onstart (after mic permission granted)
    try { recognition.start(); } catch (e) {
      if (e.name === 'InvalidStateError') {
        // Already started — ignore
      }
    }
  }

  function stop() {
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch {}
    }
    updateVoiceBtn(false);
  }

  function toggle(lang) {
    isListening ? stop() : start(lang);
  }

  function updateVoiceBtn(listening) {
    const btn = document.getElementById('voice-btn');
    if (!btn) return;
    if (listening) {
      btn.innerHTML = `<span class="voice-pulse"></span> Listening...`;
      btn.classList.add('recording');
    } else {
      btn.innerHTML = `🎤 Voice Type`;
      btn.classList.remove('recording');
    }
  }

  return { start, stop, toggle, isListening: () => isListening, isSupported, init };
})();

window.VoiceTyping = VoiceTyping;
