/**
 * AutoCorrect AI — Main Editor Controller
 * Orchestrates all modules and handles the editor dashboard
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // State
  // ============================================================
  let currentDoc = null;
  let currentPanel = 'suggestions';
  let currentSideView = 'editor';
  let autoSaveTimer = null;
  let analysisTimer = null;
  let isSidebarCollapsed = false;
  let allErrors = [];

  const settings = Storage.getSettings();

  // ============================================================
  // Toast (global)
  // ============================================================
  window.showToast = function(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <span class="toast-close" onclick="this.closest('.toast').remove()">✕</span>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, duration);
  };

  // ============================================================
  // Document Management
  // ============================================================
  function loadOrCreateDocument() {
    const docId = Storage.getCurrentDocId();
    if (docId) {
      const doc = Storage.getDocument(docId);
      if (doc) { currentDoc = doc; applyDocToEditor(); return; }
    }
    // Create new
    currentDoc = Storage.createDocument('My First Document');
    Storage.setCurrentDocId(currentDoc.id);
    getEditor().innerHTML = '';
    updateDocTitle();
  }

  function applyDocToEditor() {
    const editor = getEditor();
    if (!editor) return;
    editor.innerHTML = currentDoc.content || '';
    updateDocTitle();
    scheduleAnalysis(100);
  }

  function saveCurrentDocument() {
    if (!currentDoc) return;
    const editor = getEditor();
    const text = editor ? editor.innerText : '';
    const html = editor ? editor.innerHTML : '';

    currentDoc.content = html;
    currentDoc.wordCount = countWords(text);
    currentDoc.charCount = text.length;
    Storage.saveDocument(currentDoc);

    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.innerHTML = `<span class="autosave-dot"></span> Saved`;
      setTimeout(() => {
        indicator.innerHTML = `<span class="autosave-dot"></span> Auto-saving...`;
      }, 2000);
    }
  }

  function scheduleAutosave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveCurrentDocument, settings.autoSaveInterval || 5000);
  }

  function updateDocTitle() {
    const el = document.getElementById('doc-name');
    if (el && currentDoc) el.textContent = currentDoc.title;
  }

  // ============================================================
  // Editor Reference
  // ============================================================
  function getEditor() {
    return document.getElementById('editor-content');
  }

  function getPlainText() {
    return getEditor()?.innerText || '';
  }

  // ============================================================
  // Word Count
  // ============================================================
  function countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
  }

  function calcReadingTime(words) {
    return Math.max(1, Math.ceil(words / 238));
  }

  function countSentences(text) {
    return (text.match(/[.!?]+/g) || []).length;
  }

  function updateStats() {
    const text = getPlainText();
    const words = countWords(text);
    const chars = text.length;
    const sentences = countSentences(text);
    const readingTime = calcReadingTime(words);

    document.getElementById('stat-words').textContent = words.toLocaleString();
    document.getElementById('stat-chars').textContent = chars.toLocaleString();
    document.getElementById('stat-sentences').textContent = sentences;
    document.getElementById('stat-reading').textContent = `${readingTime} min`;
    document.getElementById('stat-paragraphs').textContent =
      (text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length) || 1;
  }

  // ============================================================
  // Analysis Engine
  // ============================================================
  function scheduleAnalysis(delay = 800) {
    clearTimeout(analysisTimer);
    analysisTimer = setTimeout(runAnalysis, delay);
  }

  function runAnalysis() {
    const text = getPlainText();
    if (!text.trim()) {
      clearSuggestions();
      updateScoreRing(0);
      return;
    }

    const spellErrors = SpellChecker.check(text);
    const grammarErrors = GrammarEngine.check(text);
    allErrors = [...spellErrors, ...grammarErrors];

    renderSuggestions(allErrors);
    updateWritingScore(text, spellErrors, grammarErrors);
    updateReadability(text);
    updateToneIndicator(text);
    updateVocabSuggestions(text);
    updateStats();
  }

  // ============================================================
  // Suggestions Panel
  // ============================================================
  function clearSuggestions() {
    const list = document.getElementById('corrections-list');
    if (list) list.innerHTML = `<p class="text-center text-muted" style="font-size:13px;padding:20px">Start writing to see AI suggestions...</p>`;
    document.getElementById('error-count').textContent = '0';
  }

  function renderSuggestions(errors) {
    const list = document.getElementById('corrections-list');
    const countEl = document.getElementById('error-count');

    if (!list) return;
    if (countEl) countEl.textContent = errors.length;

    if (errors.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:30px"><div style="font-size:48px;margin-bottom:12px">✅</div><p style="color:var(--primary);font-weight:600;font-size:14px">Excellent! No issues found.</p><p style="color:var(--text-muted);font-size:12px;margin-top:4px">Your writing looks great!</p></div>`;
      return;
    }

    list.innerHTML = errors.slice(0, 20).map((err, i) => `
      <div class="correction-item type-${err.type}" id="correction-${i}" onclick="Editor.highlightError(${i})">
        <div class="correction-header">
          <span class="correction-type-badge badge-${err.type}">${err.type}</span>
          <span class="correction-dismiss" onclick="event.stopPropagation();Editor.dismissError(${i})" title="Dismiss">✕</span>
        </div>
        <div class="correction-original">
          ${err.type === 'spell' ? `<del style="color:var(--accent-red)">${err.word}</del>` : `"${err.original || err.word}"`}
        </div>
        ${err.fix ? `<div class="correction-fix">→ ${err.fix}</div>` : ''}
        ${err.suggestions?.length ? `<div class="correction-fix">→ ${err.suggestions.slice(0,3).join(', ')}</div>` : ''}
        <div class="correction-explanation">${err.explanation || err.message}</div>
        <div class="correction-actions">
          ${err.fix ? `<button class="btn btn-primary btn-xs" onclick="event.stopPropagation();Editor.applyFix(${i})">Apply Fix</button>` : ''}
          ${err.type === 'spell' ? `<button class="btn btn-secondary btn-xs" onclick="event.stopPropagation();Editor.addToDictionary('${err.word}')">Ignore</button>` : ''}
          <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();Editor.dismissError(${i})">Dismiss</button>
        </div>
      </div>
    `).join('');
  }

  // ============================================================
  // Writing Score
  // ============================================================
  function updateWritingScore(text, spellErrors, grammarErrors) {
    const scores = GrammarEngine.calculateScore(text, spellErrors, grammarErrors);

    // Animate ring
    const ringFill = document.getElementById('score-ring-fill');
    const scoreNum = document.getElementById('score-number');

    if (ringFill) Analytics.animateScoreRing(ringFill, scores.total, 54);
    if (scoreNum) {
      let cur = parseInt(scoreNum.textContent) || 0;
      const target = scores.total;
      const startTime = performance.now();
      function tick(now) {
        const t = Math.min((now - startTime) / 1000, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        scoreNum.textContent = Math.round(cur + (target - cur) * ease);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // Update color based on score
    if (ringFill) {
      const color = scores.total >= 80 ? '#16A34A' : scores.total >= 60 ? '#F59E0B' : '#EF4444';
      ringFill.style.stroke = color;
    }

    // Score breakdown bars
    const breakdown = [
      { id: 'score-grammar',         value: scores.grammar },
      { id: 'score-vocabulary',      value: scores.vocabulary },
      { id: 'score-clarity',         value: scores.clarity },
      { id: 'score-readability',     value: scores.readability },
      { id: 'score-engagement',      value: scores.engagement },
      { id: 'score-professionalism', value: scores.professionalism },
      { id: 'score-conciseness',     value: scores.conciseness },
      { id: 'score-originality',     value: scores.originality },
    ];

    breakdown.forEach(({ id, value }) => {
      const bar = document.getElementById(id + '-bar');
      const num = document.getElementById(id + '-num');
      if (bar) Analytics.animateProgress(bar, value);
      if (num) num.textContent = value;
    });
  }

  // ============================================================
  // Readability
  // ============================================================
  function updateReadability(text) {
    const r = GrammarEngine.analyzeReadability(text);

    const fields = {
      'read-flesch': r.flesch,
      'read-grade': r.grade,
      'read-sentences': r.sentences,
      'read-words': r.words,
      'read-avg-sentence': r.avgSentenceLen,
      'read-avg-word': r.avgWordLen,
      'read-passive': r.passivePct + '%',
      'read-level': r.level,
    };

    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  }

  // ============================================================
  // Tone Detection
  // ============================================================
  function updateToneIndicator(text) {
    const tone = GrammarEngine.detectTone(text);
    const el = document.getElementById('tone-primary');
    if (el) {
      el.textContent = tone.primary.charAt(0).toUpperCase() + tone.primary.slice(1);
      el.className = `badge badge-${tone.primary === 'casual' ? 'yellow' : tone.primary === 'professional' ? 'blue' : 'green'}`;
    }

    const secondaryEl = document.getElementById('tone-secondary');
    if (secondaryEl && tone.secondary.length) {
      secondaryEl.textContent = tone.secondary.slice(0, 2).join(', ');
    }
  }

  // ============================================================
  // Vocabulary Suggestions
  // ============================================================
  function updateVocabSuggestions(text) {
    const suggestions = AIAssistant.suggestVocabulary(text);
    const container = document.getElementById('vocab-suggestions');
    if (!container) return;

    if (suggestions.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:12px;text-align:center;padding:12px">Write more text to see vocabulary suggestions...</p>`;
      return;
    }

    container.innerHTML = suggestions.map(s => `
      <div class="vocab-suggestion" onclick="Editor.replaceWord('${s.original}', '${s.replacements[0]}')">
        <div>
          <span class="vocab-original">${s.original}</span>
          <span style="color:var(--text-muted);margin:0 6px">→</span>
          <span class="vocab-replacement">${s.replacements[0]}</span>
        </div>
        <span class="vocab-strength ${s.strength === 'power' ? 'badge-purple' : 'badge-blue'}" style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--surface-3)">${s.strength}</span>
      </div>
    `).join('');
  }

  // ============================================================
  // Toolbar Actions
  // ============================================================
  function execCmd(cmd, value = null) {
    getEditor()?.focus();
    document.execCommand(cmd, false, value);
    scheduleAnalysis();
  }

  function bindToolbar() {
    const cmds = {
      'tb-bold':          () => execCmd('bold'),
      'tb-italic':        () => execCmd('italic'),
      'tb-underline':     () => execCmd('underline'),
      'tb-strike':        () => execCmd('strikeThrough'),
      'tb-ul':            () => execCmd('insertUnorderedList'),
      'tb-ol':            () => execCmd('insertOrderedList'),
      'tb-left':          () => execCmd('justifyLeft'),
      'tb-center':        () => execCmd('justifyCenter'),
      'tb-right':         () => execCmd('justifyRight'),
      'tb-link':          () => { const url = prompt('Enter URL:'); if (url) execCmd('createLink', url); },
      'tb-undo':          () => execCmd('undo'),
      'tb-redo':          () => execCmd('redo'),
      'tb-clear':         () => execCmd('removeFormat'),
      'tb-h1':            () => execCmd('formatBlock', 'H1'),
      'tb-h2':            () => execCmd('formatBlock', 'H2'),
      'tb-h3':            () => execCmd('formatBlock', 'H3'),
      'tb-p':             () => execCmd('formatBlock', 'P'),
      'tb-quote':         () => execCmd('formatBlock', 'BLOCKQUOTE'),
    };

    Object.entries(cmds).forEach(([id, fn]) => {
      document.getElementById(id)?.addEventListener('click', fn);
    });

    // Font size selector
    document.getElementById('tb-font-size')?.addEventListener('change', function() {
      execCmd('fontSize', this.value);
    });

    // Font family selector
    document.getElementById('tb-font-family')?.addEventListener('change', function() {
      execCmd('fontName', this.value);
    });

    // Color picker
    document.getElementById('tb-color')?.addEventListener('input', function() {
      execCmd('foreColor', this.value);
    });
  }

  // ============================================================
  // Sidebar Navigation
  // ============================================================
  function bindSidebar() {
    document.querySelectorAll('.sidebar-nav-item[data-view]').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        switchView(this.dataset.view);
      });
    });

    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    toggleBtn?.addEventListener('click', () => {
      const sidebar = document.getElementById('main-sidebar');
      isSidebarCollapsed = !isSidebarCollapsed;
      sidebar?.classList.toggle('collapsed', isSidebarCollapsed);
      toggleBtn.textContent = isSidebarCollapsed ? '→' : '←';
    });

    // Mobile sidebar
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('main-sidebar')?.classList.toggle('mobile-open');
    });
  }

  function switchView(view) {
    // Hide all panels
    document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden'));
    // Show selected
    const panel = document.getElementById(`view-${view}`);
    if (panel) {
      panel.classList.remove('hidden');
      currentSideView = view;
    }

    // Special handling
    if (view === 'analytics') initAnalytics();
    if (view === 'documents') renderDocumentList();
    if (view === 'history') renderHistory();
  }

  // ============================================================
  // AI Panel Tabs
  // ============================================================
  function bindPanelTabs() {
    document.querySelectorAll('.panel-tab[data-panel]').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const panelId = `panel-${this.dataset.panel}`;
        document.getElementById(panelId)?.classList.add('active');
        currentPanel = this.dataset.panel;
      });
    });
  }

  // ============================================================
  // AI Tools (Rewrite / Tone / Humanize / etc.)
  // ============================================================
  function bindAITools() {
    // Tone chips
    document.querySelectorAll('.tone-chip').forEach(chip => {
      chip.addEventListener('click', function() {
        document.querySelectorAll('.tone-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tone = this.dataset.tone;
        applyToneRewrite(tone);
      });
    });

    // AI action buttons
    bindAIButton('ai-rewrite-btn', () => {
      const text = getPlainText();
      const tone = document.querySelector('.tone-chip.active')?.dataset.tone || 'professional';
      const rewritten = AIAssistant.rewriteWithTone(text, tone);
      showRewritePreview(rewritten);
    });

    bindAIButton('ai-humanize-btn', () => {
      const text = getPlainText();
      const humanized = AIAssistant.humanize(text);
      showRewritePreview(humanized);
    });

    bindAIButton('ai-summarize-btn', () => {
      const text = getPlainText();
      const summary = AIAssistant.summarize(text);
      showRewritePreview(summary);
    });

    bindAIButton('ai-expand-btn', () => {
      const text = getPlainText();
      const expanded = AIAssistant.expand(text);
      showRewritePreview(expanded);
    });

    bindAIButton('ai-shorten-btn', () => {
      const text = getPlainText();
      const shortened = AIAssistant.shorten(text);
      showRewritePreview(shortened);
    });

    // Translate
    document.getElementById('translate-btn')?.addEventListener('click', () => {
      const lang = document.getElementById('translate-lang')?.value || 'es';
      const text = getPlainText();
      const translated = AIAssistant.translate(text, lang);
      const output = document.getElementById('translate-output');
      if (output) {
        output.innerHTML = `<div style="background:var(--surface-bg);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;color:var(--text-secondary);margin-top:8px;white-space:pre-wrap">${translated}</div>`;
      }
    });

    // AI Detection
    document.getElementById('detect-ai-btn')?.addEventListener('click', () => {
      const text = getPlainText();
      const result = GrammarEngine.detectAI(text);
      const output = document.getElementById('ai-detect-output');
      if (output) {
        const color = result.probability > 70 ? 'var(--accent-red)' : result.probability > 40 ? 'var(--accent-yellow)' : 'var(--primary)';
        output.innerHTML = `
          <div class="ai-detection-result">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-weight:700;font-size:14px;color:var(--text-primary)">${result.label}</span>
              <span style="font-weight:800;font-size:20px;color:${color}">${result.probability}%</span>
            </div>
            <div class="ai-detection-gauge"><div class="ai-detection-fill" style="width:${result.probability}%"></div></div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:8px">Confidence: ${result.confidence}% | This is a heuristic estimate</p>
          </div>
        `;
      }
    });

    // Generate content
    document.getElementById('generate-btn')?.addEventListener('click', () => {
      const type = document.getElementById('generate-type')?.value || 'blog';
      const topic = document.getElementById('generate-topic')?.value || 'AI writing';
      if (!topic.trim()) { showToast('Please enter a topic first', 'warning'); return; }
      const content = AIAssistant.generateContent(type, topic);
      getEditor().innerHTML = content.replace(/\n/g, '<br>');
      scheduleAnalysis(200);
      showToast('✨ Content generated!', 'success');
    });
  }

  function bindAIButton(id, handler) {
    document.getElementById(id)?.addEventListener('click', () => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const text = getPlainText();
      if (!text.trim()) { showToast('Please write some text first', 'warning'); return; }
      btn.classList.add('loading');
      setTimeout(() => {
        btn.classList.remove('loading');
        handler();
      }, 1200 + Math.random() * 800);
    });
  }

  function applyToneRewrite(tone) {
    const text = getPlainText();
    if (!text.trim()) return;
    const rewritten = AIAssistant.rewriteWithTone(text, tone);
    showRewritePreview(rewritten);
  }

  function showRewritePreview(text) {
    const preview = document.getElementById('rewrite-preview');
    if (!preview) return;
    preview.innerHTML = `
      <div style="background:var(--surface-bg);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:13px;color:var(--text-secondary);line-height:1.7;margin-top:8px;position:relative">
        ${text.replace(/\n/g, '<br>')}
        <div style="display:flex;gap:8px;margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
          <button class="btn btn-primary btn-sm" onclick="Editor.acceptRewrite(this)">Accept</button>
          <button class="btn btn-secondary btn-sm" onclick="this.closest('[style]').remove()">Discard</button>
          <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText(this.closest('[style]').innerText)">Copy</button>
        </div>
      </div>
    `;
  }

  // ============================================================
  // Templates
  // ============================================================
  function bindTemplates() {
    document.querySelectorAll('.template-card[data-template]').forEach(card => {
      card.addEventListener('click', function() {
        const template = AIAssistant.TEMPLATES[this.dataset.template];
        if (template) {
          getEditor().innerHTML = template.content.replace(/\n/g, '<br>');
          scheduleAnalysis(300);
          showToast(`Template "${template.name}" applied!`, 'success');
          switchView('editor');
          document.querySelector('[data-view="editor"]')?.click();
        }
      });
    });
  }

  // ============================================================
  // Chat
  // ============================================================
  function bindChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    function sendMessage() {
      const msg = chatInput?.value.trim();
      if (!msg) return;
      chatInput.value = '';

      // User message
      appendChatMessage(msg, 'user');

      // Typing indicator
      const typingId = appendTypingIndicator();

      // AI response
      setTimeout(() => {
        removeTypingIndicator(typingId);
        const response = AIAssistant.getChatResponse(msg);
        appendChatMessage(response, 'ai');
      }, 1000 + Math.random() * 1000);
    }

    chatSend?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    function appendChatMessage(text, role) {
      if (!chatMessages) return;
      const isAI = role === 'ai';
      const div = document.createElement('div');
      div.className = `chat-message ${role}`;
      div.innerHTML = `
        <div class="chat-avatar ${isAI ? 'ai-avatar' : 'user-avatar'}">${isAI ? '🤖' : '👤'}</div>
        <div class="chat-bubble">${text}</div>
      `;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      div.style.animation = 'fadeInUp 0.2s ease';
    }

    function appendTypingIndicator() {
      if (!chatMessages) return null;
      const id = 'typing-' + Date.now();
      const div = document.createElement('div');
      div.className = 'chat-message ai';
      div.id = id;
      div.innerHTML = `
        <div class="chat-avatar ai-avatar">🤖</div>
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return id;
    }

    function removeTypingIndicator(id) {
      document.getElementById(id)?.remove();
    }

    // Initial greeting
    setTimeout(() => {
      appendChatMessage("Hello! 👋 I'm your AI writing assistant. I can help you improve your writing, explain grammar rules, rewrite sentences, summarize, or answer any writing questions. What would you like to work on?", 'ai');
    }, 500);
  }

  // ============================================================
  // Export / Import
  // ============================================================
  function bindExportImport() {
    // Export TXT
    document.getElementById('export-txt')?.addEventListener('click', () => {
      const text = getPlainText();
      downloadFile(text, `${currentDoc?.title || 'document'}.txt`, 'text/plain');
      showToast('Exported as TXT', 'success');
    });

    // Export HTML
    document.getElementById('export-html')?.addEventListener('click', () => {
      const html = getEditor()?.innerHTML || '';
      const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${currentDoc?.title || 'Document'}</title></head><body>${html}</body></html>`;
      downloadFile(full, `${currentDoc?.title || 'document'}.html`, 'text/html');
      showToast('Exported as HTML', 'success');
    });

    // Export Markdown
    document.getElementById('export-md')?.addEventListener('click', () => {
      const text = getPlainText();
      downloadFile(text, `${currentDoc?.title || 'document'}.md`, 'text/markdown');
      showToast('Exported as Markdown', 'success');
    });

    // Copy all
    document.getElementById('export-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(getPlainText()).then(() => showToast('Copied to clipboard!', 'success'));
    });

    // Import — reset value so the same file can be imported again
    document.getElementById('import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        // Preserve line breaks; escape any HTML if plain text
        const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
        getEditor().innerHTML = isHtml ? text : text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g, '<br>');
        scheduleAnalysis(300);
        saveCurrentDocument();
        showToast(`✅ Imported: ${file.name}`, 'success');
      };
      reader.onerror = () => showToast('Failed to read file', 'error');
      reader.readAsText(file);
      // Reset so the same file can be re-imported
      e.target.value = '';
    });
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================================
  // Document List
  // ============================================================
  function renderDocumentList() {
    const container = document.getElementById('doc-list');
    if (!container) return;
    const docs = Storage.getAllDocuments();

    if (docs.length === 0) {
      container.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px;font-size:13px">No documents yet. Create your first document!</p>`;
      return;
    }

    // Use data attributes + event delegation so delete/open don't conflict
    container.innerHTML = docs.map(doc => `
      <div class="document-item" data-doc-id="${doc.id}" data-action="open">
        <div class="document-icon">📄</div>
        <div class="document-info">
          <div class="document-name">${doc.title}</div>
          <div class="document-meta">${doc.wordCount || 0} words · ${formatDate(doc.updatedAt)}</div>
        </div>
        <button class="btn btn-ghost btn-icon-sm" data-doc-id="${doc.id}" data-action="delete" title="Delete">🗑</button>
      </div>
    `).join('');

    // Single delegated listener replaces all inline onclick handlers
    container.onclick = (e) => {
      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        e.stopPropagation();
        Editor.deleteDocument(deleteBtn.dataset.docId);
        return;
      }
      const openItem = e.target.closest('[data-action="open"]');
      if (openItem) {
        Editor.openDocument(openItem.dataset.docId);
      }
    };
  }

  function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;
    const history = Storage.getHistory(30);

    if (history.length === 0) {
      container.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px;font-size:13px">No history yet.</p>`;
      return;
    }

    container.innerHTML = history.map(entry => `
      <div class="document-item">
        <div class="document-icon">⏱</div>
        <div class="document-info">
          <div class="document-name">${entry.action || 'Edit'}</div>
          <div class="document-meta">${formatDate(entry.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ============================================================
  // Analytics
  // ============================================================
  function initAnalytics() {
    const stats = Storage.getStats();

    // Animate metrics
    const metricEls = {
      'analytics-words': stats.totalWords || 12847,
      'analytics-fixed': stats.totalMistakesFixed || 342,
      'analytics-score': 87,
      'analytics-sessions': stats.totalSessions || 28,
    };

    Object.entries(metricEls).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) Analytics.animateCount(el, val, 1500);
    });

    // Draw charts
    setTimeout(() => {
      const weeklyCanvas = document.getElementById('weekly-chart');
      if (weeklyCanvas) {
        const weekly = Analytics.generateWeeklyData();
        Analytics.drawLineChart(weeklyCanvas, {
          labels: weekly.map(d => d.day),
          datasets: [
            { data: weekly.map(d => d.words), color: '#16A34A', fill: true, lineWidth: 2.5 },
          ],
        }, {
          padding: { top: 20, right: 20, bottom: 40, left: 50 },
          gridColor: getComputedStyle(document.documentElement).getPropertyValue('--border').trim(),
          textColor: '#64748B',
        });
      }

      const scoreCanvas = document.getElementById('score-chart');
      if (scoreCanvas) {
        const monthly = Analytics.generateMonthlyData();
        Analytics.drawLineChart(scoreCanvas, {
          labels: monthly.map(d => d.day.toString()),
          datasets: [
            { data: monthly.map(d => d.score), color: '#3B82F6', fill: true, lineWidth: 2 },
          ],
        }, {
          padding: { top: 20, right: 20, bottom: 40, left: 50 },
          gridColor: getComputedStyle(document.documentElement).getPropertyValue('--border').trim(),
          textColor: '#64748B',
        });
      }

      const errCanvas = document.getElementById('errors-chart');
      if (errCanvas) {
        Analytics.drawBarChart(errCanvas,
          [23, 18, 31, 12, 27, 8, 15],
          {
            labels: ['Spell', 'Grammar', 'Style', 'Clarity', 'Tone', 'Punctuation', 'Other'],
            colors: ['#EF4444', '#F59E0B', '#16A34A', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4'],
            padding: { top: 20, right: 20, bottom: 40, left: 50 },
            textColor: '#64748B',
          }
        );
      }
    }, 100);
  }

  // ============================================================
  // Settings
  // ============================================================
  function bindSettings() {
    // Font size
    document.getElementById('setting-font-size')?.addEventListener('change', function() {
      getEditor().style.fontSize = this.value + 'px';
      Storage.saveSetting('fontSize', parseInt(this.value));
    });

    // Font family
    document.getElementById('setting-font-family')?.addEventListener('change', function() {
      getEditor().style.fontFamily = this.value;
      Storage.saveSetting('fontFamily', this.value);
    });

    // Line height
    document.getElementById('setting-line-height')?.addEventListener('input', function() {
      getEditor().style.lineHeight = this.value;
      document.getElementById('lh-value').textContent = this.value;
    });

    // Toggles
    // Toggles
    const s = Storage.getSettings();
    ['spell-check', 'grammar-check', 'style-check', 'auto-correct', 'auto-save'].forEach(id => {
      const el = document.getElementById(`setting-${id}`);
      if (el) {
        const key = id.replace(/-/g, '_');
        el.checked = s[key] !== undefined ? s[key] : true;
        el.addEventListener('change', function() {
          Storage.saveSetting(key, this.checked);
          if (id === 'auto-save' && this.checked) scheduleAutosave();
        });
      }
    });

    // Apply saved settings
    const fontSizeEl = document.getElementById('setting-font-size');
    if (fontSizeEl) fontSizeEl.value = s.fontSize;
    if (s.fontSize) getEditor().style.fontSize = s.fontSize + 'px';
    if (s.fontFamily) getEditor().style.fontFamily = s.fontFamily;

    // Gemini API Key
    const geminiInput = document.getElementById('setting-gemini-key');
    if (geminiInput && window.GoogleAI) {
      geminiInput.value = window.GoogleAI.getApiKey();
    }
    document.getElementById('save-gemini-key-btn')?.addEventListener('click', () => {
      const val = document.getElementById('setting-gemini-key')?.value || '';
      if (window.GoogleAI) {
        window.GoogleAI.setApiKey(val);
        showToast(val ? '🔑 Google Gemini API Key saved!' : 'Gemini API Key cleared.', 'success');
      }
    });
  }

  // ============================================================
  // TTS Controls
  // ============================================================
  function bindTTS() {
    TTS.loadVoices();

    document.getElementById('tts-btn')?.addEventListener('click', () => {
      const text = getPlainText();
      if (!text.trim()) { showToast('No text to read', 'warning'); return; }
      const opts = TTS.getOptions();
      TTS.toggle(text, opts);
    });

    document.getElementById('tts-stop')?.addEventListener('click', () => TTS.stop());
  }

  // ============================================================
  // Voice Typing
  // ============================================================
  function bindVoiceTyping() {
    // Init the recognition engine first so callbacks are wired up
    VoiceTyping.init(
      ({ final, interim }) => {
        const editor = getEditor();
        if (!editor) return;
        if (final) {
          document.execCommand('insertText', false, final);
          scheduleAnalysis();
          scheduleAutosave();
        }
      },
      (error) => {
        showToast(`Voice error: ${error}`, 'error');
      }
    );

    document.getElementById('voice-btn')?.addEventListener('click', () => {
      if (!VoiceTyping.isSupported()) {
        showToast('Voice typing not supported in this browser', 'error');
        return;
      }

      if (VoiceTyping.isListening()) {
        VoiceTyping.stop();
        showToast('🎤 Voice typing stopped', 'info');
      } else {
        VoiceTyping.start('en-US');
        // "started" toast fires from recognition.onstart after mic permission granted
      }
    });
  }

  // ============================================================
  // Public API (used by inline onclick handlers)
  // ============================================================
  window.Editor = {
    highlightError(idx) {
      const err = allErrors[idx];
      if (!err) return;
      // Highlight in editor (simplified)
      showToast(`"${err.word}" — ${err.message}`, 'info');
    },

    dismissError(idx) {
      allErrors.splice(idx, 1);
      renderSuggestions(allErrors);
    },

    applyFix(idx) {
      const err = allErrors[idx];
      if (!err || !err.fix) return;

      const editor = getEditor();
      const content = editor.innerHTML;
      const escaped = (err.original || err.word).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const startBoundary = /^\w/.test(err.original || err.word) ? '\\b' : '';
      const endBoundary = /\w$/.test(err.original || err.word) ? '\\b' : '';
      const regex = new RegExp(startBoundary + escaped + endBoundary + '(?=[^<>]*([<]|$))', 'i');

      editor.innerHTML = content.replace(regex, err.fix);

      Storage.addToHistory({ action: `Fixed: "${err.word}" → "${err.fix}"` });
      Storage.updateStats({ mistakesFixed: 1 });
      allErrors.splice(idx, 1);
      renderSuggestions(allErrors);
      showToast(`Applied: "${err.fix}"`, 'success');
      scheduleAutosave();
    },

    addToDictionary(word) {
      SpellChecker.addToCustomDictionary(word);
      allErrors = allErrors.filter(e => e.word !== word);
      renderSuggestions(allErrors);
      showToast(`"${word}" added to dictionary`, 'success');
    },

    acceptRewrite(btn) {
      const preview = btn.closest('[style*="background"]');
      if (!preview) return;
      const text = preview.querySelector('div > br') ? preview.innerHTML.split('<div')[0].replace(/<br>/g, '\n') : preview.innerText.split('Accept')[0].trim();
      getEditor().innerHTML = text.replace(/\n/g, '<br>');
      preview.remove();
      scheduleAnalysis(200);
      showToast('Rewrite applied!', 'success');
    },

    openDocument(id) {
      const doc = Storage.getDocument(id);
      if (!doc) return;
      currentDoc = doc;
      Storage.setCurrentDocId(id);
      applyDocToEditor();
      switchView('editor');
      document.querySelector('[data-view="editor"]')?.click();
      showToast(`Opened: ${doc.title}`, 'success');
    },

    deleteDocument(id) {
      if (!confirm('Delete this document?')) return;
      Storage.deleteDocument(id);
      if (currentDoc?.id === id) {
        currentDoc = Storage.createDocument();
        Storage.setCurrentDocId(currentDoc.id);
        getEditor().innerHTML = '';
        updateDocTitle();
      }
      renderDocumentList();
      showToast('Document deleted', 'info');
    },

    newDocument() {
      saveCurrentDocument();
      currentDoc = Storage.createDocument();
      Storage.setCurrentDocId(currentDoc.id);
      getEditor().innerHTML = '';
      updateDocTitle();
      clearSuggestions();
      updateScoreRing(0);
      showToast('New document created', 'success');
    },

    replaceWord(original, replacement) {
      const editor = getEditor();
      const escaped = original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const startBoundary = /^\w/.test(original) ? '\\b' : '';
      const endBoundary = /\w$/.test(original) ? '\\b' : '';
      const regex = new RegExp(startBoundary + escaped + endBoundary + '(?=[^<>]*([<]|$))', 'gi');

      editor.innerHTML = editor.innerHTML.replace(regex, replacement);
      showToast(`Replaced "${original}" → "${replacement}"`, 'success');
      scheduleAnalysis(300);
    },
  };

  function updateScoreRing(score) {
    const ringFill = document.getElementById('score-ring-fill');
    const scoreNum = document.getElementById('score-number');
    if (ringFill) Analytics.animateScoreRing(ringFill, score, 54);
    if (scoreNum) scoreNum.textContent = score;
  }

  // ============================================================
  // New document button
  // ============================================================
  document.getElementById('new-doc-btn')?.addEventListener('click', () => Editor.newDocument());
  document.getElementById('rename-doc-btn')?.addEventListener('click', () => {
    const newName = prompt('Rename document:', currentDoc?.title || 'Untitled');
    if (newName && currentDoc) {
      currentDoc.title = newName;
      saveCurrentDocument();
      updateDocTitle();
    }
  });

  // ============================================================
  // Google AI AutoCorrect Integration
  // ============================================================
  document.getElementById('google-ai-btn')?.addEventListener('click', async () => {
    const text = getPlainText();
    if (!text || !text.trim()) {
      showToast('Please type or paste some text first.', 'warning');
      return;
    }

    const btn = document.getElementById('google-ai-btn');
    const originalHtml = btn ? btn.innerHTML : '✨ Google AI Fix';
    if (btn) {
      btn.innerHTML = '⏳ AI Fixing...';
      btn.disabled = true;
    }

    try {
      showToast('🤖 Google AI is proofreading & auto-correcting...', 'info', 2500);
      const result = await window.GoogleAI.autoCorrectText(text);

      if (result.correctedText && result.correctedText !== text) {
        getEditor().innerText = result.correctedText;
        scheduleAnalysis(200);
        saveCurrentDocument();
        showToast(`✨ ${result.source}: Fixed ${result.changesCount} issue(s)!`, 'success', 4000);
      } else {
        showToast('✅ Text is clean! No errors detected.', 'success', 3000);
      }
    } catch (err) {
      showToast(`AI Error: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }
  });

  // ============================================================
  // Editor Events
  // ============================================================
  const editor = getEditor();
  if (editor) {
    // Input → analysis + autosave
    editor.addEventListener('input', () => {
      scheduleAnalysis();
      scheduleAutosave();
      updateStats();
      Storage.addToHistory({ action: 'Edit', docId: currentDoc?.id });
    });

    function handleAutocorrect(e) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;

      const container = range.startContainer;
      if (container.nodeType !== Node.TEXT_NODE) return;

      const text = container.textContent;
      const offset = range.startOffset;
      const textBefore = text.slice(0, offset);

      // Match word at the end, possibly followed by punctuation (but not space)
      const match = textBefore.match(/([a-zA-Z']+)[^a-zA-Z'\s]*$/);
      if (!match) return;

      const word = match[1];

      // Skip valid words immediately (dictionary + inflection aware)
      if (SpellChecker.isCorrect(word)) return;

      // Get AI AutoCorrect top suggestion
      const suggestions = SpellChecker.getSuggestions(word);
      if (!suggestions || suggestions.length === 0) return;

      const rawCorrection = suggestions[0];

      // Match original casing
      let correction = rawCorrection;
      if (word === word.toUpperCase()) {
        correction = rawCorrection.toUpperCase();
      } else if (word[0] === word[0].toUpperCase()) {
        correction = rawCorrection.charAt(0).toUpperCase() + rawCorrection.slice(1);
      }

      // Calculate start and end offsets of the word in the text node
      const wordStartOffset = offset - match[0].length;
      const wordEndOffset = wordStartOffset + word.length;

      // Create a range selecting the misspelled word
      const wordRange = document.createRange();
      wordRange.setStart(container, wordStartOffset);
      wordRange.setEnd(container, wordEndOffset);

      // Select the word
      selection.removeAllRanges();
      selection.addRange(wordRange);

      // Replace the selection with the corrected word
      document.execCommand('insertText', false, correction);

      // Add to history and stats
      Storage.addToHistory({ action: `Auto-corrected: "${word}" → "${correction}"`, docId: currentDoc?.id });
      Storage.updateStats({ mistakesFixed: 1 });
      showToast(`Auto-corrected: "${word}" → "${correction}"`, 'success', 2000);

      // Schedule analysis update
      scheduleAnalysis(300);
      scheduleAutosave();
    }

    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        const currentSettings = Storage.getSettings();
        if (currentSettings.autoCorrect && currentSettings.spellCheck) {
          handleAutocorrect(e);
        }
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's': e.preventDefault(); saveCurrentDocument(); showToast('Saved!', 'success'); break;
          case 'z': if (e.shiftKey) { e.preventDefault(); execCmd('redo'); } break;
          case 'b': e.preventDefault(); execCmd('bold'); break;
          case 'i': e.preventDefault(); execCmd('italic'); break;
          case 'u': e.preventDefault(); execCmd('underline'); break;
        }
      }
    });

    // Placeholder
    editor.setAttribute('data-placeholder', '✍️  Start writing your document here...\n\nAutoCorrect AI will analyze your text in real-time and suggest improvements.');
  }

  // ============================================================
  // Ctrl+S global
  // ============================================================
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentDocument();
      showToast('Document saved!', 'success');
    }
  });

  // ============================================================
  // Initialize
  // ============================================================
  function init() {
    loadOrCreateDocument();
    bindToolbar();
    bindSidebar();
    bindPanelTabs();
    bindAITools();
    bindTemplates();
    bindChat();
    bindExportImport();
    bindSettings();
    bindTTS();
    bindVoiceTyping();
    Storage.updateStats({ session: true });

    // Initial stats
    updateStats();

    showToast('Welcome to AutoCorrect AI! 🚀', 'success', 3000);
    console.log('%c AutoCorrect AI Editor Ready ✅ ', 'background:#16A34A;color:white;padding:6px 14px;border-radius:6px;font-weight:bold;');
  }

  init();
});
