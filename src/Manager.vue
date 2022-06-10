<template>
  <div class="manager-window">
    <el-form class="configs" label-position="right" label-width="160px" @submit.prevent>
      <el-form-item>
        <template #label>
          <span>窗口</span>
        </template>
        <el-space>
          <span>底色</span>
          <el-color-picker v-model="config.windowBackground" size="small" />
          <span>置顶</span>
          <el-switch v-model="config.keepWindowTop" />
        </el-space>
      </el-form-item>
      <el-form-item>
        <template #label>
          <el-space>
            <span>用户点歌CD</span>
            <el-switch v-model="config.userCdEnabled" />
          </el-space>
        </template>
        <el-space>
          <el-input-number v-model="config.userCdMinute" size="small" :min="1" :precision="0" :disabled="!config.userCdEnabled" />
          <span>分钟</span>
        </el-space>
      </el-form-item>
      <el-form-item>
        <template #label>
          <el-space>
            <span>舰长魔法点歌</span>
            <el-switch v-model="config.guardPowerEnabled" />
          </el-space>
        </template>
        <el-space direction="vertical" alignment="start">
          <el-space>
            <el-input-number v-model="config.guardPowerPerWeek" size="small" :min="1" :precision="0" :disabled="!config.guardPowerEnabled || config.guardPowerTimesInfinity" />
            <span>次/周(每周一重置)</span>
          </el-space>
          <el-checkbox v-model="config.guardPowerTimesInfinity" :disabled="!config.guardPowerEnabled" label="次数不限" />
        </el-space>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>相同歌曲CD</span>
        </template>
        <el-space direction="vertical" alignment="start">
          <el-space>
            <el-input-number style="width: 80px" size="small" v-model="config.sameSongBanDays" :min="1" :max="99" :precision="0" />
            <span>天</span>
            <span>↓例外('|'分隔)</span>
          </el-space>
          <el-input style="width: 250px" v-model="config.sameSongBanExceptRaw" />
        </el-space>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>文本设置&emsp;</span>
        </template>
        <el-space direction="vertical" alignment="start">
          <el-space>
            <span>字体</span>
            <el-select v-model="config.appMainFont" class="select-font" :style="`--font-preview: ${config.appMainFont}`" clearable placeholder="默认字体">
              <el-option v-for="font in fontFamilies" :key="font" :style="`font-family: ${font}`" :value="font">{{font}}</el-option>
            </el-select>
          </el-space>
          <el-space>
            <span>字号</span>
            <el-input-number style="width: 80px" v-model="config.textSize" :min="10" :max="99" :precision="0" size="small" />
            <span>描边颜色</span>
            <el-color-picker v-model="config.textStokeColor" size="small" />
          </el-space>
          <el-space>
            <span>歌曲编号</span>
            <el-color-picker v-model="config.songNumberColor" size="small" />
            <el-checkbox v-model="config.songNumberEnabled" label="显示" />
            <el-checkbox v-model="config.songNumberBold" label="加粗" />
            <el-checkbox v-model="config.songNumberShadow" label="描边" />
          </el-space>
          <el-space>
            <span>歌曲名称</span>
            <el-color-picker v-model="config.songNameColor" size="small" />
            <el-checkbox v-model="config.songNameBold" label="加粗" />
            <el-checkbox v-model="config.songNameShadow" label="描边" />
          </el-space>
          <el-space>
            <span>点歌用户</span>
            <el-color-picker v-model="config.userNameColor" size="small" />
            <el-checkbox v-model="config.userNameBold" label="加粗" />
            <el-checkbox v-model="config.userNameShadow" label="描边" />
          </el-space>
        </el-space>
      </el-form-item>
      <el-form-item>
        <template #label>
          <el-space>
            <span>置底歌曲('|'分隔)</span>
          </el-space>
        </template>
        <el-input style="width: 250px" v-model="config.fixBottomSong" />
      </el-form-item>
      <el-form-item>
        <template #label>
          <el-space>
            <span>黑话点歌</span>
            <el-switch v-model="config.songNameAliasEnable" />
          </el-space>
        </template>
        <el-button @click="songNameAliasDrawer = true">黑话设置</el-button>
      </el-form-item>
      <el-form-item>
        <template #label>
          <el-space>
            <span>其他</span>
          </el-space>
        </template>
        <el-space direction="vertical" alignment="start">
          <el-space>
            <span>点歌弹幕歌名前需要加空格</span>
            <el-switch v-model="config.demandMsgSpaceRequired" />
          </el-space>
        </el-space>
      </el-form-item>
    </el-form>
    <el-form class="layout-right" label-position="top" @submit.prevent>
      <el-form-item>
        <el-input class="bullying-songs" type="textarea" v-model="config.bullyingSongsRaw" resize="none" />
      </el-form-item>
      <el-form-item class="botton-wrapper">
        <el-button type="primary" @click="applyConfig">应用</el-button>
      </el-form-item>
    </el-form>
  </div>
  <el-drawer v-model="songNameAliasDrawer" title="黑话设置" :size="320" :show-close="false">
    <el-input class="song-name-alias" type="textarea" v-model="config.songNameAliasRaw" resize="none" />
  </el-drawer>
</template>

<style lang="sass">
body
  margin: 0px

.manager-window
  display: flex
  height: 100vh
  box-sizing: border-box
  padding: 12px
  .configs
    box-sizing: border-box
    padding: 12px
    margin-right: 12px
    border: 1px solid #dcdfe6
    border-radius: 4px
    overflow-y: auto
    .select-font .el-input__inner
      width: 200px
      font-family: var(--font-preview)
  .layout-right
    box-sizing: border-box
    overflow-y: auto
    flex-grow: 1
    .bullying-songs
      .el-textarea__inner
        height: calc(100vh - 80px)
        padding-left: 10px
      &::after
        content: '迫害歌单'
        position: absolute
        bottom: -1em
        left: 0.5em
        padding: 0px 6px
        background-color: #ffffff
        color: var(--el-text-color-secondary)
        transition: color 0.2s ease
      &:focus-within::after
        color: var(--el-color-primary)
    .botton-wrapper
      margin-bottom: 0px
      .el-form-item__content
        flex-direction: row-reverse

.el-color-picker__panel .el-color-dropdown__btns>.el-button--text:nth-child(2)
  display: none

.el-drawer
  .el-drawer__header
    margin-bottom: 0px
  .song-name-alias
    height: 100%
    .el-textarea__inner
      height: 100%
      padding-left: 10px
</style>

<script setup>
import { ref, shallowRef } from 'vue'
import { defaultConfig } from './util/appConfig'
import { ElMessage } from 'element-plus'

const storagedConfig = localStorage.getItem('config')
const config = ref(storagedConfig && Object.assign({}, defaultConfig, JSON.parse(storagedConfig)) || defaultConfig)

const fontFamilies = shallowRef([])
window.electron.getFontFamilies().then(families => fontFamilies.value = families)

function applyConfig() {
  localStorage.setItem('config', JSON.stringify(config.value))
  window.electron.updateConfig()
  ElMessage.success({
    message: '更新成功',
    duration: 1500,
    showClose: true
  })
}

const songNameAliasDrawer = ref(false)

</script>
