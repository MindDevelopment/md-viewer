import { getEl, escHtml } from './utils.js';
import { showToast, setLoading, setupModal } from './ui.js';
import { getEditorState, setEditorContent, setCurrentFileId, refreshPreview } from './editor.js';
import { isAuthenticated } from './auth.js';

const saveBtn = getEl('save-btn');
const loadBtn = getEl('load-btn');
const saveModal = getEl('save-modal');
const saveModalClose = getEl('save-modal-close');
const saveForm = getEl('save-form');
const saveTitle = getEl('save-title');
const saveErrorEl = getEl('save-error');
const saveSubmit = getEl('save-submit');
const filesList = getEl('files-list');

export async function loadFiles() {
  if (!isAuthenticated()) return;
  try {
    filesList.innerHTML = '<div class="placeholder"><div class="spinner"></div><p>Loading files...</p></div>';
    const res = await fetch('/api/files');
    const data = await res.json();
    renderFilesList(data.files);
  } catch {
    filesList.innerHTML = '<div class="placeholder"><p>Failed to load files</p></div>';
  }
}

function renderFilesList(files) {
  if (files.length === 0) {
    filesList.innerHTML = '<div class="placeholder"><p>No saved files yet</p></div>';
    return;
  }
  filesList.innerHTML = files.map(f => {
    const date = new Date(f.updated_at).toLocaleDateString();
    return `
      <div class="file-item" data-id="${f.id}">
        <div class="file-item-info" style="flex:1;min-width:0">
          <div class="file-item-title">${escHtml(f.title)}</div>
          <div class="file-item-date">${date}</div>
        </div>
        <div class="file-item-actions">
          <button class="btn-open" title="Open">&#128194;</button>
          <button class="btn-del" title="Delete">&#128465;</button>
        </div>
      </div>`;
  }).join('');

  filesList.querySelectorAll('.file-item').forEach(item => {
    const id = parseInt(item.dataset.id);
    item.querySelector('.btn-open').addEventListener('click', (e) => {
      e.stopPropagation();
      openFile(id);
    });
    item.querySelector('.btn-del').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteFile(id);
    });
  });
}

async function openFile(id) {
  try {
    const res = await fetch(`/api/files/${id}`);
    const data = await res.json();
    if (!res.ok) {
      showToast('Failed to load file', 'error');
      return;
    }
    setEditorContent(data.file.content, data.file.title, data.file.id);
    refreshPreview();
    showToast(`Opened "${data.file.title}"`, 'info');
    if (window.innerWidth <= 768) {
      document.querySelector('.tab[data-tab="editor"]')?.click();
    }
  } catch {
    showToast('Failed to load file', 'error');
  }
}

async function deleteFile(id) {
  try {
    await fetch(`/api/files/${id}`, { method: 'DELETE' });
    const state = getEditorState();
    if (state.fileId === id) {
      setCurrentFileId(null);
    }
    await loadFiles();
    showToast('File deleted', 'info');
  } catch {
    showToast('Failed to delete file', 'error');
  }
}

export function initFiles() {
  setupModal(saveModal, saveModalClose);

  saveBtn.addEventListener('click', () => {
    const state = getEditorState();
    saveTitle.value = state.title || 'Untitled';
    saveErrorEl.textContent = '';
    saveModal.classList.add('active');
  });

  saveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveErrorEl.textContent = '';
    setLoading(saveSubmit, true);
    const title = saveTitle.value.trim();
    if (!title) { saveErrorEl.textContent = 'Title is required'; setLoading(saveSubmit, false); return; }
    const state = getEditorState();
    try {
      const body = { title, content: state.text };
      let res;
      if (state.fileId) {
        res = await fetch(`/api/files/${state.fileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      const data = await res.json();
      if (!res.ok) { saveErrorEl.textContent = data.error; return; }
      setCurrentFileId(data.file.id);
      setEditorContent(state.text, title, data.file.id);
      saveModal.classList.remove('active');
      saveForm.reset();
      showToast('File saved!', 'success');
      await loadFiles();
    } catch {
      saveErrorEl.textContent = 'Failed to save';
    } finally {
      setLoading(saveSubmit, false);
    }
  });

  loadBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      document.querySelector('.tab[data-tab="files"]')?.click();
    }
    getEl('files-panel').classList.add('active');
    getEl('files-panel').style.display = '';
  });
}
