<template>
  <div class="message-banner">
    <transition name="banner-slide">
      <div v-if="lastMessage != null" class="message-background" :class="lastMessage.type">
        <span class="message-text" ref="messageTextRef">{{lastMessage.message}}</span>
      </div>
    </transition>
  </div>
</template>

<style lang="sass" scoped>
.message-banner
  box-sizing: border-box
  overflow: hidden
  width: 100%
  height: 36px
  padding: 0px 12px
  pointer-events: none
  .message-background
    overflow: hidden
    width: 100%
    box-sizing: border-box
    padding: 4px 4px 5px
    border-radius: 4px
    &.success
      background-color: #39c05b
    &.error
      background-color: #c03939
    .message-text
      display: inline-block
      white-space: nowrap
      --scroll-duration: 1.5s
      --scroll-delay: 0s
      --scroll-times: 2

.banner-slide-enter-active, .banner-slide-leave-active
  transition: transform 0.5s ease
.banner-slide-enter-from
  transform: translateY(100%)
.banner-slide-leave-to
  transform: translateY(-100%)
</style>

<script setup>
import { ref, nextTick } from 'vue'

class MessageQueue {
  #array = []
  #index = -1

  dequeue() {
    if (++this.#index >= this.#array.length) {
      this.#array = []
      this.#index = -1
      return null
    }
    const item = this.#array[this.#index]
    this.#array[this.#index] = null
    return item
  }
  
  enqueue(item) {
    this.#array.push(item)
  }
}

const messageQueue = new MessageQueue()
const lastMessage = ref(null)
const messageTextRef = ref(null)

let isBannerBusy = false
function activeNext() {
  lastMessage.value = messageQueue.dequeue()
  if (lastMessage.value == null) {
    isBannerBusy = false
    return
  }
  isBannerBusy = true
  nextTick(() => {
    const el = messageTextRef.value
    const overflow = Math.min(0, el.parentElement.clientWidth - el.clientWidth - 8)
    el.style = `--scroll-width: ${overflow}px`
    el.classList.add('text-scroll-alternate')
  })
  setTimeout(() => {
    lastMessage.value = null
    setTimeout(activeNext, 500)
  }, 2500)
}

defineExpose({
  setMessage(type, message) {
    messageQueue.enqueue({ type, message })
    if (!isBannerBusy) { activeNext() }
  }
})
</script>
