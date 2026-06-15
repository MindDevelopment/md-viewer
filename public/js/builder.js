import { getEl, escHtml } from './utils.js';
import { setEditorContent } from './editor.js';

const builderBlocks = getEl('builder-blocks');
const mdInput = getEl('md-input');
const builderPlaceholder = getEl('builder-placeholder');
const addBtn = getEl('builder-add-btn');
const addMenu = getEl('builder-add-menu');
const generateBtn = getEl('generate-btn');

const _blocks = [];

/* ---- Block type config with preview renderers ---- */

const blockConfig = {
  heading: {
    label: 'Heading',
    defaultData: { level: '2', text: '' },
    renderPreview(data) {
      const lvl = data.level || '2';
      const text = data.text || '';
      if (!text) return '<span class="builder-empty-preview">Empty heading</span>';
      const Tag = `h${lvl}`;
      const badge = `<span class="b-level-badge">H${lvl}</span>`;
      return `<${Tag}>${badge}${escHtml(text)}</${Tag}>`;
    },
  },
  paragraph: {
    label: 'Paragraph',
    defaultData: { text: '' },
    renderPreview(data) {
      const text = data.text || '';
      if (!text) return '<span class="builder-empty-preview">Empty paragraph</span>';
      return `<p>${escHtml(text)}</p>`;
    },
  },
  bold: {
    label: 'Bold',
    defaultData: { text: '' },
    renderPreview(data) {
      const text = data.text || '';
      if (!text) return '<span class="builder-empty-preview">Empty bold text</span>';
      return `<p><strong>${escHtml(text)}</strong></p>`;
    },
  },
  italic: {
    label: 'Italic',
    defaultData: { text: '' },
    renderPreview(data) {
      const text = data.text || '';
      if (!text) return '<span class="builder-empty-preview">Empty italic text</span>';
      return `<p><em>${escHtml(text)}</em></p>`;
    },
  },
  link: {
    label: 'Link',
    defaultData: { text: 'Link text', url: 'https://' },
    renderPreview(data) {
      const text = data.text || '';
      const url = data.url || '';
      if (!text && !url) return '<span class="builder-empty-preview">Empty link</span>';
      return `<p><a href="${escHtml(url)}" target="_blank">${escHtml(text || url)}</a></p>`;
    },
  },
  image: {
    label: 'Image',
    defaultData: { alt: 'Image description', url: '' },
    renderPreview(data) {
      const url = data.url || '';
      const alt = data.alt || '';
      if (!url) return '<span class="builder-empty-preview">No image URL set</span>';
      return `<img src="${escHtml(url)}" alt="${escHtml(alt)}" onerror="this.style.display='none'">`;
    },
  },
  code: {
    label: 'Code',
    defaultData: { language: 'javascript', code: '' },
    renderPreview(data) {
      const lang = data.language || '';
      const code = data.code || '';
      const langBadge = lang ? `<div class="b-lang-badge">${escHtml(lang)}</div>` : '';
      if (!code) return `${langBadge}<span class="builder-empty-preview">Empty code block</span>`;
      return `${langBadge}<pre>${escHtml(code)}</pre>`;
    },
  },
  blockquote: {
    label: 'Blockquote',
    defaultData: { text: '' },
    renderPreview(data) {
      const text = data.text || '';
      if (!text) return '<span class="builder-empty-preview">Empty blockquote</span>';
      return `<blockquote>${escHtml(text).split('\n').join('<br>')}</blockquote>`;
    },
  },
  list: {
    label: 'Unordered List',
    defaultData: { items: [''] },
    renderPreview(data) {
      const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
      if (items.length === 0) return '<span class="builder-empty-preview">Empty list</span>';
      return `<ul>${items.map((i) => `<li>${escHtml(i)}</li>`).join('')}</ul>`;
    },
  },
  'ordered-list': {
    label: 'Ordered List',
    defaultData: { items: [''] },
    renderPreview(data) {
      const items = Array.isArray(data.items) ? data.items.filter(Boolean) : [];
      if (items.length === 0) return '<span class="builder-empty-preview">Empty ordered list</span>';
      return `<ol>${items.map((i) => `<li>${escHtml(i)}</li>`).join('')}</ol>`;
    },
  },
  checkbox: {
    label: 'Checklist',
    defaultData: { items: [{ text: '', checked: false }] },
    renderPreview(data) {
      const items = Array.isArray(data.items) ? data.items : [];
      const filtered = items.filter((i) => i && (typeof i === 'object' ? i.text : i));
      if (filtered.length === 0) return '<span class="builder-empty-preview">Empty checklist</span>';
      return `<ul>${items
        .map((i) => {
          const text = typeof i === 'object' ? i.text : i;
          const checked = typeof i === 'object' ? i.checked : false;
          if (!text) return '';
          return `<li>${checked ? '&#9745;' : '&#9744;'} ${escHtml(text)}</li>`;
        })
        .join('')}</ul>`;
    },
  },
  hr: {
    label: 'Divider',
    defaultData: {},
    renderPreview() {
      return '<hr>';
    },
  },
};

