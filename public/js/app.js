import { initTheme, setupKeyboardShortcuts, setupModal } from './ui.js';
import { initEditor } from './editor.js';
import { initAuth, checkAuth } from './auth.js';
import { initFiles } from './files.js';
import { getEl } from './utils.js';

initTheme();
initEditor();
initAuth();
initFiles();

setupKeyboardShortcuts({
  's': () => {
    const saveBtn = getEl('save-btn');
    if (saveBtn.style.display !== 'none') saveBtn.click();
  },
});

setupModal(getEl('save-modal'), getEl('save-modal-close'));

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;

    const editorPanel = getEl('editor-panel');
    const previewPanel = getEl('preview-panel');
    const filesPanel = getEl('files-panel');
    const builderPanel = getEl('builder-panel');

    if (window.innerWidth > 768) {
      editorPanel.style.display = target === 'editor' ? 'flex' : 'none';
      previewPanel.style.display = 'flex';
      filesPanel.style.display = target === 'files' ? 'flex' : 'none';
      filesPanel.classList.toggle('active', target === 'files');
      builderPanel.style.display = target === 'builder' ? 'flex' : 'none';
      builderPanel.classList.toggle('active', target === 'builder');
    } else {
      editorPanel.classList.toggle('hidden-mobile', target !== 'editor');
      previewPanel.classList.toggle('hidden-mobile', target !== 'preview');
      filesPanel.classList.toggle('hidden-mobile', target !== 'files');
      filesPanel.classList.toggle('active', target === 'files');
      builderPanel.classList.toggle('hidden-mobile', target !== 'builder');
      builderPanel.classList.toggle('active', target === 'builder');
    }

    if (target === 'builder') {
      import('./builder.js').then(m => m.parseEditorToBuilder());
    }
  });
});

checkAuth();
