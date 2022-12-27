export default {
  info(msg) {
    window.electron.writeLog('INFO', msg)
    console.log(msg)
  },
  error(msg) {
    window.electron.writeLog('ERROR', msg)
    console.error(msg)
  },
  debug(msg) {
    if (process.env.NODE_ENV == 'development') {
      window.electron.writeLog('DEBUG', msg)
      console.log(msg)
    }
  }
}