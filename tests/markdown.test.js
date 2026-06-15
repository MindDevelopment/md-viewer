import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

describe('Markdown rendering', () => {
  it('renders headings', () => {
    const html = md.render('# Hello');
    expect(html).toContain('<h1>');
    expect(html).toContain('Hello');
  });

  it('renders bold text', () => {
    const html = md.render('**bold**');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('renders code blocks', () => {
    const html = md.render('```js\nconsole.log("hi")\n```');
    expect(html).toContain('hljs');
    expect(html).toContain('console');
  });

  it('renders empty string safely', () => {
    const html = md.render('');
    expect(html).toBe('');
  });

  it('escapes HTML in inline code', () => {
    const html = md.render('`<script>`');
    expect(html).toContain('&lt;script&gt;');
  });
});
