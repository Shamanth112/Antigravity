/**
 * AutoCorrect AI — AI Writing Assistant
 * Simulates AI features: rewrite, summarize, translate, vocabulary, tone
 */

const AIAssistant = (() => {

  // Synonym database
  const SYNONYMS = {
    'good': ['excellent', 'outstanding', 'superb', 'exceptional', 'remarkable'],
    'bad': ['poor', 'inferior', 'substandard', 'inadequate', 'deficient'],
    'big': ['large', 'substantial', 'extensive', 'considerable', 'massive'],
    'small': ['tiny', 'minuscule', 'compact', 'petite', 'diminutive'],
    'fast': ['rapid', 'swift', 'expeditious', 'prompt', 'accelerated'],
    'slow': ['gradual', 'deliberate', 'measured', 'unhurried', 'leisurely'],
    'important': ['crucial', 'essential', 'critical', 'pivotal', 'fundamental'],
    'interesting': ['fascinating', 'compelling', 'captivating', 'intriguing', 'engrossing'],
    'happy': ['delighted', 'elated', 'thrilled', 'ecstatic', 'jubilant'],
    'sad': ['melancholy', 'despondent', 'sorrowful', 'dejected', 'disheartened'],
    'old': ['ancient', 'aged', 'venerable', 'antiquated', 'archaic'],
    'new': ['novel', 'innovative', 'cutting-edge', 'contemporary', 'state-of-the-art'],
    'use': ['utilize', 'employ', 'leverage', 'harness', 'apply'],
    'make': ['create', 'produce', 'generate', 'develop', 'craft'],
    'think': ['consider', 'contemplate', 'deliberate', 'reflect', 'ponder'],
    'say': ['state', 'assert', 'declare', 'proclaim', 'articulate'],
    'show': ['demonstrate', 'illustrate', 'exhibit', 'reveal', 'display'],
    'get': ['obtain', 'acquire', 'procure', 'attain', 'secure'],
    'help': ['assist', 'support', 'facilitate', 'enable', 'aid'],
    'start': ['initiate', 'commence', 'launch', 'embark', 'inaugurate'],
    'end': ['conclude', 'terminate', 'finalize', 'complete', 'wrap up'],
    'improve': ['enhance', 'optimize', 'elevate', 'refine', 'advance'],
    'change': ['transform', 'modify', 'alter', 'revise', 'restructure'],
    'increase': ['amplify', 'expand', 'augment', 'escalate', 'boost'],
    'decrease': ['reduce', 'diminish', 'minimize', 'curtail', 'mitigate'],
    'clear': ['transparent', 'lucid', 'unambiguous', 'explicit', 'evident'],
    'hard': ['challenging', 'arduous', 'demanding', 'rigorous', 'formidable'],
    'easy': ['straightforward', 'effortless', 'seamless', 'intuitive', 'accessible'],
    'many': ['numerous', 'abundant', 'myriad', 'multitude', 'plethora'],
    'few': ['limited', 'scarce', 'sparse', 'minimal', 'select'],
    'very': ['extremely', 'exceptionally', 'remarkably', 'extraordinarily', 'significantly'],
    'always': ['consistently', 'invariably', 'perpetually', 'unfailingly', 'reliably'],
    'never': ['seldom', 'rarely', 'infrequently', 'scarcely', 'barely'],
    'beautiful': ['stunning', 'exquisite', 'breathtaking', 'magnificent', 'captivating'],
    'problem': ['challenge', 'obstacle', 'impediment', 'complication', 'issue'],
    'solution': ['resolution', 'remedy', 'approach', 'strategy', 'answer'],
    'goal': ['objective', 'target', 'aim', 'aspiration', 'milestone'],
    'result': ['outcome', 'consequence', 'product', 'yield', 'achievement'],
    'work': ['operate', 'function', 'perform', 'execute', 'implement'],
    'plan': ['strategy', 'blueprint', 'roadmap', 'framework', 'approach'],
    'idea': ['concept', 'notion', 'proposition', 'hypothesis', 'insight'],
    'key': ['critical', 'pivotal', 'fundamental', 'essential', 'central'],
    'real': ['genuine', 'authentic', 'actual', 'concrete', 'substantive'],
    'simple': ['straightforward', 'uncomplicated', 'elementary', 'basic', 'streamlined'],
    'complex': ['sophisticated', 'intricate', 'multifaceted', 'elaborate', 'nuanced'],
    'main': ['primary', 'principal', 'central', 'predominant', 'paramount'],
    'try': ['attempt', 'endeavor', 'strive', 'seek', 'pursue'],
    'find': ['discover', 'identify', 'uncover', 'detect', 'ascertain'],
    'need': ['require', 'necessitate', 'demand', 'entail', 'mandate'],
    'want': ['desire', 'seek', 'aspire to', 'aim for', 'intend'],
    'know': ['understand', 'recognize', 'comprehend', 'grasp', 'discern'],
    'tell': ['inform', 'communicate', 'convey', 'relay', 'notify'],
    'ask': ['inquire', 'request', 'query', 'solicit', 'seek'],
    'give': ['provide', 'offer', 'supply', 'present', 'contribute'],
    'take': ['obtain', 'acquire', 'adopt', 'employ', 'pursue'],
  };

  // Tone transformation templates
  const TONE_TRANSFORMATIONS = {
    professional: {
      prefix: 'In a professional context, ',
      replacements: [
        [/\bI wanna\b/gi, 'I would like to'],
        [/\bgonna\b/gi, 'going to'],
        [/\bkinda\b/gi, 'somewhat'],
        [/\bpretty\s+(\w+)/gi, 'quite $1'],
        [/\bsort of\b/gi, 'somewhat'],
        [/\blots of\b/gi, 'numerous'],
        [/\ba lot of\b/gi, 'a significant number of'],
        [/\bawesome\b/gi, 'excellent'],
        [/\bgreat\b/gi, 'outstanding'],
        [/\bthanks\b/gi, 'thank you'],
        [/\bokay\b/gi, 'acceptable'],
        [/\bok\b/gi, 'acknowledged'],
      ],
    },
    academic: {
      prefix: '',
      replacements: [
        [/\bI think\b/gi, 'This analysis suggests'],
        [/\bI believe\b/gi, 'The evidence indicates'],
        [/\bI feel\b/gi, 'The data demonstrates'],
        [/\bshows\b/gi, 'demonstrates'],
        [/\buse\b/gi, 'utilize'],
        [/\bhelps?\b/gi, 'facilitates'],
        [/\bgetss?\b/gi, 'obtains'],
        [/\bgood\b/gi, 'beneficial'],
        [/\bbad\b/gi, 'detrimental'],
        [/\bbig\b/gi, 'substantial'],
      ],
    },
    friendly: {
      prefix: '',
      replacements: [
        [/\bHowever\b/gi, 'But hey,'],
        [/\bNevertheless\b/gi, "Still,"],
        [/\bFurthermore\b/gi, 'Also,'],
        [/\bIn conclusion\b/gi, "So, to wrap it up,"],
        [/\butilize\b/gi, 'use'],
        [/\bfacilitate\b/gi, 'help'],
        [/\bprocure\b/gi, 'get'],
      ],
    },
    formal: {
      prefix: '',
      replacements: [
        [/\bI'm\b/gi, 'I am'],
        [/\bI've\b/gi, 'I have'],
        [/\bI'll\b/gi, 'I will'],
        [/\bI'd\b/gi, 'I would'],
        [/\bdon't\b/gi, 'do not'],
        [/\bcan't\b/gi, 'cannot'],
        [/\bwon't\b/gi, 'will not'],
        [/\bisn't\b/gi, 'is not'],
        [/\baren't\b/gi, 'are not'],
        [/\bwasn't\b/gi, 'was not'],
        [/\bdidn't\b/gi, 'did not'],
        [/\bwouldn't\b/gi, 'would not'],
        [/\bshouldn't\b/gi, 'should not'],
        [/\bcouldn't\b/gi, 'could not'],
        [/\bhasn't\b/gi, 'has not'],
        [/\bhaven't\b/gi, 'have not'],
        [/\bYou'll\b/gi, 'You will'],
        [/\bThey're\b/gi, 'They are'],
        [/\bWe're\b/gi, 'We are'],
        [/\bIt's\b/gi, 'It is'],
        [/\bThat's\b/gi, 'That is'],
      ],
    },
    confident: {
      prefix: '',
      replacements: [
        [/\bI think\b/gi, 'I know'],
        [/\bI believe\b/gi, 'I am certain'],
        [/\bperhaps\b/gi, 'certainly'],
        [/\bmaybe\b/gi, 'absolutely'],
        [/\bpossibly\b/gi, 'definitely'],
        [/\bI'm not sure\b/gi, 'I am confident'],
        [/\bit might be\b/gi, 'it is'],
        [/\btrying to\b/gi, 'committed to'],
        [/\bhope to\b/gi, 'will'],
      ],
    },
    simple: {
      prefix: '',
      replacements: [
        [/\butilize\b/gi, 'use'],
        [/\bfacilitate\b/gi, 'help'],
        [/\bprocure\b/gi, 'get'],
        [/\bascertain\b/gi, 'find out'],
        [/\bcommence\b/gi, 'start'],
        [/\bterminate\b/gi, 'end'],
        [/\bexpeditiously\b/gi, 'quickly'],
        [/\bsubstantial\b/gi, 'big'],
        [/\bminuscule\b/gi, 'tiny'],
        [/\bindividuals\b/gi, 'people'],
        [/\bpurchase\b/gi, 'buy'],
        [/\bnevertheless\b/gi, 'but'],
        [/\bfurthermore\b/gi, 'also'],
        [/\bconsequently\b/gi, 'so'],
        [/\bmoreover\b/gi, 'also'],
        [/\bsufficient\b/gi, 'enough'],
        [/\brequire\b/gi, 'need'],
        [/\bobtain\b/gi, 'get'],
      ],
    },
  };

  // Language mock translations (simplified)
  const MOCK_TRANSLATIONS = {
    es: { greeting: 'Este texto ha sido traducido al español.', suffix: ' [Traducido]' },
    fr: { greeting: 'Ce texte a été traduit en français.', suffix: ' [Traduit]' },
    de: { greeting: 'Dieser Text wurde ins Deutsche übersetzt.', suffix: ' [Übersetzt]' },
    it: { greeting: 'Questo testo è stato tradotto in italiano.', suffix: ' [Tradotto]' },
    pt: { greeting: 'Este texto foi traduzido para o português.', suffix: ' [Traduzido]' },
    ja: { greeting: 'このテキストは日本語に翻訳されました。', suffix: ' [翻訳済み]' },
    zh: { greeting: '此文本已翻译成中文。', suffix: ' [已翻译]' },
    ar: { greeting: 'تمت ترجمة هذا النص إلى اللغة العربية.', suffix: ' [مترجم]' },
    hi: { greeting: 'यह पाठ हिंदी में अनुवादित किया गया है।', suffix: ' [अनुवादित]' },
    ko: { greeting: '이 텍스트는 한국어로 번역되었습니다.', suffix: ' [번역됨]' },
    ru: { greeting: 'Этот текст был переведён на русский язык.', suffix: ' [Переведено]' },
    nl: { greeting: 'Deze tekst is naar het Nederlands vertaald.', suffix: ' [Vertaald]' },
    sv: { greeting: 'Denna text har översatts till svenska.', suffix: ' [Översatt]' },
    pl: { greeting: 'Ten tekst został przetłumaczony na język polski.', suffix: ' [Przetłumaczono]' },
    tr: { greeting: 'Bu metin Türkçeye çevrildi.', suffix: ' [Çevrildi]' },
  };

  // Templates
  const TEMPLATES = {
    email_professional: {
      name: 'Professional Email',
      icon: '📧',
      content: `Subject: [Your Subject Here]

Dear [Recipient Name],

I hope this message finds you well. I am writing to [state your purpose clearly].

[Main body — provide details, context, or your request]

I would appreciate your response at your earliest convenience. Please feel free to reach out if you have any questions or require additional information.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Title]
[Your Contact Information]`,
    },
    email_followup: {
      name: 'Follow-up Email',
      icon: '🔄',
      content: `Subject: Following Up — [Previous Topic]

Dear [Name],

I wanted to follow up on my previous email dated [date] regarding [topic].

I understand you may be busy, but I would appreciate any update you can provide. The key points I am waiting to hear back on are:

• [Point 1]
• [Point 2]
• [Point 3]

Please let me know if there is anything I can do to facilitate this process. I look forward to hearing from you.

Warm regards,
[Your Name]`,
    },
    blog_intro: {
      name: 'Blog Introduction',
      icon: '✍️',
      content: `# [Your Blog Title Here]

*Published on [Date] | [X] min read*

Have you ever wondered about [topic]? If so, you're not alone. Millions of people face this exact challenge every day, and the good news is — there's a solution.

In this article, I'll walk you through everything you need to know about [topic], including:

- **[Key point 1]** — Why it matters
- **[Key point 2]** — How it works
- **[Key point 3]** — What you can do about it

Whether you're a beginner or an expert, there's something here for everyone. Let's dive in.

---`,
    },
    cover_letter: {
      name: 'Cover Letter',
      icon: '📄',
      content: `[Your Name]
[Your Address]
[City, State, ZIP]
[Email] | [Phone]
[Date]

[Hiring Manager's Name]
[Company Name]
[Company Address]

Dear [Hiring Manager's Name],

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With [X years] of experience in [field], I am confident in my ability to make a significant contribution to your team.

In my current role at [Current Company], I have [describe a key achievement with measurable results]. This experience has equipped me with the skills and knowledge to excel in the responsibilities outlined for this position.

What particularly excites me about [Company Name] is [specific reason — show you've done research]. I believe my background in [relevant skill] aligns perfectly with your mission to [company goal].

I would welcome the opportunity to discuss how my experience can benefit [Company Name]. Thank you for your time and consideration.

Sincerely,
[Your Name]`,
    },
    resume_summary: {
      name: 'Resume Summary',
      icon: '👤',
      content: `PROFESSIONAL SUMMARY

Dynamic and results-driven [Job Title] with [X] years of experience in [industry/field]. Proven track record of [key achievement 1] and [key achievement 2]. Expertise in [Skill 1], [Skill 2], and [Skill 3]. Known for [unique quality] and committed to driving organizational growth through [approach].

KEY SKILLS
• [Technical Skill 1]
• [Technical Skill 2]  
• [Soft Skill 1]
• [Industry Knowledge]
• [Tool/Software]

SELECTED ACHIEVEMENTS
• Increased [metric] by [X]% through [action taken]
• Led a team of [X] to deliver [project] [X]% under budget
• Reduced [inefficiency] by [X]% by implementing [solution]`,
    },
    linkedin_post: {
      name: 'LinkedIn Post',
      icon: '💼',
      content: `🚀 [Exciting opening hook — start with a bold statement or question]

[Share your insight, story, or lesson in 2-3 short paragraphs]

[Personal story or specific example that adds credibility]

Here's what I learned from this experience:

✅ [Key takeaway 1]
✅ [Key takeaway 2]
✅ [Key takeaway 3]

[Closing thought that provides value or inspiration]

💬 What's your experience with [related topic]? Share in the comments below!

#[Hashtag1] #[Hashtag2] #[Hashtag3]`,
    },
    product_description: {
      name: 'Product Description',
      icon: '🛍️',
      content: `[Product Name] — [Tagline]

✨ **Transform your [problem] with [Product Name]**

Are you tired of [pain point]? [Product Name] is designed specifically for [target audience] who want [key benefit].

**Why [Product Name]?**

🎯 **[Feature 1]** — [Benefit explained in one sentence]
⚡ **[Feature 2]** — [Benefit explained in one sentence]  
🔒 **[Feature 3]** — [Benefit explained in one sentence]
💎 **[Feature 4]** — [Benefit explained in one sentence]

**What's Included:**
• [Item 1]
• [Item 2]
• [Item 3]

**Specifications:**
- [Spec 1]: [Value]
- [Spec 2]: [Value]

⭐⭐⭐⭐⭐ *"[Customer quote]"* — [Customer Name]

[Call to action — Order now, Add to cart, etc.]`,
    },
    essay_intro: {
      name: 'Essay Introduction',
      icon: '📚',
      content: `[Essay Title]

Introduction

[Hook: Start with a compelling fact, quote, question, or anecdote that grabs attention.]

[Context: Provide background information that the reader needs to understand your topic. This is typically 2-3 sentences.]

[Bridge: Connect your hook and context to your main argument.]

Thesis Statement: This essay argues that [your main claim], because [reason 1], [reason 2], and [reason 3].

[Signpost: Briefly outline what the essay will cover — e.g., "First, the essay will examine... then it will analyze... and finally..."]`,
    },
  };

  // Rewrite text with tone
  function rewriteWithTone(text, tone) {
    if (!text.trim()) return text;

    const transform = TONE_TRANSFORMATIONS[tone];
    if (!transform) return text;

    let result = text;

    // Apply replacements
    transform.replacements.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });

    return result;
  }

  // Humanize AI text
  function humanize(text) {
    if (!text.trim()) return text;

    const humanizations = [
      [/\bIn conclusion\b/gi, 'To wrap things up'],
      [/\bFurthermore\b/gi, 'Also'],
      [/\bMoreover\b/gi, 'On top of that'],
      [/\bConsequently\b/gi, 'Because of this'],
      [/\bNevertheless\b/gi, 'Still'],
      [/\bNotwithstanding\b/gi, 'Despite that'],
      [/\bIt is important to note that\b/gi, 'Worth noting —'],
      [/\bIt is worth mentioning that\b/gi, 'Interestingly,'],
      [/\bAs previously mentioned\b/gi, 'Like I said'],
      [/\bIn this regard\b/gi, 'Here'],
      [/\bWith respect to\b/gi, 'About'],
      [/\bIn terms of\b/gi, 'For'],
      [/\bAt this juncture\b/gi, 'Right now'],
      [/\butilize\b/gi, 'use'],
      [/\bfacilitate\b/gi, 'help'],
      [/\bcommence\b/gi, 'start'],
      [/\bterminate\b/gi, 'end'],
      [/\bprocure\b/gi, 'get'],
      [/\bascertain\b/gi, 'find out'],
      [/\bdemonstrate\b/gi, 'show'],
      [/\bimplemented\b/gi, 'put in place'],
      [/\bOptimize\b/gi, 'improve'],
      [/\bLeverage\b/gi, 'Use'],
      [/\bsynergy\b/gi, 'teamwork'],
      [/\bparadigm shift\b/gi, 'big change'],
      [/\bcore competency\b/gi, 'strength'],
      [/\bvalue proposition\b/gi, 'what makes it valuable'],
      [/\bdelve into\b/gi, 'explore'],
      [/\bdive into\b/gi, 'explore'],
    ];

    let result = text;
    humanizations.forEach(([pattern, replacement]) => {
      result = result.replace(pattern, replacement);
    });

    return result;
  }

  // Summarize text
  function summarize(text) {
    if (!text.trim()) return '';

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length <= 3) return text;

    // Extract key sentences (first, a middle one, and implications)
    const key = [
      sentences[0],
      sentences[Math.floor(sentences.length / 2)],
      sentences[sentences.length - 1],
    ].map(s => s.trim()).join('. ');

    return `Summary: ${key}.`;
  }

  // Expand text
  function expand(text) {
    if (!text.trim()) return text;

    const expansions = [
      '\n\nTo elaborate further on this point, it is important to consider the broader context and implications. ',
      'There are several dimensions to this topic that merit careful examination. ',
      'Additionally, the evidence supporting this perspective is compelling and multifaceted. ',
      'The practical applications of this concept extend across numerous domains and use cases. ',
    ];

    return text + expansions[Math.floor(Math.random() * expansions.length)];
  }

  // Shorten text
  function shorten(text) {
    if (!text.trim()) return text;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return text;

    // Keep first 60% of sentences
    const keep = Math.ceil(sentences.length * 0.6);
    return sentences.slice(0, keep).join('. ').trim() + '.';
  }

  // Get synonyms for a word
  function getSynonyms(word) {
    const lower = word.toLowerCase();
    return SYNONYMS[lower] || [];
  }

  // Mock translation
  function translate(text, targetLang) {
    const mock = MOCK_TRANSLATIONS[targetLang];
    if (!mock) return `[Translation to ${targetLang} not available in demo]`;

    // In a real app, this would call DeepL or Google Translate API
    return `${mock.greeting}\n\n[Demo: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" ${mock.suffix}]\n\n(Connect a translation API like DeepL or Google Translate for real translations)`;
  }

  // Suggest vocabulary improvements
  function suggestVocabulary(text) {
    const suggestions = [];
    const words = text.match(/\b[a-z]+\b/gi) || [];

    const seen = new Set();
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);

      const syns = SYNONYMS[lower];
      if (syns && syns.length > 0) {
        suggestions.push({
          original: word,
          replacements: syns.slice(0, 3),
          strength: syns[0].length > word.length ? 'power' : 'clarity',
        });
      }
    });

    return suggestions.slice(0, 8);
  }

  // Generate content types
  function generateContent(type, topic) {
    const generators = {
      blog: () => `# ${topic}: Everything You Need to Know\n\n*A comprehensive guide for beginners and experts alike*\n\nIn today's fast-paced world, understanding ${topic} has never been more critical. Whether you're just starting out or looking to deepen your expertise, this guide will walk you through everything you need to know.\n\n## Why ${topic} Matters\n\n${topic} is reshaping how we think about [industry/field]. Here's why it deserves your attention:\n\n1. **Impact**: The effects of ${topic} are felt across multiple sectors\n2. **Opportunity**: Early adopters gain significant competitive advantages\n3. **Future-proofing**: Understanding this now prepares you for tomorrow's challenges\n\n## Getting Started with ${topic}\n\n[Continue writing your blog post here...]`,

      instagram: () => `✨ [Eye-catching emoji] ${topic} is changing the game — here's how!\n\n🔥 Key insight about ${topic}\n💡 Why this matters to YOU\n🚀 What you can do about it today\n\nSave this post if you found it helpful! 🙌\n\nDouble tap if you agree! ❤️\n\n.\n.\n.\n#${topic.replace(/\s+/g, '')} #growthmindset #motivation #success #tips #lifehacks #learning #inspiration #mindset`,

      tweet: () => `🚀 Just realized something about ${topic} that changed my perspective:\n\n[Your insight here — make it punchy and memorable]\n\nThread below 👇`,

      linkedin: () => `I've been thinking about ${topic} lately, and I wanted to share some thoughts with my network.\n\n[Your professional insight about ${topic}]\n\nAfter [X] years in this industry, here's what I've learned:\n\n✅ Insight #1 about ${topic}\n✅ Insight #2 that most people miss\n✅ The counterintuitive truth about this\n\nWhat's your experience with ${topic}? I'd love to hear different perspectives.\n\n#Professional #Insights #${topic.replace(/\s+/g, '')}`,

      email: () => `Subject: Quick Question About ${topic}\n\nHi [Name],\n\nI hope you're having a great week! I wanted to reach out about ${topic}.\n\n[State your specific question or purpose related to ${topic}]\n\nWould you have 15 minutes this week to chat? I'd really appreciate your insights.\n\nThanks so much!\n[Your name]`,
    };

    const gen = generators[type];
    return gen ? gen() : `[Generated content for: ${topic}]`;
  }

  // AI Chat responses
  const CHAT_RESPONSES = {
    greet: ["Hello! I'm your AI writing assistant. How can I help you improve your writing today? 🖊️", "Hi there! Ready to make your writing shine? What would you like to work on?"],
    improve: ["I've analyzed your text and found several areas for improvement. Let me help you enhance clarity and impact!", "Great text! Here are some suggestions to make it even more compelling..."],
    explain: ["Great question! Let me break this down for you...", "Of course! Here's a clear explanation..."],
    default: [
      "I can help with that! Here are my suggestions for improving your writing...",
      "Excellent! Let me analyze that and provide some targeted recommendations...",
      "I've reviewed your text. Here are the key improvements I'd suggest...",
      "That's a great question about writing! Here's what I recommend...",
      "I understand what you're looking for. Let me help you craft something better...",
    ],
    summarize: ["Here's a concise summary of your text: It covers the main points including [key topic 1], [key topic 2], and concludes with [main takeaway]."],
    translate: ["I can translate your text to multiple languages. Note: In this demo, I provide mock translations. Connect DeepL or Google Translate API for real translations!"],
    grammar: ["I've found some grammar patterns in your text worth reviewing. The most important fixes are: (1) subject-verb agreement issues, (2) article usage, and (3) sentence structure."],
    tone: ["Your text has a professional and formal tone overall. I notice some sentences that could be more engaging. Would you like me to suggest specific tone adjustments?"],
    rewrite: ["I've rewritten that section with improved clarity and flow. The key changes I made: simplified complex sentences, replaced weak verbs with stronger alternatives, and improved the overall structure."],
    score: ["Your writing score is based on 8 factors: Grammar, Spelling, Clarity, Readability, Vocabulary, Engagement, Professionalism, and Conciseness. Your current text scores well on Grammar but could improve on Vocabulary diversity."],
  };

  function getChatResponse(input) {
    const lower = input.toLowerCase();
    let responses = CHAT_RESPONSES.default;

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) responses = CHAT_RESPONSES.greet;
    else if (lower.includes('improve') || lower.includes('better')) responses = CHAT_RESPONSES.improve;
    else if (lower.includes('explain') || lower.includes('why') || lower.includes('what')) responses = CHAT_RESPONSES.explain;
    else if (lower.includes('summarize') || lower.includes('summary')) responses = CHAT_RESPONSES.summarize;
    else if (lower.includes('translate')) responses = CHAT_RESPONSES.translate;
    else if (lower.includes('grammar')) responses = CHAT_RESPONSES.grammar;
    else if (lower.includes('tone')) responses = CHAT_RESPONSES.tone;
    else if (lower.includes('rewrite')) responses = CHAT_RESPONSES.rewrite;
    else if (lower.includes('score')) responses = CHAT_RESPONSES.score;

    return responses[Math.floor(Math.random() * responses.length)];
  }

  return {
    rewriteWithTone,
    humanize,
    summarize,
    expand,
    shorten,
    getSynonyms,
    translate,
    suggestVocabulary,
    generateContent,
    getChatResponse,
    TEMPLATES,
    SYNONYMS,
    TONE_TRANSFORMATIONS,
  };
})();

window.AIAssistant = AIAssistant;
