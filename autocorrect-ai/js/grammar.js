/**
 * AutoCorrect AI — Grammar Engine
 * Rule-based grammar checking with explanations
 */

const GrammarEngine = (() => {

  // Grammar rules: { id, pattern, message, fix, type, explanation, severity }
  const RULES = [
    // Articles
    {
      id: 'article-a-before-vowel',
      pattern: /\ba\s+([aeiouAEIOU][a-zA-Z]*)/g,
      type: 'grammar',
      severity: 'medium',
      check: (text) => {
        const errors = [];
        const re = /\b(a)\s+([aeiouAEIOU][a-zA-Z]+)/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const nextWord = m[2];
          // Exceptions: "a user", "a university" (sounds like "you")
          const exceptions = ['user', 'university', 'unique', 'uniform', 'unit', 'universe', 'union', 'usage', 'use', 'useful', 'usual', 'using', 'ultimate', 'unanimous', 'urge', 'unicorn', 'united', 'unity'];
          if (!exceptions.some(ex => nextWord.toLowerCase().startsWith(ex.substring(0, 3)))) {
            errors.push({
              index: m.index,
              length: m[0].length,
              original: m[0],
              fix: `an ${m[2]}`,
              type: 'grammar',
              message: 'Use "an" before words starting with a vowel sound',
              explanation: `"An" is used before words that begin with a vowel sound. Write "an ${m[2]}" instead of "a ${m[2]}".`,
            });
          }
        }
        return errors;
      }
    },
    {
      id: 'article-an-before-consonant',
      check: (text) => {
        const errors = [];
        const re = /\ban\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][a-zA-Z]*)/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const nextWord = m[1].toLowerCase();
          // Exceptions: "an hour", "an honest"
          const exceptions = ['hour', 'honest', 'heir', 'honor', 'honour', 'herb'];
          if (!exceptions.some(ex => nextWord.startsWith(ex.substring(0, 3)))) {
            errors.push({
              index: m.index,
              length: m[0].length,
              original: m[0],
              fix: `a ${m[1]}`,
              type: 'grammar',
              message: 'Use "a" before words starting with a consonant sound',
              explanation: `"A" is used before words that begin with a consonant sound. Write "a ${m[1]}" instead of "an ${m[1]}".`,
            });
          }
        }
        return errors;
      }
    },
    // Double spaces
    {
      id: 'double-space',
      check: (text) => {
        const errors = [];
        const re = /  +/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          errors.push({
            index: m.index,
            length: m[0].length,
            original: m[0],
            fix: ' ',
            type: 'grammar',
            message: 'Extra space detected',
            explanation: 'Multiple consecutive spaces should be reduced to a single space.',
          });
        }
        return errors;
      }
    },
    // Capitalization after period
    {
      id: 'capitalize-after-period',
      check: (text) => {
        const errors = [];
        const re = /([.!?])\s+([a-z])/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          // Skip abbreviations (Mr. Dr. etc.)
          const before = text.substring(Math.max(0, m.index - 3), m.index + 1);
          const abbrevPattern = /\b(mr|mrs|ms|dr|prof|sr|jr|st|ave|blvd|dept|est|govt|mgr|rev|vs|vol|approx|etc|inc|ltd|corp)\./i;
          if (!abbrevPattern.test(before)) {
            errors.push({
              index: m.index + m[1].length + 1,
              length: 1,
              original: m[2],
              fix: m[2].toUpperCase(),
              type: 'grammar',
              message: 'Capitalize the first word of a new sentence',
              explanation: 'After a period, exclamation mark, or question mark, the next sentence should begin with a capital letter.',
            });
          }
        }
        return errors;
      }
    },
    // Comma splice detector (simplified)
    {
      id: 'common-word-pairs',
      check: (text) => {
        const errors = [];
        const patterns = [
          { re: /\bshould\s+of\b/gi, fix: 'should have', msg: '"Should of" is incorrect', exp: 'The correct phrase is "should have." "Of" is not a verb and cannot follow modal verbs.' },
          { re: /\bcould\s+of\b/gi, fix: 'could have', msg: '"Could of" is incorrect', exp: 'The correct phrase is "could have." This is a common mistake caused by how "could\'ve" sounds when spoken.' },
          { re: /\bwould\s+of\b/gi, fix: 'would have', msg: '"Would of" is incorrect', exp: 'The correct phrase is "would have."' },
          { re: /\bmight\s+of\b/gi, fix: 'might have', msg: '"Might of" is incorrect', exp: 'The correct phrase is "might have."' },
          { re: /\bmust\s+of\b/gi, fix: 'must have', msg: '"Must of" is incorrect', exp: 'The correct phrase is "must have."' },
          { re: /\bthen\s+me\b/gi, fix: 'than me', msg: 'Use "than" for comparisons', exp: '"Then" indicates time sequence; "than" is used for comparisons.' },
          { re: /\balot\b/gi, fix: 'a lot', msg: '"Alot" is not a word', exp: '"A lot" is two separate words. "Alot" is a common misspelling.' },
          { re: /\binfact\b/gi, fix: 'in fact', msg: '"Infact" is not a word', exp: '"In fact" is two words.' },
          { re: /\bofcourse\b/gi, fix: 'of course', msg: '"Ofcourse" is not a word', exp: '"Of course" is two words.' },
          { re: /\btherefor\b(?!e)/gi, fix: 'therefore', msg: 'Did you mean "therefore"?', exp: '"Therefore" means "for that reason." Make sure it\'s spelled correctly.' },
          { re: /\bits'\s/gi, fix: "its ", msg: 'Use "its" (possessive) not "its\'"', exp: '"Its" (without apostrophe) shows possession. "It\'s" (with apostrophe) means "it is."' },
          { re: /\bI\s+are\b/g, fix: 'I am', msg: '"I are" is grammatically incorrect', exp: 'The correct conjugation is "I am," not "I are."' },
          { re: /\byou\s+is\b/gi, fix: 'you are', msg: '"You is" is grammatically incorrect', exp: 'The correct form is "you are."' },
          { re: /\bthey\s+is\b/gi, fix: 'they are', msg: '"They is" is grammatically incorrect', exp: 'The correct form is "they are."' },
          { re: /\bwe\s+is\b/gi, fix: 'we are', msg: '"We is" is grammatically incorrect', exp: 'The correct form is "we are."' },
          { re: /\bvery\s+unique\b/gi, fix: 'unique', msg: '"Very unique" is redundant', exp: '"Unique" means one of a kind — it cannot be modified by "very." Simply use "unique."' },
          { re: /\bmore\s+better\b/gi, fix: 'better', msg: '"More better" is a double comparative', exp: 'Use just "better." "More" is already implied in the comparative form.' },
          { re: /\bmost\s+worst\b/gi, fix: 'worst', msg: '"Most worst" is a double superlative', exp: '"Worst" is already a superlative; "most" is redundant.' },
          { re: /\bunexpected\s+surprise\b/gi, fix: 'surprise', msg: '"Unexpected surprise" is redundant', exp: 'All surprises are unexpected by definition. Just say "surprise."' },
          { re: /\bfree\s+gift\b/gi, fix: 'gift', msg: '"Free gift" is redundant', exp: 'All gifts are free by definition. Use just "gift."' },
          { re: /\bexact\s+same\b/gi, fix: 'the same', msg: '"Exact same" is informal/redundant', exp: 'Consider using "exactly the same" or just "the same" in formal writing.' },
          { re: /\bpast\s+history\b/gi, fix: 'history', msg: '"Past history" is redundant', exp: 'History is always in the past. Use just "history."' },
          { re: /\bATM\s+machine\b/gi, fix: 'ATM', msg: '"ATM machine" is redundant', exp: 'ATM stands for "Automated Teller Machine." "ATM machine" is therefore redundant.' },
          { re: /\bdue\s+to\s+the\s+fact\s+that\b/gi, fix: 'because', msg: 'Wordy phrase detected', exp: '"Due to the fact that" can be replaced with the simpler word "because."' },
          { re: /\bin\s+order\s+to\b/gi, fix: 'to', msg: '"In order to" can be simplified', exp: 'In most cases, you can replace "in order to" with just "to" for more concise writing.' },
          { re: /\bat\s+this\s+point\s+in\s+time\b/gi, fix: 'now', msg: 'Wordy phrase', exp: '"At this point in time" is verbose. Use "now" or "currently" instead.' },
        ];

        patterns.forEach(({ re, fix, msg, exp }) => {
          let m;
          while ((m = re.exec(text)) !== null) {
            errors.push({
              index: m.index,
              length: m[0].length,
              original: m[0],
              fix,
              type: 'grammar',
              message: msg,
              explanation: exp,
            });
          }
        });

        return errors;
      }
    },
    // Passive voice detection
    {
      id: 'passive-voice',
      check: (text) => {
        const errors = [];
        const passiveRe = /\b(is|are|was|were|be|been|being)\s+([\w]+ed|built|bought|caught|brought|done|found|given|gone|grown|had|heard|held|kept|known|left|made|meant|met|paid|put|read|run|said|seen|sent|set|showed|stood|taken|told|thought|understood|worn|won)\b/gi;
        let m;
        while ((m = passiveRe.exec(text)) !== null) {
          errors.push({
            index: m.index,
            length: m[0].length,
            original: m[0],
            fix: null, // Passive voice requires context to fix
            type: 'style',
            message: 'Passive voice detected',
            explanation: `Consider rewriting "${m[0]}" in active voice for stronger, clearer writing. Active voice is generally more direct and engaging.`,
          });
        }
        return errors;
      }
    },
    // Weak words
    {
      id: 'weak-words',
      check: (text) => {
        const errors = [];
        const weakWords = [
          { re: /\bvery\s+good\b/gi, alt: 'excellent, outstanding, superb', explanation: '"Very good" is weak. Use a stronger adjective.' },
          { re: /\bvery\s+bad\b/gi, alt: 'terrible, awful, dreadful', explanation: '"Very bad" is vague. Use a more precise word.' },
          { re: /\bvery\s+big\b/gi, alt: 'enormous, massive, huge', explanation: '"Very big" can be replaced with a stronger word.' },
          { re: /\bvery\s+small\b/gi, alt: 'tiny, minuscule, microscopic', explanation: '"Very small" can be replaced with a stronger adjective.' },
          { re: /\bvery\s+fast\b/gi, alt: 'rapid, swift, lightning-fast', explanation: '"Very fast" can be expressed more powerfully.' },
          { re: /\bvery\s+slow\b/gi, alt: 'sluggish, glacial, plodding', explanation: '"Very slow" has stronger alternatives.' },
          { re: /\bvery\s+important\b/gi, alt: 'crucial, essential, critical', explanation: '"Very important" can be strengthened.' },
          { re: /\bvery\s+interesting\b/gi, alt: 'fascinating, compelling, captivating', explanation: '"Very interesting" is weak; consider a more vivid word.' },
          { re: /\bgot\b/gi, alt: 'received, obtained, acquired', explanation: '"Got" is informal. Consider a more precise verb.' },
          { re: /\bthing\b/gi, alt: 'item, object, element, aspect', explanation: '"Thing" is vague. Use a more specific noun.' },
        ];

        weakWords.forEach(({ re, alt, explanation }) => {
          let m;
          while ((m = re.exec(text)) !== null) {
            errors.push({
              index: m.index,
              length: m[0].length,
              original: m[0],
              fix: null,
              suggestions: alt.split(', '),
              type: 'style',
              message: `Weak expression: consider stronger alternatives`,
              explanation: `${explanation} Alternatives: ${alt}.`,
            });
          }
        });

        return errors;
      }
    },
    // Run-on sentences (very long sentences)
    {
      id: 'run-on-sentence',
      check: (text) => {
        const errors = [];
        const sentences = text.split(/[.!?]+/);
        let pos = 0;
        sentences.forEach(sentence => {
          const wordCount = sentence.trim().split(/\s+/).length;
          if (wordCount > 40) {
            errors.push({
              index: pos,
              length: sentence.length,
              original: sentence.trim().substring(0, 50) + '...',
              fix: null,
              type: 'clarity',
              message: 'Long sentence detected — consider breaking it up',
              explanation: `This sentence has ${wordCount} words. Sentences longer than 40 words can be hard to read. Consider splitting it into shorter sentences for better clarity.`,
            });
          }
          pos += sentence.length + 1;
        });
        return errors;
      }
    },
  ];

  // Readability analysis
  function analyzeReadability(text) {
    if (!text.trim()) {
      return { flesch: 0, grade: 0, level: 'N/A', sentences: 0, words: 0, avgWordLen: 0, avgSentenceLen: 0 };
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.match(/\b\w+\b/g) || [];
    const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);

    const numSentences = Math.max(sentences.length, 1);
    const numWords = Math.max(words.length, 1);

    // Flesch Reading Ease
    const flesch = Math.min(100, Math.max(0,
      206.835 - 1.015 * (numWords / numSentences) - 84.6 * (syllables / numWords)
    ));

    // Flesch-Kincaid Grade Level
    const grade = Math.max(0,
      0.39 * (numWords / numSentences) + 11.8 * (syllables / numWords) - 15.59
    );

    const avgWordLen = words.reduce((a, w) => a + w.length, 0) / numWords;
    const avgSentenceLen = numWords / numSentences;

    let level;
    if (flesch >= 90) level = 'Very Easy (5th grade)';
    else if (flesch >= 80) level = 'Easy (6th grade)';
    else if (flesch >= 70) level = 'Fairly Easy (7th grade)';
    else if (flesch >= 60) level = 'Standard (8th-9th grade)';
    else if (flesch >= 50) level = 'Fairly Difficult (10th-12th grade)';
    else if (flesch >= 30) level = 'Difficult (College level)';
    else level = 'Very Difficult (Professional)';

    // Count passive voice
    const passiveCount = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
    const passivePct = Math.round((passiveCount / numSentences) * 100);

    // Transition words
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'additionally', 'nevertheless', 'although', 'despite', 'whereas', 'meanwhile', 'similarly', 'in contrast', 'as a result', 'for example', 'for instance', 'in conclusion', 'finally', 'first', 'second', 'third', 'next', 'then', 'also', 'because', 'since', 'while'];
    const transitionCount = transitionWords.filter(t => text.toLowerCase().includes(t)).length;

    return {
      flesch: Math.round(flesch),
      grade: Math.round(grade * 10) / 10,
      level,
      sentences: numSentences,
      words: numWords,
      syllables,
      avgWordLen: Math.round(avgWordLen * 10) / 10,
      avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
      passivePct,
      transitionCount,
    };
  }

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  // Tone detection
  function detectTone(text) {
    const lower = text.toLowerCase();
    const toneKeywords = {
      professional: ['therefore', 'consequently', 'furthermore', 'moreover', 'however', 'pursuant', 'regarding', 'accordingly', 'herein', 'hereby'],
      friendly: ['thanks', 'great', 'awesome', 'sure', 'absolutely', 'happy', 'glad', 'please', 'hope', 'enjoy'],
      formal: ['sincerely', 'respectfully', 'kindly', 'hereby', 'aforementioned', 'shall', 'ought', 'must'],
      casual: ["won't", "can't", "gonna", "wanna", "yeah", "ok", "okay", "cool", "stuff", 'like', 'just', 'pretty'],
      confident: ['will', 'certainly', 'definitely', 'absolutely', 'ensure', 'guarantee', 'deliver', 'achieve'],
      persuasive: ['imagine', 'consider', 'discover', 'unlock', 'transform', 'proven', 'effective', 'powerful', 'exclusive'],
      empathetic: ['understand', 'appreciate', 'recognize', 'aware', 'concern', 'feel', 'support', 'care', 'listen'],
      urgent: ['immediately', 'urgent', 'critical', 'deadline', 'asap', 'now', 'quickly', 'hurry', 'important'],
    };

    const scores = {};
    for (const [tone, words] of Object.entries(toneKeywords)) {
      scores[tone] = words.filter(w => lower.includes(w)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    const detected = Object.entries(scores)
      .filter(([, s]) => s > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tone]) => tone);

    return {
      primary: detected[0] || 'neutral',
      secondary: detected.slice(1),
      scores,
      maxScore,
    };
  }

  // Writing score
  function calculateScore(text, spellErrors = [], grammarErrors = []) {
    if (!text.trim()) return { total: 0, grammar: 0, vocabulary: 0, clarity: 0, readability: 0, engagement: 0, professionalism: 0, conciseness: 0, originality: 85 };

    const words = (text.match(/\b\w+\b/g) || []).length;
    const readability = analyzeReadability(text);

    // Grammar score (100 - deductions)
    const grammarDeductions = Math.min(40, grammarErrors.filter(e => e.type === 'grammar').length * 5);
    const grammar = Math.max(0, 100 - grammarDeductions);

    // Spell score
    const spellDeductions = Math.min(40, spellErrors.length * 8);
    const spelling = Math.max(0, 100 - spellDeductions);

    // Clarity (based on avg sentence length)
    const clarity = readability.avgSentenceLen < 15 ? 95 :
                   readability.avgSentenceLen < 20 ? 88 :
                   readability.avgSentenceLen < 25 ? 78 :
                   readability.avgSentenceLen < 35 ? 65 : 50;

    // Readability score
    const readScore = Math.min(100, readability.flesch);

    // Vocabulary (unique word ratio)
    const uniqueWords = new Set((text.match(/\b[a-z]+\b/gi) || []).map(w => w.toLowerCase())).size;
    const vocabRatio = words > 0 ? uniqueWords / words : 0;
    const vocabulary = Math.min(100, Math.round(vocabRatio * 150));

    // Engagement (varied sentence lengths, transitions)
    const engagement = Math.min(100, 60 + readability.transitionCount * 5);

    // Professionalism
    const styleErrors = grammarErrors.filter(e => e.type === 'style').length;
    const professionalism = Math.max(0, 100 - styleErrors * 3);

    // Conciseness (fewer redundancies)
    const redundancyCount = grammarErrors.filter(e => e.message && e.message.includes('redundant')).length;
    const conciseness = Math.max(0, 100 - redundancyCount * 10);

    const total = Math.round(
      grammar * 0.20 +
      spelling * 0.15 +
      clarity * 0.15 +
      readScore * 0.15 +
      vocabulary * 0.15 +
      engagement * 0.10 +
      professionalism * 0.05 +
      conciseness * 0.05
    );

    return { total, grammar, spelling, clarity, readability: readScore, vocabulary, engagement, professionalism, conciseness, originality: 85 };
  }

  // AI detection heuristic
  function detectAI(text) {
    if (text.trim().length < 50) return { probability: 0, label: 'N/A', confidence: 0 };

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = (text.match(/\b\w+\b/g) || []);

    // Heuristic signals (simplified)
    let aiScore = 0;

    // 1. Very uniform sentence lengths
    const sentLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLen = sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length;
    const variance = sentLengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / sentLengths.length;
    if (variance < 15) aiScore += 25;

    // 2. High transition word density
    const transitions = ['furthermore', 'moreover', 'additionally', 'consequently', 'therefore', 'however', 'nevertheless', 'in conclusion', 'in summary', 'it is important', 'it should be noted', 'it is worth noting'];
    const transCount = transitions.filter(t => text.toLowerCase().includes(t)).length;
    if (transCount > 3) aiScore += 20;

    // 3. Common AI phrases
    const aiPhrases = ['as an ai', 'as a language model', 'i cannot provide', 'certainly!', 'of course!', 'great question', 'in this article, we will', 'in conclusion,', 'it is important to note', 'it is worth mentioning', 'there are several', 'there are many', 'delve into', 'dive into'];
    const phraseCount = aiPhrases.filter(p => text.toLowerCase().includes(p)).length;
    aiScore += phraseCount * 15;

    // 4. Overly formal consistent tone
    const formalWords = ['utilize', 'leverage', 'facilitate', 'implement', 'optimize', 'streamline', 'synergy', 'paradigm'];
    const formalCount = formalWords.filter(w => text.toLowerCase().includes(w)).length;
    if (formalCount > 2) aiScore += 10;

    // 5. Low first-person usage
    const firstPerson = (text.match(/\b(I|me|my|mine|myself)\b/g) || []).length;
    if (firstPerson < 2 && words.length > 100) aiScore += 15;

    // 6. Very high average word length (AI tends to use longer words)
    const avgWordLen = words.reduce((a, w) => a + w.length, 0) / words.length;
    if (avgWordLen > 6) aiScore += 15;

    const probability = Math.min(100, aiScore);
    const label = probability > 70 ? 'AI Generated' :
                  probability > 40 ? 'Likely AI (Mixed)' :
                  probability > 20 ? 'Possibly AI' : 'Likely Human';

    return {
      probability,
      label,
      confidence: Math.abs(50 - probability) + 50,
    };
  }

  /**
   * Run all grammar checks
   */
  function check(text) {
    const errors = [];
    RULES.forEach(rule => {
      try {
        const ruleErrors = rule.check(text);
        errors.push(...ruleErrors);
      } catch (e) {
        // Silently fail for individual rules
      }
    });

    // Sort by index and remove overlapping
    errors.sort((a, b) => a.index - b.index);
    const deduped = [];
    let lastEnd = -1;
    errors.forEach(e => {
      if (e.index >= lastEnd) {
        deduped.push(e);
        lastEnd = e.index + e.length;
      }
    });

    return deduped;
  }

  return {
    check,
    analyzeReadability,
    detectTone,
    calculateScore,
    detectAI,
    countSyllables,
  };
})();

window.GrammarEngine = GrammarEngine;
