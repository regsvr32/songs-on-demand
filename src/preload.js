import { ipcRenderer, contextBridge, shell, clipboard } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  selectFastest(host_list) {
    return ipcRenderer.invoke('select-fastest', host_list)
  },
  decompress(type, array) {
    return ipcRenderer.invoke(`${type}-decompress`, array)
  },
  openConfigWindow() {
    ipcRenderer.send('open-config-window')
  },
  watchConfig(callback) {
    const stripCallback = () => callback()
    ipcRenderer.on('config-updated', stripCallback)
    return () => {
      ipcRenderer.removeListener('config-updated', stripCallback)
    }
  },
  openExternal(url) {
    shell.openExternal(url)
  },
  watchFocusChanges(callback) {
    const stripCallback = (_, focused) => callback(focused)
    ipcRenderer.on('focus-changed', stripCallback)
  },
  copyText(text) {
    clipboard.writeText(text)
  }
})