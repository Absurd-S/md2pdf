import { writeFileSync } from 'fs';
import { resolve } from 'path';

export async function exportPng(fullHtml, outputPath, browser, options = {}) {
  const target = resolve(outputPath || 'output.png');
  const width = options.width || 1200;
  const scale = options.scale || 2;

  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });

    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: options.timeout || 30000,
    });

    await page.screenshot({
      path: target,
      fullPage: options.fullPage !== false,
      type: 'png',
      omitBackground: false,
    });

    return { filepath: target };
  } finally {
    await page.close();
  }
}
