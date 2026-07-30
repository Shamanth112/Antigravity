/**
 * AutoCorrect AI — Google AI AutoCorrect Engine
 * Uses Gemini API when available, falls back to SpellChecker + GrammarEngine locally
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
   * Synchronous high-speed word autocorrect (for instant keydown execution)
   */
  function autoCorrectWordSync(word) {
    if (!word || word.length < 2) return word;
    if (window.SpellChecker) {
      if (window.SpellChecker.isCorrect(word)) return word;
      const suggestions = window.SpellChecker.getSuggestions(word);
      if (suggestions && suggestions.length > 0) return suggestions[0];
    }
    return word;
  }

  /**
   * Word-level AutoCorrect
   * Cloud: Gemini API | Local: SpellChecker engine
   */
  async function autoCorrectWord(word, contextBefore = '') {
    if (!word || word.length < 2) return word;

    // Cloud AI path (if API key is set)
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Context: "${contextBefore}". Word: "${word}". If misspelled, output ONLY the corrected word. If correct, output "${word}". No quotes or punctuation.` }] }],
              generationConfig: { temperature: 0.0, maxOutputTokens: 16 }
            })
          }
        );
        if (res.ok) {
          const data = await res.json();
          const fix = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (fix && fix.length > 0 && !fix.includes(' ')) return fix;
        }
      } catch (e) {
        console.warn('Gemini word API error:', e);
      }
    }

    // Local AI engine — use SpellChecker
    if (window.SpellChecker) {
      if (window.SpellChecker.isCorrect(word)) return word; // word is fine
      const suggestions = window.SpellChecker.getSuggestions(word);
      if (suggestions && suggestions.length > 0) return suggestions[0];
    }

    return word; // no correction found
  }

  /**
   * Sentence-level AutoCorrect
   * Cloud: Gemini API | Local: SpellChecker + GrammarEngine
   */
  async function correctSentence(text) {
    if (!text || text.trim().length < 3) return text;

    // Cloud AI path
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Correct all spelling, grammar, prepositions, capitalization, and punctuation errors. Output ONLY the corrected text:\n\n${text}` }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
          }
        );
        if (res.ok) {
          const data = await res.json();
          const corrected = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (corrected && corrected.length > 0) return corrected;
        }
      } catch (e) {
        console.warn('Gemini sentence API error:', e);
      }
    }

    // Local AI engine — multi-pass correction
    return localSentenceFix(text);
  }

  /**
   * Local multi-pass sentence fixer using SpellChecker + GrammarEngine
   */
  function localSentenceFix(text) {
    let s = text;

    // Pass 1: Fix misspelled words using SpellChecker
    if (window.SpellChecker) {
      const words = s.split(/(\b[a-zA-Z']+\b)/);
      s = words.map(w => {
        if (!/^[a-zA-Z']+$/.test(w) || w.length < 2) return w;
        if (window.SpellChecker.isCorrect(w)) return w;
        const suggestions = window.SpellChecker.getSuggestions(w);
        if (suggestions && suggestions.length > 0) {
          const fix = suggestions[0];
          // Preserve casing
          if (w === w.toUpperCase()) return fix.toUpperCase();
          if (w[0] === w[0].toUpperCase()) return fix.charAt(0).toUpperCase() + fix.slice(1);
          return fix;
        }
        return w;
      }).join('');
    }

    // Pass 2: Grammar fixes using GrammarEngine
    if (window.GrammarEngine) {
      try {
        const errors = window.GrammarEngine.check(s);
        // Apply fixes in reverse order to preserve indices
        errors.sort((a, b) => b.index - a.index);
        for (const err of errors) {
          if (err.fix && typeof err.index === 'number' && typeof err.length === 'number') {
            s = s.substring(0, err.index) + err.fix + s.substring(err.index + err.length);
          }
        }
      } catch (e) {
        console.warn('GrammarEngine error:', e);
      }
    }

    // Pass 3: Common phrase corrections
    const phraseFixes = [
      [/\bshould of\b/gi, 'should have'],
      [/\bcould of\b/gi, 'could have'],
      [/\bwould of\b/gi, 'would have'],
      [/\bmust of\b/gi, 'must have'],
      [/\bmight of\b/gi, 'might have'],
      [/\bthey is\b/gi, 'they are'],
      [/\bwe is\b/gi, 'we are'],
      [/\byou is\b/gi, 'you are'],
      [/\bhe are\b/gi, 'he is'],
      [/\bshe are\b/gi, 'she is'],
      [/\bit are\b/gi, 'it is'],
      [/\bi\b/g, 'I'],
    ];
    phraseFixes.forEach(([p, r]) => { s = s.replace(p, r); });

    // Pass 4: Capitalize first letter of sentences
    s = s.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    return s;
  }

  async function autoCorrectText(text) {
    if (!text || !text.trim()) return { correctedText: text, changesCount: 0 };
    const corrected = await correctSentence(text);
    return {
      correctedText: corrected,
      changesCount: text !== corrected ? 1 : 0
    };
  }

  return {
    getApiKey,
    setApiKey,
    autoCorrectWord,
    autoCorrectWordSync,
    correctSentence,
    autoCorrectText
  };
})();

window.GoogleAI = GoogleAI;
