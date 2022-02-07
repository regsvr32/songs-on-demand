import { ipcMain, BrowserWindow } from 'electron'
import ping from 'ping'
import { decompress } from 'brotli'
import { join } from 'path'
import fontManager from 'node-system-fonts'

let configWindow = null
let fontFamilies = null

export function regisiterApi() {
  ipcMain.handle('select-fastest', (_, host_list) => {
    return Promise.any(host_list.map(async host => {
      await ping.promise.probe(host.host)
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
      alwaysOnTop: true,
      parent: BrowserWindow.fromId(process.env.MAIN_WINDOW_ID * 1),
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        preload: join(__dirname, './manager-preload.js')
      }
    })
    configWindow.loadURL((process.env.WEBPACK_DEV_SERVER_URL || 'app://./') + 'manager.html')
    configWindow.once('closed', () => { configWindow = null })
  })

  ipcMain.on('config-updated', () => {
    BrowserWindow.fromId(process.env.MAIN_WINDOW_ID * 1).webContents.send('config-updated')
  })
}