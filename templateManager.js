const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const chromium = require('chrome-aws-lambda'); // For serverless
const puppeteer = require('puppeteer-core');   // Lightweight Puppeteer

// ✅ Sanitize file names
function sanitize(str) {
  return str.replace(/[^a-z0-9-_]/gi, '_').substring(0, 30);
}

async function generatePDFWithTemplate(templateNumber, lrData, rawMessage) {
  const templatePath = path.join(__dirname, `./templates/template${templateNumber}.ejs`);
  const safeFileName = sanitize(rawMessage || 'message');
  const outputDir = path.join(__dirname, './generated');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `LR-${safeFileName}-${Date.now()}.pdf`);
  const html = await ejs.renderFile(templatePath, lrData);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();

  return outputPath;
}

module.exports = generatePDFWithTemplate;
