export default {
  info(msg) {
    console.log(msg)
  },
  error(msg) {
    console.error(msg)
  },
  debug(msg) {
    if (process.env.NODE_ENV == 'development') { console.log(msg) }
  }
}