const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Target directories for policy documents
const directories = [
    'docs/policies',
    'docs/workflows',
    'proposals'
];

async function convert() {
    console.log('🚀 Finalizing Policy PDF Sync (Robust Implementation)...');

    const profilePath = path.join(__dirname, '.chrome_pdf_profile');

    // Safety: Remove profile locks if they exist to prevent "Browser already running" errors
    const lockFiles = [
        path.join(profilePath, 'SingletonLock'),
        path.join(profilePath, 'SingletonCookie'),
        path.join(profilePath, 'SingletonSocket')
    ];

    lockFiles.forEach(f => {
        if (fs.existsSync(f)) {
            try { fs.unlinkSync(f); } catch (e) { }
        }
    });

    if (!fs.existsSync(profilePath)) fs.mkdirSync(profilePath, { recursive: true });

    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        userDataDir: profilePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process'
        ]
    });

    for (const dir of directories) {
        const fullDir = path.join(__dirname, '..', dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = fs.readdirSync(fullDir);
        for (const file of files) {
            if (file.endsWith('.md')) {
                const srcPath = path.join(fullDir, file);
                const destPath = srcPath.replace('.md', '.pdf');

                // Skip if current
                if (fs.existsSync(destPath)) {
                    const srcStat = fs.statSync(srcPath);
                    const destStat = fs.statSync(destPath);
                    if (srcStat.mtime <= destStat.mtime) continue;
                }

                console.log(`📄 Syncing ${file} -> PDF...`);
                const markdown = fs.readFileSync(srcPath, 'utf8');

                const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        @page { size: letter; margin: 0.8in; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; background: white; margin: 0; padding: 40px; }
        
        .header-brand { 
            text-align: right; 
            font-size: 8pt; 
            color: #C8A951; 
            font-family: 'Inter', sans-serif; 
            font-weight: 700;
            letter-spacing: 0.1em;
            margin-bottom: 30px;
            border-bottom: 1px solid #C8A951;
            padding-bottom: 5px;
        }

        h1, h2, h3 { font-family: 'Cinzel', serif; color: #1e293b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5em; }
        h1 { font-size: 26pt; text-align: center; border-bottom: 3px solid #C8A951; padding-bottom: 15px; margin-top: 0; color: #0f172a; }
        h2 { font-size: 16pt; color: #C8A951; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        
        p, li { font-family: 'Merriweather', serif; text-align: justify; margin-bottom: 1.2em; font-size: 11pt; }
        
        code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
        pre { background: #0f172a; color: #f8fafc; padding: 25px; border-radius: 8px; font-size: 9.5pt; overflow-x: auto; margin: 20px 0; border: 1px solid #C8A951; }
        
        blockquote { 
            border-left: 5px solid #C8A951; 
            margin: 25px 0; 
            padding: 15px 30px; 
            background: #fdfaf3; 
            font-style: italic;
            border-radius: 0 8px 8px 0;
        }

        table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 10pt; }
        th, td { border: 1px solid #e2e8f0; padding: 14px; text-align: left; }
        th { background: #f8fafc; font-family: 'Cinzel', serif; font-weight: 700; color: #0f172a; }
        
        .footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            text-align: center; 
            font-size: 8pt; 
            color: #94a3b8; 
            padding: 20px; 
            border-top: 1px solid #f1f5f9; 
            background: white; 
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body>
    <div class="header-brand">SIRSI TECHNOLOGIES | CONFIDENTIAL</div>
    <div id="content"></div>
    <div class="footer">
        © 2026 Sirsi Technologies Inc. • SOC 2 COMPLIANT • MASTER POLICY FRAMEWORK v5.2.0
    </div>
    <script>
        document.getElementById('content').innerHTML = marked.parse(\`${markdown.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
    </script>
</body>
</html>`;

                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: 'networkidle0' });
                await page.pdf({
                    path: destPath,
                    format: 'Letter',
                    printBackground: true,
                    margin: { top: '0', right: '0', bottom: '0', left: '0' }
                });
                await page.close();
                console.log(`✅ Success: ${file}`);
            }
        }
    }

    await browser.close();
    console.log('✨ All policies synchronized to PDF.');
}

convert().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
