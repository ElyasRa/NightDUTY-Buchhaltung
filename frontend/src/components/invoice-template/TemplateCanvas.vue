<template>
  <div class="canvas-container">
    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <button
          @click="emit('modeChange', 'editor')"
          :class="['mode-btn', { active: mode === 'editor' }]"
        >
          Editor-Modus
        </button>
        <button
          @click="emit('modeChange', 'test')"
          :class="['mode-btn', { active: mode === 'test' }]"
        >
          Test-Rechnung
        </button>
      </div>
      
      <div class="toolbar-center">
        <button @click="emit('exportPdf')" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2"/>
          </svg>
          PDF Export
        </button>
      </div>
      
      <div class="toolbar-right">
        <label class="zoom-label">Zoom:</label>
        <select v-model.number="zoom" @change="emit('zoomChange', zoom)" class="zoom-select">
          <option :value="50">50%</option>
          <option :value="75">75%</option>
          <option :value="100">100%</option>
          <option :value="125">125%</option>
          <option :value="150">150%</option>
        </select>
      </div>
    </div>

    <!-- Canvas Area -->
    <div 
      ref="canvasArea"
      class="canvas-area"
      @click="onCanvasClick"
    >
      <div 
        class="canvas-paper"
        :class="{ 'show-grid': showGrid }"
        :style="paperStyle"
      >
        <!-- Grid background -->
        <div v-if="showGrid" class="grid-background" :style="gridStyle"></div>
        
        <!-- Rulers -->
        <div class="ruler ruler-horizontal" :style="{ width: paperWidth + 'px' }">
          <div
            v-for="i in Math.ceil(paperWidth / (gridSize * 10))"
            :key="`h-${i}`"
            class="ruler-mark"
            :style="{ left: `${i * gridSize * 10}px` }"
          >
            <span>{{ i * gridSize * 10 }}</span>
          </div>
        </div>
        
        <div class="ruler ruler-vertical" :style="{ height: paperHeight + 'px' }">
          <div
            v-for="i in Math.ceil(paperHeight / (gridSize * 10))"
            :key="`v-${i}`"
            class="ruler-mark"
            :style="{ top: `${i * gridSize * 10}px` }"
          >
            <span>{{ i * gridSize * 10 }}</span>
          </div>
        </div>

        <!-- Elements -->
        <DraggableElement
          v-for="element in sortedElements"
          :key="element.id"
          :element="element"
          :isSelected="selectedElement?.id === element.id"
          :snapToGrid="snapToGrid"
          :gridSize="gridSize"
          :zoom="zoom"
          @update="onElementUpdate"
          @select="onElementSelect"
          @contextmenu="onElementContextMenu"
        >
          <component
            :is="getElementComponent(element)"
            :element="element"
            :zoom="zoom"
            :mode="mode"
            :testData="testData"
          />
        </DraggableElement>

        <!-- Context Menu -->
        <div
          v-if="contextMenu.visible"
          class="context-menu"
          :style="{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px` 
          }"
        >
          <button @click="onContextAction('properties')">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" stroke-width="2"/>
            </svg>
            Eigenschaften
          </button>
          <button @click="onContextAction('duplicate')">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" stroke="currentColor" stroke-width="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
            </svg>
            Duplizieren
          </button>
          <button @click="onContextAction('forward')">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2"/>
            </svg>
            Nach vorne
          </button>
          <button @click="onContextAction('backward')">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" stroke-width="2"/>
            </svg>
            Nach hinten
          </button>
          <hr>
          <button @click="onContextAction('delete')" class="danger">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
            </svg>
            Löschen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DraggableElement from './DraggableElement.vue'
import LogoElementRender from './elements/LogoElementRender.vue'
import TextElementRender from './elements/TextElementRender.vue'
import PlaceholderElementRender from './elements/PlaceholderElementRender.vue'
import TableElementRender from './elements/TableElementRender.vue'
import LineElementRender from './elements/LineElementRender.vue'
import type { TemplateElement, TestInvoiceData } from '../../stores/invoiceTemplate'

