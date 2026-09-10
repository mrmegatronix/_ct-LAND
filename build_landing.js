const fs = require('fs');
const path = require('path');
require('dotenv').config();

const workspaceDir = path.resolve(__dirname, '..');
const outputFile = path.join(__dirname, 'index.html');

// PIN configurations
const EXPECTED_PIN = process.env.PIN || '791355';
const EXPECTED_HASH = simpleHash(EXPECTED_PIN);
const DEMO_PIN = process.env.DEMO_PIN || '0001';

const ignoreDirs = ['dist', 'public', 'node_modules', '.git', '.vscode', '.github', '_UNUSED', 'extra-slides', 'images', 'scratch', '_old', 'z_OLD', '_menus', '_backgrounds', '.venv', 'venv'];

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
                const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
                fileList.push(relPath);
            }
        } catch (e) {
            // Ignore broken symlinks
        }
    }
    return fileList.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
}

function getPreviewImage(repoPath, repoName) {
    const images = [
        '_preview/cover.jpg', '_preview/cover.png', '_preview/preview.png',
        'preview.png', 'preview.jpg', 'cover.png', 'cover.jpg', 'screenshot.png', 'screenshot.jpg'
    ];
    for (const img of images) {
        if (fs.existsSync(path.join(repoPath, img))) {
            return `../${repoName}/${img}`;
        }
    }
    return null;
}

