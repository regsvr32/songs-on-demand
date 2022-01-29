<template>
  <div class="song-list-page">
    <div class="songs-full-banner">
      <template v-if="!isAccepting">
        <div class="stroke">当前歌单已满，暂停点歌啦！</div>
        <div class="gradient">当前歌单已满，暂停点歌啦！</div>
      </template>
    </div>
    <div class="song-list" v-bind="songListStyles">
      <transition-group name="song-line">
        <div class="song-line" v-for="({ uid, time, uname, song, privilege }, idx) in songList" :key="`${uid}-${time}`" :class="{ privilege }">
          <span class="song-number" v-if="config.songNumberEnabled">{{idx + 1}}.</span>
          <span class="demand-content-wrapper">
            <span class="demand-content" :ref="setDemandContentRef">
              <span class="song-name">{{song}}</span>
              <span class="user-name">&nbsp;{{uname}}</span>
            </span>
          </span>
          <div class="song-actions">
            <icon icon="copy" style="color: #c15cc1" @click="copyText(song, $event.target)" />
            <icon icon="up" style="color: #409eff" @click="pinToTop(idx)" />
            <icon icon="check" style="color: #67c23a" @click="removeSong(idx)" />
            <icon icon="times" style="color: #f56c6c" @click="removeSong(idx)" />
          </div>
        </div>
      </transition-group>
    </div>
    <div class="button-wrapper">
      <icon icon="cogs" @click="openConfigWindow" />
      <span style="flex-grow: 1" />
      <button v-if="isAccepting" class="pause" @click="isAccepting = false">暂停点歌</button>
      <button v-else-if="canAccept" class="start" @click="isAccepting = true">开启点歌</button>
      <span style="flex-grow: 1" />
      <icon icon="move" />
      <icon icon="back" @click="back" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.song-list-page
  .songs-full-banner
    position: relative
    box-sizing: border-box
    text-align: center
    height: 64px
    padding-top: 8px
    white-space: nowrap
    div
      font-size: 36px
      font-style: italic
      font-weight: bold
      text-shadow: none
    .stroke
      width: 100%
      position: absolute
      -webkit-text-stroke: 5px #ffffff
      z-index: -100
    .gradient
      background-image: linear-gradient(#55826c, #b8d6c5)
      background-clip: text
      -webkit-text-fill-color: transparent
  .song-list
    box-sizing: border-box
    width: calc(100vw - 12px)
    height: calc(100% - 144px)
    overflow-y: scroll
    font-weight: bold
    .song-line
      position: relative
      box-sizing: border-box
      padding: 0px 0px 3px 8px
      white-space: nowrap
      overflow: hidden
      width: 100%
      height: 36px
      display: flex
      border-radius: 4px
      margin-bottom: 2px
      &.privilege
        background-color: #3146a580
      .demand-content-wrapper
        display: inline-block
        overflow: hidden
        flex-grow: 1
        .demand-content
          display: inline-block
          --scroll-duration: 2.5s
          --scroll-delay: 0s
          --scroll-times: infinite
      .song-actions
        display: none
        position: absolute
        top: 2px
        right: 8px
        .icon
          cursor: pointer
          width: 32px
          height: 32px
          margin-left: 4px
          &.copy
            position: relative
            @keyframes copy-hint-fade
              0%, 60%
                opacity: 1
            :deep(.copy-hint)
              position: absolute
              top: 0px
              left: -6px
              font-size: 14px
              font-style: normal
              color: #ffffff
              opacity: 0
              animation: copy-hint-fade 0.4s ease
      &:hover .song-actions
        display: block
    .song-line-enter-active, .song-line-leave-active
      transition: height 0.2s ease
    .song-line-enter-from, .song-line-leave-to
      height: 0px
    .song-number, .demand-content-wrapper
      pointer-events: none
    &.song-number-no-shadow .song-number
      text-shadow: none
    .song-number
      display: inline-block
      box-sizing: border-box
      width: 1.8em
      padding-left: 4px
      font-size: 30px
      color: var(--song-number-color)
      flex-shrink: 0
    &.song-name-no-shadow .song-name
      text-shadow: none
    .song-name
      font-size: 30px
      color: var(--song-name-color)
    &.user-name-no-shadow .user-name
      text-shadow: none
    .user-name
      display: inline-block
      font-size: 24px
      vertical-align: 3px
      color: var(--user-name-color)
  .button-wrapper
    display: flex
    padding: 20px
    .pause
      background-color: #c03939
    .icon
      cursor: pointer
      width: 40px
      height: 40px
      color: #ffffff
      opacity: 0.6
      filter: drop-shadow(0px 0px 3px #00000080)
      &.move
        margin-right: 12px
        -webkit-app-region: drag
body:not(.focused) .button-wrapper
  visibility: hidden
</style>

<script setup>
import { ref, shallowRef, computed, watchEffect, inject, onUnmounted, nextTick } from 'vue'
import logger from '../util/logger'
import { defaultConfig } from '../util/appConfig'
import Icon from '../asset/Icon.vue'

const globalStore = inject('globalStore')
const pages = inject('pages')
const message = inject('message')

function loadStoragedJson(key, defaultValue) {
  const storaged = localStorage.getItem(key)
  return storaged && JSON.parse(storaged) || defaultValue
}

const roomId = parseInt(localStorage.getItem('roomId'))
const config = shallowRef(loadStoragedJson('config', defaultConfig))

const cancelWatchConfig = window.electron.watchConfig(() => config.value = JSON.parse(localStorage.getItem('config')))
onUnmounted(cancelWatchConfig)

const songListStyles = computed(() => {
  const { songNumberColor, songNumberShadow, songNameColor, songNameShadow, userNameColor, userNameShadow } = config.value
  return {
    class: {
      'song-number-no-shadow': !songNumberShadow,
      'song-name-no-shadow': !songNameShadow,
      'user-name-no-shadow': !userNameShadow
    },
    style: {
      '--song-number-color': songNumberColor,
      '--song-name-color': songNameColor,
      '--user-name-color': userNameColor
    }
  }
})

const songList = ref(loadStoragedJson(`songList_${roomId}`, []))
function saveSongList() {
  localStorage.setItem(`songList_${roomId}`, JSON.stringify(songList.value))
}

const isAccepting = ref(false)

function setDemandContentRef(el) {
  if (!el) { return }
  nextTick(() => {
    const overflow = Math.min(0, el.parentElement.clientWidth - el.clientWidth - 8)
    el.style = `--scroll-width: ${overflow}px`
    el.classList.add('text-scroll-alternate')
  })
}

const canAccept = computed(() => {
  return !config.value.listLimitEnabled || songList.value.filter(({ privilege }) => !privilege).length < config.value.listLimitCount
})

watchEffect(() => {
  if (isAccepting.value && !canAccept.value) { isAccepting.value = false }
})

const bullyingSongs = computed(() => {
  return config.value.bullyingSongsRaw.split('\n').map(str => str.trim().toLowerCase()).filter(str => str != '')
})

/** @type {WebSocket} */
let session = globalStore.roomChatSession

let closeByButton = false
function back() {
  closeByButton = true
  if (session && session.readyState === WebSocket.OPEN) { session.close() }
  pages.back()
}

session.addEventListener('close', ({ code, reason }) => {
  if (closeByButton) { return }
  pages.back()
  message.error(`${code}: ${reason}`)
})

const userStatus = ref(loadStoragedJson(`userStatus_${roomId}`, {}))

function saveUserStatus(uid, key, value) {
  if (!userStatus.value[uid]) { userStatus.value[uid] = {} }
  userStatus.value[uid][key] = value
  localStorage.setItem(`userStatus_${roomId}`, JSON.stringify(userStatus.value))
}

function getUserStatus(uid, key) {
  return userStatus.value[uid] && userStatus.value[uid][key]
}

function getWeek() {
  const now = new Date()
  let weekday = now.getDay() - 2
  if (weekday < 0) { weekday += 7 }
  now.setHours(0, 0, 0, 0)
  return now.setDate(now.getDate() - weekday)
}

const demandedSongs = loadStoragedJson(`demanded_${roomId}`, { songs: [] })

session.addEventListener('normal-message', ({ data }) => {
  logger.debug(data)
  switch (data.cmd) {
    //弹幕消息
    case 'DANMU_MSG': {
      const [ , msg, [uid, uname], medal] = data.info
      const match = /^([仙妖魔膜][法术術])?[点點]歌\s*(.+)$/.exec(msg)
      if (!match) { return }
      const { userCdEnabled, guardPowerEnabled, guardPowerTimesInfinity, guardPowerPerWeek } = config.value
      const song = match[2].trim()
      const songLowerCase = song.toLowerCase()
      const today = new Date().setHours(0, 0, 0, 0)

      const isBullyingSong = bullyingSongs.value.includes(songLowerCase)
      if (isBullyingSong) {
        const lastBuyGuard = getUserStatus(uid, 'buyGuard')
        const isBuyGuardToday = lastBuyGuard && new Date(lastBuyGuard).setHours(0, 0, 0, 0) == today
        if (!isBuyGuardToday) {
          message.error('只有上舰当天可以点迫害歌')
          return
        }
      }
      
      if (!isBullyingSong && medal[3] != roomId) {
        message.error('未佩戴主播勋章，点歌无效')
        return
      }

      if (demandedSongs.date == today && demandedSongs.songs.includes(songLowerCase)) {
        message.error(`今天已经点过${song}啦`)
        return
      }

      const usePower = !isBullyingSong && match[1]
      if (usePower) {
        if (!medal[10]) {
          message.error('只有舰长可以魔法点歌')
          return
        }
        if (!guardPowerEnabled) {
          message.error('主播已关闭了魔法点歌')
          return
        }
        const week = getWeek()
        const powerUsage = getUserStatus(uid, 'powerUsage') || { times: 0 }
        if (!guardPowerTimesInfinity && powerUsage.week == week && powerUsage.times >= guardPowerPerWeek) {
          message.error('本周魔法点歌次数已耗尽')
          return
        }
        powerUsage.week = week
        powerUsage.times += 1
        saveUserStatus(uid, 'powerUsage', powerUsage)
      }

      const now = new Date().getTime()
      const privilege = isBullyingSong || usePower
      if (!privilege) {
        if (!isAccepting.value) {
          message.error('点歌已暂停，下一轮要手速快点哦')
          return
        }
        if (userCdEnabled) {
          const lastDemand = getUserStatus(uid, 'demand')
          if (lastDemand && now - lastDemand <= config.value.userCdMinute * 60 * 1000) {
            message.error('点歌太快了，请让点机会给其他人')
            return
          }
        }
        saveUserStatus(uid, 'demand', now)
      }

      if (demandedSongs.date == today) {
        demandedSongs.songs.push(songLowerCase)
      }
      else {
        demandedSongs.date = today
        demandedSongs.songs = [songLowerCase]
      }
      localStorage.setItem(`demanded_${roomId}`, JSON.stringify(demandedSongs))

      const accept = { uid, time: now, uname, song, privilege }
      songList.value[isBullyingSong ? 'unshift' : 'push'](accept)
      saveSongList()
      message.success(`${song} 点歌成功`)
      break
    }
    //SC
    case 'SUPER_CHAT_MESSAGE': {
      const { message, uid, user_info: { uname } } = data.data
      const match = /^[点點]歌\s*(.+)$/.exec(message)
      if (!match) { return }
      const song = match[1].trim()
      if (bullyingSongs.value.includes(song.toLowerCase())) {
        message.error('不支持SC点迫害歌，请在上舰当天使用普通弹幕点歌')
        return
      }
      songList.value.unshift({ uid, time: new Date().getTime(), uname, song, privilege: true })
      saveSongList()
      message.success(`${song} 点歌成功`)
      break
    }
    //上舰
    case 'GUARD_BUY': {
      saveUserStatus(data.data.uid, 'buyGuard', new Date().getTime())
      break
    }
  }
})

function openConfigWindow() {
  window.electron.openConfigWindow()
}

function removeSong(idx) {
  songList.value.splice(idx, 1)
  saveSongList()
}

function pinToTop(idx) {
  if (idx == 0) { return }
  const [item] = songList.value.splice(idx, 1)
  nextTick(() => {
    songList.value.unshift(item)
    saveSongList()
  })
}

function copyText(text, el) {
  window.electron.copyText(text)
  while (el.tagName.toLowerCase() != 'i') { el = el.parentElement }
  const hint = document.createElement('div')
  hint.innerText = '已复制'
  hint.className = 'copy-hint'
  el.appendChild(hint)
  setTimeout(() => { hint.remove() }, 400)
}
</script>