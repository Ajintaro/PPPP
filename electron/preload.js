// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pp3', {
  version: () => ipcRenderer.invoke('app:getVersion')
});
