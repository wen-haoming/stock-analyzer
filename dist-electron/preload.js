import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    // Expose protected methods that allow the renderer process to use
    // the ipcRenderer without exposing the entire object
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});
