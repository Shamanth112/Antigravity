/**
 * AutoCorrect AI — LocalStorage Manager
 * Handles documents, history, settings persistence
 */

const Storage = (() => {
  const KEYS = {
    documents: 'acai-documents',
    currentDoc: 'acai-current-doc',
    settings: 'acai-settings',
    history: 'acai-history',
    wordCount: 'acai-word-count-stats',
  };

  const defaults = {
    settings: {
      language: 'en',
      theme: 'dark',
      fontSize: 16,
      fontFamily: 'Plus Jakarta Sans',
      lineHeight: 1.8,
      autoSave: true,
      autoSaveInterval: 5000,
      spellCheck: true,
      grammarCheck: true,
      styleCheck: true,
      correctionSensitivity: 'medium',
      notifications: true,
      showWordCount: true,
      showReadingTime: true,
    },
  };

  function get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  // Documents
  function getAllDocuments() {
    return get(KEYS.documents) || [];
  }

  function getDocument(id) {
    const docs = getAllDocuments();
    return docs.find(d => d.id === id) || null;
  }

  function saveDocument(doc) {
    const docs = getAllDocuments();
    const idx = docs.findIndex(d => d.id === doc.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], ...doc, updatedAt: now };
    } else {
      docs.unshift({ ...doc, createdAt: now, updatedAt: now });
    }
    set(KEYS.documents, docs);
    return doc;
  }

  function deleteDocument(id) {
    const docs = getAllDocuments().filter(d => d.id !== id);
    set(KEYS.documents, docs);
  }

  function createDocument(title = 'Untitled Document') {
    const doc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: '',
      wordCount: 0,
      charCount: 0,
      score: 0,
      tags: [],
      starred: false,
    };
    saveDocument(doc);
    return doc;
  }

  function setCurrentDocId(id) {
    set(KEYS.currentDoc, id);
  }

  function getCurrentDocId() {
    return get(KEYS.currentDoc);
  }

  // Settings
  function getSettings() {
    return { ...defaults.settings, ...(get(KEYS.settings) || {}) };
  }

  function saveSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    set(KEYS.settings, settings);
  }

  // History
  function addToHistory(entry) {
    const history = get(KEYS.history) || [];
    history.unshift({ ...entry, timestamp: new Date().toISOString() });
    if (history.length > 500) history.pop();
    set(KEYS.history, history);
  }

  function getHistory(limit = 50) {
    return (get(KEYS.history) || []).slice(0, limit);
  }

  // Word Count Stats
  function updateStats(delta) {
    const stats = get(KEYS.wordCount) || { totalWords: 0, totalMistakesFixed: 0, totalSessions: 0 };
    if (delta.words) stats.totalWords += delta.words;
    if (delta.mistakesFixed) stats.totalMistakesFixed += delta.mistakesFixed;
    if (delta.session) stats.totalSessions += 1;
    stats.lastSession = new Date().toISOString();
    set(KEYS.wordCount, stats);
    return stats;
  }

  function getStats() {
    return get(KEYS.wordCount) || { totalWords: 0, totalMistakesFixed: 0, totalSessions: 0 };
  }

  return {
    get, set,
    getAllDocuments, getDocument, saveDocument, deleteDocument, createDocument,
    setCurrentDocId, getCurrentDocId,
    getSettings, saveSetting,
    addToHistory, getHistory,
    updateStats, getStats,
    KEYS,
  };
})();

window.Storage = Storage;