/* ---- Edit mode field renderers ---- */

function renderEditFields(block, index) {
  const config = blockConfig[block.type];
  if (!config) return '';

  const fields = [];
  const d = block.data;

  switch (block.type) {
    case 'heading':
      fields.push(renderSelect('Level', ['1', '2', '3', '4', '5', '6'], d.level || '2', index, 'level'));
      fields.push(renderInput('Text', d.text || '', index, 'text'));
      break;
    case 'paragraph':
      fields.push(renderTextarea('Text', d.text || '', index, 'text'));
      break;
    case 'bold':
      fields.push(renderInput('Text', d.text || '', index, 'text'));
      break;
    case 'italic':
      fields.push(renderInput('Text', d.text || '', index, 'text'));
      break;
    case 'link':
      fields.push(renderInput('Display Text', d.text || '', index, 'text'));
      fields.push(renderInput('URL', d.url || '', index, 'url'));
      break;
    case 'image':
      fields.push(renderInput('Alt Text', d.alt || '', index, 'alt'));
      fields.push(renderInput('Image URL', d.url || '', index, 'url'));
      break;
    case 'code':
      fields.push(renderInput('Language', d.language || '', index, 'language'));
      fields.push(renderTextarea('Code', d.code || '', index, 'code'));
      break;
    case 'blockquote':
      fields.push(renderTextarea('Text', d.text || '', index, 'text'));
      break;
    case 'list':
    case 'ordered-list':
      fields.push(renderListEditor(d.items || [''], index, 'items', false));
      break;
    case 'checkbox':
      fields.push(renderListEditor(d.items || [{ text: '', checked: false }], index, 'items', true));
      break;
    case 'hr':
      fields.push(
        '<div style="color:var(--text-muted);font-size:0.75rem;text-align:center;padding:0.25rem">This block has no settings</div>'
      );
      break;
  }

  return fields.join('\n');
}

function renderInput(label, value, index, key) {
  return `
    <div class="builder-edit-field">
      <label>${label}</label>
      <input type="text" value="${escHtml(String(value))}" data-idx="${index}" data-key="${key}">
    </div>`;
}

function renderTextarea(label, value, index, key) {
  return `
    <div class="builder-edit-field">
      <label>${label}</label>
      <textarea data-idx="${index}" data-key="${key}">${escHtml(String(value))}</textarea>
    </div>`;
}

function renderSelect(label, opts, value, index, key) {
  return `
    <div class="builder-edit-field">
      <label>${label}</label>
      <select data-idx="${index}" data-key="${key}">
        ${opts.map((o) => `<option value="${o}"${String(value) === o ? ' selected' : ''}>${o}</option>`).join('')}
      </select>
    </div>`;
}

