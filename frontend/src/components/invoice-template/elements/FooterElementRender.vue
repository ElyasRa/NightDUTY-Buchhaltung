<template>
  <div class="footer-element" :style="footerStyle">
    {{ element.text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FooterElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: FooterElement
  zoom?: number
  mode?: 'editor' | 'test'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const footerStyle = computed(() => ({
  fontSize: `${props.element.fontSize || 7}px`,
  color: props.element.color || '#64748b',
  lineHeight: '1.3',
  fontFamily: props.element.fontFamily || 'Arial, sans-serif',
  textAlign: props.element.align || 'left'
}))
</script>

<style scoped>
.footer-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
  white-space: nowrap;
}
</style>
