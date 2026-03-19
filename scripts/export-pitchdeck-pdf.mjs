#!/usr/bin/env node
/**
 * Sirsi Pitch Deck → PDF Export (Puppeteer)
 * 
 * Simplest possible approach: modify the live page to show ALL slides
 * vertically with page-break-after, then call page.pdf() directly.
 * Puppeteer's pdf() renders exactly what Chrome renders.
 * 
 * Usage:
 *   node scripts/export-pitchdeck-pdf.mjs
 *   node scripts/export-pitchdeck-pdf.mjs https://sirsi.ai/pitchdeck
 */

import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

const url = process.argv[2] || 'https://sirsi.ai/pitchdeck';
const output = resolve(homedir(), 'Desktop', 'Sirsi_Technologies_Pitch_Deck.pdf');

// PDF page size in pixels: 11in × 8.5in at 96dpi
const PW = 1056;
const PH = 816;

console.log('\n  ╔══════════════════════════════════════════╗');
console.log('  ║   Sirsi Technologies — PDF Export        ║');
console.log('  ╚══════════════════════════════════════════╝\n');

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--force-color-profile=srgb']
    });

    const page = await browser.newPage();
    // Use exact PDF page dimensions so 100vh = one printed page height
    await page.setViewport({ width: PW, height: PH, deviceScaleFactor: 2 });

    console.log('  ⏳ Loading:', url);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('.slide');

    const totalSlides = await page.$$eval('.slide', s => s.length);
    console.log(`  ✓ ${totalSlides} slides detected\n`);

    // Transform the page: show all slides vertically for PDF export
    await page.evaluate(() => {
        // Remove nav and chrome
        document.querySelectorAll('.nav-footer, .progress-container, .print-controls, .doc-header').forEach(el => el.remove());

        // Unlock the html/body
        document.documentElement.style.cssText = 'overflow:visible!important;height:auto!important;background:#000!important;';
        document.body.style.cssText = 'overflow:visible!important;height:auto!important;background:#000!important;';

        // Unlock the presentation wrapper
        const pres = document.querySelector('.presentation');
        if (pres) {
            pres.style.cssText = 'position:relative!important;width:100%!important;height:auto!important;overflow:visible!important;background:transparent!important;';
        }

        // Make every slide visible and stacked vertically
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide) => {
            slide.className = 'slide'; // remove 'active' + any other state classes
            slide.style.cssText = [
                'display:flex!important',
                'opacity:1!important',
                'position:relative!important',
                'width:100%!important',
                'height:100vh!important',
                'page-break-after:always',
                'break-after:page',
                'page-break-inside:avoid',
                'break-inside:avoid',
                'overflow:hidden!important',
                'flex-shrink:0!important',
            ].join(';');
        });
    });

    // Wait for layout to settle
    await new Promise(r => setTimeout(r, 1500));

    console.log('  📄 Generating landscape PDF...');

    const pdfBuffer = await page.pdf({
        width: '11in',
        height: '8.5in',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: false,
        timeout: 60000
    });

    writeFileSync(output, pdfBuffer);
    await browser.close();

    const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(1);
    console.log(`\n  ✅ PDF saved: ${output}`);
    console.log(`  📊 Size: ${sizeMB} MB | ${totalSlides} slides, Landscape\n`);
}

main().catch(err => {
    console.error('\n  ❌ Error:', err.message);
    process.exit(1);
});