function renderListEditor(items, index, key, isCheckbox) {
  const list = Array.isArray(items) ? items : [isCheckbox ? { text: '', checked: false } : ''];
  return `
    <div class="builder-edit-field">
      <label>Items</label>
      <div class="builder-list-editor" data-idx="${index}" data-key="${key}" data-check="${isCheckbox ? '1' : '0'}">
        ${list
          .map((item, ii) => {
            const val = isCheckbox ? (typeof item === 'object' ? item.text : item) : item;
            const checked = isCheckbox && (typeof item === 'object' ? item.checked : false);
            return `
            <div class="builder-list-row">
              ${isCheckbox ? `<input type="checkbox" data-item="${ii}" ${checked ? 'checked' : ''}>` : ''}
              <input type="text" value="${escHtml(String(val))}" data-item="${ii}" placeholder="Item ${ii + 1}">
              <button class="list-del" data-item="${ii}" title="Remove">&times;</button>
            </div>`;
          })
          .join('')}
        <button class="builder-list-add" title="Add item">+ Add item</button>
      </div>
    </div>`;
}

/* ---- Core functions ---- */

function renderBlocks() {
  const hasBlocks = _blocks.length > 0;
  builderPlaceholder.style.display = hasBlocks ? 'none' : 'flex';

  builderBlocks.innerHTML = _blocks
    .map((block, i) => {
      const config = blockConfig[block.type];
      if (!config) return '';
      const previewHtml = config.renderPreview(block.data);
      return `
      <div class="builder-block" data-index="${i}" draggable="false">
        <div class="builder-block-header" draggable="true">
          <div class="builder-drag-handle" title="Drag to reorder">
            <span></span><span></span><span></span>
          </div>
          <span class="builder-block-type">${config.label}</span>
          <div class="builder-block-actions">
            <button class="bclone" title="Duplicate" data-i="${i}">&#10697;</button>
            <button class="bdel" title="Delete" data-i="${i}">&times;</button>
          </div>
        </div>
        <div class="builder-block-preview" data-i="${i}">
          ${previewHtml}
        </div>
        <div class="builder-block-edit" data-i="${i}">
          ${renderEditFields(block, i)}
          <div style="display:flex;gap:0.375rem;margin-top:0.5rem">
            <button class="btn btn-render" style="flex:1;justify-content:center;padding:0.35rem" data-i="${i}">Done</button>
          </div>
        </div>
      </div>`;
    })
    .join('');

  attachBlockEvents();
}

function attachBlockEvents() {
  /* Preview click → edit mode */
  builderBlocks.querySelectorAll('.builder-block-preview').forEach((el) => {
    el.addEventListener('click', () => {
      const block = el.closest('.builder-block');
      block.classList.add('editing');
      block.querySelector('input, textarea, select')?.focus();
    });
  });

  /* Done button → back to preview */
  builderBlocks.querySelectorAll('.builder-block-edit .btn-render').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.builder-block').classList.remove('editing');
      syncEditor();
    });
  });

  /* Delete button */
  builderBlocks.querySelectorAll('.bdel').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeBlock(parseInt(btn.dataset.i));
    });
  });

  /* Clone button */
  builderBlocks.querySelectorAll('.bclone').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.i);
      const clone = JSON.parse(JSON.stringify(_blocks[i]));
      _blocks.splice(i + 1, 0, clone);
      renderBlocks();
      syncEditor();
    });
  });

  /* Edit field inputs */
  builderBlocks
    .querySelectorAll(
      '.builder-edit-field input[type="text"], .builder-edit-field textarea, .builder-edit-field select'
    )
    .forEach((el) => {
      el.addEventListener('input', () => updateBlockField(el));
      el.addEventListener('change', () => {
        updateBlockField(el);
        syncEditor();
      });
    });

  /* List editors */
  builderBlocks.querySelectorAll('.builder-list-editor').forEach((editor) => {
    const idx = parseInt(editor.dataset.idx);
    const key = editor.dataset.key;
    const isCheck = editor.dataset.check === '1';

    editor.querySelectorAll('.builder-list-row input[type="text"]').forEach((inp) => {
      inp.addEventListener('input', () => updateListItem(idx, key, parseInt(inp.dataset.item), inp.value, isCheck));
    });

    editor.querySelectorAll('.builder-list-row input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const items = _blocks[idx]?.data[key];
        if (Array.isArray(items) && items[parseInt(cb.dataset.item)]) {
          items[parseInt(cb.dataset.item)].checked = cb.checked;
          syncEditor();
        }
      });
    });

    editor.querySelectorAll('.list-del').forEach((btn) => {
      btn.addEventListener('click', () => {
        const items = _blocks[idx]?.data[key];
        if (Array.isArray(items)) {
          items.splice(parseInt(btn.dataset.item), 1);
          renderBlocks();
          syncEditor();
        }
      });
    });

    const addItemBtn = editor.querySelector('.builder-list-add');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        const items = _blocks[idx]?.data[key];
        if (Array.isArray(items)) {
          items.push(isCheck ? { text: '', checked: false } : '');
          renderBlocks();
          syncEditor();
        }
      });
    }
  });

  /* Drag and drop */
  setupDragDrop();
}

