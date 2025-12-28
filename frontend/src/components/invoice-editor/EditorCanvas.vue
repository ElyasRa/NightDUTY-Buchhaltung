<template>
  <div class="editor-canvas-container">
    <div class="canvas-wrapper" ref="canvasWrapper">
      <canvas ref="fabricCanvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Canvas, FabricObject, Rect, Circle, IText, Line, Image as FabricImage, Textbox, Group, FabricText } from 'fabric'

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

  // Configure Fabric.js controls (pink handles, rotation)
  FabricObject.prototype.set({
    transparentCorners: false,
    cornerColor: '#ec4899',
    cornerStyle: 'circle',
    borderColor: '#ec4899',
    cornerSize: 12,
    padding: 5,
    borderDashArray: [5, 5],
    hasRotatingPoint: true
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

// NIGHTDUTY-specific elements
function addColorStripe(color = '#C00000', options = {}) {
  if (!canvas) return
  
  const stripe = new Rect({
    left: 0,
    top: 0,
    width: 794,
    height: 15,
    fill: color,
    selectable: true,
    ...options
  })
  
  canvas.add(stripe)
  canvas.setActiveObject(stripe)
  canvas.renderAll()
  return stripe
}

function addWatermark(options = {}) {
  if (!canvas) return
  
  const watermark = new FabricText('NIGHTDUTY', {
    left: 397,
    top: 561,
    fontSize: 180,
    fontFamily: 'Arial Black',
    fill: '#000000',
    opacity: 0.05,
    angle: -45,
    originX: 'center',
    originY: 'center',
    selectable: true,
    ...options
  })
  
  canvas.add(watermark)
  canvas.setActiveObject(watermark)
  canvas.renderAll()
  return watermark
}

function addCompanyData(options = {}) {
  if (!canvas) return
  
  const companyData = new Textbox(
    'NIGHTDUTY GmbH\nWestendohrf 11\n45143 Essen',
    {
      left: 50,
      top: 210,
      width: 200,
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#000000',
      ...options
    }
  )
  
  canvas.add(companyData)
  canvas.setActiveObject(companyData)
  canvas.renderAll()
  return companyData
}

function addBankDetails(options = {}) {
  if (!canvas) return
  
  const box = new Rect({
    left: 530,
    top: 255,
    width: 220,
    height: 110,
    fill: '#fff8f0',
    stroke: '#ff6600',
    strokeWidth: 2,
    ...options
  })
  
  const text = new Textbox(
    'Die Bankdaten der NIGHTDUTY GmbH\n\nIBAN: DE72 1001 9000 1000 0097 62\nBIC: ADYBDEB2\nBank: Adyen N.V.\n\nIBAN: BE74 9679 3908 0507\nBIC: TRWIBEB1XXX\nBank: Wise Europe',
    {
      left: 540,
      top: 265,
      width: 200,
      fontSize: 8,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  
  const group = new Group([box, text], {
    left: 530,
    top: 255,
    selectable: true
  })
  
  canvas.add(group)
  canvas.setActiveObject(group)
  canvas.renderAll()
  return group
}

function addCustomerAddress(options = {}) {
  if (!canvas) return
  
  const address = new Textbox(
    'Abschleppdienst Rudolph GmbH\nStraße 9 Nr. 11\n13059 Berlin',
    {
      left: 50,
      top: 165,
      width: 200,
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#000000',
      ...options
    }
  )
  
  canvas.add(address)
  canvas.setActiveObject(address)
  canvas.renderAll()
  return address
}

function addInvoiceInfo(options = {}) {
  if (!canvas) return
  
  const box = new Rect({
    left: 530,
    top: 145,
    width: 220,
    height: 100,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1
  })
  
  const text = new Textbox(
    'Datum: 06.12.2025\nKundennummer: NDY-NBCNDY-10244\nRechnungsnr: 202500568\nKundenbetreuer: Yassine Ratbi',
    {
      left: 540,
      top: 155,
      width: 200,
      fontSize: 9,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  
  const group = new Group([box, text], {
    left: 530,
    top: 145,
    selectable: true,
    ...options
  })
  
  canvas.add(group)
  canvas.setActiveObject(group)
  canvas.renderAll()
  return group
}

function addTable(options = {}) {
  if (!canvas) return
  
  const headerBg = new Rect({ left: 0, top: 0, width: 694, height: 25, fill: '#f0f0f0' })
  const headerLine = new Line([0, 25, 694, 25], { stroke: '#000', strokeWidth: 1 })
  
  const headers = [
    new FabricText('Art-Nr.', { left: 10, top: 7, fontSize: 9, fontWeight: 'bold', fill: '#000000' }),
    new FabricText('Bezeichnung', { left: 80, top: 7, fontSize: 9, fontWeight: 'bold', fill: '#000000' }),
    new FabricText('Menge', { left: 400, top: 7, fontSize: 9, fontWeight: 'bold', fill: '#000000' }),
    new FabricText('E-Preis netto', { left: 480, top: 7, fontSize: 9, fontWeight: 'bold', fill: '#000000' }),
    new FabricText('Betrag netto', { left: 600, top: 7, fontSize: 9, fontWeight: 'bold', fill: '#000000' })
  ]
  
  const rowData = [
    new FabricText('SB-131', { left: 10, top: 35, fontSize: 9, fill: '#000000' }),
    new FabricText('Rufbereitschaftsdienst B', { left: 80, top: 35, fontSize: 9, fill: '#000000' }),
    new FabricText('310 Std.', { left: 400, top: 35, fontSize: 9, fill: '#000000' }),
    new FabricText('7,00 €', { left: 480, top: 35, fontSize: 9, fill: '#000000' }),
    new FabricText('2.170,00 €', { left: 580, top: 35, fontSize: 9, fill: '#000000' })
  ]
  
  const table = new Group([headerBg, headerLine, ...headers, ...rowData], {
    left: 50,
    top: 440,
    selectable: true,
    ...options
  })
  
  canvas.add(table)
  canvas.setActiveObject(table)
  canvas.renderAll()
  return table
}

function addTotals(options = {}) {
  if (!canvas) return
  
  const totals = new Textbox(
    'Nettobetrag:              2.170,00 €\nUmsatzsteuer 19%:           412,30 €\nRechnungsbetrag:          2.582,30 €',
    {
      left: 450,
      top: 550,
      width: 294,
      fontSize: 10,
      textAlign: 'right',
      fontFamily: 'Arial',
      fill: '#000000',
      ...options
    }
  )
  
  canvas.add(totals)
  canvas.setActiveObject(totals)
  canvas.renderAll()
  return totals
}

function addFooter(options = {}) {
  if (!canvas) return
  
  const footer = new Textbox(
    'NIGHTDUTY GmbH • Westendohrf 11 • D-45143 Essen\nIBAN: DE 72 1001 9000 1000 0097 62  •  BIC: ADYBDEB2\nRegistergericht Essen  HRB 28180  •  Geschäftsführer: Roland Müller-Roth, Karsten Roth',
    {
      left: 50,
      top: 1060,
      width: 694,
      fontSize: 7,
      textAlign: 'center',
      fill: '#666666',
      fontFamily: 'Arial',
      ...options
    }
  )
  
  canvas.add(footer)
  canvas.setActiveObject(footer)
  canvas.renderAll()
  return footer
}

function addHeading(text = 'INVOICE/Rechnung', options = {}) {
  if (!canvas) return
  
  const heading = new FabricText(text, {
    left: 50,
    top: 400,
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Arial',
    ...options
  })
  
  canvas.add(heading)
  canvas.setActiveObject(heading)
  canvas.renderAll()
  return heading
}

function addBox(options = {}) {
  if (!canvas) return
  
  const box = new Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 100,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 2,
    ...options
  })
  
  canvas.add(box)
  canvas.setActiveObject(box)
  canvas.renderAll()
  return box
}

function addShape(type = 'circle', options = {}) {
  if (!canvas) return
  
  if (type === 'circle') {
    return addCircle(options)
  } else {
    return addRectangle(options)
  }
}

function loadNightDutyTemplate() {
  if (!canvas) return
  
  // Clear canvas
  canvas.clear()
  canvas.backgroundColor = props.backgroundColor
  
  // 1. Color stripes at top
  const colors = [
    { color: '#C00000', height: 15 },
    { color: '#FFFFFF', height: 3 },
    { color: '#0033A0', height: 3 },
    { color: '#808080', height: 3 }
  ]
  
  let y = 0
  colors.forEach(stripe => {
    const rect = new Rect({
      left: 0,
      top: y,
      width: 794,
      height: stripe.height,
      fill: stripe.color,
      selectable: true
    })
    canvas!.add(rect)
    y += stripe.height
  })
  
  // 2. Watermark
  const watermark = new FabricText('NIGHTDUTY', {
    left: 397,
    top: 561,
    fontSize: 180,
    fill: '#000000',
    opacity: 0.05,
    angle: -45,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Arial Black',
    selectable: true
  })
  canvas.add(watermark)
  canvas.sendObjectToBack(watermark)
  
  // 3. Company data header
  const companyHeader = new Textbox(
    'NIGHTDUTY GmbH - Westendohrf 11 - 45143 Essen',
    {
      left: 50,
      top: 40,
      width: 300,
      fontSize: 8,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(companyHeader)
  
  // 4. Logo placeholder
  const logoBox = new Rect({
    left: 640,
    top: 50,
    width: 100,
    height: 80,
    fill: '#f0f0f0',
    stroke: '#ccc',
    strokeWidth: 1,
    selectable: true
  })
  const logoText = new FabricText('LOGO', {
    left: 665,
    top: 80,
    fontSize: 16,
    fill: '#999999'
  })
  canvas.add(logoBox, logoText)
  
  // 5. Customer address
  const customerAddress = new Textbox(
    'Abschleppdienst Rudolph GmbH\nStraße 9 Nr. 11\n13059 Berlin',
    {
      left: 50,
      top: 165,
      width: 200,
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(customerAddress)
  
  // 6. Info box
  const infoBox = new Rect({
    left: 530,
    top: 145,
    width: 220,
    height: 100,
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1,
    selectable: true
  })
  canvas.add(infoBox)
  
  const infoText = new Textbox(
    'Datum: 06.12.2025\nKundennummer: NDY-NBCNDY-10244\nRechnungsnr: 202500568\nKundenbetreuer: Yassine Ratbi',
    {
      left: 540,
      top: 155,
      width: 200,
      fontSize: 9,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(infoText)
  
  // 7. Bank details box
  const bankBox = new Rect({
    left: 530,
    top: 255,
    width: 220,
    height: 110,
    fill: '#fff8f0',
    stroke: '#ff6600',
    strokeWidth: 2,
    selectable: true
  })
  canvas.add(bankBox)
  
  const bankText = new Textbox(
    'Die Bankdaten der NIGHTDUTY GmbH\n\nIBAN: DE72 1001 9000 1000 0097 62\nBIC: ADYBDEB2\nBank: Adyen N.V.\n\nIBAN: BE74 9679 3908 0507\nBIC: TRWIBEB1XXX\nBank: Wise Europe',
    {
      left: 540,
      top: 265,
      width: 200,
      fontSize: 8,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(bankText)
  
  // 8. Heading
  const heading = new FabricText('INVOICE/Rechnung 202500568', {
    left: 50,
    top: 400,
    fontSize: 16,
    fontWeight: 'bold',
    fill: '#000000',
    fontFamily: 'Arial'
  })
  canvas.add(heading)
  
  // 9. Table (simplified)
  const tableHeaderBg = new Rect({
    left: 50,
    top: 440,
    width: 694,
    height: 25,
    fill: '#f0f0f0',
    selectable: false
  })
  canvas.add(tableHeaderBg)
  
  const tableHeaders = [
    { text: 'Art-Nr.', left: 60 },
    { text: 'Bezeichnung', left: 130 },
    { text: 'Menge', left: 450 },
    { text: 'E-Preis netto', left: 530 },
    { text: 'Betrag netto', left: 650 }
  ]
  
  tableHeaders.forEach(header => {
    const text = new FabricText(header.text, {
      left: header.left,
      top: 447,
      fontSize: 9,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial'
    })
    canvas!.add(text)
  })
  
  const tableLine = new Line([50, 465, 744, 465], {
    stroke: '#000',
    strokeWidth: 1,
    selectable: false
  })
  canvas.add(tableLine)
  
  // Example row
  const rowData = [
    { text: 'SB-131', left: 60 },
    { text: 'Rufbereitschaftsdienst B', left: 130 },
    { text: '310 Std.', left: 450 },
    { text: '7,00 €', left: 530 },
    { text: '2.170,00 €', left: 630 }
  ]
  
  rowData.forEach(data => {
    const text = new FabricText(data.text, {
      left: data.left,
      top: 475,
      fontSize: 9,
      fill: '#000000',
      fontFamily: 'Arial'
    })
    canvas!.add(text)
  })
  
  // 10. Totals
  const totals = new Textbox(
    'Nettobetrag:              2.170,00 €\nUmsatzsteuer 19%:           412,30 €\nRechnungsbetrag:          2.582,30 €',
    {
      left: 450,
      top: 550,
      width: 294,
      fontSize: 10,
      textAlign: 'right',
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(totals)
  
  // 11. Payment text
  const paymentText = new Textbox(
    'Wir bedanken uns für die partnerschaftliche Zusammenarbeit und bitten um Begleichung des Rechnungsbetrages bis zum 13.12.2025 auf die unten angegebene Kontonummer.',
    {
      left: 50,
      top: 650,
      width: 694,
      fontSize: 9,
      fontFamily: 'Arial',
      fill: '#000000'
    }
  )
  canvas.add(paymentText)
  
  // 12. Partner logos placeholder
  const partnerBox = new Rect({
    left: 560,
    top: 950,
    width: 180,
    height: 100,
    fill: '#f9f9f9',
    stroke: '#ddd',
    strokeWidth: 1,
    selectable: true
  })
  canvas.add(partnerBox)
  
  const partnerText = new FabricText('Partner-Logos', {
    left: 595,
    top: 990,
    fontSize: 10,
    fill: '#999999'
  })
  canvas.add(partnerText)
  
  // 13. Footer
  const footer = new Textbox(
    'NIGHTDUTY GmbH • Westendohrf 11 • D-45143 Essen\nIBAN: DE 72 1001 9000 1000 0097 62  •  BIC: ADYBDEB2\nRegistergericht Essen  HRB 28180  •  Geschäftsführer: Roland Müller-Roth, Karsten Roth',
    {
      left: 50,
      top: 1060,
      width: 694,
      fontSize: 7,
      textAlign: 'center',
      fill: '#666666',
      fontFamily: 'Arial'
    }
  )
  canvas.add(footer)
  
  // 14. Bottom color stripes
  y = 1099
  colors.reverse().forEach(stripe => {
    y -= stripe.height
    const rect = new Rect({
      left: 0,
      top: y,
      width: 794,
      height: stripe.height,
      fill: stripe.color,
      selectable: true
    })
    canvas!.add(rect)
  })
  
  canvas.renderAll()
}

defineExpose({
  addRectangle,
  addCircle,
  addText,
  addLine,
  addImage,
  addHeading,
  addColorStripe,
  addWatermark,
  addCompanyData,
  addBankDetails,
  addCustomerAddress,
  addInvoiceInfo,
  addTable,
  addTotals,
  addFooter,
  addBox,
  addShape,
  deleteSelected,
  getCanvas,
  toJSON,
  loadFromJSON,
  clear,
  loadNightDutyTemplate
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
