const fs = require('fs');
const path = require('path');
const vm = require('vm');

const LORE_DB = {
    'CODYFROG': {
        title: 'Cody Frog (Classic Logic Edition)',
        fileName: 'CODYFROG.EXE',
        publisher: 'PONDLOGIC',
        year: '1994',
        type: 'Coding & Logic Puzzle Game',
        headquarters: 'Cambridge, Massachusetts, USA',
        description: 'Developed by Pondlogic in 1994, Cody Frog was hailed as a breakthrough computer science logic puzzle game designed to teach algorithm execution, stack manipulation, and grid traversal through intuitive frog movements.'
    },
    'CODY26': {
        title: "Cody Frog '26 (Original 3D Engine)",
        fileName: 'CODY26.EXE',
        publisher: 'PONDLOGIC',
        year: '1994',
        type: '3D Coding & Spatial Logic Engine',
        headquarters: 'Cambridge, Massachusetts, USA',
        description: "Pondlogic's flagship spatial computing division released this high-performance 3D rendering suite to model complex algorithmic pathfinding, recursive branching, and 3D grid spatial orientation."
    },
    'SYS_VOID': {
        title: 'S Y S T E M _ V O I D',
        fileName: 'SYS_VOID.EXE',
        publisher: 'VOID WORKS',
        year: '1993',
        type: 'Vector Space Arcade Shooter',
        headquarters: 'Tokyo, Japan',
        description: 'Released in 1993 by Tokyo-based experimental software house VOID WORKS, System Void combined ultra-fast wireframe vector graphics with intense orbital arcade combat and synth soundtrack synthesis.'
    },
    'GNOMES': {
        title: 'Gnomes in the Tall Grass',
        fileName: 'GNOMES.EXE',
        publisher: 'ECOSPHERE SOFTWARE',
        brandingName: 'ECOSPHERE',
        year: '1998',
        type: '3D Nature & Meadow Simulation',
        headquarters: 'Boulder, Colorado, USA',
        description: 'Published in 1998 by Ecosphere Software (known simply as Ecosphere in branding), this serene 3D meadow simulator allowed users to explore tall grass ecosystems, discover hidden gnomes, and observe procedural wildlife dynamics.'
    },
    'TRAIN': {
        title: 'Train Game (3D Rail Sim)',
        fileName: 'TRAIN.EXE',
        publisher: 'RAILROAD SIMULATIONS INC.',
        year: '1991',
        type: 'Real-Time Rail Transit Simulator',
        headquarters: 'Chicago, Illinois, USA',
        description: 'First published in 1991 by Chicago-based Railroad Simulations Inc., Train Game set the gold standard for desktop model railroading, complete with wooden covered bridges, diesel engine physics, and custom track switching.'
    },
    'GRIDMIX': {
        title: 'Music Grid Synthesizer',
        fileName: 'GRIDMIX.EXE',
        publisher: 'SYNTHWAVE DYNAMICS LTD.',
        year: '1995',
        type: '16-Step Audio Sequencer & Workstation',
        headquarters: 'Berlin, Germany',
        description: 'Released in 1995 by Berlin audio pioneer Synthwave Dynamics Ltd., GridMix brought professional 16-step matrix sequencing, scale quantizers, and polyphonic Web Audio synth voice sculpting to personal computers.'
    },
    'APEXCAD': {
        title: 'ApexCAD 3D Workstation',
        fileName: 'APEXCAD.EXE',
        publisher: 'APEX GRAPHICS CORP.',
        year: '1992',
        type: '3D CSG CAD Solid Modeling Engine',
        headquarters: 'San Jose, California, USA',
        description: 'Published in 1992 by Silicon Valley graphics pioneer Apex Graphics Corp., ApexCAD delivered industrial-grade Constructive Solid Geometry (CSG), real-time boolean subtractive mesh rendering, and interactive 3D ViewCube navigation.'
    }
};

// 1. Update physical floppy disk README.TXT files in disks/
Object.keys(LORE_DB).forEach(key => {
    const info = LORE_DB[key];
    const diskFolder = path.join(__dirname, 'disks', key);
    if (fs.existsSync(diskFolder)) {
        const readmePath = path.join(diskFolder, 'README.TXT');
        const readmeContent = `====================================================
${info.title.toUpperCase()}
====================================================
SOFTWARE TITLE   : ${info.title}
FILE NAME        : ${info.fileName}
PUBLISHER        : ${info.publisher} ${info.brandingName ? `(${info.brandingName})` : ''}
RELEASE YEAR     : ${info.year}
SOFTWARE TYPE    : ${info.type}
HEADQUARTERS     : ${info.headquarters}
INSTALL TARGET   : C:\\GAMES\\${info.fileName}
----------------------------------------------------
LORE & DESCRIPTION:
${info.description}

HOW TO EXECUTE:
- Double-click RUN_GAME.BAT on Drive A:\\ to play instantly!
- Or insert floppy into JGLOVR-OS Workstation drive A:\\ to install into local storage C:\\GAMES.
====================================================
(C) ${info.year} ${info.publisher}. All Rights Reserved.
`;
        fs.writeFileSync(readmePath, readmeContent, 'utf8');
        console.log('Updated disk README:', readmePath);
    }
});

