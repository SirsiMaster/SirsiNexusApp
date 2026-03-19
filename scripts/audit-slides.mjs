#!/usr/bin/env node
/**
 * Quick audit: screenshot every slide individually for review
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const url = 'https://sirsi.ai/pitchdeck';
const outDir = '/tmp/slide-audit';
mkdirSync(outDir, { recursive: true });

async function main() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1728, height: 1335, deviceScaleFactor: 1 });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('.slide');
    await page.addStyleTag({ content: `.nav-footer, .progress-container, .print-controls, .doc-header { display: none !important; }` });

    const total = await page.$$eval('.slide', s => s.length);

    for (let i = 1; i <= total; i++) {
        await page.evaluate(n => showSlide(n), i);
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({
            path: resolve(outDir, `slide-${String(i).padStart(2,'0')}.png`),
            type: 'png',
            clip: { x: 0, y: 0, width: 1728, height: 1335 }
        });
        console.log(`  ✓ Slide ${i}`);
    }
    await browser.close();
    console.log(`\n  Screenshots saved to ${outDir}`);
}
main();
