const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onFloppyInserted: (callback) => ipcRenderer.on('floppy-inserted', (event, data) => callback(data)),
    onFloppyEjected: (callback) => ipcRenderer.on('floppy-ejected', () => callback()),
    installGameToLocalDisk: (data) => ipcRenderer.invoke('install-game-to-local-disk', data),
    listLocalInstalledGames: () => ipcRenderer.invoke('list-local-installed-games')
});
