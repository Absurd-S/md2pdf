import { writeFileSync } from 'fs';
import { resolve } from 'path';

export async function exportPdf(fullHtml, outputPath, browser, options = {}) {
  const target = resolve(outputPath || 'output.pdf');

  const page = await browser.newPage();
  try {
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0',
      timeout: options.timeout || 30000,
    });

    await page.pdf({
      path: target,
      format: options.pageSize || 'A4',
      margin: {
        top: options.margin || '20mm',
        bottom: options.margin || '20mm',
        left: options.margin || '15mm',
        right: options.margin || '15mm',
      },
      landscape: options.landscape || false,
      printBackground: options.printBackground !== false,
      scale: options.scale || 1,
      displayHeaderFooter: false,
    });

    return { filepath: target };
  } finally {
    await page.close();
  }
}
