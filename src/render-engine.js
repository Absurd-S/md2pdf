import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItToc from 'markdown-it-table-of-contents';
import markdownItFootnote from 'markdown-it-footnote';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItDeflist from 'markdown-it-deflist';
import markdownItMark from 'markdown-it-mark';
import { createHighlightFunction } from './highlight.js';

export function createMarkdownEngine(options = {}) {
  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
    langPrefix: 'language-',
    highlight: createHighlightFunction(options.highlight !== false),
  });

  // Plugins
  md.use(markdownItAnchor, {
    level: [1, 2, 3, 4, 5, 6],
  });

  if (options.toc) {
    md.use(markdownItToc, {
      includeLevel: Array.from(
        { length: options.tocDepth || 3 },
        (_, i) => i + 1
      ),
      containerClass: 'table-of-contents',
      markerPattern: /^\[\[toc\]\]/im,
    });
  }

  md.use(markdownItFootnote);
  md.use(markdownItEmoji);
  md.use(markdownItSub);
  md.use(markdownItSup);
  md.use(markdownItDeflist);
  md.use(markdownItMark);

  return md;
}

export function renderMarkdown(mdString, options = {}) {
  const engine = createMarkdownEngine(options);
  return engine.render(mdString);
}
