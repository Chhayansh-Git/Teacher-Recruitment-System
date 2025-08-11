// server/utils/pdfGenerator.js

import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';

/**
 * generatePdf
 * Renders HTML or Handlebars template into PDF buffer.
 */
export async function generatePdf(htmlOrPath, variables = {}, options = {}) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let content;
  if (htmlOrPath.endsWith('.hbs')) {
    const src = await fs.readFile(htmlOrPath, 'utf8');
    const template = handlebars.compile(src);
    content = template(variables);
    await page.setContent(content, { waitUntil: 'networkidle0' });
  } else if (htmlOrPath.endsWith('.html')) {
    await page.goto(`file://${path.resolve(htmlOrPath)}`, { waitUntil: 'networkidle0' });
  } else {
    await page.setContent(htmlOrPath, { waitUntil: 'networkidle0' });
  }

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    ...options
  });
  await browser.close();
  return pdfBuffer;
}
