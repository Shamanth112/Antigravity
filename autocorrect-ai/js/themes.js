/**
 * AutoCorrect AI — Theme Manager
 * Handles dark/light mode toggle with persistence
 */

const ThemeManager = (() => {
  const STORAGE_KEY = 'autocorrect-ai-theme';
  let currentTheme = 'dark';

  const icons = { dark: '🌙', light: '☀️' };

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = icons[theme === 'dark' ? 'light' : 'dark'];
      btn.setAttribute('data-tooltip', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });

    // Dispatch event for other modules
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function toggle() {
    apply(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply(getPreferred());

    // Bind all toggle buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.theme-toggle')) toggle();
    });

    // Watch system preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        apply(e.matches ? 'dark' : 'light');
      }
    });
  }

  return { init, toggle, apply, get: () => currentTheme };
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}

window.ThemeManager = ThemeManager;
