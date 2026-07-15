/**
 * AutoCorrect AI — Landing Page Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // Navigation scroll effect
  // ============================================================
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ============================================================
  // Mobile menu
  // ============================================================
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
    });
  });

  // ============================================================
  // Animate on scroll
  // ============================================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // ============================================================
  // Hero typing animation
  // ============================================================
  const demoText = document.getElementById('demo-text');
  const demoCorrectionsList = document.getElementById('demo-corrections');

  if (demoText) {
    const sentences = [
      { text: 'Writting profesionally is importent for successfull communication in buisness.', errors: [
        { word: 'Writting', correction: 'Writing', type: 'spell' },
        { word: 'profesionally', correction: 'professionally', type: 'spell' },
        { word: 'importent', correction: 'important', type: 'spell' },
        { word: 'successfull', correction: 'successful', type: 'spell' },
        { word: 'buisness', correction: 'business', type: 'spell' },
      ]},
      { text: 'The team should of started earlier to acheive there goals on time.', errors: [
        { word: 'should of', correction: 'should have', type: 'grammar' },
        { word: 'acheive', correction: 'achieve', type: 'spell' },
        { word: 'there', correction: 'their', type: 'grammar' },
      ]},
      { text: 'This is very good content that shows a very big improvement.', errors: [
        { word: 'very good', correction: 'excellent', type: 'style' },
        { word: 'very big', correction: 'substantial', type: 'style' },
      ]},
    ];

    let currentSentence = 0;
    let charIndex = 0;
    let typingForward = true;
    let delay = 60;

    function renderDemoText(sentence) {
      let html = sentence.text;
      // Highlight errors
      sentence.errors.forEach(err => {
        const cls = err.type === 'spell' ? 'demo-error' : err.type === 'grammar' ? 'grammar-error' : 'demo-suggestion';
        html = html.replace(err.word, `<span class="${cls}" title="→ ${err.correction}">${err.word}</span>`);
      });
      return html;
    }

    function renderCorrections(sentence) {
      if (!demoCorrectionsList) return;
      demoCorrectionsList.innerHTML = '';
      sentence.errors.forEach((err, i) => {
        setTimeout(() => {
          const item = document.createElement('div');
          item.className = `demo-correction-item ${err.type}`;
          item.innerHTML = `
            <span class="demo-correction-type type-${err.type}">${err.type.toUpperCase()}</span>
            <span class="demo-correction-text">"${err.word}" → </span>
            <span class="demo-correction-fix" onclick="this.closest('.demo-correction-item').style.display='none'">${err.correction} ✓</span>
          `;
          demoCorrectionsList.appendChild(item);
        }, i * 400);
      });
    }

    function typeNext() {
      const sentence = sentences[currentSentence];
      const fullText = sentence.text;

      if (typingForward) {
        charIndex++;
        const partial = fullText.substring(0, charIndex);
        demoText.innerHTML = partial + '<span class="demo-cursor"></span>';

        if (charIndex >= fullText.length) {
          // Show corrections
          setTimeout(() => {
            demoText.innerHTML = renderDemoText(sentence);
            renderCorrections(sentence);
          }, 300);

          typingForward = false;
          setTimeout(typeNext, 3500);
          return;
        }
      } else {
        // Move to next sentence
        currentSentence = (currentSentence + 1) % sentences.length;
        charIndex = 0;
        typingForward = true;
        demoCorrectionsList && (demoCorrectionsList.innerHTML = '');
        demoText.innerHTML = '<span class="demo-cursor"></span>';
        delay = 60;
      }

      const variance = Math.random() * 40 - 20;
      setTimeout(typeNext, delay + variance);
    }

    typeNext();
  }

  // ============================================================
  // Counter animation
  // ============================================================
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(start + (target - start) * ease).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ============================================================
  // FAQ Accordion
  // ============================================================
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      const wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));

      // Open clicked if wasn't open
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ============================================================
  // Demo tool buttons
  // ============================================================
  document.querySelectorAll('.demo-tool-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.demo-tool-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Demo textarea live check
  const demoInput = document.getElementById('demo-input');
  const demoOutput = document.getElementById('demo-output-area');

  if (demoInput && demoOutput) {
    let debounceTimer;
    demoInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const text = demoInput.value;
        if (!text.trim()) { demoOutput.innerHTML = '<p class="text-muted" style="font-size:13px;text-align:center;padding:20px">Suggestions will appear here...</p>'; return; }

        // Simulate analysis
        const suggestions = [];
        if (text.includes('teh')) suggestions.push({ type: 'spell', msg: '"teh" → "the"', icon: '🔴' });
        if (text.includes('freind')) suggestions.push({ type: 'spell', msg: '"freind" → "friend"', icon: '🔴' });
        if (text.includes('should of')) suggestions.push({ type: 'grammar', msg: '"should of" → "should have"', icon: '🟡' });
        if (text.includes('very good')) suggestions.push({ type: 'style', msg: '"very good" → "excellent"', icon: '🟢' });
        if (text.includes('alot')) suggestions.push({ type: 'grammar', msg: '"alot" → "a lot"', icon: '🟡' });

        if (suggestions.length === 0) {
          demoOutput.innerHTML = '<p style="color:var(--primary);font-size:13px;text-align:center;padding:20px">✅ Looking great! No issues found.</p>';
        } else {
          demoOutput.innerHTML = suggestions.map(s => `
            <div style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;background:var(--surface-2);border-radius:10px;border:1px solid var(--border);font-size:12px;color:var(--text-secondary);">
              <span>${s.icon}</span>
              <span>${s.msg}</span>
            </div>
          `).join('');
        }
      }, 300);
    });
  }

  // ============================================================
  // Button ripple effect
  // ============================================================
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ============================================================
  // Smooth scroll for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================================
  // Toast notification helper (global)
  // ============================================================
  window.showToast = function(message, type = 'success', duration = 4000) {
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
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ============================================================
  // Feature card hover glow
  // ============================================================
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, var(--primary-subtle), var(--surface-1) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  console.log('%c AutoCorrect AI 🚀 ', 'background:#16A34A;color:white;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:bold;');
});
