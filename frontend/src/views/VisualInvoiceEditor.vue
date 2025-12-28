<template>
  <div class="invoice-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <!-- Auswahl -->
      <div class="tool-group">
        <button @click="setTool('select')" :class="{ active: currentTool === 'select' }" title="Auswahl">
          <IconPointer />
        </button>
        <button @click="setTool('multiselect')" title="Mehrfachauswahl">
          <IconSelector />
        </button>
      </div>

      <!-- Bild -->
      <div class="tool-group">
        <button @click="openImageUpload" title="Bild einfügen">
          <IconPhoto />
        </button>
        <button @click="cropImage" :disabled="!selectedImage" title="Zuschneiden">
          <IconCrop />
        </button>
        <button @click="rotateImage" :disabled="!selectedImage" title="Drehen">
          <IconRotate />
        </button>
      </div>

      <!-- Zeichen-Tools -->
      <div class="tool-group">
        <button @click="setTool('text')" title="Text">
          <IconTypography />
        </button>
        <button @click="setTool('draw')" title="Stift">
          <IconPencil />
        </button>
        <button @click="setTool('brush')" title="Pinsel">
          <IconBrush />
        </button>
        <button @click="setTool('eraser')" title="Radiergummi">
          <IconEraser />
        </button>
        <button @click="setTool('fill')" title="Farbfüller">
          <IconBucket />
        </button>
        <button @click="setTool('eyedropper')" title="Pipette">
          <IconDroplet />
        </button>
        <button @click="zoomIn" title="Zoom +">
          <IconZoomIn />
        </button>
        <button @click="zoomOut" title="Zoom -">
          <IconZoomOut />
        </button>
      </div>

      <!-- Formen -->
      <div class="tool-group">
        <button @click="addShape('rect')" title="Rechteck">
          <IconSquare />
        </button>
        <button @click="addShape('circle')" title="Kreis">
          <IconCircle />
        </button>
        <button @click="addShape('triangle')" title="Dreieck">
          <IconTriangle />
        </button>
        <button @click="addShape('line')" title="Linie">
          <IconLine />
        </button>
        <button @click="addShape('arrow')" title="Pfeil">
          <IconArrowRight />
        </button>
        <button @click="addShape('star')" title="Stern">
          <IconStar />
        </button>
        <button @click="addShape('polygon')" title="Polygon">
          <IconPolygon />
        </button>
        <button @click="addShape('speech-bubble')" title="Sprechblase">
          <IconMessageCircle />
        </button>
      </div>

      <!-- Farben -->
      <div class="tool-group color-picker-group">
        <div class="color-palette">
          <button
            v-for="color in colorPalette"
            :key="color"
            :style="{ background: color }"
            @click="setColor(color)"
            class="color-swatch"
          ></button>
        </div>
        <input type="color" v-model="customColor" @change="setColor(customColor)" />
        <button @click="openColorPicker" title="RGB-Farbwähler">
          <IconPalette />
        </button>
      </div>

      <!-- Ebenen -->
      <div class="tool-group">
        <button @click="bringToFront" :disabled="!selectedObject" title="Nach vorne">
          <IconArrowUp />
        </button>
        <button @click="sendToBack" :disabled="!selectedObject" title="Nach hinten">
          <IconArrowDown />
        </button>
        <button @click="groupObjects" :disabled="selectedObjects.length < 2" title="Gruppieren">
          <IconLayersLinked />
        </button>
        <button @click="lockObject" :disabled="!selectedObject" title="Sperren">
          <IconLock />
        </button>
      </div>
    </div>

    <!-- Canvas-Bereich -->
    <div class="editor-layout">
      <!-- Eigenschaften-Panel (links) -->
      <div class="properties-panel">
        <h3>Eigenschaften</h3>
        <div v-if="selectedObject">
          <div class="property-group">
            <label>Position</label>
            <input type="number" v-model.number="selectedObject.left" @change="updateObject" placeholder="X" />
            <input type="number" v-model.number="selectedObject.top" @change="updateObject" placeholder="Y" />
          </div>
          <div class="property-group">
            <label>Größe</label>
            <input type="number" v-model.number="selectedObject.width" @change="updateObject" placeholder="Breite" />
            <input type="number" v-model.number="selectedObject.height" @change="updateObject" placeholder="Höhe" />
          </div>
          <div class="property-group" v-if="selectedObject.type === 'i-text' || selectedObject.type === 'textbox'">
            <label>Schriftart</label>
            <select v-model="selectedObject.fontFamily" @change="updateObject">
              <option>Arial</option>
              <option>Helvetica</option>
              <option>Times New Roman</option>
              <option>Courier</option>
            </select>
            <input type="number" v-model.number="selectedObject.fontSize" @change="updateObject" placeholder="Größe" />
          </div>
          <div class="property-group">
            <label>Farbe</label>
            <input type="color" v-model="selectedObject.fill" @change="updateObject" />
          </div>
          <div class="property-group">
            <label>Transparenz</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="selectedObject.opacity" @change="updateObject" />
          </div>
          <div class="property-group">
            <label>Rahmen</label>
            <input type="color" v-model="selectedObject.stroke" @change="updateObject" />
            <input type="number" v-model.number="selectedObject.strokeWidth" @change="updateObject" placeholder="Stärke" />
          </div>
        </div>
        <div v-else class="empty-state">
          Kein Element ausgewählt
        </div>

        <!-- Firmendaten-Editor -->
        <div class="company-data-editor">
          <h3>Firmendaten</h3>
          <input v-model="companyData.name" placeholder="Firmenname" />
          <input v-model="companyData.address" placeholder="Adresse" />
          <input v-model="companyData.city" placeholder="PLZ Ort" />
          <input v-model="companyData.phone" placeholder="Telefon" />
          <input v-model="companyData.email" placeholder="E-Mail" />
          <input v-model="companyData.website" placeholder="Website" />
          <input v-model="companyData.ustId" placeholder="UST-ID" />
          <input v-model="companyData.taxNumber" placeholder="Steuernummer" />
          <input v-model="companyData.registerCourt" placeholder="Registergericht" />
          <input v-model="companyData.ceo" placeholder="Geschäftsführer" />
          <button @click="saveCompanyData" class="btn-primary">Speichern</button>
        </div>
      </div>

      <!-- Canvas -->
      <div class="canvas-container">
        <canvas ref="fabricCanvas" width="794" height="1123"></canvas>
      </div>

      <!-- Ebenen-Panel (rechts) -->
      <div class="layers-panel">
        <h3>Ebenen</h3>
        <draggable v-model="layers" @end="reorderLayers" item-key="id">
          <template #item="{ element }">
            <div class="layer-item" :class="{ selected: element.id === selectedObject?.id }" @click="selectLayer(element)">
              <IconEye v-if="element.visible" @click.stop="toggleVisibility(element)" />
              <IconEyeOff v-else @click.stop="toggleVisibility(element)" />
              <span>{{ element.name || element.type }}</span>
              <IconLock v-if="element.locked" />
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Aktionen -->
    <div class="editor-actions">
      <button @click="testInvoice" class="btn-secondary">Test-Rechnung</button>
      <button @click="exportPDF" class="btn-secondary">PDF Export</button>
      <button @click="saveTemplate" class="btn-primary">Speichern (Strg+S)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Canvas, IText, Rect, Circle, Triangle, Line, Polygon, Image as FabricImage, Text, Group } from 'fabric'