// 2. HTML Properties Modal & JS Registry
const propertiesModalHTML = `
    <!-- RETRO PROGRAM PROPERTIES / SYSTEM INFO MODAL OVERLAY -->
    <div id="properties-modal" class="hidden">
        <div class="properties-card bevel-out" style="width: 520px;">
            <div class="window-titlebar" style="margin:-16px -16px 12px -16px;">
                <div class="window-title-text">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#2980B9" stroke="#000000" stroke-width="1.5"/><circle cx="12" cy="8" r="1.5" fill="#FFFFFF"/><rect x="11" y="11" width="2" height="6" fill="#FFFFFF"/></svg>
                    <span id="prop-window-title">Program Properties & System Lore</span>
                </div>
                <div class="window-controls">
                    <button class="win-btn bevel-out" onclick="closePropertiesModal()">X</button>
                </div>
            </div>

            <div class="prop-tabs" style="display:flex; gap:4px; margin-bottom:12px;">
                <div class="prop-tab active" id="tab-prop-general" onclick="switchPropTab('general')">General</div>
                <div class="prop-tab" id="tab-prop-lore" onclick="switchPropTab('lore')">Publisher & Lore</div>
                <div class="prop-tab" id="tab-prop-sys" onclick="switchPropTab('sys')">System Reqs</div>
            </div>

            <div id="prop-content-general" class="prop-panel">
                <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #888;">
                    <div id="prop-icon-box" style="width:48px; height:48px; background:#fff; border:2px inset #888; display:flex; align-items:center; justify-content:center;"></div>
                    <div>
                        <h3 id="prop-game-title" style="margin:0; font-size:20px; color:#000080;">Program Name</h3>
                        <span id="prop-file-name" style="font-family:monospace; font-size:14px; background:#e0e0e0; padding:1px 6px;">FILE.EXE</span>
                    </div>
                </div>
                <table class="prop-table" style="width:100%; font-size:15px; border-collapse:collapse;">
                    <tr><td style="width:140px; font-weight:bold;">Publisher:</td><td id="prop-publisher">Publisher Name</td></tr>
                    <tr><td style="font-weight:bold;">Year Published:</td><td id="prop-year">1995</td></tr>
                    <tr><td style="font-weight:bold;">Software Type:</td><td id="prop-type">Software Type</td></tr>
                    <tr><td style="font-weight:bold;">Headquarters:</td><td id="prop-hq">City, Country</td></tr>
                    <tr><td style="font-weight:bold;">Target Location:</td><td id="prop-location">C:\\GAMES\\PROGRAM.EXE</td></tr>
                    <tr><td style="font-weight:bold;">File Size:</td><td id="prop-size">1.2 MB (1,248,512 bytes)</td></tr>
                </table>
            </div>

            <div id="prop-content-lore" class="prop-panel hidden">
                <div style="background:#fff; border:2px inset #888; padding:12px; font-size:15px; line-height:1.4; height:180px; overflow-y:auto;" id="prop-description-text">
                    Lore description goes here.
                </div>
            </div>

            <div id="prop-content-sys" class="prop-panel hidden">
                <table class="prop-table" style="width:100%; font-size:15px; border-collapse:collapse;">
                    <tr><td style="width:140px; font-weight:bold;">Required CPU:</td><td>Intel i486DX2 66 MHz or higher</td></tr>
                    <tr><td style="font-weight:bold;">Base Memory:</td><td>640 KB Conventional + 4 MB Extended (XMS)</td></tr>
                    <tr><td style="font-weight:bold;">Graphics Mode:</td><td>VESA VGA 640x480 (256 Colors / Hardware 3D)</td></tr>
                    <tr><td style="font-weight:bold;">Sound Hardware:</td><td>Sound Blaster 16 / Web Audio DSP</td></tr>
                    <tr><td style="font-weight:bold;">Storage Media:</td><td>3.5" High-Density Floppy Disk / Hard Drive C:</td></tr>
                </table>
            </div>

            <div class="card-actions" style="margin-top:16px; justify-content:flex-end;">
                <button class="btn-action primary bevel-out" style="width:120px;" onclick="closePropertiesModal()">OK</button>
            </div>
        </div>
    </div>
`;

const propertiesCSS = `
        /* PROGRAM PROPERTIES MODAL */
        #properties-modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #properties-modal.hidden { display: none; }
        .properties-card {
            background: var(--win-bg);
            padding: 16px;
        }
        .prop-tab {
            padding: 4px 12px;
            font-size: 15px;
            cursor: pointer;
            border: 2px solid var(--win-border-light);
            border-bottom: none;
            background: #d0d0d0;
        }
        .prop-tab.active {
            background: var(--win-bg);
            font-weight: bold;
            border-top: 2px solid var(--win-border-light);
            border-left: 2px solid var(--win-border-light);
            border-right: 2px solid var(--win-border-shadow);
        }
        .prop-panel {
            background: var(--win-bg);
            border: 2px solid;
            border-color: var(--win-border-light) var(--win-border-shadow) var(--win-border-shadow) var(--win-border-light);
            padding: 14px;
            min-height: 200px;
        }
        .prop-panel.hidden { display: none; }
        .prop-table td { padding: 4px 6px; }
`;

