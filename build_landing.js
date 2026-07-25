const fs = require('fs');
const path = require('path');
require('dotenv').config();

const workspaceDir = path.resolve(__dirname, '..');
const outputFile = path.join(__dirname, 'index.html');

// PIN configurations
const EXPECTED_PIN = process.env.PIN || '5551';
const DEMO_PIN = process.env.DEMO_PIN || '0001';

const ignoreDirs = ['node_modules', '.git', '.vscode', '.github', '_UNUSED', 'extra-slides', 'images', 'scratch', '_old', 'z_OLD', '_menus', '_backgrounds'];

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
    
    // Column 1: Local Signage (Matrix and Auto-dash)
    const signageModules = ['_ct-MATRIX', '__auto-dash'];
    const signageHtml = signageModules.map(mod => {
        const modDir = path.join(workspaceDir, mod);
        const htmlFiles = findHtmlFiles(modDir, mod, modDir);
        const linksHtml = htmlFiles.map(f => `<li><a href="../${mod}/${f}" target="_blank" class="mod-link"><i data-lucide="file"></i> ${f}</a></li>`).join('');

        return `
        <div class="repo-card border-blue">
            <h3 class="repo-title text-blue"><i data-lucide="folder"></i> ${mod}</h3>
            <ul class="repo-links">
                ${linksHtml}
            </ul>
        </div>`;
    }).join('');

    // Column 2: Operations & Portals (CTOS Beta, and CTSC External App)
    const operationsHtml = `
        <div class="repo-card border-gold">
            <h3 class="repo-title text-gold"><i data-lucide="server"></i> _ctos-beta</h3>
            <ul class="repo-links">
                <li>
                    <a href="#" onclick="const url = (window.location.protocol === 'file:') ? 'http://localhost:3000' : (window.location.protocol + '//' + window.location.hostname + ':3000'); window.open(url);" class="mod-link text-gold-hover">
                        <i data-lucide="external-link"></i> CTOS Beta Service
                    </a>
                </li>
            </ul>
        </div>
        <div class="repo-card border-cyan">
            <h3 class="repo-title text-cyan"><i data-lucide="globe"></i> ctsc-app.web.app</h3>
            <ul class="repo-links">
                <li>
                    <a href="https://ctsc-app.web.app/" target="_blank" class="mod-link text-cyan-hover">
                        <i data-lucide="external-link"></i> Coasters Social Club Portal
                    </a>
                </li>
            </ul>
        </div>
    `;

    // Column 3: GitHub Cloud Repositories (All other directories)
    const allDirs = fs.readdirSync(workspaceDir);
    const gitHubHtml = allDirs.filter(d => {
        const fullPath = path.join(workspaceDir, d);
        return fs.statSync(fullPath).isDirectory() && 
               !signageModules.includes(d) && 
               d !== '_ctos-beta' &&
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
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(255, 255, 255, 0.02);
      --card-hover: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.06);
      --border-hover: rgba(255, 255, 255, 0.12);
      --text: #f1f5f9;
      --muted: #64748b;
      
      --blue: #3b82f6;
      --blue-glow: rgba(59, 130, 246, 0.15);
      --blue-hover: #60a5fa;
      
      --gold: #d4af37;
      --gold-glow: rgba(212, 175, 55, 0.15);
      --gold-hover: #f59e0b;
      
      --cyan: #06b6d4;
      --cyan-glow: rgba(6, 182, 212, 0.15);
      --cyan-hover: #22d3ee;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      font-family: 'Inter', sans-serif; 
      background: radial-gradient(circle at top right, #111827, #030712); 
      color: var(--text); 
      min-height: 100vh; 
      display: flex;
      flex-direction: column;
    }
    
    @media (min-width: 1201px) {
      body { overflow: hidden; }
    }
    
    /* Header Styles */
    .header {
      padding: 2rem 2.5rem 1rem;
      max-width: 1800px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 30%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-subtitle {
      font-size: 0.85rem;
      color: var(--muted);
      margin-top: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    .pi-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--gold);
    }
    .pi-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }

    .container { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr);
      flex: 1;
      padding: 1.5rem 2.5rem 2.5rem; 
      gap: 2rem; 
      max-width: 1800px; 
      width: 100%;
      margin: 0 auto; 
      box-sizing: border-box;
      overflow: hidden;
    }
    
    @media (max-width: 1200px) {
      .container {
        grid-template-columns: repeat(2, 1fr);
        height: auto;
        overflow-y: auto;
      }
    }
    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
      }
    }
    
    .column { 
      display: flex; 
      flex-direction: column; 
      background: var(--card-bg); 
      border: 1px solid var(--border); 
      border-radius: 24px; 
      padding: 1.75rem; 
      overflow: hidden; 
      backdrop-filter: blur(16px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
    }
    .column-header { 
      font-family: 'Outfit', sans-serif; 
      font-size: 1.4rem; 
      font-weight: 600; 
      margin-bottom: 1.25rem; 
      padding-bottom: 1rem; 
      border-bottom: 1px solid var(--border); 
      display: flex; 
      align-items: center; 
      gap: 0.75rem;
    }
    .column-content { 
      flex: 1; 
      overflow-y: auto; 
      padding-right: 0.5rem; 
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
    
    /* Links & Cards */
    .repo-card { 
      margin-bottom: 1.5rem; 
      background: rgba(255,255,255,0.01);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .repo-card:hover {
      transform: translateY(-2px);
      background: var(--card-hover);
      border-color: var(--border-hover);
    }
    
    .repo-card.border-blue { border-left: 4px solid var(--blue); }
    .repo-card.border-blue:hover { box-shadow: 0 0 20px var(--blue-glow); }
    
    .repo-card.border-gold { border-left: 4px solid var(--gold); }
    .repo-card.border-gold:hover { box-shadow: 0 0 20px var(--gold-glow); }
    
    .repo-card.border-cyan { border-left: 4px solid var(--cyan); }
    .repo-card.border-cyan:hover { box-shadow: 0 0 20px var(--cyan-glow); }

    .repo-title { 
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem; 
      color: #fff; 
      margin-bottom: 0.75rem; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
    }
    .text-blue { color: var(--blue-hover); }
    .text-gold { color: var(--gold-hover); }
    .text-cyan { color: var(--cyan-hover); }

    .repo-links { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
    
    .mod-link { 
      color: #94a3b8; 
      text-decoration: none; 
      display: flex; 
      align-items: center; 
      gap: 0.6rem; 
      font-size: 0.9rem; 
      transition: all 0.2s; 
      padding: 8px 12px; 
      border-radius: 8px;
      background: rgba(255,255,255,0.01);
      border: 1px solid transparent;
    }
    .mod-link:hover { 
      color: #fff; 
      background: rgba(255,255,255,0.04); 
      border-color: rgba(255,255,255,0.05);
      transform: translateX(4px);
    }
    .mod-link.text-gold-hover:hover { color: var(--gold-hover); }
    .mod-link.text-cyan-hover:hover { color: var(--cyan-hover); }
    .mod-link.text-blue-hover:hover { color: var(--blue-hover); }
    
    .mod-link i { width: 16px; height: 16px; opacity: 0.7; }
 
    /* Accordion */
    .accordion-item { 
      border: 1px solid var(--border); 
      border-radius: 12px; 
      margin-bottom: 0.75rem; 
      background: rgba(0,0,0,0.15); 
      overflow: hidden; 
      transition: all 0.3s;
    }
    .accordion-item:hover {
      border-color: var(--border-hover);
    }
    .accordion-header { 
      width: 100%; 
      padding: 1.1rem; 
      background: transparent; 
      border: none; 
      color: #cbd5e1; 
      text-align: left; 
      cursor: pointer; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      font-family: 'Inter', sans-serif; 
      font-size: 0.95rem; 
      font-weight: 500;
      transition: all 0.2s;
    }
    .accordion-header:hover { background: rgba(255,255,255,0.02); color: #fff; }
    .accordion-header span { display: flex; align-items: center; gap: 0.6rem; }
    .accordion-header .chevron { transition: transform 0.3s; width: 16px; opacity: 0.5; }
    .accordion-header.active { background: rgba(255,255,255,0.02); color: #fff; }
    .accordion-header.active .chevron { transform: rotate(180deg); opacity: 1; }
    .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .accordion-content .repo-links { padding: 0.75rem; border-top: 1px solid var(--border); margin: 0; background: rgba(0,0,0,0.1); }
 
    /* PIN Overlay */
    #pin-overlay { 
      position: fixed; 
      inset: 0; 
      background: rgba(7, 10, 19, 0.96); 
      backdrop-filter: blur(20px); 
      z-index: 100; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    .pin-modal { 
      background: rgba(255, 255, 255, 0.02); 
      border: 1px solid var(--border); 
      border-radius: 28px; 
      padding: 3rem; 
      width: 380px; 
      text-align: center; 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .pin-display { display: flex; gap: 1.25rem; justify-content: center; margin: 2.5rem 0; }
    .pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border); transition: all 0.2s; }
    .pin-dot.filled { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 10px var(--gold); }
    .pin-dot.error { background: #ef4444; border-color: #ef4444; box-shadow: 0 0 10px #ef4444; }
    .pin-numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .pin-btn { 
      aspect-ratio: 1.1; 
      border-radius: 16px; 
      border: 1px solid rgba(255,255,255,0.03); 
      background: rgba(255,255,255,0.02); 
      color: #fff; 
      font-size: 1.6rem; 
      font-weight: 600;
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      transition: all 0.2s; 
    }
    .pin-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
    .pin-btn:active { transform: scale(0.95); }
    .pin-btn[data-val="clear"], .pin-btn[data-val="del"] { font-size: 1.1rem; color: var(--muted); }
  </style>
</head>
<body>

  <!-- PIN Overlay -->
  <div id="pin-overlay">
    <div class="pin-modal">
      <h2 style="font-family: Outfit; margin-bottom: 0.5rem; font-size: 1.8rem; font-weight: 700; color: #fff;">Access Hub</h2>
      <p style="color: var(--muted); font-size: 0.95rem; font-weight: 500;">Enter PIN to Unlock</p>
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

  <!-- Header -->
  <header class="header">
    <div>
      <h1 class="header-title">CT Ecosystem Hub</h1>
      <div class="header-subtitle">Venue Operation Controls</div>
    </div>
    <div class="pi-status" id="pi-status" style="display: none;">
      <span class="pi-dot"></span>
      <span>Auto-Unlocked (Pi Mode)</span>
    </div>
  </header>

  <div class="container" id="main-content" style="opacity: 0; pointer-events: none; transition: opacity 0.5s;">
    <!-- COLUMN 1 (Local Signs & Displays) -->
    <div class="column">
      <div class="column-header" style="color: var(--blue);"><i data-lucide="server"></i> Local Displays</div>
      <div class="column-content">
        ${signageHtml}
      </div>
    </div>

    <!-- COLUMN 2 (Operational Portals) -->
    <div class="column">
      <div class="column-header" style="color: var(--gold);"><i data-lucide="layout-grid"></i> Operations</div>
      <div class="column-content">
        ${operationsHtml}
      </div>
    </div>

    <!-- COLUMN 3 (Cloud Deployments) -->
    <div class="column">
      <div class="column-header" style="color: var(--cyan);"><i data-lucide="cloud"></i> GitHub Cloud Modules</div>
      <div class="column-content">
        ${gitHubHtml}
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
    const DEMO_PIN = '${DEMO_PIN}';
    let currentPin = '';
    const dots = document.querySelectorAll('.pin-dot');
    const overlay = document.getElementById('pin-overlay');
    const main = document.getElementById('main-content');
    const piStatus = document.getElementById('pi-status');

    // Auto unlock on Pi/Localhost/File protocol
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.97';
    const isFileProtocol = window.location.protocol === 'file:';

    if (sessionStorage.getItem('ct-land-auth') === 'true' || isLocalhost || isFileProtocol) {
        if (isLocalhost || isFileProtocol) {
            piStatus.style.display = 'flex';
        }
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

    function handleInput(val) {
        if (val === 'clear') currentPin = '';
        else if (val === 'del') currentPin = currentPin.slice(0, -1);
        else if (currentPin.length < 4) currentPin += val;
        
        updateDisplay();

        if (currentPin.length === 4) {
            if (currentPin === EXPECTED_PIN || currentPin === DEMO_PIN) {
                sessionStorage.setItem('ct-land-auth', 'true');
                unlock();
            } else {
                dots.forEach(d => d.classList.add('error'));
                setTimeout(() => { currentPin = ''; updateDisplay(); }, 500);
            }
        }
    }

    // Keypad Clicks
    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleInput(e.currentTarget.getAttribute('data-val'));
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (overlay.style.display === 'none') return;
        if (e.key >= '0' && e.key <= '9') {
            handleInput(e.key);
        } else if (e.key === 'Backspace') {
            handleInput('del');
        } else if (e.key === 'Escape') {
            handleInput('clear');
        }
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputFile, template);
    console.log('Successfully generated index.html');
}

buildHtml();
