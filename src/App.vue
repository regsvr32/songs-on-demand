<template>
  <div class="window-frame full-window" />
  <transition :name="isBack ? 'back-page' : 'go-page'">
    <component class="full-window" :is="pageStack[pageStack.length - 1]" />
  </transition>
  <message-banner ref="messageBanner" />
  <div v-if="loading" class="loading-block full-window" @click.prevent>
    <icon icon="spinner" />
  </div>
</template>

<style lang="sass">
body
  background-color: var(--window-background-color)
  color: #ffffff
  overflow: hidden

.full-window
  position: absolute
  width: 100%
  height: 100%
  left: 0px
  top: 0px
  box-sizing: border-box

.window-frame
  z-index: -1000

@keyframes rotating
  from
    transform: rotate(0turn)
  to
    transform: rotate(1turn)

.message-banner
  position: fixed
  left: 0px
  bottom: 80px

.loading-block
  z-index: 1000
  background-color: #00000080
  text-align: center
  padding-top: calc(45vh - 30px)
  .spinner
    color: #ffffff
    opacity: 0.8
    width: 60px
    height: 60px
    animation: rotating 1.2s linear infinite

.go-page-enter-active
  transition: transform 0.3s ease
.go-page-enter-from
  transform: translateX(100vw)
.go-page-leave-active
  transition: clip-path 0.3s ease
.go-page-leave-from
  clip-path: inset(0% 0% 0% 0%)
.go-page-leave-to
  clip-path: inset(0% 100% 0% 0%)

.back-page-enter-active
  transition: clip-path 0.3s ease
.back-page-enter-from
  clip-path: inset(0% 100% 0% 0%)
.back-page-enter-to
  clip-path: inset(0% 0% 0% 0%)
.back-page-leave-active
  transition: transform 0.3s ease
.back-page-leave-to
  transform: translateX(100vw)
  
</style>

<script setup>
import { markRaw, provide, ref, shallowRef, onUnmounted, watchEffect } from 'vue'
import SelectRoomPage from './component/SelectRoomPage.vue'
// eslint-disable-next-line
import MessageBanner from './component/MessageBanner.vue'
import Icon from './asset/Icon.vue'
import { defaultConfig } from './util/appConfig'

const pageStack = ref([markRaw(SelectRoomPage)])
const isBack = ref(false)
const messageBanner = ref(null)

const storagedConfig = localStorage.getItem('config')
const config = shallowRef(Object.assign({}, defaultConfig, storagedConfig && JSON.parse(storagedConfig) || {}))
const cancelWatchConfig = window.electron.watchConfig(() => config.value = JSON.parse(localStorage.getItem('config')))
onUnmounted(cancelWatchConfig)
provide('config', config)

watchEffect(() => {
  document.body.style = `--app-main-font: ${config.value.appMainFont || 'UKai'}; --window-background-color: ${config.value.windowBackground || '#4c4c4c'}`
})

provide('globalStore', {})

const pages = {
  go(page) {
    isBack.value = false
    pageStack.value.push(markRaw(page))
  },
  back() {
    isBack.value = true
    pageStack.value.pop()
  }
}

provide('pages', pages)

const loading = ref(false)

provide('blocking', (/**@type Promise*/ promise) => {
  loading.value = true
  return promise.finally(() => loading.value = false)
})

provide('message', {
  success(msg) {
    messageBanner.value.setMessage('success', msg)
  },
  error(msg) {
    messageBanner.value.setMessage('error', msg)
  }
})

document.body.classList.add('focused')
window.electron.watchFocusChanges(focused => {
  if (focused) {
    document.body.classList.add('focused')
  }
  else {
    document.body.classList.remove('focused')
  }
})
</script>