import { getEl } from './utils.js';
import { showToast, setLoading, setupModal, updateTabUI } from './ui.js';
import { setCurrentFileId } from './editor.js';
import { loadFiles } from './files.js';

let currentUser = null;

const headerUser = getEl('header-user');
const authModal = getEl('auth-modal');
const modalClose = getEl('modal-close');
const modalTabs = document.querySelectorAll('.modal-tab');
const loginForm = getEl('login-form');
const registerForm = getEl('register-form');
const loginError = getEl('login-error');
const registerError = getEl('register-error');
const loginSubmit = getEl('login-submit');
const registerSubmit = getEl('register-submit');
const filesTab = getEl('files-tab');
const builderTab = getEl('builder-tab');
const footerActions = getEl('footer-actions');

export function isAuthenticated() {
  return currentUser !== null;
}

export function getCurrentUser() {
  return currentUser;
}

export function updateUserUI() {
  if (currentUser) {
    const initial = currentUser.username.charAt(0).toUpperCase();
    headerUser.innerHTML = `
      <div class="user-info">
        <div class="user-avatar">${initial}</div>
        <span>${currentUser.username}</span>
      </div>
      <button class="btn-logout" id="logout-btn">Logout</button>`;
    getEl('logout-btn').addEventListener('click', logout);
    filesTab.style.display = '';
    builderTab.style.display = '';
    footerActions.style.display = '';
  } else {
    headerUser.innerHTML = `<button class="btn-login" id="login-btn">Login</button>`;
    getEl('login-btn').addEventListener('click', () => authModal.classList.add('active'));
    filesTab.style.display = 'none';
    builderTab.style.display = 'none';
    footerActions.style.display = 'none';
    getEl('files-panel').classList.remove('active');
    getEl('files-panel').style.display = 'none';
    getEl('builder-panel').classList.remove('active');
    getEl('builder-panel').style.display = 'none';
    if (window.innerWidth > 768) {
      getEl('editor-panel').style.display = 'flex';
      getEl('preview-panel').style.display = 'flex';
    } else {
      getEl('editor-panel').style.display = '';
      getEl('preview-panel').style.display = '';
    }
    updateTabUI('editor');
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  currentUser = null;
  setCurrentFileId(null);
  updateUserUI();
}

export async function checkAuth() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (data.user) {
      currentUser = data.user;
      updateUserUI();
      await loadFiles();
    } else {
      updateUserUI();
    }
  } catch {
    updateUserUI();
  }
}

export function initAuth() {
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loginForm.style.display = tab.dataset.form === 'login' ? '' : 'none';
      registerForm.style.display = tab.dataset.form === 'register' ? '' : 'none';
      loginError.textContent = '';
      registerError.textContent = '';
    });
  });

  setupModal(authModal, modalClose);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    setLoading(loginSubmit, true);
    const username = getEl('login-username').value;
    const password = getEl('login-password').value;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) { loginError.textContent = data.error; return; }
      currentUser = data.user;
      authModal.classList.remove('active');
      loginForm.reset();
      updateUserUI();
      showToast(`Welcome back, ${currentUser.username}!`, 'success');
      await loadFiles();
    } catch {
      loginError.textContent = 'Connection error';
    } finally {
      setLoading(loginSubmit, false);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    setLoading(registerSubmit, true);
    const username = getEl('register-username').value;
    const email = getEl('register-email').value;
    const password = getEl('register-password').value;
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) { registerError.textContent = data.error; return; }
      currentUser = data.user;
      authModal.classList.remove('active');
      registerForm.reset();
      updateUserUI();
      showToast(`Welcome, ${currentUser.username}!`, 'success');
      await loadFiles();
    } catch {
      registerError.textContent = 'Connection error';
    } finally {
      setLoading(registerSubmit, false);
    }
  });
}
