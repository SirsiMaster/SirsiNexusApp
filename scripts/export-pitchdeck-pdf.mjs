#!/usr/bin/env node
/**
 * Sirsi Pitch Deck → PDF Export (v6 — Aspect Match)
 * 
 * KEY INSIGHT: The slides use 100vh. If we set the viewport to exactly
 * match Letter Landscape aspect ratio (1.294:1), the 100vh slide will
 * have the EXACT same proportions as the PDF page. Screenshot → embed
 * at 100% fill. No dead space. No stretching. Perfect.
 * 
 * At 1728px wide: height = 1728 / (11/8.5) = 1335px
 * That's the magic number.
 * 
 * Usage:
 *   node scripts/export-pitchdeck-pdf.mjs
 *   node scripts/export-pitchdeck-pdf.mjs https://sirsi.ai/pitchdeck
 */

import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

const url = process.argv[2] || 'https://sirsi.ai/pitchdeck';
const output = resolve(homedir(), 'Desktop', 'Sirsi_Technologies_Pitch_Deck.pdf');

const WIDTH = 1728;
// Match Letter Landscape aspect ratio EXACTLY
const HEIGHT = Math.round(WIDTH / (11 / 8.5));  // 1335

console.log('\n  ╔══════════════════════════════════════════╗');
console.log('  ║   Sirsi Technologies — PDF Export  v6    ║');
console.log('  ╚══════════════════════════════════════════╝\n');
console.log(`  Source:  ${url}`);
console.log(`  Output:  ${output}`);
console.log(`  Viewport: ${WIDTH}×${HEIGHT} @ 2x`);
console.log(`  Aspect: ${(WIDTH/HEIGHT).toFixed(3)} (Letter = ${(11/8.5).toFixed(3)})\n`);

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--force-color-profile=srgb']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: WIDTH,
        height: HEIGHT,
        deviceScaleFactor: 2
    });

    console.log('  ⏳ Loading pitch deck...');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('.slide');

    // Hide UI chrome
    await page.addStyleTag({ content: `
        .nav-footer, .progress-container, .print-controls, .doc-header {
            display: none !important;
        }
    `});

    const totalSlides = await page.$$eval('.slide', s => s.length);
    console.log(`  ✓ ${totalSlides} slides loaded\n`);

    // Create the PDF document — Letter Landscape
    const pdf = await PDFDocument.create();
    pdf.setTitle('Sirsi Technologies — Investor Pitch Deck');
    pdf.setAuthor('Sirsi Technologies Inc.');
    pdf.setSubject('Autonomous Operating System for AI Infrastructure');
    pdf.setCreator('Sirsi PDF Export v6');

    const PAGE_W = 11 * 72;   // 792 points
    const PAGE_H = 8.5 * 72;  // 612 points

    for (let i = 1; i <= totalSlides; i++) {
        process.stdout.write(`  📸 Slide ${i}/${totalSlides}...`);

        // Navigate to the slide
        await page.evaluate((num) => {
            if (typeof showSlide === 'function') showSlide(num);
        }, i);

        // Wait for everything to render
        await new Promise(r => setTimeout(r, 800));

        // Take the screenshot — viewport matches page aspect perfectly
        const pngBytes = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
            omitBackground: false
        });

        // Embed — the aspect ratios match, so this fills 100% of the page
        const pngImage = await pdf.embedPng(pngBytes);
        const pdfPage = pdf.addPage([PAGE_W, PAGE_H]);

        // White background
        pdfPage.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H,
            color: { type: 'RGB', red: 1, green: 1, blue: 1 } });

        // FILL entire page — aspect ratios are identical
        pdfPage.drawImage(pngImage, {
            x: 0, y: 0, width: PAGE_W, height: PAGE_H
        });

        console.log(' ✓');
    }

    console.log('\n  📄 Saving PDF...');
    const pdfBytes = await pdf.save();
    writeFileSync(output, pdfBytes);

    await browser.close();

    const sizeMB = (pdfBytes.length / 1024 / 1024).toFixed(1);
    console.log(`\n  ✅ PDF saved: ${output}`);
    console.log(`  📊 Size: ${sizeMB} MB`);
    console.log(`  📐 ${totalSlides} slides, Letter Landscape`);
    console.log(`  🖼  ${WIDTH}×${HEIGHT} @ 2x (100% page fill)\n`);
}

main().catch(err => {
    console.error('\n  ❌ Error:', err.message);
    process.exit(1);
});
