<template>
  <div class="select-room-page">
    <div class="select-room-layout">
      <div class="input-wrapper">
        <span class="label">房间号: </span>
        <input autofocus v-model="roomId" />&nbsp;
        <button :disabled="!roomId" @click="connect">连接</button>
      </div>
    </div>
    <icon icon="cogs" @click="openConfigWindow" />
    <icon icon="info" @click="pages.go(AboutPage)" />
    <icon icon="close" @click="close" />
  </div>
</template>

<style lang="sass" scoped>
.select-room-page
  padding-top: 24px
  padding-right: 0.25em
  .select-room-layout
    width: fit-content
    margin: auto
    .input-wrapper
      white-space: nowrap
      @media screen and (max-width: 450px)
        display: flex
        flex-direction: column
        align-items: center
        .label
          padding-bottom: 12px
  .icon
    position: absolute
    bottom: 24px
    color: #ffffff
    opacity: 0.6
    width: 40px
    height: 40px
    cursor: pointer
    filter: drop-shadow(0px 0px 3px #00000080)
  .cogs
    left: 32px
  .info
    width: 12px
    left: 108px
  .close
    right: 36px
</style>

<script setup>
import { inject, ref } from 'vue'
import SongListPage from './SongListPage.vue'
import AboutPage from './AboutPage.vue'
import { connectRoomChat } from '../util/bilibiliLiveRoomChat'
import Icon from '../asset/Icon.vue'

const globalStore = inject('globalStore')
const pages = inject('pages')
const blocking = inject('blocking')
const message = inject('message')

const roomId = ref(localStorage.getItem('roomId') || '')

function connect() {
  localStorage.setItem('roomId', roomId.value)
  blocking(connectRoomChat(roomId.value)).then(session => {
    globalStore.roomChatSession = session
    pages.go(SongListPage)
  }).catch(message.error)
}

function openConfigWindow() {
  window.electron.openConfigWindow()
}

function close() {
  window.close()
}
</script>
