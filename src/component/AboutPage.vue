<template>
  <div class="about-page">
    <div class="contents-wrapper">
      <table class="contents">
        <tr>
          <td>Powered By</td>
          <td>
            <span class="link" @click="open('https://v3.cn.vuejs.org/')">Vue 3</span><br/>
            <span class="link" @click="open('https://www.electronjs.org/')">Electron</span><br/>
            <span class="link" @click="open('https://fontawesome.com/license')">Font Awesome</span><br/>
            <span class="link" @click="open('https://element-plus.org/zh-CN/')">Element Plus</span><br/>
            <span class="link" @click="open('https://www.freedesktop.org/wiki/Arphic_Public_License/')">AR PL UKai</span>
          </td>
        </tr>
        <tr>
          <td>联系作者</td>
          <td>QQ: <span class="link" @click="open('https://wpa.qq.com/msgrd?v=3&uin=364944699&site=qq&menu=yes')">364944699</span></td>
        </tr>
      </table>
    </div>
    <div class="button-wrapper">
      <icon icon="back" @click="pages.back" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
*
  font-family: sans-serif
  font-size: 17px
  text-shadow: none

.about-page
  background-color: #ffffff
  .contents-wrapper
    height: calc(100% - 64px)
    box-sizing: border-box
    padding: 12px 24px
    .contents
      color: #303133
      td
        padding-right: 1em
        padding-bottom: 0.5em
        vertical-align: top
        white-space: nowrap
        &:first-child
          font-weight: bold
          font-size: 16px
        .link
          cursor: pointer
          color: #409eff
  .button-wrapper
    text-align: end
    padding: 10px
    .back
      cursor: pointer
      width: 45px
      height: 45px
      color: #606266
</style>

<script setup>
import { inject } from 'vue'
import Icon from '../asset/Icon.vue'

const pages = inject('pages')

function open(url) {
  window.electron.openExternal(url)
}
</script>