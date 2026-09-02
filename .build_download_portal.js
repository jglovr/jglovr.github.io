const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Create download.html (90s Netscape/IE Retro Download Portal)
const downloadHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JGLOVR-OS 3.11 Offline Desktop Edition Download Portal (C) 1995-2026</title>
    <style>
        :root {
            --win-bg: #c0c0c0;
            --win-border-light: #ffffff;
            --win-border-dark: #808080;
            --win-border-shadow: #404040;
            --header-bg: #000080;
            --header-text: #ffffff;
        }

        body {
            background-color: #008080; /* Classic Win95 Teal */
            font-family: "MS Sans Serif", Tahoma, Geneva, sans-serif;
            color: #000;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .browser-window {
            width: 860px;
            background-color: var(--win-bg);
            border: 2px solid;
            border-color: var(--win-border-light) var(--win-border-shadow) var(--win-border-shadow) var(--win-border-light);
            box-shadow: 6px 6px 20px rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
        }

        .window-titlebar {
            height: 28px;
            background: linear-gradient(90deg, #000080, #1084d0);
            color: #fff;
            padding: 2px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: bold;
            font-size: 16px;
        }

        .netscape-menubar {
            background: #d4d0c8;
            border-bottom: 2px solid #808080;
            padding: 4px 8px;
            font-size: 14px;
            display: flex;
            gap: 16px;
        }

        .netscape-toolbar {
            background: #d4d0c8;
            border-bottom: 2px solid #808080;
            padding: 6px 12px;
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .tool-btn {
            padding: 4px 10px;
            font-size: 14px;
            font-weight: bold;
            border: 2px solid;
            border-color: #fff #808080 #808080 #fff;
            background: #c0c0c0;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .tool-btn:active {
            border-color: #808080 #fff #fff #808080;
        }

        .url-bar-container {
            background: #d4d0c8;
            padding: 6px 12px;
            border-bottom: 2px solid #808080;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: bold;
        }

        .url-input {
            flex: 1;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 14px;
            background: #fff;
            color: #000;
            border: 2px inset #808080;
        }

        .page-content {
            background: #ffffff;
            padding: 24px;
            border: 2px inset #808080;
            margin: 12px;
            overflow-y: auto;
        }

        h1 {
            color: #000080;
            font-size: 26px;
            margin-top: 0;
            border-bottom: 2px solid #000080;
            padding-bottom: 6px;
        }

        .netscape-banner {
            background: linear-gradient(90deg, #000080, #008080);
            color: #ffffff;
            padding: 12px;
            border: 2px outset #ffffff;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .badge-bar {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .badge {
            background: #000000;
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 4px 8px;
            border: 1px solid #808080;
            box-shadow: 2px 2px 0 #000;
        }

        .matrix-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 15px;
        }

        .matrix-table th {
            background: #000080;
            color: #ffffff;
            padding: 8px;
            text-align: left;
            border: 1px solid #000;
        }

        .matrix-table td {
            padding: 8px;
            border: 1px solid #ccc;
        }

        .matrix-table tr:nth-child(even) {
            background: #f4f4f4;
        }

        .download-card-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
        }

        .download-card {
            background: #f8f9fa;
            border: 2px outset #ffffff;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        }

        .download-card h3 {
            margin-top: 0;
            color: #000080;
        }

        .dl-btn {
            background: #008000;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
            padding: 10px;
            border: 2px outset #ffffff;
            display: block;
            margin-top: 12px;
            cursor: pointer;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .dl-btn:hover {
            background: #00a000;
        }

        .status-footer {
            background: #d4d0c8;
            border-top: 2px solid #808080;
            padding: 4px 12px;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            font-family: monospace;
        }
    </style>
</head>
<body>

    <div class="browser-window">
        <!-- Titlebar -->
        <div class="window-titlebar">
            <span>🌐 Netscape Navigator 4.0 - [JGLOVR-OS 3.11 Offline Desktop Distribution Portal]</span>
            <span>X</span>
        </div>

        <!-- Menubar -->
        <div class="netscape-menubar">
            <span><u>F</u>ile</span>
            <span><u>E</u>dit</span>
            <span><u>V</u>iew</span>
            <span><u>G</u>o</span>
            <span><u>B</u>ookmarks</span>
            <span><u>O</u>ptions</span>
            <span><u>D</u>irectory</span>
            <span><u>H</u>elp</span>
        </div>

        <!-- Toolbar -->
        <div class="netscape-toolbar">
            <button class="tool-btn" onclick="history.back()">⬅ Back</button>
            <button class="tool-btn" onclick="location.reload()">🔄 Reload</button>
            <button class="tool-btn" onclick="location.href='index.html'">🏠 Home</button>
            <button class="tool-btn" onclick="window.print()">🖨 Print</button>
            <button class="tool-btn" onclick="alert('Searching 1995 Web Directories...')">🔍 Search</button>
        </div>

        <!-- URL Address Bar -->
        <div class="url-bar-container">
            <span>Netsite:</span>
            <input type="text" class="url-input" value="http://www.jglovr-os.org/downloads/desktop-3.11.html" readonly>
        </div>

        <!-- Page Body Content -->
        <div class="page-content">

            <div class="netscape-banner">
                <div>
                    <h2 style="margin:0; font-size:22px;">JGLOVR-OS 3.11 NATIVE DESKTOP EDITION</h2>
                    <p style="margin:4px 0 0 0; font-size:14px;">Official Standalone Windows Distribution & Physical Floppy Disk Suite</p>
                </div>
                <div style="font-family:monospace; font-size:14px; background:#000; color:#00ff00; padding:6px 12px; border:1px solid #fff;">
                    VISITOR # 004,821
                </div>
            </div>

            <div class="badge-bar">
                <div class="badge">🚧 UNDER CONSTRUCTION</div>
                <div class="badge">🖥 BEST VIEWED IN 800x600 256-COLORS</div>
                <div class="badge">💾 3.5" PHYSICAL FLOPPY DISK READY</div>
                <div class="badge">⚡ POWERED BY MS-DOS 6.22</div>
            </div>

            <h1>📥 Download Desktop Software Packages</h1>
            <p style="font-size:16px; line-height:1.4;">
                Experience JGLOVR-OS 3.11 natively on your Windows PC! The offline Desktop Edition unlocks <b>direct physical USB Floppy Disk hardware mounting</b>, real 3.5" High-Density disk burning, zero-latency Sound Blaster 16 audio synthesis, and complete offline playability without requiring an internet connection.
            </p>

            <!-- Download Cards -->
            <div class="download-card-grid">
                
                <div class="download-card">
                    <div>
                        <h3>📦 Portable EXE Edition v3.11</h3>
                        <p style="font-size:14px; color:#555;">No installation required! Download and double-click to play instantly on any Windows 10/11 PC.</p>
                        <ul style="font-size:14px; padding-left:20px;">
                            <li>File Size: <b>77.8 MB</b></li>
                            <li>Format: Standalone <code>.exe</code></li>
                            <li>Physical USB Floppy Support: <b>YES</b></li>
                            <li>Offline Operation: <b>100%</b></li>
                        </ul>
                    </div>
                    <a href="desktop-app/dist/JGLOVR OS Desktop 3.11.0.exe" download class="dl-btn">📥 DOWNLOAD PORTABLE EXE</a>
                </div>

                <div class="download-card">
                    <div>
                        <h3>⚙️ Setup Installer Edition v3.11</h3>
                        <p style="font-size:14px; color:#555;">Full Windows NSIS Setup Installer with Start Menu shortcuts and desktop launcher integration.</p>
                        <ul style="font-size:14px; padding-left:20px;">
                            <li>File Size: <b>78.0 MB</b></li>
                            <li>Format: NSIS Setup <code>.exe</code></li>
                            <li>Start Menu Shortcuts: <b>YES</b></li>
                            <li>Offline Operation: <b>100%</b></li>
                        </ul>
                    </div>
                    <a href="desktop-app/dist/JGLOVR OS Desktop Setup 3.11.0.exe" download class="dl-btn" style="background:#000080;">⚙️ DOWNLOAD SETUP INSTALLER</a>
                </div>

            </div>

            <!-- Feature Comparison Matrix -->
            <h2>📊 Web Version vs. Native Windows Desktop Edition</h2>
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th>Feature / Capability</th>
                        <th>🌐 Web OS Version</th>
                        <th>💻 Native Windows Desktop OS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Physical USB Floppy Drive Access</b></td>
                        <td>Virtual Drag & Drop Mock</td>
                        <td><b>100% Real Physical Hardware Support</b></td>
                    </tr>
                    <tr>
                        <td><b>Floppy Disk Writer / Burner</b></td>
                        <td>Simulated</td>
                        <td><b>Real 3.5" Disk Track Sector Writer</b></td>
                    </tr>
                    <tr>
                        <td><b>Offline Operation</b></td>
                        <td>Requires Internet</td>
                        <td><b>100% Offline Standalone Execution</b></td>
                    </tr>
                    <tr>
                        <td><b>Sound Blaster 16 DSP Synth</b></td>
                        <td>Web Audio API Synth</td>
                        <td><b>Low Latency Native Audio Engine</b></td>
                    </tr>
                    <tr>
                        <td><b>Screen Display</b></td>
                        <td>Browser Window</td>
                        <td><b>Borderless Retro Kiosk Mode</b></td>
                    </tr>
                </tbody>
            </table>

            <div style="background:#fff3cd; border:2px solid #ffeba2; padding:14px; font-size:15px; margin-top:20px;">
                <b>💾 Collectors & Retro Enthusiasts Note:</b><br>
                All software packages built on Drive C:\\ can be written directly onto 3.5" High-Density (1.44 MB) physical floppy disks using any standard USB Floppy Disk Drive plugged into your Windows workstation!
            </div>

        </div>

        <!-- Status Footer -->
        <div class="status-footer">
            <span>Document: Done</span>
            <span>Internet Host: connected</span>
            <span>(C) 1995-2026 JGLOVR Systems</span>
        </div>
    </div>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'download.html'), downloadHtmlContent, 'utf8');
console.log('Created download.html clean 90s download portal!');

// 2. Clippy Assistant Widget & Desktop Shortcut Injection into index.html
let webHtml = fs.readFileSync('index.html', 'utf8');

const clippyHTML = `
    <!-- RETRO 90s CLIPPY ASSISTANT WIDGET -->
    <div id="clippy-assistant" class="clippy-container">
        <div class="clippy-bubble bevel-out">
            <button class="clippy-close-btn" onclick="dismissClippy()">X</button>
            <div class="clippy-title">📎 JGLOVR Assistant</div>
            <div class="clippy-text">
                Hi! It looks like you're running <b>JGLOVR-OS</b> in a web browser.
                <br><br>
                Would you like to download the <b>Native Windows Desktop Edition</b> with <b>Physical USB Floppy Drive</b> support?
            </div>
            <div class="clippy-actions">
                <button class="btn-action primary bevel-out" onclick="openDownloadPortal()">📥 Get Desktop OS</button>
                <button class="btn-action bevel-out" onclick="dismissClippy()">Snooze</button>
            </div>
        </div>
        <div class="clippy-mascot-box" onclick="toggleClippySpeech()">
            <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
                <!-- Retro Wire Paperclip Mascot -->
                <path d="M 20 60 L 20 20 A 15 15 0 0 1 50 20 L 50 45 A 10 10 0 0 1 30 45 L 30 25 A 5 5 0 0 1 40 25 L 40 38" stroke="#4a6984" stroke-width="5" stroke-linecap="round" fill="none"/>
                <path d="M 20 60 L 20 20 A 15 15 0 0 1 50 20 L 50 45 A 10 10 0 0 1 30 45 L 30 25 A 5 5 0 0 1 40 25 L 40 38" stroke="#d0e0f0" stroke-width="2" stroke-linecap="round" fill="none"/>
                <!-- Googly Eyes -->
                <circle cx="28" cy="18" r="7" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
                <circle cx="42" cy="18" r="7" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
                <circle cx="29" cy="19" r="3" fill="#000000"/>
                <circle cx="43" cy="19" r="3" fill="#000000"/>
                <!-- Eyebrows -->
                <path d="M 23 9 Q 28 6 33 9" stroke="#000000" stroke-width="2" fill="none"/>
                <path d="M 37 9 Q 42 6 47 9" stroke="#000000" stroke-width="2" fill="none"/>
            </svg>
        </div>
    </div>
`;

const clippyCSS = `
        /* RETRO 90s CLIPPY ASSISTANT STYLES */
        .clippy-container {
            position: fixed;
            bottom: 45px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: auto;
        }

        .clippy-bubble {
            width: 260px;
            background: #ffffcc;
            border: 2px solid #000000;
            padding: 10px 12px;
            box-shadow: 4px 4px 10px rgba(0,0,0,0.5);
            margin-bottom: 8px;
            position: relative;
            font-size: 14px;
            line-height: 1.3;
        }
        .clippy-bubble.hidden { display: none; }

        .clippy-close-btn {
            position: absolute;
            top: 4px;
            right: 6px;
            font-size: 11px;
            font-weight: bold;
            width: 18px;
            height: 18px;
            cursor: pointer;
            background: #c0c0c0;
            border: 1px solid #000;
            line-height: 1;
        }

        .clippy-title {
            font-weight: bold;
            color: #000080;
            margin-bottom: 6px;
            font-size: 15px;
        }

        .clippy-actions {
            display: flex;
            gap: 6px;
            margin-top: 10px;
        }
        .clippy-actions button {
            font-size: 13px;
            padding: 4px 8px;
        }

        .clippy-mascot-box {
            cursor: pointer;
            filter: drop-shadow(3px 3px 4px rgba(0,0,0,0.4));
            transition: transform 0.2s;
        }
        .clippy-mascot-box:hover {
            transform: scale(1.1) rotate(-5deg);
        }
`;

const clippyJS = `
        // CLIPPY ASSISTANT CONTROLLER
        function dismissClippy() {
            playSound('click');
            const bubble = document.querySelector('.clippy-bubble');
            if (bubble) bubble.classList.add('hidden');
        }

        function toggleClippySpeech() {
            playSound('click');
            const bubble = document.querySelector('.clippy-bubble');
            if (bubble) bubble.classList.toggle('hidden');
        }

        function openDownloadPortal() {
            playSound('click');
            openGameWindow('download.html', 'Get Desktop OS 3.11', 'window-download', 'FOLDER');
            window.open('download.html', '_blank');
        }

        setTimeout(() => {
            const bubble = document.querySelector('.clippy-bubble');
            if (bubble) bubble.classList.remove('hidden');
        }, 2500);
`;

if (!webHtml.includes('.clippy-container')) {
    webHtml = webHtml.replace('</style>', clippyCSS + '\n</style>');
}

if (!webHtml.includes('id="clippy-assistant"')) {
    webHtml = webHtml.replace('</body>', clippyHTML + '\n</body>');
}

if (!webHtml.includes('Get Desktop OS')) {
    const desktopShortcutHTML = `
                <div class="desktop-shortcut" id="icon-download">
                    <div class="shortcut-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2V14M12 14L7 9M12 14L17 9" stroke="#000080" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="18" width="18" height="4" rx="1" fill="#000080"/></svg>
                    </div>
                    <div class="shortcut-label">Get Desktop OS</div>
                </div>`;
    webHtml = webHtml.replace('<div class="desktop-shortcut" id="icon-terminal"', desktopShortcutHTML + '\n                <div class="desktop-shortcut" id="icon-terminal"');

    const startMenuItemHTML = `
                <div class="start-item" onclick="openDownloadPortal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2V14M12 14L7 9M12 14L17 9" stroke="#000080" stroke-width="2" stroke-linecap="round"/><rect x="3" y="18" width="18" height="3" fill="#000080"/></svg>
                    <span>Get Desktop OS (Offline App)...</span>
                </div>`;
    webHtml = webHtml.replace('<div class="start-item" onclick="toggleWindow(\'terminal-window\')">', startMenuItemHTML + '\n                <div class="start-item" onclick="toggleWindow(\'terminal-window\')">');
}

if (!webHtml.includes('function openDownloadPortal()')) {
    webHtml = webHtml.replace('</script>', clippyJS + '\n    </script>');
}

webHtml = webHtml.replace(
    "else if (id === 'icon-terminal') toggleWindow('terminal-window');",
    "else if (id === 'icon-terminal') toggleWindow('terminal-window');\n            else if (id === 'icon-download') openDownloadPortal();"
);

fs.writeFileSync('index.html', webHtml, 'utf8');

// Validate JS syntax
const scriptBlocks = webHtml.split('<script>');
let allValid = true;
scriptBlocks.forEach((block, idx) => {
    if (idx === 0) return;
    const code = block.split('</script>')[0];
    try {
        new vm.Script(code, { filename: 'index.html_script_' + idx });
        console.log('index.html Script block', idx, 'SYNTAX VALIDATED CLEAN!');
    } catch(err) {
        allValid = false;
        console.error('index.html Script block', idx, 'SYNTAX ERROR:', err.message);
    }
});

if (allValid) {
    console.log('>>> SUCCESS: 90s Download Portal download.html & Clippy Assistant 100% APPLIED AND VALIDATED!\n');
}
