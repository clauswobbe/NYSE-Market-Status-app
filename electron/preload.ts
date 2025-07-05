import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded');
});

