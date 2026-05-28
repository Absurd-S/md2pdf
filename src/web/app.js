/* ============================================
   MD2PDF — Frontend Application Logic
   ============================================ */

// --- State ---
const state = {
  currentFormat: 'html',
  markdown: '',
};

// --- DOM refs ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const mdInput = $('#mdInput');
const preview = $('#preview');
const downloadBtn = $('#downloadBtn');
const copyBtn = $('#copyBtn');
const clearBtn = $('#clearBtn');
const formatLabel = $('#formatLabel');
const statusMsg = $('#statusMsg');
const wordCount = $('#wordCount');
const fileInput = $('#fileInput');
const formatTabs = $$('.format-tab');

// --- Markdown engine (browser-side) ---
const md = window.markdownit({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  langPrefix: 'language-',
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs language-' + lang + '">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (_) {}
    }
    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  },
});

// --- Sample document ---
const SAMPLE_MD = `# Hello Markdown

欢迎使用 **MD2PDF** — 一个优雅的 Markdown 转换工具。

## 功能特性

- 实时预览渲染
- 代码语法高亮
- 三种格式导出

### 代码示例

\`\`\`python
def fibonacci(n):
    """Return the nth Fibonacci number."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fibonacci(10))  # 55
\`\`\`

\`\`\`javascript
const greet = (name) => {
  const msg = \`Hello, \${name}!\`;
  console.log(msg);
  return msg;
};
\`\`\`

### 表格

| 格式 | 引擎 | 特点 |
|------|------|------|
| HTML | markdown-it | 网页输出 |
| PDF | Puppeteer | 高质量打印 |
| PNG | Puppeteer | 全页截图 |

> **提示**：在左侧编辑 Markdown，右侧会实时渲染预览。点击上方按钮下载对应格式。

---

*Made with MD2PDF*
`;

// --- Live Preview ---
function updatePreview() {
  const markdown = mdInput.value;
  state.markdown = markdown;

  if (!markdown.trim()) {
    preview.innerHTML = '<p class="preview-placeholder">在左侧输入 Markdown，此处将实时渲染预览&hellip;</p>';
    wordCount.textContent = '0 字';
    return;
  }

  const html = md.render(markdown);
  preview.innerHTML = html;

  // Word count (CJK-aware: count characters for CJK, words for Latin)
  const text = markdown.replace(/[#*`\-_~\[\]()>|]/g, ' ');
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
  const latin = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  const total = cjk + latin;
  wordCount.textContent = total > 0 ? total.toLocaleString() + ' 字' : '0 字';
}

mdInput.addEventListener('input', updatePreview);

// --- Clear button ---
clearBtn.addEventListener('click', () => {
  mdInput.value = '';
  updatePreview();
  mdInput.focus();
  showStatus('已清空', 'success');
});

// --- Format tabs ---
formatTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    formatTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.currentFormat = tab.dataset.format;
    formatLabel.textContent = tab.dataset.format.toUpperCase();
  });
});

// --- Show status ---
function showStatus(msg, type = '') {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg ' + type;
  if (type) setTimeout(() => { statusMsg.textContent = ''; statusMsg.className = 'status-msg'; }, 4000);
}

// --- Download ---
downloadBtn.addEventListener('click', async () => {
  if (!state.markdown.trim()) {
    showStatus('请先输入 Markdown 内容', 'error');
    return;
  }

  const format = state.currentFormat;

  // HTML: generate client-side, no server needed
  if (format === 'html') {
    try {
      const apiRes = await fetch('/api/convert/html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: state.markdown }),
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success) {
          downloadBase64(data.data, 'document.html', data.mimeType);
          showStatus('HTML 下载完成', 'success');
          return;
        }
      }
    } catch (_) { /* offline fallback */ }

    // Offline fallback: use browser-rendered HTML wrapped in template
    const bodyHtml = preview.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>Document</title>
<style>
  body { max-width:860px; margin:0 auto; padding:40px 24px; font-family:Inter,sans-serif; background:#faf9f5; color:#3d3d3a; }
  h1,h2,h3 { font-family:"Cormorant Garamond",serif; color:#141413; }
  pre { background:#181715; color:#faf9f5; padding:24px; border-radius:12px; overflow-x:auto; }
  code { font-family:"JetBrains Mono",monospace; }
  blockquote { border-left:4px solid #cc785c; padding:8px 16px; background:#f5f0e8; }
  table { border-collapse:collapse; } th,td { border:1px solid #e6dfd8; padding:6px 12px; }
  img { max-width:100%; }
</style></head>
<body><article>${bodyHtml}</article></body></html>`;
    downloadBlob(fullHtml, 'document.html', 'text/html');
    showStatus('HTML 下载完成（离线模式）', 'success');
    return;
  }

  // PDF, PNG: use server API
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = '<span class="spinner"></span> 生成中...';
  showStatus('正在生成 ' + format.toUpperCase() + ' ...');

  try {
    const res = await fetch('/api/convert/' + format, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: state.markdown }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Server error');
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Conversion failed');

    const filename = 'document.' + format;
    downloadBase64(data.data, filename, data.mimeType);
    showStatus(format.toUpperCase() + ' 下载完成 (' + (data.metadata.sizeBytes / 1024).toFixed(1) + ' KB)', 'success');
  } catch (err) {
    showStatus('转换失败: ' + err.message, 'error');
  } finally {
    downloadBtn.disabled = false;
    const label = state.currentFormat.toUpperCase();
    downloadBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 11V13C3 13.5 3.5 14 4 14H12C12.5 14 13 13.5 13 13V11M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>导出 <span id="formatLabel">${label}</span>`;
  }
});

function downloadBase64(b64, filename, mimeType) {
  const byteChars = atob(b64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
  const bytes = new Uint8Array(byteNums);
  downloadBlob(bytes, filename, mimeType);
}

function downloadBlob(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Copy ---
copyBtn.addEventListener('click', async () => {
  if (!state.markdown.trim()) {
    showStatus('没有可复制的内容', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(state.markdown);
    showStatus('已复制源码到剪贴板', 'success');
  } catch {
    mdInput.select();
    document.execCommand('copy');
    showStatus('已复制到剪贴板', 'success');
  }
});

// --- File upload ---
$('#uploadBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);
$('#ctaTryBtn').addEventListener('click', () => {
  mdInput.value = SAMPLE_MD;
  updatePreview();
  window.scrollTo({ top: $('.editor-section').offsetTop - 80, behavior: 'smooth' });
});

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    mdInput.value = ev.target.result;
    updatePreview();
    showStatus('已加载: ' + file.name, 'success');
  };
  reader.readAsText(file);
}

// --- Drag & drop ---
const editorPane = mdInput.closest('.editor-pane');
editorPane.addEventListener('dragover', (e) => { e.preventDefault(); editorPane.style.borderColor = 'var(--primary)'; });
editorPane.addEventListener('dragleave', () => { editorPane.style.borderColor = ''; });
editorPane.addEventListener('drop', (e) => {
  e.preventDefault();
  editorPane.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt'))) {
    const reader = new FileReader();
    reader.onload = (ev) => { mdInput.value = ev.target.result; updatePreview(); showStatus('已加载: ' + file.name, 'success'); };
    reader.readAsText(file);
  }
});

// --- Keyboard shortcut: Ctrl+Enter to download ---
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    downloadBtn.click();
  }
});

// --- Init ---
mdInput.value = SAMPLE_MD;
updatePreview();
