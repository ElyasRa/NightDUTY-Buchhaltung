<template>
  <div
    class="line-element"
    :style="lineStyle"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LineElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: LineElement
  zoom?: number
}

const props = defineProps<Props>()

const lineStyle = computed(() => {
  if (props.element.orientation === 'horizontal') {
    return {
      width: '100%',
      height: `${props.element.thickness}px`,
      background: props.element.color || '#000000'
    }
  } else {
    return {
      width: `${props.element.thickness}px`,
      height: '100%',
      background: props.element.color || '#000000'
    }
  }
})
</script>

<style scoped>
.line-element {
  pointer-events: none;
}
</style>
