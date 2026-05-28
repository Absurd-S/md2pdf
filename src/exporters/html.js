import { writeFileSync } from 'fs';
import { resolve } from 'path';

export async function exportHtml(fullHtml, outputPath) {
  const target = resolve(outputPath || 'output.html');
  writeFileSync(target, fullHtml, 'utf-8');
  return { filepath: target };
}