import draggable from 'vuedraggable'
import { useInvoiceTemplateStore } from '../stores/invoiceTemplate'
import type { TemplateConfig } from '../stores/invoiceTemplate'
import {
  IconPointer,
  IconSelector,
  IconPhoto,
  IconCrop,
  IconRotate,
  IconTypography,
  IconPencil,
  IconBrush,
  IconEraser,
  IconBucket,
  IconDroplet,
  IconZoomIn,
  IconZoomOut,
  IconSquare,
  IconCircle,
  IconTriangle,
  IconLine,
  IconArrowRight,
  IconStar,
  IconPolygon,
  IconMessageCircle,
  IconPalette,
  IconArrowUp,
  IconArrowDown,
  IconLayersLinked,
  IconLock,
  IconEye,
  IconEyeOff
} from '@tabler/icons-vue'

const templateStore = useInvoiceTemplateStore()
const fabricCanvas = ref<HTMLCanvasElement>()
let canvas: Canvas | null = null

const currentTool = ref('select')
const selectedObject = ref<any>(null)
const selectedObjects = ref<any[]>([])
const selectedImage = ref<any>(null)
const customColor = ref('#000000')
const layers = ref<any[]>([])

const colorPalette = [
  '#000000', '#808080', '#C00000', '#FF0000', '#FFA500',
  '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0',
  '#002060', '#7030A0', '#FFFFFF'
]

