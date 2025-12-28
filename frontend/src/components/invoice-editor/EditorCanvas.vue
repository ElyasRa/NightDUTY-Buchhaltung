<template>
  <div class="editor-canvas-container">
    <div class="canvas-wrapper" ref="canvasWrapper">
      <canvas ref="fabricCanvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Canvas, FabricObject, Rect, Circle, IText, Line, Image as FabricImage } from 'fabric'

interface Props {
  width?: number
  height?: number
  showGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 794,  // A4 width at 96 DPI
  height: 1123, // A4 height at 96 DPI
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
  backgroundColor: '#ffffff'
})

const emit = defineEmits<{
  objectAdded: [obj: FabricObject]
  objectModified: [obj: FabricObject]
  objectSelected: [obj: FabricObject | null]
  canvasReady: [canvas: Canvas]
}>()

const fabricCanvas = ref<HTMLCanvasElement | null>(null)
const canvasWrapper = ref<HTMLDivElement | null>(null)
let canvas: Canvas | null = null

onMounted(() => {
  if (!fabricCanvas.value) return

  // Initialize Fabric.js canvas
  canvas = new Canvas(fabricCanvas.value, {
    width: props.width,
    height: props.height,
    backgroundColor: props.backgroundColor,
    selection: true,
    preserveObjectStacking: true
  })

  // Add grid if enabled
  if (props.showGrid) {
    addGrid()
  }

  // Enable snap to grid if enabled
  if (props.snapToGrid) {
    enableSnapToGrid()
  }

  // Event listeners
  canvas.on('object:added', (e) => {
    if (e.target) emit('objectAdded', e.target)
  })

  canvas.on('object:modified', (e) => {
    if (e.target) emit('objectModified', e.target)
  })

  canvas.on('selection:created', (e) => {
    if (e.selected && e.selected[0]) emit('objectSelected', e.selected[0])
  })

  canvas.on('selection:updated', (e) => {
    if (e.selected && e.selected[0]) emit('objectSelected', e.selected[0])
  })

  canvas.on('selection:cleared', () => {
    emit('objectSelected', null)
  })

  // Emit canvas ready event
  emit('canvasReady', canvas)
})

onUnmounted(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
})

// Watch for grid changes
watch(() => props.showGrid, (show) => {
  if (!canvas) return
  if (show) {
    addGrid()
  } else {
    removeGrid()
  }
})

// Watch for snap to grid changes
watch(() => props.snapToGrid, (snap) => {
  if (!canvas) return
  if (snap) {
    enableSnapToGrid()
  } else {
    disableSnapToGrid()
  }
})

function addGrid() {
  if (!canvas) return

  const gridSize = props.gridSize
  const width = props.width
  const height = props.height

  // Remove existing grid
  removeGrid()

  // Add vertical lines
  for (let i = 0; i < width / gridSize; i++) {
    const line = new Line([i * gridSize, 0, i * gridSize, height], {
      stroke: '#e5e5e5',
      strokeWidth: 1,
      selectable: false,
      evented: false
    })
    // @ts-ignore - data property exists but not typed
    line.data = { isGrid: true }
    canvas.add(line)
    canvas.sendObjectToBack(line)
  }

  // Add horizontal lines
  for (let i = 0; i < height / gridSize; i++) {
    const line = new Line([0, i * gridSize, width, i * gridSize], {
      stroke: '#e5e5e5',
      strokeWidth: 1,
      selectable: false,
      evented: false
    })
    // @ts-ignore - data property exists but not typed
    line.data = { isGrid: true }
    canvas.add(line)
    canvas.sendObjectToBack(line)
  }

  canvas.renderAll()
}

function removeGrid() {
  if (!canvas) return
  const objects = canvas.getObjects()
  objects.forEach(obj => {
    // @ts-ignore - data property exists but not typed
    if (obj.data && obj.data.isGrid) {
      canvas!.remove(obj)
    }
  })
  canvas.renderAll()
}

function enableSnapToGrid() {
  if (!canvas) return

  canvas.on('object:moving', (e) => {
    if (!e.target) return
    const gridSize = props.gridSize
    
    e.target.set({
      left: Math.round((e.target.left || 0) / gridSize) * gridSize,
      top: Math.round((e.target.top || 0) / gridSize) * gridSize
    })
  })

  canvas.on('object:scaling', (e) => {
    if (!e.target) return
    const gridSize = props.gridSize
    
    // Snap width and height
    const width = (e.target.width || 0) * (e.target.scaleX || 1)
    const height = (e.target.height || 0) * (e.target.scaleY || 1)
    
    e.target.set({
      width: Math.round(width / gridSize) * gridSize / (e.target.scaleX || 1),
      height: Math.round(height / gridSize) * gridSize / (e.target.scaleY || 1)
    })
  })
}

function disableSnapToGrid() {
  if (!canvas) return
  canvas.off('object:moving')
  canvas.off('object:scaling')
}

// Public methods accessible via defineExpose
function addRectangle(options = {}) {
  if (!canvas) return
  
  const rect = new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: '#1e3a8a',
    ...options
  })
  
  canvas.add(rect)
  canvas.setActiveObject(rect)
  canvas.renderAll()
  return rect
}

function addCircle(options = {}) {
  if (!canvas) return
  
  const circle = new Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: '#1e3a8a',
    ...options
  })
  
  canvas.add(circle)
  canvas.setActiveObject(circle)
  canvas.renderAll()
  return circle
}

function addText(text = 'Text', options = {}) {
  if (!canvas) return
  
  const textObj = new IText(text, {
    left: 100,
    top: 100,
    fontSize: 20,
    fill: '#000000',
    fontFamily: 'Arial',
    ...options
  })
  
  canvas.add(textObj)
  canvas.setActiveObject(textObj)
  canvas.renderAll()
  return textObj
}

