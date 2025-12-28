<template>
  <div
    class="text-element"
    :style="textStyle"
  >
    {{ element.content }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: TextElement
  zoom?: number
}

const props = defineProps<Props>()

const textStyle = computed(() => ({
  fontSize: `${props.element.fontSize}px`,
  fontFamily: props.element.fontFamily || 'Arial, sans-serif',
  color: props.element.color || '#000000',
  fontWeight: props.element.bold ? 'bold' : 'normal',
  fontStyle: props.element.italic ? 'italic' : 'normal',
  textAlign: props.element.align || 'left',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const
}))
</script>

<style scoped>
.text-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
}
</style>
