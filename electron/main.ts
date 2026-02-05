import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

// Importar y iniciar el servidor Fastify
import './server/index'

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV !== 'production'

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, '../public/icon.ico'),
        title: 'SAORIX - ERP',
        show: false, // Mostrar cuando esté listo
    })

    // Cargar la aplicación
    if (isDev) {
        // En desarrollo, cargar desde Vite dev server
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        // En producción, cargar el build
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
        mainWindow?.focus()
    })

    // Manejar cierre de ventana
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    // Prevenir navegación externa
    mainWindow.webContents.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url)
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'http://localhost:3000') {
            event.preventDefault()
        }
    })
}

// Cuando Electron esté listo
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // En macOS, recrear ventana cuando se hace clic en el dock
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Cerrar cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// IPC handlers para comunicación con el renderer
ipcMain.handle('app:version', () => {
    return app.getVersion()
})

ipcMain.handle('app:quit', () => {
    app.quit()
})

ipcMain.handle('app:minimize', () => {
    mainWindow?.minimize()
})

ipcMain.handle('app:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize()
    } else {
        mainWindow?.maximize()
    }
})

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