const companyData = ref({
  name: 'NIGHTDUTY GmbH',
  address: 'Westendohrf 11',
  city: '45143 Essen',
  phone: '0201/8578670',
  email: 'buchhaltung@nightduty.de',
  website: 'www.nightduty.de',
  ustId: 'DE312802879',
  taxNumber: '111/57630795',
  registerCourt: 'Amtsgericht Essen',
  ceo: 'Max Mustermann'
})

onMounted(() => {
  initCanvas()
  loadTemplate()
  setupKeyboardShortcuts()
})

onUnmounted(() => {
  if (canvas) {
    canvas.dispose()
  }
})

function initCanvas() {
  if (!fabricCanvas.value) return
  
  canvas = new Canvas(fabricCanvas.value, {
    width: 794,
    height: 1123,
    backgroundColor: '#ffffff'
  })

  // Wasserzeichen hinzufügen
  addWatermark()

  // Farbstreifen oben
  addColorStripes('top')

  // Farbstreifen unten
  addColorStripes('bottom')

  // Event-Listener
  canvas.on('selection:created', handleSelection)
  canvas.on('selection:updated', handleSelection)
  canvas.on('selection:cleared', () => {
    selectedObject.value = null
    selectedObjects.value = []
  })
  
  // Update layers whenever objects change
  canvas.on('object:added', updateLayers)
  canvas.on('object:removed', updateLayers)
  canvas.on('object:modified', updateLayers)
}

function addWatermark() {
  if (!canvas) return
  
  const watermark = new Text('NIGHTDUTY', {
    left: 397,
    top: 561,
    fontSize: 180,
    fontFamily: 'Arial',
    fill: '#f0f0f0',
    opacity: 0.08,
    selectable: false,
    evented: false,
    angle: -45,
    originX: 'center',
    originY: 'center'
  })
  canvas.add(watermark)
  // Send to back by moving to first position
  canvas.sendObjectToBack(watermark)
}

function addColorStripes(position: 'top' | 'bottom') {
  if (!canvas) return
  
  const colors = ['#C00000', '#FFFFFF', '#0070C0', '#808080']
  const heights = [15, 3, 3, 3]
  const startY = position === 'top' ? 0 : 1099

  let currentY = startY

  colors.forEach((color, index) => {
    const height = heights[index]
    if (height === undefined) return
    
    const stripe = new Rect({
      left: 0,
      top: currentY,
      width: 794,
      height: height,
      fill: color,
      selectable: true,
      stroke: undefined
    })
    canvas!.add(stripe)
    if (position === 'top') {
      currentY += height
    } else {
      if (index > 0) {
        currentY -= height
      }
    }
  })
}

function setTool(tool: string) {
  currentTool.value = tool
  if (!canvas) return
  
  if (tool === 'draw') {
    canvas.isDrawingMode = true
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2
      canvas.freeDrawingBrush.color = customColor.value
    }
  } else if (tool === 'brush') {
    canvas.isDrawingMode = true
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 10
      canvas.freeDrawingBrush.color = customColor.value
    }
  } else if (tool === 'eraser') {
    canvas.isDrawingMode = true
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 20
      canvas.freeDrawingBrush.color = '#ffffff'
    }
  } else if (tool === 'text') {
    canvas.isDrawingMode = false
    const text = new IText('Text eingeben', {
      left: 100,
      top: 100,
      fontSize: 16,
      fill: customColor.value
    })
    canvas.add(text)
    canvas.setActiveObject(text)
  } else {
    canvas.isDrawingMode = false
  }
}

