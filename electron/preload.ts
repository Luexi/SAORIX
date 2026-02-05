import { contextBridge, ipcRenderer } from 'electron'

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Información de la app
    getVersion: () => ipcRenderer.invoke('app:version'),

    // Control de ventana
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),

    // Plataforma
    platform: process.platform,
})

// Tipos para TypeScript
declare global {
    interface Window {
        electronAPI: {
            getVersion: () => Promise<string>
            quit: () => Promise<void>
            minimize: () => Promise<void>
            maximize: () => Promise<void>
            platform: NodeJS.Platform
        }
    }
}
