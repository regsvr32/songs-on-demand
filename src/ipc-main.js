import { ipcMain, BrowserWindow } from 'electron'
import ping from 'ping'
import { decompress } from 'brotli'
import { join } from 'path'
import fontManager from 'node-system-fonts'
import { appendFileSync } from 'fs'

let configWindow = null
let fontFamilies = null

export function regisiterApi() {
  ipcMain.handle('select-fastest', (_, host_list) => {
    return Promise.any(host_list.map(async host => {
      const { alive } = await ping.promise.probe(host.host)
      if (!alive) { throw new Error('host not alive') }
      return host
    }))
  })

  ipcMain.handle('brotli-decompress', (_, array) => {
    return decompress(Buffer.from(array))
  })

  ipcMain.handle('get-font-families', () => {
    return new Promise(res => {
      if (fontFamilies != null) {
        res(fontFamilies)
        return
      }
      fontManager.getAvailableFonts(fonts => {
        fontFamilies = [...new Set(fonts.map(font => font.family))]
        res(fontFamilies)
      })
    })
  })

  ipcMain.on('open-config-window', () => {
    if (configWindow != null) { return }
    configWindow = new BrowserWindow({
      parent: BrowserWindow.fromId(process.env.MAIN_WINDOW_ID * 1),
      height: 705,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        preload: join(__dirname, './manager-preload.js')
      }
    })
    configWindow.loadURL((process.env.WEBPACK_DEV_SERVER_URL || 'app://./') + 'manager.html').then(() => {
      if (process.env.WEBPACK_DEV_SERVER_URL && !process.env.IS_TEST) {
        configWindow.webContents.openDevTools({ mode: 'detach' })
      }
    })
    configWindow.once('close', () => {
      if (configWindow.webContents.isDevToolsOpened()) { configWindow.webContents.closeDevTools() }
      configWindow = null
    })
  })

  ipcMain.on('config-updated', () => {
    BrowserWindow.fromId(process.env.MAIN_WINDOW_ID * 1).webContents.send('config-updated')
  })

  ipcMain.on('set-keep-window-top', (_, keepTop) => {
    BrowserWindow.fromId(process.env.MAIN_WINDOW_ID * 1).setAlwaysOnTop(keepTop)
  })

  ipcMain.on('write-log', (_, level, msg) => {
    appendFileSync('./log.txt', `[${level}][${new Date().toLocaleString()}] ${msg}\n`)
  })
}