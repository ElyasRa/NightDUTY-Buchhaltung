<template>
  <div class="logo-element">
    <img :src="getLogoUrl()" :alt="'Logo'" />
  </div>
</template>

<script setup lang="ts">
import { API_BASE_URL } from '../../../config'
import type { LogoElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: LogoElement
  zoom?: number
}

const props = defineProps<Props>()

const getLogoUrl = () => {
  if (props.element.url.startsWith('http')) {
    return props.element.url
  }
  return `${API_BASE_URL.replace('/api', '')}${props.element.url}`
}
</script>

<style scoped>
.logo-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-element img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