function generateLinksHtml(repoName, htmlFiles) {
    return htmlFiles.map(f => {
        let label = f;
        let fileIcon = 'file';
        if (f === 'index.html' && repoName === '_ctos-beta') { label = 'CTOS Beta App'; fileIcon = 'smartphone'; }
        else if (f === 'postermaker.html') { label = 'A4 Poster Maker'; fileIcon = 'printer'; }
        else if (f === 'files.html') { label = 'File Browser'; fileIcon = 'folder-tree'; }
        else if (f === 'masteradmin.html') { label = 'Master TV Admin'; fileIcon = 'crown'; }
        else if (f === 'index.html') { label = 'Live Display/Index'; fileIcon = 'tv'; }
        
        const ghUrl = `../${repoName}/${f}`;
        const absoluteUrl = `https://mrmegatronix.github.io/${repoName}/${f}`;
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(absoluteUrl)}`;
        return `<li style="display:flex; align-items:center; gap: 8px;">
            <a href="${ghUrl}" target="_blank" class="mod-link" style="flex:1;"><i data-lucide="${fileIcon}"></i> ${label}</a>
            <a href="${ghUrl}" target="_blank" title="Scan or Click to open in new window" style="display:block; flex-shrink:0; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
               <img src="${qrApi}" style="width: 44px; height: 44px; border-radius: 8px; background: white; padding: 2px;" alt="QR Code" />
            </a>
        </li>`;
    }).join('');
}

function generateRepoCard(repo, borderColor, titleColor, icon, subRepos = []) {
    const repoDir = path.join(workspaceDir, repo);
    const htmlFiles = findHtmlFiles(repoDir, repo, repoDir);
    
    const previewImg = getPreviewImage(repoDir, repo);
    const previewHtml = previewImg ? `<img src="${previewImg}" class="repo-preview-img" alt="${repo} preview" onerror="this.style.display='none'"/>` : '';
    
    let linksHtml = '';
    if (htmlFiles.length > 0) {
        linksHtml += generateLinksHtml(repo, htmlFiles);
    }
    
    for (const sub of subRepos) {
        const subDir = path.join(workspaceDir, sub);
        const subFiles = findHtmlFiles(subDir, sub, subDir);
        if (subFiles.length > 0) {
            linksHtml += `<li style="margin-top: 16px; margin-bottom: 4px; font-size: 0.8rem; font-weight: 700; color: var(--${titleColor}); text-transform: uppercase; letter-spacing: 1px; padding-left: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">${sub}</li>`;
            linksHtml += generateLinksHtml(sub, subFiles);
        }
    }
    
    if (!linksHtml) return '';

    return `
    <div class="repo-card border-${borderColor}" data-repo="${repo}">
        <details>
            <summary class="repo-title text-${titleColor}">
                <div style="display:flex; align-items:center; gap:0.5rem; width:100%;">
                    <input type="checkbox" class="repo-select-checkbox" value="${repo}" style="display:none; transform: scale(1.5); margin-right: 10px;" />
                    <i data-lucide="${icon}"></i> ${repo}
                </div>
            </summary>
            ${previewHtml}
            <ul class="repo-links">
                ${linksHtml}
            </ul>
        </details>
    </div>`;
}

function buildHtml() {
    console.log('Building ct-LAND index.html...');
    
    const allDirs = fs.readdirSync(workspaceDir);
    
    // Filter to ONLY CT repos (must contain ct or be _ctos-beta)
    const ctRepos = allDirs.filter(d => {
        const fullPath = path.join(workspaceDir, d);
        if (!fs.statSync(fullPath).isDirectory() || ignoreDirs.includes(d) || d === '_ct-LAND' || d === 'ndm-LAND') return false;
        
        const lower = d.toLowerCase();
        if (lower.includes('ct') || lower === '_ctos-beta') {
            return true;
        }
        return false;
    }).sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));

    // Grouping
    const matrixModules = ['_ct-MMR', '_ct-ACE', '_ct-TRIP', '_ct-TIK', '_ct-wea1'];
    const ctosModules = ['_ct-CLOCK', '_ctos-beta'];
    
    let matrixHtml = '';
    if (ctRepos.includes('_ct-MATRIX')) {
        const validSubRepos = matrixModules.filter(r => ctRepos.includes(r));
        matrixHtml = generateRepoCard('_ct-MATRIX', 'blue', 'blue', 'layout', validSubRepos);
    }
    
    const ctosHtml = ctRepos.filter(r => ctosModules.includes(r)).map(repo => generateRepoCard(repo, 'gold', 'gold', 'server')).join('');
    
    const excludeFromOther = [...matrixModules, '_ct-MATRIX', ...ctosModules];
    const otherHtml = ctRepos.filter(r => !excludeFromOther.includes(r)).map(repo => generateRepoCard(repo, 'cyan', 'cyan', 'folder-minus')).join('');

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
      --bg: #0b0f19; --card-bg: rgba(255, 255, 255, 0.02); --card-hover: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.06); --border-hover: rgba(255, 255, 255, 0.12);
      --text: #f1f5f9; --muted: #64748b;
      
      --blue: #3b82f6; --blue-glow: rgba(59, 130, 246, 0.15); --blue-hover: #60a5fa;
      --gold: #d4af37; --gold-glow: rgba(212, 175, 55, 0.15); --gold-hover: #f59e0b;
      --cyan: #06b6d4; --cyan-glow: rgba(6, 182, 212, 0.15); --cyan-hover: #22d3ee;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: radial-gradient(circle at top right, #111827, #030712); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; }
    
    .header { padding: 1.5rem 2.5rem 0.5rem; max-width: 1800px; width: 100%; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .header-title { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #fff 30%, var(--gold) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .header-subtitle { font-size: 0.8rem; color: var(--muted); margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
    
    .container { display: grid; grid-template-columns: repeat(3, 1fr); flex: 1; padding: 1rem 2.5rem 2rem; gap: 2rem; max-width: 1800px; width: 100%; margin: 0 auto; box-sizing: border-box; min-height: calc(100vh - 120px); }
    @media (max-width: 1200px) { .container { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .container { grid-template-columns: 1fr; padding: 1rem; } .header { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1.5rem 1rem 0.5rem; } .hero-section { min-height: 50vh; } }
    
    .column { display: flex; flex-direction: column; background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; padding: 1.5rem; overflow: hidden; backdrop-filter: blur(16px); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4); height: 100%; }
    .column-header { font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .column-content { flex: 1; overflow-y: auto; padding-right: 0.5rem; }
    
    .hero-section { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); width: 100%; padding: 2rem; }
    .crowd-dj-btn { display: flex; align-items: center; gap: 1rem; padding: 1.5rem 3.5rem; background: linear-gradient(135deg, var(--gold) 0%, #a1801c 100%); color: #000; font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 700; border-radius: 99px; text-decoration: none; box-shadow: 0 10px 30px var(--gold-glow); transition: all 0.3s; }
    .crowd-dj-btn:hover { transform: scale(1.05); box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4); color: #000; }
    @media (max-width: 768px) { .crowd-dj-btn { font-size: 1.2rem; padding: 1rem 2rem; } }
    
    ::-webkit-scrollbar { width: 24px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 20px; border: 6px solid var(--card-bg); } ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
    
    .repo-card { margin-bottom: 1rem; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: 16px; padding: 1rem; transition: all 0.3s; }
    .repo-card:hover { transform: translateY(-2px); background: var(--card-hover); border-color: var(--border-hover); }
    .repo-card.border-blue { border-left: 4px solid var(--blue); } .repo-card.border-blue:hover { box-shadow: 0 0 20px var(--blue-glow); }
    .repo-card.border-gold { border-left: 4px solid var(--gold); } .repo-card.border-gold:hover { box-shadow: 0 0 20px var(--gold-glow); }
    .repo-card.border-cyan { border-left: 4px solid var(--cyan); } .repo-card.border-cyan:hover { box-shadow: 0 0 20px var(--cyan-glow); }

    .repo-title { font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #fff; padding: 12px 6px; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; list-style: none; }
    .repo-title::-webkit-details-marker { display: none; }
    .text-blue { color: var(--blue-hover); } .text-gold { color: var(--gold-hover); } .text-cyan { color: var(--cyan-hover); }

    .repo-links { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem; }
    .mod-link { color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 0.8rem; font-size: 1rem; transition: all 0.2s; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); margin-bottom: 4px; }
    .mod-link:hover { color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); transform: translateX(4px); }
    .mod-link i { width: 14px; height: 14px; opacity: 0.7; }
    
    .repo-preview-img { width: 100%; border-radius: 12px; margin: 10px 0; object-fit: cover; max-height: 200px; border: 1px solid var(--border); }
    
    .manage-btn { padding: 0.5rem 1rem; border-radius: 99px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid var(--border); cursor: pointer; font-family: 'Outfit'; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
    .manage-btn:hover { background: rgba(255,255,255,0.1); }
    .manage-actions { display: flex; gap: 10px; align-items: center; }

    #pin-overlay { position: fixed; inset: 0; background: rgba(7, 10, 19, 0.96); backdrop-filter: blur(20px); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .pin-modal { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 28px; padding: 3rem; width: 380px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .pin-display { display: flex; gap: 1.25rem; justify-content: center; margin: 2.5rem 0; }
    .pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border); transition: all 0.2s; }
    .pin-dot.filled { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 10px var(--gold); }
    .pin-dot.error { background: #ef4444; border-color: #ef4444; box-shadow: 0 0 10px #ef4444; }
    .pin-numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .pin-btn { aspect-ratio: 1.1; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.02); color: #fff; font-size: 1.6rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .pin-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
    .pin-btn:active { transform: scale(0.95); }
    .pin-btn[data-val="clear"], .pin-btn[data-val="del"] { font-size: 1.1rem; color: var(--muted); }
    
    .pi-status { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.9rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: var(--gold); }
    .pi-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
  </style>
</head>
<body>

  <!-- PIN Overlay -->
  <div id="pin-overlay">
    <div class="pin-modal">
      <h2 style="font-family: Outfit; margin-bottom: 0.5rem; font-size: 1.8rem; font-weight: 700; color: #fff;">Access Hub</h2>
      <p style="color: var(--muted); font-size: 0.95rem; font-weight: 500;">Enter PIN to Unlock</p>
      <div class="pin-display">
        <div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div><div class="pin-dot"></div>
      </div>
      <div class="pin-numpad">
        <button class="pin-btn" data-val="1">1</button><button class="pin-btn" data-val="2">2</button><button class="pin-btn" data-val="3">3</button>
        <button class="pin-btn" data-val="4">4</button><button class="pin-btn" data-val="5">5</button><button class="pin-btn" data-val="6">6</button>
        <button class="pin-btn" data-val="7">7</button><button class="pin-btn" data-val="8">8</button><button class="pin-btn" data-val="9">9</button>
        <button class="pin-btn" data-val="clear"><i data-lucide="x"></i></button><button class="pin-btn" data-val="0">0</button><button class="pin-btn" data-val="del"><i data-lucide="delete"></i></button>
      </div>
    </div>
  </div>

  <header class="header">
    <div>
      <h1 class="header-title">CT Ecosystem Hub</h1>
      <div class="header-subtitle">Venue Operation Controls</div>
    </div>
    <div class="manage-actions">
        <button id="manage-links-btn" class="manage-btn"><i data-lucide="edit-2" style="width:14px;height:14px;margin-right:4px;vertical-align:text-bottom;"></i> Manage Links</button>
        <button id="download-archive-btn" class="manage-btn" style="display:none; border-color: #ef4444; color: #ef4444;"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px;vertical-align:text-bottom;"></i> Save Changes</button>
        <div class="pi-status" id="pi-status" style="display: none;">
          <span class="pi-dot"></span>
          <span>Auto-Unlocked</span>
        </div>
    </div>
  </header>

  <div id="main-content" style="opacity: 0; pointer-events: none; transition: opacity 0.5s;">
    
    <div class="hero-section">
        <a href="https://app.nightlifr.com/?lid=07b0c6e5-6e0f-5d91-9abb-d1b492047cd0&t=1786661576564&s=q" target="_blank" class="crowd-dj-btn">
            <i data-lucide="music" style="width: 36px; height: 36px;"></i>
            CrowdDJ Spotify Controls
        </a>
    </div>

    <div class="container">
      <div class="column">
        <div class="column-header" style="color: var(--blue);"><i data-lucide="layout"></i> CT-Matrix & Modules</div>
        <div class="column-content">
          ${matrixHtml}
        </div>
      </div>

      <div class="column">
        <div class="column-header" style="color: var(--gold);"><i data-lucide="server"></i> CTOS-Beta & Ops</div>
        <div class="column-content">
          ${ctosHtml}
        </div>
      </div>

      <div class="column">
        <div class="column-header" style="color: var(--cyan);"><i data-lucide="folder-minus"></i> CT-SOC & Other Apps</div>
        <div class="column-content">
          ${otherHtml}
        </div>
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    const EXPECTED_HASH = '${EXPECTED_HASH}';
    let currentPin = '';
    const dots = document.querySelectorAll('.pin-dot');
    const overlay = document.getElementById('pin-overlay');
    const main = document.getElementById('main-content');
    const piStatus = document.getElementById('pi-status');

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.97';
    const isFileProtocol = window.location.protocol === 'file:';

    if (sessionStorage.getItem('ct-land-auth') === 'true' || isLocalhost || isFileProtocol) {
        if (isLocalhost || isFileProtocol) piStatus.style.display = 'flex';
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
        else if (currentPin.length < 6) currentPin += val;
        
        updateDisplay();
        if (currentPin.length === 6) {
            if (simpleHash(currentPin) === EXPECTED_HASH) {
                sessionStorage.setItem('ct-land-auth', 'true');
                unlock();
            } else {
                dots.forEach(d => d.classList.add('error'));
                setTimeout(() => { currentPin = ''; updateDisplay(); }, 500);
            }
        }
    }

    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleInput(e.currentTarget.getAttribute('data-val')));
    });

    document.addEventListener('keydown', (e) => {
        if (overlay.style.display === 'none') return;
        if (e.key >= '0' && e.key <= '9') handleInput(e.key);
        else if (e.key === 'Backspace') handleInput('del');
        else if (e.key === 'Escape') handleInput('clear');
    });

    const manageBtn = document.getElementById('manage-links-btn');
    const downloadBtn = document.getElementById('download-archive-btn');
    const checkboxes = document.querySelectorAll('.repo-select-checkbox');
    let isManageMode = false;

    manageBtn.addEventListener('click', () => {
        isManageMode = !isManageMode;
        checkboxes.forEach(cb => cb.style.display = isManageMode ? 'inline-block' : 'none');
        downloadBtn.style.display = isManageMode ? 'inline-flex' : 'none';
        manageBtn.innerHTML = isManageMode ? 
            '<i data-lucide="x" style="width:14px;height:14px;margin-right:4px;vertical-align:text-bottom;"></i> Cancel' : 
            '<i data-lucide="edit-2" style="width:14px;height:14px;margin-right:4px;vertical-align:text-bottom;"></i> Manage Links';
        lucide.createIcons();
    });

    downloadBtn.addEventListener('click', () => {
        const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
        if (selected.length === 0) { alert('No links selected to remove!'); return; }
        
        const data = { archiveRepos: selected };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archive_changes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        manageBtn.click();
        checkboxes.forEach(cb => cb.checked = false);
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputFile, template);
    console.log('Successfully generated ct-LAND index.html');
}

buildHtml();
