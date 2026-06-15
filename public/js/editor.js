import { getEl, debounce } from './utils.js';
import { showToast } from './ui.js';

const mdInput = getEl('md-input');
const preview = getEl('preview');
const renderBtn = getEl('render-btn');
const fileInput = getEl('file-input');
const charCount = getEl('char-count');
const fileName = getEl('file-name');

export let currentFileId = null;

const DRAFT_KEY = 'md-viewer-draft';

export function setCurrentFileId(id) {
  currentFileId = id;
}

export function getEditorState() {
  return {
    text: mdInput.value,
    title: fileName.textContent,
    fileId: currentFileId,
  };
}

export function setEditorContent(text, title = '', fileId = null) {
  mdInput.value = text;
  fileName.textContent = title;
  currentFileId = fileId;
  charCount.textContent = `${text.length} characters`;
}

function saveDraft() {
  const text = mdInput.value;
  if (text.trim()) {
    try {
      localStorage.setItem(DRAFT_KEY, text);
    } catch {}
  }
}

function restoreDraft() {
  if (currentFileId || fileName.textContent) return;
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && draft.trim()) {
      mdInput.value = draft;
      charCount.textContent = `${draft.length} characters`;
    }
  } catch {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

const renderMarkdown = debounce(async () => {
  const text = mdInput.value.trim();
  if (!text) {
    preview.innerHTML = `
      <div class="placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p>Upload a .md file or type Markdown on the left, then click Render</p>
      </div>`;
    return;
  }

  try {
    const res = await fetch('/api/v1/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    preview.innerHTML = data.html;
  } catch (err) {
    preview.innerHTML = `<div class="placeholder"><p style="color:var(--red)">Failed to render Markdown. ${err.message}</p></div>`;
  }
}, 300);

export function initEditor() {
  restoreDraft();

  const saveDraftDebounced = debounce(saveDraft, 1000);

  mdInput.addEventListener('input', () => {
    charCount.textContent = `${mdInput.value.length} characters`;
    saveDraftDebounced();
    renderMarkdown();
  });

  renderBtn.addEventListener('click', () => renderMarkdown());

  mdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      renderMarkdown();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileName.textContent = file.name;
    currentFileId = null;
    clearDraft();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditorContent(ev.target.result, file.name);
      renderMarkdown();
      showToast(`Loaded ${file.name}`, 'info');
    };
    reader.readAsText(file);
  });

  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.mdown'))) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });

  if (mdInput.value.trim()) {
    renderMarkdown();
  }
}

export function refreshPreview() {
  renderMarkdown();
}