const propertiesJS = `
        // PROGRAM LORE & SYSTEM PROPERTIES DATABASE
        const PROGRAM_LORE_DATABASE = ${JSON.stringify(LORE_DB, null, 8)};

        function openProgramProperties(keyOrFilename) {
            playSound('click');
            hideDesktopContextMenu();

            let key = (keyOrFilename || 'CODYFROG').toUpperCase().replace('.EXE', '').replace('.HTML', '').replace('WINDOW-', '').replace('WIN-CUSTOM-', '').replace('ICON-', '');
            if (key.includes('TRAIN')) key = 'TRAIN';
            else if (key.includes('26')) key = 'CODY26';
            else if (key.includes('CODY')) key = 'CODYFROG';
            else if (key.includes('GNOME')) key = 'GNOMES';
            else if (key.includes('VOID') || key.includes('SYS')) key = 'SYS_VOID';
            else if (key.includes('GRID')) key = 'GRIDMIX';
            else if (key.includes('CAD') || key.includes('APEX')) key = 'APEXCAD';

            const info = PROGRAM_LORE_DATABASE[key] || {
                title: key,
                fileName: key + '.EXE',
                publisher: 'CUSTOM USER SOFTWARE',
                year: '2026',
                type: 'Installed Executable Program',
                headquarters: 'Local Workstation (Drive C:)',
                description: 'Custom installed retro program stored on local hard drive storage C:\\\\GAMES.'
            };

            const modal = document.getElementById('properties-modal');
            if (!modal) return;

            document.getElementById('prop-window-title').textContent = \`Properties: \${info.fileName}\`;
            document.getElementById('prop-game-title').textContent = info.title;
            document.getElementById('prop-file-name').textContent = info.fileName;
            document.getElementById('prop-publisher').textContent = info.publisher + (info.brandingName ? \` (\${info.brandingName})\` : '');
            document.getElementById('prop-year').textContent = info.year;
            document.getElementById('prop-type').textContent = info.type;
            document.getElementById('prop-hq').textContent = info.headquarters;
            document.getElementById('prop-location').textContent = \`C:\\\\GAMES\\\\\${info.fileName}\`;
            document.getElementById('prop-size').textContent = \`1.4 MB (1,452,032 bytes)\`;
            document.getElementById('prop-description-text').innerHTML = \`<b>\${info.title}</b><br><br><b>Publisher:</b> \${info.publisher} (\${info.year})<br><b>Headquarters:</b> \${info.headquarters}<br><br>\${info.description}\`;
            document.getElementById('prop-icon-box').innerHTML = getSvgIcon(key);

            switchPropTab('general');
            modal.classList.remove('hidden');
        }

        function closePropertiesModal() {
            playSound('click');
            const modal = document.getElementById('properties-modal');
            if (modal) modal.classList.add('hidden');
        }

        function switchPropTab(tabName) {
            playSound('click');
            ['general', 'lore', 'sys'].forEach(t => {
                const tabEl = document.getElementById('tab-prop-' + t);
                const contentEl = document.getElementById('prop-content-' + t);
                if (tabEl) tabEl.classList.toggle('active', t === tabName);
                if (contentEl) contentEl.classList.toggle('hidden', t !== tabName);
            });
        }
`;

['index.html', 'desktop-app/index.html'].forEach(filePath => {
    let html = fs.readFileSync(filePath, 'utf8');

    // 1. Inject CSS
    if (!html.includes('#properties-modal')) {
        html = html.replace('</style>', propertiesCSS + '\n</style>');
    }

    // 2. Inject HTML overlay
    if (!html.includes('id="properties-modal"')) {
        html = html.replace('</body>', propertiesModalHTML + '\n</body>');
    }

    // 3. Inject JS
    if (!html.includes('function openProgramProperties(')) {
        html = html.replace('</script>', propertiesJS + '\n    </script>');
    }

    // 4. Connect context menu "info" action to openProgramProperties
    html = html.replace(
        "else if (action === 'info') {\n                openAboutDialog();\n            }",
        "else if (action === 'info') {\n                const key = target ? target.id : 'CODYFROG';\n                openProgramProperties(key);\n            }"
    );

    fs.writeFileSync(filePath, html, 'utf8');

    // Validate JS syntax
    const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
    let allValid = true;
    scripts.forEach((s, idx) => {
        const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
        try {
            new vm.Script(code, { filename: filePath + '_script_' + idx });
            console.log(filePath, 'Script block', idx, 'SYNTAX VALIDATED CLEAN!');
        } catch(err) {
            allValid = false;
            console.error(filePath, 'Script block', idx, 'SYNTAX ERROR:', err.message);
        }
    });
});

console.log('>>> SUCCESS: Lore database, floppy disk READMEs, and Properties popup dialog fully applied!\n');