/* ---- Drag and drop ---- */

function setupDragDrop() {
  let dragSrcIndex = null;

  builderBlocks.querySelectorAll('.builder-block-header[draggable="true"]').forEach((header) => {
    header.addEventListener('dragstart', (e) => {
      const block = header.closest('.builder-block');
      dragSrcIndex = parseInt(block.dataset.index);
      block.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(dragSrcIndex));
    });

    header.addEventListener('dragend', () => {
      builderBlocks.querySelectorAll('.builder-block').forEach((b) => b.classList.remove('dragging', 'drag-over'));
      dragSrcIndex = null;
    });
  });

  builderBlocks.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.builder-block');
    if (target) target.classList.add('drag-over');
  });

  builderBlocks.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.builder-block');
    if (!target) return;
    const related = e.relatedTarget;
    if (related && target.contains(related)) return;
    target.classList.remove('drag-over');
  });

  builderBlocks.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.builder-block');
    if (!target || dragSrcIndex === null) return;
    const targetIndex = parseInt(target.dataset.index);
    if (dragSrcIndex === targetIndex) return;
    const [moved] = _blocks.splice(dragSrcIndex, 1);
    _blocks.splice(targetIndex, 0, moved);
    renderBlocks();
    syncEditor();
  });
}

/* ---- Data updates ---- */

function updateBlockField(el) {
  const block = el.closest('.builder-block');
  if (!block) return;
  const idx = parseInt(el.dataset.idx);
  const key = el.dataset.key;
  if (!_blocks[idx]) return;
  _blocks[idx].data[key] = el.value;
}

function updateListItem(idx, key, itemIdx, value, isCheck) {
  if (!_blocks[idx]) return;
  const items = _blocks[idx].data[key];
  if (!Array.isArray(items)) return;
  if (isCheck && typeof items[itemIdx] === 'object') {
    items[itemIdx].text = value;
  } else {
    items[itemIdx] = value;
  }
}

/* ---- Generate markdown from blocks ---- */

function generateMarkdown() {
  const lines = [];
  _blocks.forEach((block) => {
    const d = block.data;
    switch (block.type) {
      case 'heading':
        lines.push(`${'#'.repeat(parseInt(d.level) || 1)} ${d.text}`);
        break;
      case 'paragraph':
        lines.push(d.text);
        break;
      case 'bold':
        lines.push(`**${d.text}**`);
        break;
      case 'italic':
        lines.push(`*${d.text}*`);
        break;
      case 'link':
        lines.push(`[${d.text}](${d.url})`);
        break;
      case 'image':
        lines.push(`![${d.alt}](${d.url})`);
        break;
      case 'code':
        lines.push('```' + (d.language || ''));
        lines.push(d.code || '');
        lines.push('```');
        break;
      case 'blockquote':
        lines.push('> ' + d.text.split('\n').join('\n> '));
        break;
      case 'list': {
        const items = Array.isArray(d.items) ? d.items : [];
        items.forEach((item) => {
          if (item) lines.push(`- ${item}`);
        });
        break;
      }
      case 'ordered-list': {
        const items = Array.isArray(d.items) ? d.items : [];
        items.forEach((item, i) => {
          if (item) lines.push(`${i + 1}. ${item}`);
        });
        break;
      }
      case 'checkbox': {
        const items = Array.isArray(d.items) ? d.items : [];
        items.forEach((item) => {
          if (!item) return;
          const text = typeof item === 'object' ? item.text : item;
          const checked = typeof item === 'object' ? item.checked : false;
          if (text) lines.push(`- [${checked ? 'x' : ' '}] ${text}`);
        });
        break;
      }
      case 'hr':
        lines.push('---');
        break;
    }
    lines.push('');
  });
  return lines.join('\n').trim();
}

