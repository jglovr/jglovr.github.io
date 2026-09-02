/* =========================================================================
   JGLOVR-OS PHYSICAL & VIRTUAL FLOPPY DISK SUBSYSTEM (DRIVE A:\)
   ========================================================================= */

// IndexedDB Local Hard Drive Storage Manager for C:\GAMES
const DB_NAME = 'JGLOVR_OS_Storage';
const DB_VERSION = 1;
const STORE_NAME = 'installed_games';

function openOSDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function saveGameToHardDrive(fileName, title, codeContent, iconSymbol = '💾', gameType = '16-Bit Logic') {
    try {
        const db = await openOSDatabase();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const record = {
                fileName: fileName.toUpperCase(),
                title: title,
                codeContent: codeContent,
                iconSymbol: iconSymbol,
                gameType: gameType,
                installDate: new Date().toISOString(),
                sizeBytes: codeContent.length
            };
            store.put(record);
            tx.oncomplete = () => resolve(record);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch(e) {
        console.error('Failed to save to local disk:', e);
    }
}

async function getInstalledGamesFromHardDrive() {
    try {
        const db = await openOSDatabase();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch(e) {
        return [];
    }
}

async function getInstalledGame(fileName) {
    try {
        const db = await openOSDatabase();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(fileName.toUpperCase());
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    } catch(e) {
        return null;
    }
}

// Drive A:\ Physical Mount & Parsing
let mountedFloppy = null;

async function mountPhysicalFloppyDrive() {
    try {
        if ('showOpenFilePicker' in window) {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Floppy Disk Executable or Disk Image (*.html, *.exe, *.img, *.txt)',
                    accept: {
                        'text/html': ['.html', '.htm'],
                        'application/octet-stream': ['.exe', '.img'],
                        'text/plain': ['.txt']
                    }
                }],
                multiple: false
            });
            
            const file = await fileHandle.getFile();
            const textContent = await file.text();
            
            const diskObj = {
                fileName: file.name.toUpperCase(),
                title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
                content: textContent,
                sizeBytes: file.size,
                lastModified: file.lastModified
            };
            
            setMountedFloppy(diskObj);
            return diskObj;
        } else {
            alert('Physical File Access API is not supported in this browser environment. Use drag-and-drop instead.');
        }
    } catch(err) {
        if (err.name !== 'AbortError') {
            console.error('Floppy mount error:', err);
        }
    }
    return null;
}

function setMountedFloppy(diskObj) {
    mountedFloppy = diskObj;
    if (typeof playFloppySeek === 'function') {
        playFloppySeek();
    }
    updateFloppyDriveUI();
}

function ejectFloppyDrive() {
    mountedFloppy = null;
    if (typeof playFloppySeek === 'function') {
        playFloppySeek();
    }
    updateFloppyDriveUI();
}

function updateFloppyDriveUI() {
    const driveBtn = document.getElementById('floppy-drive-btn');
    const statusText = document.getElementById('floppy-status-text');
    
    if (mountedFloppy) {
        if (driveBtn) driveBtn.classList.add('disk-inserted');
        if (statusText) statusText.textContent = `A:\\${mountedFloppy.fileName}`;
    } else {
        if (driveBtn) driveBtn.classList.remove('disk-inserted');
        if (statusText) statusText.textContent = `Drive A: [Empty]`;
    }
}
