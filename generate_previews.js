const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const workspaceDir = path.resolve(__dirname, '..');
const ignoreDirs = ['node_modules', '.git', '.vscode', '.github', '_UNUSED', 'extra-slides', 'images', 'scratch', '_old', 'z_OLD', '_menus', '_backgrounds', '.venv', 'venv'];

function findHtmlFiles(dir, repoName, baseDir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (ignoreDirs.includes(file)) continue;
        const filePath = path.join(dir, file);
        try {
            if (fs.statSync(filePath).isDirectory()) {
                findHtmlFiles(filePath, repoName, baseDir, fileList);
            } else if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        } catch (e) {
            // Ignore broken symlinks
        }
    }
    return fileList;
}

async function generatePreviews() {
    console.log('Starting preview generation...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const allDirs = fs.readdirSync(workspaceDir);
    
    for (const repo of allDirs) {
        if (ignoreDirs.includes(repo)) continue;
        
        const repoPath = path.join(workspaceDir, repo);
        if (!fs.statSync(repoPath).isDirectory() || repo === '_ct-LAND' || repo === 'ndm-LAND') continue;

        const htmlFiles = findHtmlFiles(repoPath, repo, repoPath);
        if (htmlFiles.length === 0) continue;

        const indexFile = htmlFiles.find(f => f.endsWith('index.html')) || htmlFiles[0];
        
        const previewDir = path.join(repoPath, '_preview');
        const screenshotPath = path.join(previewDir, 'cover.jpg');

        if (fs.existsSync(screenshotPath)) {
            console.log(`Skipping ${repo}: cover.jpg already exists.`);
            continue;
        }

        console.log(`Generating preview for ${repo}...`);
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir);
        }

        try {
            const fileUrl = 'file://' + indexFile;
            await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 80 });
            console.log(`Saved screenshot for ${repo}`);
        } catch (err) {
            console.error(`Failed to generate screenshot for ${repo}:`, err.message);
        }
    }

    await browser.close();
    console.log('Finished generating previews.');
}

generatePreviews().catch(console.error);
