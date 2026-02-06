import { app, BrowserWindow, ipcMain } from 'electron'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

let mainWindow: BrowserWindow | null = null
let apiServer: { close: () => Promise<void> } | null = null

const isDev = !app.isPackaged

function toSQLiteUrl(filePath: string) {
    return `file:${filePath.replace(/\\/g, '/')}`
}

function ensurePackagedDatabaseTemplate(targetDbPath: string) {
    if (fs.existsSync(targetDbPath)) {
        return
    }

    const parentDir = path.dirname(targetDbPath)
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true })
    }

    const templateDbPath = path.join(process.resourcesPath, 'db', 'saori-template.db')
    if (!fs.existsSync(templateDbPath)) {
        throw new Error(`No se encontro la DB plantilla en recursos: ${templateDbPath}`)
    }

    fs.copyFileSync(templateDbPath, targetDbPath)
}

function ensureRuntimeConfig() {
    const userDataPath = app.getPath('userData')
    const secretsDir = path.join(userDataPath, 'secrets')
    const jwtSecretPath = path.join(secretsDir, 'jwt.secret')

    if (!process.env.DATABASE_URL) {
        const dbPath = isDev
            ? path.join(process.cwd(), 'prisma', 'saori.db')
            : path.join(userDataPath, 'saori.db')

        if (!isDev) {
            ensurePackagedDatabaseTemplate(dbPath)
        }

        process.env.DATABASE_URL = toSQLiteUrl(dbPath)
    }

    if (!process.env.PORT) {
        process.env.PORT = '3001'
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        if (!fs.existsSync(secretsDir)) {
            fs.mkdirSync(secretsDir, { recursive: true })
        }

        if (fs.existsSync(jwtSecretPath)) {
            const persistedSecret = fs.readFileSync(jwtSecretPath, 'utf-8').trim()
            if (persistedSecret.length >= 32) {
                process.env.JWT_SECRET = persistedSecret
                return
            }
        }

        const generatedSecret = crypto.randomBytes(48).toString('hex')
        fs.writeFileSync(jwtSecretPath, generatedSecret, { encoding: 'utf-8' })
        process.env.JWT_SECRET = generatedSecret
    }
}

async function startApiServer() {
    const serverModule = await import('./server/index')
    apiServer = serverModule.fastify
}

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
        title: 'SAORIX - ERP',
        show: false,
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
        mainWindow?.focus()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!isDev) {
            if (!url.startsWith('file://')) {
                event.preventDefault()
            }
            return
        }

        const parsedUrl = new URL(url)
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'http://localhost:3000') {
            event.preventDefault()
        }
    })
}

app.whenReady().then(async () => {
    ensureRuntimeConfig()
    await startApiServer()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    if (apiServer) {
        apiServer.close().catch((error) => {
            console.error('Error al cerrar API embebida:', error)
        })
    }
})

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

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
