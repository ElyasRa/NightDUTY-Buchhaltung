<template>
  <div
    :ref="elementRef"
    class="draggable-element"
    :class="{ 
      'selected': isSelected,
      'dragging': isDragging 
    }"
    :style="elementStyle"
    @mousedown="onMouseDown"
    @contextmenu.prevent="onContextMenu"
  >
    <slot></slot>
    
    <!-- Resize handles -->
    <template v-if="isSelected && !element.locked">
      <div
        v-for="handle in resizeHandles"
        :key="handle"
        :class="['resize-handle', handle]"
        @mousedown.stop="onResizeStart($event, handle)"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TemplateElement } from '../../stores/invoiceTemplate'

interface Props {
  element: TemplateElement
  isSelected: boolean
  snapToGrid?: boolean
  gridSize?: number
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  snapToGrid: true,
  gridSize: 10,
  zoom: 100
})

const emit = defineEmits<{
  update: [element: TemplateElement]
  select: [element: TemplateElement]
  contextmenu: [event: MouseEvent, element: TemplateElement]
}>()

const elementRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)

const startX = ref(0)
const startY = ref(0)
const startElementX = ref(0)
const startElementY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

const resizeHandles = ['nw', 'ne', 'sw', 'se']

const elementStyle = computed(() => {
  const scale = props.zoom / 100
  return {
    position: 'absolute',
    left: `${props.element.x * scale}px`,
    top: `${props.element.y * scale}px`,
    width: `${props.element.width * scale}px`,
    height: `${props.element.height * scale}px`,
    zIndex: props.element.zIndex,
    opacity: props.element.visible !== false ? 1 : 0.5,
    cursor: props.element.locked ? 'not-allowed' : 'move'
  }
})

const snap = (value: number) => {
  if (!props.snapToGrid) return value
  return Math.round(value / props.gridSize) * props.gridSize
}

const onMouseDown = (event: MouseEvent) => {
  if (props.element.locked) return
  
  event.stopPropagation()
  emit('select', props.element)
  
  if (event.button !== 0) return // Only left click
  
  isDragging.value = true
  startX.value = event.clientX
  startY.value = event.clientY
  startElementX.value = props.element.x
  startElementY.value = props.element.y
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value && !isResizing.value) return
  
  const scale = props.zoom / 100
  const deltaX = (event.clientX - startX.value) / scale
  const deltaY = (event.clientY - startY.value) / scale
  
  if (isDragging.value) {
    const newX = snap(startElementX.value + deltaX)
    const newY = snap(startElementY.value + deltaY)
    
    emit('update', {
      ...props.element,
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    })
  } else if (isResizing.value && resizeHandle.value) {
    handleResize(deltaX, deltaY)
  }
}

const onMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = null
  
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

const onResizeStart = (event: MouseEvent, handle: string) => {
  if (props.element.locked) return
  
  event.stopPropagation()
  
  isResizing.value = true
  resizeHandle.value = handle
  startX.value = event.clientX
  startY.value = event.clientY
  startElementX.value = props.element.x
  startElementY.value = props.element.y
  startWidth.value = props.element.width
  startHeight.value = props.element.height
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const handleResize = (deltaX: number, deltaY: number) => {
  if (!resizeHandle.value) return
  
  let newX = startElementX.value
  let newY = startElementY.value
  let newWidth = startWidth.value
  let newHeight = startHeight.value
  
  switch (resizeHandle.value) {
    case 'nw': // Top-left
      newX = snap(startElementX.value + deltaX)
      newY = snap(startElementY.value + deltaY)
      newWidth = snap(startWidth.value - deltaX)
      newHeight = snap(startHeight.value - deltaY)
      break
    case 'ne': // Top-right
      newY = snap(startElementY.value + deltaY)
      newWidth = snap(startWidth.value + deltaX)
      newHeight = snap(startHeight.value - deltaY)
      break
    case 'sw': // Bottom-left
      newX = snap(startElementX.value + deltaX)
      newWidth = snap(startWidth.value - deltaX)
      newHeight = snap(startHeight.value + deltaY)
      break
    case 'se': // Bottom-right
      newWidth = snap(startWidth.value + deltaX)
      newHeight = snap(startHeight.value + deltaY)
      break
  }
  
  // Ensure minimum size
  newWidth = Math.max(20, newWidth)
  newHeight = Math.max(20, newHeight)
  
  emit('update', {
    ...props.element,
    x: Math.max(0, newX),
    y: Math.max(0, newY),
    width: newWidth,
    height: newHeight
  })
}

const onContextMenu = (event: MouseEvent) => {
  emit('contextmenu', event, props.element)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})
</script>

<style scoped>
.draggable-element {
  box-sizing: border-box;
  transition: opacity 0.2s;
  user-select: none;
}

.draggable-element.selected {
  outline: 2px solid #ff006e;
  outline-offset: 2px;
}

.draggable-element.dragging {
  opacity: 0.7;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ff006e;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
}

.resize-handle.nw {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.resize-handle.ne {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.resize-handle.sw {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.resize-handle.se {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

.resize-handle:hover {
  background: #8338ec;
  transform: scale(1.2);
}
</style>
