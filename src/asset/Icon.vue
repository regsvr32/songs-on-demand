<template>
  <i v-html="icons[icon]" class="icon" :class="icon" />
</template>

<style lang="sass" scoped>
.icon
  display: inline-block
  :deep(svg)
    width: 100%
    height: 100%
</style>

<script setup>
import * as icons from './icons'

defineProps(['icon'])
</script>