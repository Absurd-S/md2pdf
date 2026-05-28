import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultStyles = readFileSync(resolve(__dirname, 'default-styles.css'), 'utf-8');

export function buildHtmlDocument(bodyHtml, options = {}) {
  const {
    title = 'Document',
    lang = 'zh-CN',
    highlightCss = '',
    customCss = '',
  } = options;

  return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="generator" content="MD2PDF">
  <style>
/* === highlight.js Theme === */
${highlightCss}

/* === MD2PDF Default Styles (DESIGN.md tokens) === */
${defaultStyles}

/* === User Custom CSS === */
${customCss}
  </style>
</head>
<body>
  <article class="md-content">
${bodyHtml}
  </article>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
