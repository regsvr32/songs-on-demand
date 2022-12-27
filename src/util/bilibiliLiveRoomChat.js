import { Buffer } from 'buffer/'
import blobToBuffer from 'blob-to-buffer'
import { httpGet } from './httpRequest'
import logger from './logger'

async function getRoomInfo(id) {
  return await httpGet('https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo', { id })
}

function blobToBufferAsync(blob) {
  return new Promise((res, rej) => {
    blobToBuffer(blob, (err, buffer) => {
      if (err) { rej(err); return }
      res(buffer)
    })
  })
}

export async function connectRoomChat(roomId) {
  const { code, message, data } = await getRoomInfo(roomId)
  if (code !== 0) { throw message }
  const { token, host_list } = data
  const { host, wss_port } = await window.electron.selectFastest(host_list)
  logger.info(`connecting ${host}:${wss_port}...`)
  return await createRoomChatSession(`wss://${host}:${wss_port}/sub`, roomId, token)
}

function createRoomChatSession(url, roomId, token) {
  const socket = new WebSocket(url)
  let sequence = 1
  function sendDataPacket(operateCode, payload) {
    const protocolCode = 1
    let buffer = new Buffer(16)
    let offset = 4
    offset = buffer.writeUInt16BE(16, offset)
    offset = buffer.writeUInt16BE(protocolCode, offset)
    offset = buffer.writeUInt32BE(operateCode, offset)
    buffer.writeUInt32BE(sequence, offset)
    if (typeof payload !== 'string') { payload = JSON.stringify(payload) }
    buffer = Buffer.concat([buffer, new Buffer(payload)])
    buffer.writeUInt32BE(buffer.length, 0)
    socket.send(buffer)
  }

  return new Promise((res, rej) => {
    socket.onopen = () => {
      sendDataPacket(7, {
        uid: 0, roomid: parseInt(roomId), protover: 3, platform: "web", type: 2, key: token
      })
      const heartbeat = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          clearInterval(heartbeat)
          return
        }
        sendDataPacket(2, '[object Object]')
      }, 30000)
      res(socket)
    }
    socket.onerror = (err) => { rej(err) }
    socket.onmessage = async ev => {
      const buffer = await blobToBufferAsync(ev.data)
      if (buffer.readUInt32BE(8) !== 5) { return }
      switch (buffer.readUInt16BE(6)) {
        case 0: {
          socket.dispatchEvent(new MessageEvent('normal-message', {
            data: JSON.parse(buffer.slice(16).toString())
          }))
          break
        }
        case 2:
          throw 'Not Implemented'
        case 3: {
          const payloads = new Buffer(await window.electron.decompress('brotli', buffer.buffer.slice(16)))
          let read = 0
          while (read < payloads.length) {
            let length = payloads.readUInt32BE(read)
            if (payloads.readUInt32BE(read + 8) == 5) {
              socket.dispatchEvent(new MessageEvent('normal-message', {
                data: JSON.parse(payloads.slice(read + 16, read + length).toString())
              }))
            }
            read += length
          }
          break
        }
      }
    }
  })
}