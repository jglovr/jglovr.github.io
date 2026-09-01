const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
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
    if (process.platform !== 'darwin') app.quit();
});

// NATIVE PHYSICAL FLOPPY DRIVE AUTO-DETECTOR ENGINE
let lastFloppyState = false;
let floppyWatcherInterval = null;

function getFloppyDrivePath() {
    if (process.platform === 'win32') {
        // Windows Floppy Disk Drive A:\
        if (fs.existsSync('A:\\')) return 'A:\\';
        if (fs.existsSync('B:\\')) return 'B:\\';
    } else if (process.platform === 'darwin') {
        // macOS Mounted USB Floppy Volume
        const volumes = '/Volumes';
        if (fs.existsSync(volumes)) {
            try {
                const list = fs.readdirSync(volumes);
                const floppy = list.find(v => v.toUpperCase().includes('FLOPPY') || v.toUpperCase().includes('DISK'));
                if (floppy) return path.join(volumes, floppy);
            } catch(e) {}
        }
    } else {
        // Linux /media or /mnt
        if (fs.existsSync('/media/floppy')) return '/media/floppy';
        if (fs.existsSync('/mnt/floppy')) return '/mnt/floppy';
    }
    return null;
}

function startFloppyDriveWatcher() {
    floppyWatcherInterval = setInterval(() => {
        const drivePath = getFloppyDrivePath();
        const diskPresent = !!drivePath;

        if (diskPresent !== lastFloppyState) {
            lastFloppyState = diskPresent;

            if (diskPresent) {
                try {
                    const files = fs.readdirSync(drivePath);
                    const gameFiles = files.filter(f => f.toUpperCase().endsWith('.EXE') || f.toUpperCase().endsWith('.HTML'));
                    
                    if (gameFiles.length > 0) {
                        const firstFile = gameFiles[0];
                        const fullPath = path.join(drivePath, firstFile);
                        const content = fs.readFileSync(fullPath, 'utf8');

                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.webContents.send('floppy-inserted', {
                                fileName: firstFile.toUpperCase(),
                                title: firstFile.replace(/\.[^/.]+$/, "").toUpperCase(),
                                content: content,
                                drivePath: drivePath,
                                sizeBytes: content.length
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
