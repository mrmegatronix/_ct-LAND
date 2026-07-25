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
    
    // Group 1: Loaded in Matrix
    const matrixDirs = ['_ct-MATRIX', '_ct-ACE', '_ct-MMR', '_ct-QUIZ', '_ct-wea1', '_ct-FIR', '_ct-TIK'];
    const matrixHtml = matrixDirs.map(mod => {
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
    }).join('') + `
        <div class="repo-card border-blue">
            <h3 class="repo-title text-blue"><i data-lucide="globe"></i> Social Club TV</h3>
            <ul class="repo-links">
                <li><a href="https://ctsc-app.web.app/#/tv" target="_blank" class="mod-link"><i data-lucide="external-link"></i> TV Slides Integration</a></li>
            </ul>
        </div>`;

    // Group 2: Stand Alone Apps
    const standaloneHtml = `
        <div class="repo-card border-gold">
            <h3 class="repo-title text-gold"><i data-lucide="server"></i> CTOS Beta</h3>
            <ul class="repo-links">
                <li>
                    <a href="#" onclick="const url = (window.location.protocol === 'file:') ? 'http://localhost:3000' : (window.location.protocol + '//' + window.location.hostname + ':3000'); window.open(url);" class="mod-link text-gold-hover">
                        <i data-lucide="external-link"></i> CTOS Beta (Local)
                    </a>
                </li>
                <li><a href="https://mrmegatronix.github.io/_ctos-beta1/" target="_blank" class="mod-link"><i data-lucide="globe"></i> CTOS Beta (GitHub Pages)</a></li>
            </ul>
        </div>
        <div class="repo-card border-gold">
            <h3 class="repo-title text-gold"><i data-lucide="clock"></i> Timeclock</h3>
            <ul class="repo-links">
                <li><a href="../_ct-CLOCK/index.html" target="_blank" class="mod-link"><i data-lucide="file"></i> Simulator</a></li>
                <li><a href="../_ct-CLOCK/mobile.html" target="_blank" class="mod-link"><i data-lucide="smartphone"></i> Mobile App</a></li>
                <li><a href="https://mrmegatronix.github.io/_ct-CLOCK/" target="_blank" class="mod-link"><i data-lucide="globe"></i> GitHub Pages</a></li>
            </ul>
        </div>
        <div class="repo-card border-gold">
            <h3 class="repo-title text-gold"><i data-lucide="users"></i> Social Club Portal</h3>
            <ul class="repo-links">
                <li><a href="https://ctsc-app.web.app/" target="_blank" class="mod-link"><i data-lucide="external-link"></i> Live App Portal</a></li>
                <li><a href="../_ct-SOC/index.html" target="_blank" class="mod-link"><i data-lucide="file"></i> Local index.html</a></li>
            </ul>
        </div>
        <div class="repo-card border-gold">
            <h3 class="repo-title text-gold"><i data-lucide="zap"></i> NZAG EV Portal</h3>
            <ul class="repo-links">
                <li><a href="../_nzagev/index.html" target="_blank" class="mod-link"><i data-lucide="file"></i> Local index.html</a></li>
            </ul>
        </div>
    `;

    // Group 3: Not Used / Other
    const allDirs = fs.readdirSync(workspaceDir);
    const activeDirs = [...matrixDirs, '_ct-CLOCK', '_ctos-beta', '_ct-SOC', '_nzagev', '_NZAGEV', '_ct-LAND'];
    const otherHtml = allDirs.filter(d => {
        const fullPath = path.join(workspaceDir, d);
        return fs.statSync(fullPath).isDirectory() && 
               !activeDirs.includes(d) && 
               !ignoreDirs.includes(d);
    }).map(repo => {
        const repoDir = path.join(workspaceDir, repo);
        const htmlFiles = findHtmlFiles(repoDir, repo, repoDir);
        if (htmlFiles.length === 0) return '';

        const linksHtml = htmlFiles.map(f => {
            const ghUrl = `../${repo}/${f}`;
            return `<li><a href="${ghUrl}" target="_blank" class="mod-link"><i data-lucide="file"></i> ${f}</a></li>`;
        }).join('');

        return `
        <div class="repo-card border-cyan">
            <h3 class="repo-title text-cyan"><i data-lucide="folder-minus"></i> ${repo}</h3>
            <ul class="repo-links">
                ${linksHtml}
            </ul>
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
      height: 100vh; 
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    /* Header Styles */
    .header {
      padding: 1.5rem 2.5rem 0.5rem;
      max-width: 1800px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .header-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 30%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-subtitle {
      font-size: 0.8rem;
      color: var(--muted);
      margin-top: 0.2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    .pi-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 99px;
      font-size: 0.75rem;
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
      padding: 1rem 2.5rem 2rem; 
      gap: 2rem; 
      max-width: 1800px; 
      width: 100%;
      margin: 0 auto; 
      box-sizing: border-box;
      overflow: hidden;
      height: calc(100vh - 120px);
    }
    
    .column { 
      display: flex; 
      flex-direction: column; 
      background: var(--card-bg); 
      border: 1px solid var(--border); 
      border-radius: 24px; 
      padding: 1.5rem; 
      overflow: hidden; 
      backdrop-filter: blur(16px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
      height: 100%;
    }
    .column-header { 
      font-family: 'Outfit', sans-serif; 
      font-size: 1.3rem; 
      font-weight: 600; 
      margin-bottom: 1rem; 
      padding-bottom: 0.75rem; 
      border-bottom: 1px solid var(--border); 
      display: flex; 
      align-items: center; 
      gap: 0.75rem;
      flex-shrink: 0;
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
      margin-bottom: 1rem; 
      background: rgba(255,255,255,0.01);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1rem;
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
      font-size: 1.1rem; 
      color: #fff; 
      margin-bottom: 0.5rem; 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
    }
    .text-blue { color: var(--blue-hover); }
    .text-gold { color: var(--gold-hover); }
    .text-cyan { color: var(--cyan-hover); }

    .repo-links { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; }
    
    .mod-link { 
      color: #94a3b8; 
      text-decoration: none; 
      display: flex; 
      align-items: center; 
      gap: 0.6rem; 
      font-size: 0.85rem; 
      transition: all 0.2s; 
      padding: 6px 10px; 
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
    
    .mod-link i { width: 14px; height: 14px; opacity: 0.7; }
 
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
    <!-- COLUMN 1: Loaded in Matrix -->
    <div class="column">
      <div class="column-header" style="color: var(--blue);"><i data-lucide="layout"></i> Loaded in Matrix</div>
      <div class="column-content">
        ${matrixHtml}
      </div>
    </div>

    <!-- COLUMN 2: Stand Alone Apps -->
    <div class="column">
      <div class="column-header" style="color: var(--gold);"><i data-lucide="server"></i> Stand Alone Apps</div>
      <div class="column-content">
        ${standaloneHtml}
      </div>
    </div>

    <!-- COLUMN 3: Not Used / Other -->
    <div class="column">
      <div class="column-header" style="color: var(--cyan);"><i data-lucide="folder-minus"></i> Not Used / Other</div>
      <div class="column-content">
        ${otherHtml}
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();

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
