const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        fullscreen: true,
        frame: false,
        title: "JGLOVR-OS 3.11 Personal Workstation (Desktop Edition)",
        icon: path.join(__dirname, 'assets/icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Start physical floppy drive hardware watcher
    startFloppyDriveWatcher();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (floppyWatcherInterval) clearInterval(floppyWatcherInterval);
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handler for App Shutdown
ipcMain.handle('shutdown-app', () => {
    if (floppyWatcherInterval) clearInterval(floppyWatcherInterval);
    app.quit();
});

// NATIVE PHYSICAL FLOPPY DISK AUTO-DETECTOR ENGINE (NON-BLOCKING READABILITY ENGINE)
let lastDiskSignature = null;
let floppyWatcherInterval = null;

async function checkFloppyDiskStateAsync() {
    if (process.platform === 'win32') {
        const potentialDrives = ['A:\\', 'B:\\'];
        for (const drive of potentialDrives) {
            try {
                // Non-blocking readdir with 600ms timeout to verify media is physically inserted
                const files = await new Promise((resolve) => {
                    let done = false;
                    const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 600);
                    fs.readdir(drive, (err, list) => {
                        if (!done) {
                            done = true;
                            clearTimeout(timer);
                            resolve(err ? null : list);
                        }
                    });
                });

                if (files !== null) {
                    const gameFiles = files.filter(f => f.toUpperCase().endsWith('.HTA') || f.toUpperCase().endsWith('.HTML') || f.toUpperCase().endsWith('.EXE'));
                    const signature = drive + '_' + (gameFiles.length > 0 ? gameFiles.join(',') : 'EMPTY') + '_' + files.length;
                    return { drivePath: drive, files: files, gameFiles: gameFiles, signature: signature };
                }
            } catch(e) {}
        }
    } else if (process.platform === 'darwin') {
        const volumes = '/Volumes';
        try {
            if (fs.existsSync(volumes)) {
                const list = await fs.promises.readdir(volumes);
                const floppy = list.find(v => v.toUpperCase().includes('FLOPPY') || v.toUpperCase().includes('DISK'));
                if (floppy) {
                    const fullPath = path.join(volumes, floppy);
                    const files = await fs.promises.readdir(fullPath);
                    const gameFiles = files.filter(f => f.toUpperCase().endsWith('.HTA') || f.toUpperCase().endsWith('.HTML') || f.toUpperCase().endsWith('.EXE'));
                    return { drivePath: fullPath, files: files, gameFiles: gameFiles, signature: floppy + '_' + files.length };
                }
            }
        } catch(e) {}
    } else {
        try {
            if (fs.existsSync('/media/floppy')) {
                const files = await fs.promises.readdir('/media/floppy');
                const gameFiles = files.filter(f => f.toUpperCase().endsWith('.HTA') || f.toUpperCase().endsWith('.HTML') || f.toUpperCase().endsWith('.EXE'));
                return { drivePath: '/media/floppy', files: files, gameFiles: gameFiles, signature: 'linux_' + files.length };
            }
        } catch(e) {}
    }
    return null;
}

function startFloppyDriveWatcher() {
    floppyWatcherInterval = setInterval(async () => {
        const diskState = await checkFloppyDiskStateAsync();
        const currentSignature = diskState ? diskState.signature : null;

        if (currentSignature !== lastDiskSignature) {
            lastDiskSignature = currentSignature;

            if (diskState) {
                try {
                    if (diskState.gameFiles.length > 0) {
                        const firstFile = diskState.gameFiles[0];
                        const fullPath = path.join(diskState.drivePath, firstFile);
                        const content = await fs.promises.readFile(fullPath, 'utf8');

                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('floppy-inserted', {
                                fileName: firstFile.toUpperCase(),
                                title: firstFile.replace(/\.[^/.]+$/, "").toUpperCase(),
                                content: content,
                                drivePath: diskState.drivePath,
                                sizeBytes: content.length,
                                isEmpty: false
                            });
                        }
                    } else {
                        // Empty / Unrecognized Floppy Disk Detected!
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('floppy-inserted', {
                                fileName: 'EMPTY_DISK',
                                title: 'EMPTY DISK',
                                content: '',
                                drivePath: diskState.drivePath,
                                sizeBytes: 0,
                                isEmpty: true
                            });
                        }
                    }
                } catch(e) {
                    console.error('Error reading physical floppy disk:', e);
                }
            } else {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('floppy-ejected');
                }
            }
        }
    }, 1500);
}

