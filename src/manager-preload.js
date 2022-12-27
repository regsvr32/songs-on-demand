import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getFontFamilies() {
    return ipcRenderer.invoke('get-font-families')
  },
  updateConfig() {
    ipcRenderer.send('config-updated')
  },
  writeLog(level, msg) {
    ipcRenderer.send('write-log', level, msg)
  }
})