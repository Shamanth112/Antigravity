/**
 * AutoCorrect AI — Google Gemini AI Integration Engine
 * Provides live AI proofreading, grammar & spelling auto-correction via Google Gemini API
 */

const GoogleAI = (() => {
  const GEMINI_KEY_STORAGE = 'acai-gemini-api-key';

  function getApiKey() {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  }

  function setApiKey(key) {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }

  /**
   * Auto-correct text using Google Gemini AI or smart fallback
   * @param {string} text 
   * @returns {Promise<{correctedText: string, changesCount: number, source: string, explanation: string}>}
   */
  async function autoCorrectText(text) {
    if (!text || !text.trim()) {
      return { correctedText: text, changesCount: 0, source: 'none', explanation: 'Text is empty.' };
    }

    const apiKey = getApiKey();

    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert English editor and proofreader. Correct all spelling, grammar, punctuation, and capitalization errors in the following text. Return ONLY the corrected text without any introductory or concluding comments, quotes, or markdown wrappers.\n\nText to correct:\n${text}`
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const corrected = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (corrected) {
          return {
            correctedText: corrected,
            changesCount: countDifferences(text, corrected),
            source: 'Google Gemini AI (Cloud)',
            explanation: 'Corrected via Google Gemini 1.5 Flash.'
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local engine:', err.message);
      }
    }

    // Local Smart AutoCorrect Engine (works offline or without API key)
    const corrected = localSmartCorrection(text);
    return {
      correctedText: corrected,
      changesCount: countDifferences(text, corrected),
      source: apiKey ? 'Local AI Engine (Gemini fallback)' : 'Smart AI Engine (Local)',
      explanation: 'Proofread and corrected by Smart Engine.'
    };
  }

  /**
   * Helper: local multi-pass smart correction
   */
  function localSmartCorrection(text) {
    if (window.GrammarEngine && window.SpellChecker) {
      let current = text;
      // Pass 1: Common misspellings replacement
      const words = current.split(/\b/);
      const fixedWords = words.map(w => {
        const lower = w.toLowerCase();
        if (SpellChecker.COMMON_MISSPELLINGS[lower]) {
          const fix = SpellChecker.COMMON_MISSPELLINGS[lower];
          if (w === w.toUpperCase()) return fix.toUpperCase();
          if (w[0] === w[0].toUpperCase()) return fix.charAt(0).toUpperCase() + fix.slice(1);
          return fix;
        }
        return w;
      });
      current = fixedWords.join('');

      // Pass 2: Grammar rules (articles, double space, etc.)
      const grammarErrors = GrammarEngine.check(current);
      grammarErrors.reverse().forEach(err => {
        if (err.fix && err.original) {
          current = current.substring(0, err.index) + err.fix + current.substring(err.index + err.length);
        }
      });

      return current;
    }
    return text;
  }

  function countDifferences(original, corrected) {
    const origWords = original.trim().split(/\s+/);
    const corrWords = corrected.trim().split(/\s+/);
    let diff = Math.abs(origWords.length - corrWords.length);
    const minLen = Math.min(origWords.length, corrWords.length);
    for (let i = 0; i < minLen; i++) {
      if (origWords[i].toLowerCase() !== corrWords[i].toLowerCase()) diff++;
    }
    return diff;
  }

  return {
    getApiKey,
    setApiKey,
    autoCorrectText
  };
})();

window.GoogleAI = GoogleAI;
