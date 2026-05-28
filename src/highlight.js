import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import hljs from 'highlight.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEME_CACHE = new Map();

function findBuiltinThemePath(themeName) {
  const hljsRoot = resolve(__dirname, '../node_modules/highlight.js');
  const candidate = resolve(hljsRoot, 'styles', `${themeName}.css`);
  if (existsSync(candidate)) return candidate;

  const minCandidate = resolve(hljsRoot, 'styles', `${themeName}.min.css`);
  if (existsSync(minCandidate)) return minCandidate;

  return null;
}

export function loadThemeCss(themeName) {
  if (THEME_CACHE.has(themeName)) return THEME_CACHE.get(themeName);

  // 1. If it's a file path, read directly
  if (existsSync(themeName)) {
    try {
      const css = readFileSync(themeName, 'utf-8');
      THEME_CACHE.set(themeName, css);
      return css;
    } catch { /* fall through */ }
  }

  // 2. Look up in highlight.js built-in themes
  const builtin = findBuiltinThemePath(themeName);
  if (builtin) {
    const css = readFileSync(builtin, 'utf-8');
    THEME_CACHE.set(themeName, css);
    return css;
  }

  // 3. Fall back to github-dark
  const fallback = findBuiltinThemePath('github-dark');
  if (fallback) {
    const css = readFileSync(fallback, 'utf-8');
    THEME_CACHE.set(themeName, css);
    return css;
  }

  return '';
}

export function createHighlightFunction(enabled = true) {
  if (!enabled) return undefined;

  return function highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
        return `<pre><code class="hljs language-${lang}">${result.value}</code></pre>`;
      } catch {
        // fall through
      }
    }
    return `<pre><code class="hljs">${hljs.highlightAuto(str).value}</code></pre>`;
  };
}

export function listAvailableThemes() {
  try {
    const stylesDir = resolve(__dirname, '../node_modules/highlight.js/styles');
    const files = readdirSync(stylesDir);
    return files
      .filter(f => f.endsWith('.css') && !f.endsWith('.min.css'))
      .map(f => f.replace('.css', ''));
  } catch {
    return ['github-dark', 'monokai', 'monokai-sublime', 'dracula', 'nord'];
  }
}
