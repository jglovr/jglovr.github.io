const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onFloppyInserted: (callback) => ipcRenderer.on('floppy-inserted', (event, data) => callback(data)),
    onFloppyEjected: (callback) => ipcRenderer.on('floppy-ejected', () => callback()),
    installGameToLocalDisk: (data) => ipcRenderer.invoke('install-game-to-local-disk', data),
    checkGameInstalled: (data) => ipcRenderer.invoke('check-game-installed', data),
    listLocalInstalledGames: () => ipcRenderer.invoke('list-local-installed-games'),
    shutdownApp: () => ipcRenderer.invoke('shutdown-app'),
    writeGameToFloppyDisk: (data) => ipcRenderer.invoke('write-game-to-floppy-disk', data)
});
