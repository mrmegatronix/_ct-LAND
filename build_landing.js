const fs = require('fs');
const path = require('path');
require('dotenv').config();

const workspaceDir = path.resolve(__dirname, '..');
const outputFile = path.join(__dirname, 'index.html');

const leftModules = ['__auto-dash', '_ct-MATRIX', '_ctos-beta'];
const ignoreDirs = ['node_modules', '.git', '.vscode', '.github', '_UNUSED', 'extra-slides', 'images', 'scratch', '_old', 'z_OLD', '_menus', '_backgrounds'];

// PIN configuration
const EXPECTED_PIN = process.env.PIN || '5551';

function findHtmlFiles(dir, repoName, baseDir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (ignoreDirs.includes(file)) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findHtmlFiles(filePath, repoName, baseDir, fileList);
        } else if (file.endsWith('.html')) {
            const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
            fileList.push(relPath);
        }
    }
    return fileList;
}

function buildHtml() {
    console.log('Building ct-LAND index.html...');
    
    // Process Left List
    const leftListHtml = leftModules.map(mod => {
        let linksHtml = '';
        if (mod === '_ctos-beta') {
             linksHtml = `<li><a href="#" onclick="window.open(window.location.protocol + '//' + window.location.hostname + ':3000')" class="mod-link"><i data-lucide="external-link"></i> CTOS Beta Service</a></li>`;
        } else if (mod === '_ct-MATRIX') {
            const modDir = path.join(workspaceDir, mod);
            const htmlFiles = findHtmlFiles(modDir, mod, modDir);
            linksHtml = htmlFiles.map(f => `<li><a href="../${mod}/${f}" target="_blank" class="mod-link"><i data-lucide="file"></i> ${f}</a></li>`).join('');
        } else {
            const modDir = path.join(workspaceDir, mod);
            const htmlFiles = findHtmlFiles(modDir, mod, modDir);
            linksHtml = htmlFiles.map(f => `<li><a href="../${mod}/${f}" target="_blank" class="mod-link"><i data-lucide="file"></i> ${f}</a></li>`).join('');
        }

        return `
        <div class="repo-card">
            <h3 class="repo-title"><i data-lucide="folder"></i> ${mod}</h3>
            <ul class="repo-links">
                ${linksHtml}
            </ul>
        </div>`;
    }).join('');

    // Process Right List (All other repos)
    const allDirs = fs.readdirSync(workspaceDir);
    const rightListHtml = allDirs.filter(d => {
        const fullPath = path.join(workspaceDir, d);
        return fs.statSync(fullPath).isDirectory() && 
               !leftModules.includes(d) && 
               !ignoreDirs.includes(d) &&
               d !== '_ct-LAND'; // exclude self
    }).map(repo => {
        const repoDir = path.join(workspaceDir, repo);
        const htmlFiles = findHtmlFiles(repoDir, repo, repoDir);
        if (htmlFiles.length === 0) return '';

        const linksHtml = htmlFiles.map(f => {
            const ghUrl = `https://mrmegatronix.github.io/${repo}/${f}`;
            return `<li><a href="${ghUrl}" target="_blank" class="mod-link"><i data-lucide="external-link"></i> ${f}</a></li>`;
        }).join('');

        return `
        <div class="accordion-item">
            <button class="accordion-header" onclick="toggleAccordion(this)">
                <span><i data-lucide="github"></i> ${repo}</span>
                <i data-lucide="chevron-down" class="chevron"></i>
            </button>
            <div class="accordion-content">
                <ul class="repo-links">
                    ${linksHtml}
                </ul>
            </div>
        </div>`;
    }).join('');

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CT Ecosystem Hub</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --bg: #0f172a; --card-bg: rgba(255, 255, 255, 0.03); --border: rgba(255, 255, 255, 0.08);
      --text: #f8fafc; --muted: #94a3b8; --accent: #3b82f6; --accent-hover: #60a5fa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow: hidden; }
    
    .container { display: flex; height: 100vh; padding: 2rem; gap: 2rem; max-width: 1600px; margin: 0 auto; }
    
    .column { flex: 1; display: flex; flex-direction: column; background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; overflow: hidden; }
    .column-header { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem;}
    .column-content { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    
    /* Links & Cards */
    .repo-card { margin-bottom: 1.5rem; }
    .repo-title { font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .repo-links { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; margin-left: 1rem; }
    .mod-link { color: var(--muted); text-decoration: none; display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; transition: color 0.2s; padding: 4px; border-radius: 6px;}
    .mod-link:hover { color: var(--accent-hover); background: rgba(255,255,255,0.05); }
    .mod-link i { width: 14px; height: 14px; }

    /* Accordion */
    .accordion-item { border: 1px solid var(--border); border-radius: 10px; margin-bottom: 0.5rem; background: rgba(0,0,0,0.2); overflow: hidden; }
    .accordion-header { width: 100%; padding: 1rem; background: transparent; border: none; color: #fff; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; font-size: 1rem; transition: background 0.2s;}
    .accordion-header:hover { background: rgba(255,255,255,0.05); }
    .accordion-header span { display: flex; align-items: center; gap: 0.5rem; }
    .accordion-header .chevron { transition: transform 0.3s; width: 18px; }
    .accordion-header.active .chevron { transform: rotate(180deg); }
    .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
    .accordion-content .repo-links { padding: 1rem; border-top: 1px solid var(--border); margin: 0; }

    /* PIN Overlay */
    #pin-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.98); backdrop-filter: blur(10px); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .pin-modal { background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem; width: 340px; text-align: center; }
    .pin-display { display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; }
    .pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border); }
    .pin-dot.filled { background: var(--accent); border-color: var(--accent); }
    .pin-dot.error { background: #ef4444; border-color: #ef4444; }
    .pin-numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .pin-btn { aspect-ratio: 1; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); color: #fff; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .pin-btn:hover { background: rgba(255,255,255,0.1); }
  </style>
</head>
<body>

  <!-- PIN Overlay -->
  <div id="pin-overlay">
    <div class="pin-modal">
      <h2 style="font-family: Outfit; margin-bottom: 0.5rem;">Access Hub</h2>
      <p style="color: var(--muted); font-size: 0.9rem;">Enter PIN</p>
      <div class="pin-display">
        <div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div>
      </div>
      <div class="pin-numpad">
        <button class="pin-btn" data-val="1">1</button><button class="pin-btn" data-val="2">2</button><button class="pin-btn" data-val="3">3</button>
        <button class="pin-btn" data-val="4">4</button><button class="pin-btn" data-val="5">5</button><button class="pin-btn" data-val="6">6</button>
        <button class="pin-btn" data-val="7">7</button><button class="pin-btn" data-val="8">8</button><button class="pin-btn" data-val="9">9</button>
        <button class="pin-btn" data-val="clear"><i data-lucide="x"></i></button><button class="pin-btn" data-val="0">0</button><button class="pin-btn" data-val="del"><i data-lucide="delete"></i></button>
      </div>
    </div>
  </div>

  <div class="container" id="main-content" style="opacity: 0; pointer-events: none; transition: opacity 0.5s;">
    <!-- LEFT COLUMN (Main Local Modules) -->
    <div class="column">
      <div class="column-header"><i data-lucide="server"></i> Local Services</div>
      <div class="column-content">
        ${leftListHtml}
      </div>
    </div>

    <!-- RIGHT COLUMN (GitHub Hosted Modules) -->
    <div class="column">
      <div class="column-header"><i data-lucide="cloud"></i> GitHub Cloud Modules</div>
      <div class="column-content">
        ${rightListHtml}
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();

    function toggleAccordion(btn) {
        btn.classList.toggle("active");
        const content = btn.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }

    // PIN Auth Logic
    const EXPECTED_PIN = '${EXPECTED_PIN}';
    let currentPin = '';
    const dots = document.querySelectorAll('.pin-dot');
    const overlay = document.getElementById('pin-overlay');
    const main = document.getElementById('main-content');

    if (sessionStorage.getItem('ct-land-auth') === 'true') {
        unlock();
    }

    function unlock() {
        overlay.style.display = 'none';
        main.style.opacity = '1';
        main.style.pointerEvents = 'all';
    }

    function updateDisplay() {
        dots.forEach((dot, i) => {
            if (i < currentPin.length) dot.classList.add('filled');
            else { dot.classList.remove('filled'); dot.classList.remove('error'); }
        });
    }

    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.currentTarget.getAttribute('data-val');
            if (val === 'clear') currentPin = '';
            else if (val === 'del') currentPin = currentPin.slice(0, -1);
            else if (currentPin.length < 4) currentPin += val;
            
            updateDisplay();

            if (currentPin.length === 4) {
                if (currentPin === EXPECTED_PIN) {
                    sessionStorage.setItem('ct-land-auth', 'true');
                    unlock();
                } else {
                    dots.forEach(d => d.classList.add('error'));
                    setTimeout(() => { currentPin = ''; updateDisplay(); }, 500);
                }
            }
        });
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputFile, template);
    console.log('Successfully generated index.html');
}

buildHtml();
