import { getEl } from './utils.js';

const THEME_KEY = 'md-viewer-theme';

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  getEl('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

export function showToast(message, type = 'info', duration = 3500) {
  const container = getEl('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('btn-loading');
    btn._origText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.classList.remove('btn-loading');
    if (btn._origText) btn.textContent = btn._origText;
    btn.disabled = false;
  }
}

export function setupModal(modalEl, closeBtn, onClose) {
  const close = () => {
    modalEl.classList.remove('active');
    if (onClose) onClose();
  };
  closeBtn.addEventListener('click', close);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) close();
  });
  return { close };
}

export function setupKeyboardShortcuts(handlers) {
  document.addEventListener('keydown', (e) => {
    for (const [key, handler] of Object.entries(handlers)) {
      if (e.key === key && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handler(e);
        return;
      }
    }
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
      }
    }
  });
}

export function updateTabUI(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (tab) tab.classList.add('active');
}