function addLine(options = {}) {
  if (!canvas) return
  
  const line = new Line([50, 50, 200, 50], {
    stroke: '#000000',
    strokeWidth: 2,
    ...options
  })
  
  canvas.add(line)
  canvas.setActiveObject(line)
  canvas.renderAll()
  return line
}

function addImage(url: string, options = {}) {
  if (!canvas) return
  
  FabricImage.fromURL(url).then((img) => {
    img.set({
      left: 100,
      top: 100,
      scaleX: 0.5,
      scaleY: 0.5,
      ...options
    })
    
    canvas!.add(img)
    canvas!.setActiveObject(img)
    canvas!.renderAll()
  })
}

function addInvoiceElement(type: string) {
  if (!canvas) return
  
  switch (type) {
    case 'companyData':
      addText('Firma GmbH\nMusterstraße 123\n12345 Musterstadt\nTel: +49 123 456789\nEmail: info@firma.de', {
        left: 50,
        top: 50,
        fontSize: 12,
        fontFamily: 'Arial'
      })
      break
      
    case 'customerAddress':
      addRectangle({
        left: 50,
        top: 200,
        width: 200,
        height: 100,
        fill: 'transparent',
        stroke: '#cccccc',
        strokeWidth: 1
      })
      addText('Kundenadresse', {
        left: 60,
        top: 210,
        fontSize: 10,
        fill: '#666666'
      })
      break
      
    case 'invoiceInfo':
      addText('Rechnungsnummer: {RECHNUNGSNUMMER}\nDatum: {DATUM}\nFällig: {FAELLIGKEITSDATUM}', {
        left: 400,
        top: 50,
        fontSize: 11,
        fontFamily: 'Arial',
        textAlign: 'right'
      })
      break
      
    case 'table':
      // Add table header
      addRectangle({
        left: 50,
        top: 350,
        width: 500,
        height: 30,
        fill: '#1e3a8a'
      })
      addText('Pos.\tBeschreibung\tMenge\tPreis\tGesamt', {
        left: 60,
        top: 360,
        fontSize: 11,
        fill: '#ffffff',
        fontFamily: 'Arial'
      })
      // Add table body placeholder
      addRectangle({
        left: 50,
        top: 380,
        width: 500,
        height: 150,
        fill: 'transparent',
        stroke: '#cccccc',
        strokeWidth: 1
      })
      break
      
    case 'totals':
      addText('Zwischensumme:\nMwSt. (19%):\nGesamtsumme:', {
        left: 350,
        top: 550,
        fontSize: 11,
        fontFamily: 'Arial',
        textAlign: 'right'
      })
      addText('{BETRAG_NETTO} €\n{MWST} €\n{BETRAG_BRUTTO} €', {
        left: 500,
        top: 550,
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'right'
      })
      break
      
    case 'footer':
      addLine({
        x1: 50,
        y1: 1050,
        x2: 744,
        y2: 1050,
        stroke: '#cccccc',
        strokeWidth: 1
      })
      addText('Firma GmbH | Bankverbindung: IBAN DE00 0000 0000 0000 0000 00 | BIC: GENODEF1', {
        left: 50,
        top: 1060,
        fontSize: 8,
        fill: '#666666',
        fontFamily: 'Arial'
      })
      break
      
    case 'bankDetails':
      addText('Bankverbindung:\nIBAN: DE00 0000 0000 0000 0000 00\nBIC: GENODEF1\nBank: Musterbank', {
        left: 50,
        top: 650,
        fontSize: 10,
        fontFamily: 'Arial'
      })
      break
      
    case 'colorStripe':
      addRectangle({
        left: 0,
        top: 0,
        width: 794,
        height: 20,
        fill: '#ff006e',
        selectable: true
      })
      break
      
    case 'watermark':
      addText('ENTWURF', {
        left: 300,
        top: 500,
        fontSize: 80,
        fill: 'rgba(0, 0, 0, 0.05)',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        angle: -45
      })
      break
  }
}

function addColoredLine(orientation: 'horizontal' | 'vertical' = 'horizontal') {
  if (!canvas) return
  
  if (orientation === 'horizontal') {
    addLine({
      x1: 50,
      y1: 100,
      x2: 744,
      y2: 100,
      stroke: '#ff006e',
      strokeWidth: 3
    })
  } else {
    addLine({
      x1: 100,
      y1: 50,
      x2: 100,
      y2: 1073,
      stroke: '#ff006e',
      strokeWidth: 3
    })
  }
}

function deleteSelected() {
  if (!canvas) return
  const activeObjects = canvas.getActiveObjects()
  activeObjects.forEach(obj => canvas!.remove(obj))
  canvas.discardActiveObject()
  canvas.renderAll()
}

function getCanvas() {
  return canvas
}

function toJSON() {
  if (!canvas) return null
  return canvas.toJSON()
}

function loadFromJSON(json: any) {
  if (!canvas) return
  canvas.loadFromJSON(json, () => {
    canvas!.renderAll()
  })
}

function clear() {
  if (!canvas) return
  canvas.clear()
  canvas.backgroundColor = props.backgroundColor
  if (props.showGrid) addGrid()
  canvas.renderAll()
}

defineExpose({
  addRectangle,
  addCircle,
  addText,
  addLine,
  addImage,
  addInvoiceElement,
  addColoredLine,
  deleteSelected,
  getCanvas,
  toJSON,
  loadFromJSON,
  clear
})
</script>

<style scoped>
.editor-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  overflow: auto;
  padding: 20px;
}

.canvas-wrapper {
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

canvas {
  display: block;
}
</style>