/* ---- Sync builder → editor ---- */

function syncEditor() {
  const md = generateMarkdown();
  mdInput.value = md;
  mdInput.dispatchEvent(new Event('input'));
}

/* ---- Parse editor text → blocks ---- */

export function parseEditorToBuilder() {
  const text = mdInput.value;
  if (!text.trim()) return;

  const parsed = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      parsed.push({ type: 'heading', data: { level: String(heading[1].length), text: heading[2] } });
      i++;
      continue;
    }

    if (/^---+\s*$/.test(trimmed) || /^\*\*\*+\s*$/.test(trimmed) || /^___+\s*$/.test(trimmed)) {
      parsed.push({ type: 'hr', data: {} });
      i++;
      continue;
    }

    if (/^>\s/.test(trimmed)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      parsed.push({ type: 'blockquote', data: { text: quoteLines.join('\n') } });
      continue;
    }

    if (/^```/.test(trimmed)) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      parsed.push({ type: 'code', data: { language: lang, code: codeLines.join('\n') } });
      continue;
    }

    if (/^-\s\[[ x]\]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(/^-\s\[([ x])\]\s(.+)$/);
        if (!m) break;
        items.push({ text: m[2], checked: m[1] === 'x' });
        i++;
      }
      parsed.push({ type: 'checkbox', data: { items } });
      continue;
    }

    if (/^-\s/.test(trimmed) || /^\*\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!/^[-*]\s/.test(t)) break;
        items.push(t.replace(/^[-*]\s/, ''));
        i++;
      }
      parsed.push({ type: 'list', data: { items } });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!/^\d+\.\s/.test(t)) break;
        items.push(t.replace(/^\d+\.\s/, ''));
        i++;
      }
      parsed.push({ type: 'ordered-list', data: { items } });
      continue;
    }

    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      parsed.push({ type: 'image', data: { alt: img[1], url: img[2] } });
      i++;
      continue;
    }

    const link = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      parsed.push({ type: 'link', data: { text: link[1], url: link[2] } });
      i++;
      continue;
    }

    const bold = trimmed.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      parsed.push({ type: 'bold', data: { text: bold[1] } });
      i++;
      continue;
    }

    const italic = trimmed.match(/^\*(.+)\*$/);
    if (italic) {
      parsed.push({ type: 'italic', data: { text: italic[1] } });
      i++;
      continue;
    }

    parsed.push({ type: 'paragraph', data: { text: trimmed } });
    i++;
  }

  _blocks.length = 0;
  parsed.forEach((b) => _blocks.push(b));
  renderBlocks();
  syncEditor();
}

/* ---- Add block (menu) ---- */

addBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  addMenu.classList.toggle('open');
});

document.addEventListener('click', () => {
  addMenu.classList.remove('open');
});

addMenu.addEventListener('click', (e) => {
  e.stopPropagation();
});

addMenu.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const config = blockConfig[type];
    if (!config) return;
    const block = { type, data: JSON.parse(JSON.stringify(config.defaultData)) };
    _blocks.push(block);
    addMenu.classList.remove('open');
    renderBlocks();
    syncEditor();
    const lastBlock = builderBlocks.lastElementChild;
    if (lastBlock) {
      lastBlock.classList.add('editing');
      lastBlock.querySelector('input, textarea, select')?.focus();
    }
  });
});

/* ---- Generate & Render ---- */

generateBtn.addEventListener('click', () => {
  const md = generateMarkdown();
  if (md) {
    setEditorContent(md, 'from-builder.md', null);
    mdInput.dispatchEvent(new Event('input'));
    if (window.innerWidth <= 768) {
      document.querySelector('.tab[data-tab="preview"]')?.click();
    }
  }
});

/* ---- Helper to remove block ---- */

function removeBlock(index) {
  _blocks.splice(index, 1);
  renderBlocks();
  syncEditor();
}

export function initBuilder() {}

/* ---- Re-export renderBlocks for menu ---- */
export { renderBlocks };