interface Props {
  elements: TemplateElement[]
  selectedElement: TemplateElement | null
  zoom?: number
  showGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
  mode?: 'editor' | 'test'
  testData?: TestInvoiceData | null
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 100,
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
  mode: 'editor'
})

const emit = defineEmits<{
  elementUpdate: [element: TemplateElement]
  elementSelect: [element: TemplateElement | null]
  elementContextMenu: [action: string, element: TemplateElement]
  modeChange: [mode: 'editor' | 'test']
  zoomChange: [zoom: number]
  exportPdf: []
}>()

const canvasArea = ref<HTMLElement | null>(null)
const zoom = ref(props.zoom)

// DIN A4 dimensions at 96 DPI
const paperWidth = 794
const paperHeight = 1123

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  element: null as TemplateElement | null
})

const sortedElements = computed(() => {
  return [...props.elements].sort((a, b) => a.zIndex - b.zIndex)
})

const paperStyle = computed(() => {
  const scale = props.zoom / 100
  return {
    width: `${paperWidth * scale}px`,
    height: `${paperHeight * scale}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  }
})

const gridStyle = computed(() => {
  return {
    backgroundSize: `${props.gridSize}px ${props.gridSize}px`,
    backgroundImage: `
      linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
    `
  }
})

const getElementComponent = (element: TemplateElement) => {
  switch (element.type) {
    case 'logo': return LogoElementRender
    case 'text': return TextElementRender
    case 'placeholder': return PlaceholderElementRender
    case 'table': return TableElementRender
    case 'line': return LineElementRender
    default: return 'div'
  }
}

const onElementUpdate = (element: TemplateElement) => {
  emit('elementUpdate', element)
}

const onElementSelect = (element: TemplateElement) => {
  emit('elementSelect', element)
  closeContextMenu()
}

const onCanvasClick = (event: MouseEvent) => {
  if (event.target === canvasArea.value || (event.target as HTMLElement).classList.contains('canvas-paper')) {
    emit('elementSelect', null)
  }
  closeContextMenu()
}

const onElementContextMenu = (event: MouseEvent, element: TemplateElement) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    element
  }
}

const onContextAction = (action: string) => {
  if (contextMenu.value.element) {
    emit('elementContextMenu', action, contextMenu.value.element)
  }
  closeContextMenu()
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

// Close context menu on outside click
const handleDocumentClick = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.context-menu')) {
    closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.canvas-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 1rem;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.mode-btn.active {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  border-color: transparent;
  color: white;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.zoom-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.zoom-select {
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.canvas-area {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.canvas-paper {
  position: relative;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  margin: 2rem auto;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.ruler {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.ruler-horizontal {
  top: -20px;
  left: 0;
  height: 20px;
}

.ruler-vertical {
  left: -20px;
  top: 0;
  width: 20px;
}

.ruler-mark {
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  font-size: 9px;
}

.ruler-horizontal .ruler-mark {
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  height: 100%;
}

.ruler-horizontal .ruler-mark span {
  position: absolute;
  top: 2px;
  left: 2px;
}

.ruler-vertical .ruler-mark {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
}

.ruler-vertical .ruler-mark span {
  position: absolute;
  top: 2px;
  left: 2px;
  writing-mode: vertical-rl;
}

.context-menu {
  position: fixed;
  background: #1e293b;
  border: 1px solid rgba(255, 0, 110, 0.3);
  border-radius: 8px;
  padding: 0.5rem 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  z-index: 10000;
  min-width: 180px;
}

.context-menu button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.context-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.context-menu button.danger {
  color: #ff6b6b;
}

.context-menu button.danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.context-menu button svg {
  width: 16px;
  height: 16px;
}

.context-menu hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

/* Scrollbar */
.canvas-area::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.canvas-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.canvas-area::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}

.canvas-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 0, 110, 0.5);
}
</style>
