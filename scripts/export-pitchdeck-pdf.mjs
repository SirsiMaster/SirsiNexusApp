#!/usr/bin/env node
/**
 * Sirsi Pitch Deck → PDF Export (v1 — Locked Baseline)
 * 
 * Strategy: Screenshot each slide at the user's exact screen resolution
 * (1728×1117) using Puppeteer, then embed each screenshot as a full-page
 * image in a Letter Landscape PDF using pdf-lib.
 * 
 * This is the LOCKED v1 baseline that the user approved.
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

// Capture at the user's actual screen resolution
const WIDTH = 1728;
const HEIGHT = 1117;

console.log('\n  ╔══════════════════════════════════════════╗');
console.log('  ║   Sirsi Technologies — PDF Export        ║');
console.log('  ╚══════════════════════════════════════════╝\n');
console.log(`  Source:  ${url}`);
console.log(`  Output:  ${output}`);
console.log(`  Resolution: ${WIDTH}×${HEIGHT} @ 2x\n`);

async function main() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--force-color-profile=srgb']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: WIDTH,
        height: HEIGHT,
        deviceScaleFactor: 2  // Retina-quality screenshots
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

    // Create the PDF document — Letter Landscape (11in × 8.5in = 792 × 612 points)
    const pdf = await PDFDocument.create();
    pdf.setTitle('Sirsi Technologies — Investor Pitch Deck');
    pdf.setAuthor('Sirsi Technologies Inc.');
    pdf.setSubject('Autonomous Operating System for AI Infrastructure');
    pdf.setCreator('Sirsi PDF Export');

    // Letter landscape in points (1 inch = 72 points)
    const PAGE_W = 11 * 72;   // 792
    const PAGE_H = 8.5 * 72;  // 612

    for (let i = 1; i <= totalSlides; i++) {
        process.stdout.write(`  📸 Slide ${i}/${totalSlides}...`);

        // Navigate to this slide
        await page.evaluate((num) => {
            if (typeof showSlide === 'function') showSlide(num);
        }, i);

        // Wait for animations and images
        await new Promise(r => setTimeout(r, 800));

        // Take a pixel-perfect screenshot of the viewport
        const pngBytes = await page.screenshot({
            type: 'png',
            clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
            omitBackground: false
        });

        // Embed the screenshot — maintain aspect ratio, no stretching
        const pngImage = await pdf.embedPng(pngBytes);

        // Calculate scale to FIT within page while preserving aspect ratio
        const imgAspect = WIDTH / HEIGHT;   // ~1.547
        const pageAspect = PAGE_W / PAGE_H; // ~1.294

        let drawW, drawH, drawX, drawY;
        if (imgAspect > pageAspect) {
            // Image is wider than page — fit to width, center vertically
            drawW = PAGE_W;
            drawH = PAGE_W / imgAspect;
            drawX = 0;
            drawY = (PAGE_H - drawH) / 2;
        } else {
            // Image is taller than page — fit to height, center horizontally
            drawH = PAGE_H;
            drawW = PAGE_H * imgAspect;
            drawX = (PAGE_W - drawW) / 2;
            drawY = 0;
        }

        const pdfPage = pdf.addPage([PAGE_W, PAGE_H]);
        // White background
        pdfPage.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H,
            color: { type: 'RGB', red: 1, green: 1, blue: 1 } });
        pdfPage.drawImage(pngImage, {
            x: drawX, y: drawY, width: drawW, height: drawH
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
    console.log(`  🖼  ${WIDTH}×${HEIGHT} @ 2x per slide\n`);
}

main().catch(err => {
    console.error('\n  ❌ Error:', err.message);
    process.exit(1);
});
