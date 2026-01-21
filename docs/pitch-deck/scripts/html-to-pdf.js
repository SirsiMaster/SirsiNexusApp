const puppeteer = require('puppeteer');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function generatePDF() {
    const inputFile = process.argv[2] || 'sirsipitchdecknov.html';
    const outputFile = process.argv[3] || inputFile.replace('.html', '-multipage.pdf');

    console.log(`Converting ${inputFile} to ${outputFile}...`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to 16:9 presentation aspect ratio
    const width = 1920;
    const height = 1080;
    await page.setViewport({ width, height });

    // Load the HTML file
    const filePath = path.resolve(__dirname, '..', inputFile);
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Get visible slide indices
    const slideIndices = await page.evaluate(() => {
        const slides = document.querySelectorAll('.slide');
        const indices = [];
        slides.forEach((slide, index) => {
            const style = window.getComputedStyle(slide);
            // Skip slides with display: none
            if (style.display !== 'none' && !slide.style.display?.includes('none')) {
                indices.push(index);
            }
        });
        return indices;
    });

    console.log(`Found ${slideIndices.length} visible slides`);

    // Hide UI elements once
    await page.evaluate(() => {
        const header = document.querySelector('.slide-header');
        const nav = document.querySelector('.nav-footer');
        const progress = document.querySelector('.progress');
        if (header) header.style.display = 'none';
        if (nav) nav.style.display = 'none';
        if (progress) progress.style.display = 'none';
    });

    // Collect individual PDFs for each slide
    const pdfBuffers = [];

    for (let i = 0; i < slideIndices.length; i++) {
        const slideIndex = slideIndices[i];
        console.log(`Processing slide ${i + 1}/${slideIndices.length}...`);

        // Show only the current slide
        await page.evaluate((currentIndex) => {
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide, index) => {
                if (index === currentIndex) {
                    slide.classList.add('active');
                    slide.style.opacity = '1';
                    slide.style.visibility = 'visible';
                } else {
                    slide.classList.remove('active');
                    slide.style.opacity = '0';
                    slide.style.visibility = 'hidden';
                }
            });
        }, slideIndex);

        // Wait for any animations
        await new Promise(r => setTimeout(r, 300));

        // Capture this slide as a single-page PDF
        const pdfBuffer = await page.pdf({
            width: `${width}px`,
            height: `${height}px`,
            printBackground: true,
            pageRanges: '1',
            preferCSSPageSize: false
        });

        pdfBuffers.push(pdfBuffer);
    }

    console.log('Merging slides into final PDF...');

    // Merge all PDFs into one
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const [copiedPage] = await mergedPdf.copyPages(pdf, [0]);
        mergedPdf.addPage(copiedPage);
    }

    const mergedPdfBytes = await mergedPdf.save();

    const outputPath = path.resolve(__dirname, '..', outputFile);
    fs.writeFileSync(outputPath, mergedPdfBytes);

    console.log(`PDF generated: ${outputFile} (${slideIndices.length} pages)`);

    await browser.close();
}

generatePDF().catch(console.error);
