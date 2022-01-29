import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  updateConfig() {
    ipcRenderer.send('config-updated')
  }
})