function addShape(shape: string) {
  if (!canvas) return
  
  let obj: any

  switch (shape) {
    case 'rect':
      obj = new Rect({ left: 100, top: 100, width: 100, height: 60, fill: '#0070C0' })
      break
    case 'circle':
      obj = new Circle({ left: 100, top: 100, radius: 50, fill: '#92D050' })
      break
    case 'triangle':
      obj = new Triangle({ left: 100, top: 100, width: 80, height: 80, fill: '#FFA500' })
      break
    case 'line':
      obj = new Line([50, 100, 200, 100], { stroke: '#000000', strokeWidth: 2 })
      break
    case 'arrow':
      // Custom arrow shape
      obj = new Polygon([
        { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: -20 },
        { x: 140, y: 20 }, { x: 100, y: 60 }, { x: 100, y: 40 }, { x: 0, y: 40 }
      ], { left: 100, top: 100, fill: '#C00000' })
      break
    case 'star':
      obj = new Polygon([
        { x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 },
        { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 },
        { x: 2, y: 35 }, { x: 39, y: 35 }
      ], { left: 100, top: 100, fill: '#FFFF00' })
      break
    case 'polygon':
      obj = new Polygon([
        { x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }
      ], { left: 100, top: 100, fill: '#7030A0' })
      break
    case 'speech-bubble':
      // Custom speech bubble (simplified)
      obj = new Rect({ left: 100, top: 100, width: 120, height: 60, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2, rx: 10, ry: 10 })
      break
  }

  if (obj) {
    canvas.add(obj)
    canvas.setActiveObject(obj)
  }
}

function openImageUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!canvas || !event.target?.result) return
      
      FabricImage.fromURL(event.target.result as string).then((img: FabricImage) => {
        if (!canvas) return
        img.scaleToWidth(200)
        canvas.add(img)
        canvas.setActiveObject(img)
        selectedImage.value = img
      })
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function cropImage() {
  if (!selectedImage.value) return
  // TODO: Implement crop functionality
  alert('Crop-Funktionalität wird implementiert')
}

function rotateImage() {
  if (!selectedImage.value || !canvas) return
  const currentAngle = selectedImage.value.angle || 0
  selectedImage.value.rotate((currentAngle + 90) % 360)
  canvas.renderAll()
}

function setColor(color: string) {
  if (selectedObject.value && canvas) {
    selectedObject.value.set('fill', color)
    canvas.renderAll()
  }
  customColor.value = color
}

function bringToFront() {
  if (selectedObject.value && canvas) {
    canvas.bringObjectToFront(selectedObject.value)
    canvas.renderAll()
    updateLayers()
  }
}

function sendToBack() {
  if (selectedObject.value && canvas) {
    canvas.sendObjectToBack(selectedObject.value)
    canvas.renderAll()
    updateLayers()
  }
}

function groupObjects() {
  if (selectedObjects.value.length < 2 || !canvas) return
  const group = new Group(selectedObjects.value)
  canvas.remove(...selectedObjects.value)
  canvas.add(group)
  canvas.setActiveObject(group)
}

function lockObject() {
  if (selectedObject.value && canvas) {
    selectedObject.value.set({ 
      lockMovementX: true, 
      lockMovementY: true, 
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      selectable: false 
    })
    canvas.renderAll()
    updateLayers()
  }
}

function zoomIn() {
  if (!canvas) return
  const zoom = canvas.getZoom()
  canvas.setZoom(Math.min(zoom * 1.1, 3))
}

function zoomOut() {
  if (!canvas) return
  const zoom = canvas.getZoom()
  canvas.setZoom(Math.max(zoom * 0.9, 0.5))
}

function openColorPicker() {
  // Trigger the color input click
  const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
  if (colorInput) {
    colorInput.click()
  }
}

function handleSelection(e: any) {
  selectedObject.value = e.selected?.[0] || null
  selectedObjects.value = e.selected || []
  if (selectedObject.value?.type === 'image') {
    selectedImage.value = selectedObject.value
  }
  updateLayers()
}

function updateObject() {
  if (canvas) {
    canvas.renderAll()
  }
}

function updateLayers() {
  if (!canvas) return
  
  layers.value = canvas.getObjects().map((obj: any, index: number) => ({
    id: obj.id || `layer-${index}`,
    name: obj.name || obj.type,
    type: obj.type,
    visible: obj.visible !== false,
    locked: obj.lockMovementX === true,
    object: obj
  })).reverse()
}

function reorderLayers() {
  // TODO: Implement layer reordering
  alert('Layer-Reordering wird implementiert')
}

function selectLayer(layer: any) {
  if (!canvas) return
  const obj = layer.object
  if (obj) {
    canvas.setActiveObject(obj)
    canvas.renderAll()
  }
}