// IPC Handlers for Disk Installation to User AppData Storage
const getStorageDir = () => {
    const dir = path.join(app.getPath('userData'), 'C_GAMES');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

ipcMain.handle('install-game-to-local-disk', async (event, { fileName, content }) => {
    try {
        const destDir = getStorageDir();
        const destPath = path.join(destDir, fileName.toUpperCase());
        fs.writeFileSync(destPath, content, 'utf8');
        return { success: true, path: destPath };
    } catch(e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('check-game-installed', async (event, { fileName, content }) => {
    try {
        const destDir = getStorageDir();
        const destPath = path.join(destDir, fileName.toUpperCase());
        if (!fs.existsSync(destPath)) return { installed: false };
        
        const existingContent = fs.readFileSync(destPath, 'utf8');
        if (existingContent === content) {
            return { installed: true, upToDate: true };
        } else {
            return { installed: true, upToDate: false };
        }
    } catch(e) {
        return { installed: false };
    }
});

ipcMain.handle('list-local-installed-games', async () => {
    try {
        const destDir = getStorageDir();
        const files = fs.readdirSync(destDir);
        const result = [];
        for (const file of files) {
            const fullPath = path.join(destDir, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            const stat = fs.statSync(fullPath);
            result.push({
                fileName: file.toUpperCase(),
                title: file.replace(/\.[^/.]+$/, "").toUpperCase(),
                content: content,
                sizeBytes: stat.size
            });
        }
        return result;
    } catch(e) {
        return [];
    }
});

// IPC Handler to Burn/Write a Game onto a Physical Floppy Disk (Drive A:\)
ipcMain.handle('write-game-to-floppy-disk', async (event, { gameFileName, content, drivePath }) => {
    try {
        const targetDrive = drivePath || 'A:\\';
        if (!fs.existsSync(targetDrive)) {
            return { success: false, error: `Drive ${targetDrive} is not accessible. Please insert a floppy disk.` };
        }

        // Write Game HTML file
        const htmlFileName = gameFileName.endsWith('.HTML') ? gameFileName : `${gameFileName.replace(/\.[^/.]+$/, "")}.HTML`;
        const targetHtmlPath = path.join(targetDrive, htmlFileName);
        fs.writeFileSync(targetHtmlPath, content, 'utf8');

        // Write RUN_GAME.BAT Kiosk Launcher
        const batContent = `@echo off\r\ntitle JGLOVR-OS Floppy Disk Launcher\r\ncolor 0A\r\necho Launching ${htmlFileName} from Drive A:...\r\nstart "" chrome.exe --app="file:///%~dp0${htmlFileName}" --kiosk --user-data-dir="%TEMP%\\jglovr_floppy_profile"\r\nif errorlevel 1 start "" msedge.exe --app="file:///%~dp0${htmlFileName}" --kiosk\r\nif errorlevel 1 start "" "%~dp0${htmlFileName}"\r\n`;
        fs.writeFileSync(path.join(targetDrive, 'RUN_GAME.BAT'), batContent, 'utf8');

        // Write AUTORUN.INF
        const autorunContent = `[autorun]\r\nopen=RUN_GAME.BAT\r\nicon=RUN_GAME.BAT,0\r\nlabel=JGLOVR_GAME\r\n`;
        fs.writeFileSync(path.join(targetDrive, 'AUTORUN.INF'), autorunContent, 'utf8');

        // Write README.TXT
        const readmeContent = `JGLOVR-OS PHYSICAL FLOPPY DISK\r\nGame: ${htmlFileName}\r\nDouble-click RUN_GAME.BAT on any Windows PC to play!\r\n`;
        fs.writeFileSync(path.join(targetDrive, 'README.TXT'), readmeContent, 'utf8');

        return { success: true, path: targetHtmlPath };
    } catch(e) {
        return { success: false, error: e.message };
    }
});
