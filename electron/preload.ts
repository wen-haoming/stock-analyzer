import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
})