function toggleVisibility(layer: any) {
  if (!canvas) return
  const obj = layer.object
  if (obj) {
    obj.visible = !obj.visible
    canvas.renderAll()
    updateLayers()
  }
}

async function saveCompanyData() {
  try {
    const currentTemplate = templateStore.currentTemplate
    if (!currentTemplate) return
    
    await templateStore.saveTemplate({
      ...currentTemplate,
      config: {
        ...currentTemplate.config,
        companyData: companyData.value
      } as TemplateConfig
    })
    alert('Firmendaten gespeichert!')
  } catch (error) {
    alert('Fehler beim Speichern der Firmendaten')
    console.error(error)
  }
}

async function loadTemplate() {
  try {
    await templateStore.fetchTemplates()
    const defaultTemplate = templateStore.templates.find(t => t.is_default)
    if (defaultTemplate) {
      templateStore.setCurrentTemplate(defaultTemplate)
      // Load company data if available
      if (defaultTemplate.config?.companyData) {
        Object.assign(companyData.value, defaultTemplate.config.companyData)
      }
      // Render template on canvas if canvasData exists
      if (defaultTemplate.config?.canvasData && canvas) {
        canvas.loadFromJSON(defaultTemplate.config.canvasData, () => {
          if (canvas) {
            canvas.renderAll()
            updateLayers()
          }
        })
      }
    }
  } catch (error) {
    console.error('Error loading template:', error)
  }
}

function testInvoice() {
  // Fill placeholders with test data
  alert('Test-Rechnung wird generiert...')
}

function exportPDF() {
  if (!canvas) return
  
  // Export canvas to PNG
  const dataURL = canvas.toDataURL({ 
    format: 'png', 
    quality: 1.0,
    multiplier: 1
  })
  
  // Create a download link
  const link = document.createElement('a')
  link.download = 'rechnung-vorlage.png'
  link.href = dataURL
  link.click()
  
  alert('PDF wird erstellt... (PNG-Export verfügbar)')
}

async function saveTemplate() {
  if (!canvas) return
  
  try {
    const json = canvas.toJSON()
    const currentTemplate = templateStore.currentTemplate
    if (!currentTemplate) return
    
    await templateStore.saveTemplate({
      ...currentTemplate,
      config: {
        ...currentTemplate.config,
        canvasData: json,
        companyData: companyData.value
      } as TemplateConfig
    })
    alert('Vorlage gespeichert!')
  } catch (error) {
    alert('Fehler beim Speichern der Vorlage')
    console.error(error)
  }
}

function setupKeyboardShortcuts() {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveTemplate()
    }
    if (e.key === 'Delete' && selectedObject.value && canvas) {
      canvas.remove(selectedObject.value)
      selectedObject.value = null
    }
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault()
      // Undo functionality would go here
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
</script>

<style scoped>
.invoice-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
  overflow-x: auto;
}

.tool-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-right: 1px solid #3a3a3a;
}

.tool-group button {
  padding: 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-group button:hover {
  background: #3a3a3a;
}

.tool-group button.active {
  background: #ec4899;
  border-color: #ec4899;
}

.tool-group button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(13, 20px);
  gap: 2px;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid #555;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.color-swatch:hover {
  border-color: #ec4899;
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.properties-panel, .layers-panel {
  width: 280px;
  background: #2a2a2a;
  padding: 16px;
  overflow-y: auto;
  color: #fff;
}

.properties-panel h3, .layers-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 14px;
  text-transform: uppercase;
  color: #999;
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a1a;
  overflow: auto;
  padding: 20px;
}

.canvas-container canvas {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  text-transform: uppercase;
  color: #999;
}

.property-group input, .property-group select {
  width: 100%;
  padding: 8px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 8px;
}

.property-group input[type="color"] {
  height: 40px;
  cursor: pointer;
}

.property-group input[type="range"] {
  cursor: pointer;
}

.company-data-editor {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #3a3a3a;
}

.company-data-editor input {
  width: 100%;
  padding: 8px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 4px;
  background: #3a3a3a;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.layer-item:hover {
  background: #4a4a4a;
}

.layer-item.selected {
  background: #ec4899;
}

.layer-item span {
  flex: 1;
}

.editor-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 20px;
  background: #ec4899;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #db2777;
}

.btn-secondary {
  padding: 10px 20px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #4a4a4a;
}

.empty-state {
  color: #999;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}
</style>
