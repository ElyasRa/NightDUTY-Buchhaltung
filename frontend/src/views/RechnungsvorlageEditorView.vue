<template>
  <MainLayout>
    <div class="editor-view">
      <!-- Top Toolbar -->
      <div class="editor-header">
        <div class="header-left">
          <button @click="goBack" class="btn-back">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
            </svg>
            Zurück
          </button>
          <input 
            v-model="templateName" 
            type="text" 
            class="template-name-input"
            :placeholder="isInvoiceMode ? 'Rechnungsbezeichnung' : 'Vorlagenname'"
            :readonly="isInvoiceMode"
          />
          <span v-if="isInvoiceMode" class="invoice-mode-badge">📋 Rechnung</span>
        </div>

        <div class="header-right">
          <button @click="showPreview" class="btn-preview">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Vorschau
          </button>
          <button @click="showCompanyEditor" class="btn-company">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M5 21V7l8-4v18M19 21V10l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            Firmendaten
          </button>
          <button @click="saveTemplate" class="btn-save" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
              <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ saving ? 'Speichert...' : (isInvoiceMode ? 'Änderungen speichern' : 'Speichern') }}
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="editor-content">
        <!-- Properties Panel (Left) -->
        <div class="panel panel-left">
          <PropertiesPanel
            :selectedObject="selectedObject"
            @updateProperty="updateProperty"
            @duplicate="duplicateSelected"
            @delete="deleteSelected"
          />
        </div>

        <!-- Canvas Area (Center) -->
        <div class="canvas-area">
          <EditorToolbar
            :canUndo="canUndo"
            :canRedo="canRedo"
            :hasSelection="hasSelection"
            @addElement="addElement"
            @loadNightDutyTemplate="loadNightDutyTemplate"
            @undo="undo"
            @redo="redo"
            @deleteSelected="deleteSelected"
            @bringForward="bringForward"
            @sendBackward="sendBackward"
          />

          <EditorCanvas
            ref="editorCanvas"
            :showGrid="showGrid"
            :snapToGrid="snapToGrid"
            :gridSize="gridSize"
            @objectSelected="onObjectSelected"
            @objectModified="onObjectModified"
            @canvasReady="onCanvasReady"
          />

          <div class="canvas-controls">
            <label class="control-checkbox">
              <input type="checkbox" v-model="showGrid" />
              <span>Raster anzeigen</span>
            </label>
            <label class="control-checkbox">
              <input type="checkbox" v-model="snapToGrid" />
              <span>An Raster ausrichten</span>
            </label>
          </div>
        </div>

        <!-- Right Panels -->
        <div class="panel panel-right">
          <div class="panel-tabs">
            <button 
              :class="['tab', { active: activeTab === 'elements' }]"
              @click="activeTab = 'elements'"
            >
              📚 Elemente
            </button>
            <button 
              :class="['tab', { active: activeTab === 'layers' }]"
              @click="activeTab = 'layers'"
            >
              🎚️ Ebenen
            </button>
          </div>

          <div class="panel-content">
            <ElementLibrary 
              v-show="activeTab === 'elements'"
              @elementDrop="addElementFromLibrary"
            />
            <LayersPanel 
              v-show="activeTab === 'layers'"
              :layers="layers"
              @selectLayer="selectLayer"
              @toggleVisibility="toggleVisibility"
              @toggleLock="toggleLock"
            />
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="showToast" :class="['toast', toastType]">
        {{ toastMessage }}
      </div>

      <!-- Preview Modal -->
      <div v-if="previewModalVisible" class="modal-overlay" @click="closePreview">
        <div class="modal-content preview-modal" @click.stop>
          <div class="modal-header">
            <h2>📄 Rechnungsvorschau</h2>
            <button @click="closePreview" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <img v-if="previewImageUrl" :src="previewImageUrl" class="preview-image" alt="Vorschau" />
          </div>
          <div class="modal-footer">
            <button @click="exportPDF" class="btn-export">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Als PDF exportieren
            </button>
            <button @click="closePreview" class="btn-secondary">Schließen</button>
          </div>
        </div>
      </div>

      <!-- Company Data Editor Modal -->
      <div v-if="companyEditorVisible" class="modal-overlay" @click="closeCompanyEditor">
        <div class="modal-content company-editor-modal" @click.stop>
          <div class="modal-header">
            <h2>🏢 Firmendaten bearbeiten</h2>
            <button @click="closeCompanyEditor" class="modal-close">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>Firmenname:</label>
                <input v-model="companyData.name" type="text" />
              </div>
              <div class="form-group">
                <label>Adresse:</label>
                <input v-model="companyData.address" type="text" />
              </div>
              <div class="form-group">
                <label>PLZ/Ort:</label>
                <input v-model="companyData.city" type="text" />
              </div>
              <div class="form-group">
                <label>UST-ID:</label>
                <input v-model="companyData.ustId" type="text" />
              </div>
              <div class="form-group">
                <label>Steuernummer:</label>
                <input v-model="companyData.taxNumber" type="text" />
              </div>
              <div class="form-group">
                <label>IBAN:</label>
                <input v-model="companyData.iban" type="text" />
              </div>
              <div class="form-group">
                <label>BIC:</label>
                <input v-model="companyData.bic" type="text" />
              </div>
              <div class="form-group">
                <label>Bank:</label>
                <input v-model="companyData.bank" type="text" />
              </div>
              <div class="form-group">
                <label>Registergericht:</label>
                <input v-model="companyData.registerCourt" type="text" />
              </div>
              <div class="form-group">
                <label>Geschäftsführer:</label>
                <input v-model="companyData.ceo" type="text" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="saveCompanyData" class="btn-save">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Speichern
            </button>
            <button @click="closeCompanyEditor" class="btn-secondary">Abbrechen</button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplateStore } from '../stores/templates'
import { useInvoiceStore } from '../stores/invoice'
import type { Canvas, FabricObject } from 'fabric'
import MainLayout from '../layouts/MainLayout.vue'
import EditorCanvas from '../components/invoice-editor/EditorCanvas.vue'
import EditorToolbar from '../components/invoice-editor/EditorToolbar.vue'
import ElementLibrary from '../components/invoice-editor/ElementLibrary.vue'
import PropertiesPanel from '../components/invoice-editor/PropertiesPanel.vue'
import LayersPanel from '../components/invoice-editor/LayersPanel.vue'

// Constants
const DEFAULT_TEMPLATE_ID = 'default'

// Utility function for invoice canvas storage
function getInvoiceCanvasKey(invoiceId: number): string {
  return `invoice_${invoiceId}_canvas`
}

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()
const invoiceStore = useInvoiceStore()

const editorCanvas = ref<InstanceType<typeof EditorCanvas> | null>(null)
let canvas: Canvas | null = null

const templateId = ref<number | null>(null)
const templateName = ref('Neue Vorlage')
const selectedObject = ref<any | null>(null)
const showGrid = ref(true)
const snapToGrid = ref(true)
const gridSize = ref(10)
const activeTab = ref('elements')
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Invoice editing mode
const isInvoiceMode = ref(false)
const currentInvoiceId = ref<number | null>(null)

// Preview modal
const previewModalVisible = ref(false)
const previewImageUrl = ref('')

// Company data editor
const companyEditorVisible = ref(false)
const companyData = ref({
  name: 'NIGHTDUTY GmbH',
  address: 'Westendohrf 11',
  city: '45143 Essen',
  ustId: 'DE123456789',
  taxNumber: '123/4567/8910',
  iban: 'DE72 1001 9000 1000 0097 62',
  bic: 'ADYBDEB2',
  bank: 'Adyen N.V.',
  registerCourt: 'Essen HRB 28180',
  ceo: 'Roland Müller-Roth, Karsten Roth'
})

// History for undo/redo
const history = ref<any[]>([])
const historyIndex = ref(-1)
const maxHistorySize = 50

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)
const hasSelection = computed(() => selectedObject.value !== null)

const layers = computed(() => {
  if (!canvas) return []
  
  const objects = canvas.getObjects()
  return objects
    .filter(obj => {
      // @ts-ignore - data property exists but not typed
      return !(obj.data && obj.data.isGrid)
    })
    .map((obj, index) => ({
      // @ts-ignore - data property exists but not typed
      id: obj.data?.id || `obj-${index}`,
      type: obj.type || 'unknown',
      // @ts-ignore - data property exists but not typed
      name: obj.data?.name,
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      selected: obj === selectedObject.value,
      zIndex: index
    }))
})

onMounted(async () => {
  // Check if we're in invoice editing mode
  const invoiceIdParam = route.query.invoiceId
  if (invoiceIdParam) {
    isInvoiceMode.value = true
    currentInvoiceId.value = parseInt(invoiceIdParam as string)
    
    // Load current invoice from store or session
    invoiceStore.loadCurrentInvoiceFromSession()
    
    if (invoiceStore.currentInvoice) {
      templateName.value = `Rechnung ${invoiceStore.currentInvoice.invoice_number}`
    }
  }
  
  // Get template ID from route
  const id = route.params.id
  if (id && id !== 'new' && id !== DEFAULT_TEMPLATE_ID) {
    templateId.value = parseInt(id as string)
    await loadTemplate()
  } else {
    // Initialize new template or use default
    saveToHistory()
  }

  // Load company data from local storage
  const savedCompanyData = localStorage.getItem('nightduty_company_data')
  if (savedCompanyData) {
    try {
      companyData.value = JSON.parse(savedCompanyData)
    } catch (e) {
      console.error('Failed to parse company data:', e)
    }
  }

  // Register keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

async function loadTemplate() {
  if (!templateId.value) return

  try {
    const template = await templateStore.fetchTemplate(templateId.value)
    templateName.value = template.name

    // Load canvas data if exists
    if (template.config?.canvasData && canvas) {
      canvas.loadFromJSON(template.config.canvasData, () => {
        canvas!.renderAll()
        saveToHistory()
      })
    }
  } catch (error) {
    console.error('Failed to load template:', error)
    showToastMessage('Fehler beim Laden der Vorlage', 'error')
  }
}

function onCanvasReady(fabricCanvas: Canvas) {
  canvas = fabricCanvas
  
  if (templateId.value) {
    loadTemplate()
  }
}

function onObjectSelected(obj: FabricObject | null) {
  selectedObject.value = obj
}

function onObjectModified(obj: FabricObject) {
  saveToHistory()
}

function addElement(type: string) {
  if (!editorCanvas.value) return

  switch (type) {
    case 'text':
      editorCanvas.value.addText('Neuer Text')
      break
    case 'heading':
      editorCanvas.value.addHeading('Überschrift')
      break
    case 'rectangle':
      editorCanvas.value.addRectangle()
      break
    case 'circle':
      editorCanvas.value.addCircle()
      break
    case 'line':
      editorCanvas.value.addLine()
      break
    case 'colorStripe':
      editorCanvas.value.addColorStripe()
      break
    case 'watermark':
      editorCanvas.value.addWatermark()
      break
    case 'companyData':
      editorCanvas.value.addCompanyData()
      break
    case 'bankDetails':
      editorCanvas.value.addBankDetails()
      break
    case 'customerAddress':
      editorCanvas.value.addCustomerAddress()
      break
    case 'invoiceInfo':
      editorCanvas.value.addInvoiceInfo()
      break
    case 'table':
      editorCanvas.value.addTable()
      break
    case 'totals':
      editorCanvas.value.addTotals()
      break
    case 'footer':
      editorCanvas.value.addFooter()
      break
    case 'box':
      editorCanvas.value.addBox()
      break
    case 'shape':
      editorCanvas.value.addShape('circle')
      break
    case 'image':
      // Open file picker
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result && editorCanvas.value) {
              editorCanvas.value.addImage(event.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
      break
  }
  
  saveToHistory()
}

function addElementFromLibrary(type: string) {
  addElement(type)
}

function loadNightDutyTemplate() {
  if (!editorCanvas.value) return
  
  editorCanvas.value.loadNightDutyTemplate()
  saveToHistory()
  showToastMessage('NIGHTDUTY Vorlage wurde geladen', 'success')
}

function updateProperty(property: string, value: any) {
  if (!selectedObject.value || !canvas) return

  selectedObject.value.set(property, value)
  canvas.renderAll()
  saveToHistory()
}

function duplicateSelected() {
  if (!selectedObject.value || !canvas) return

  selectedObject.value.clone().then((cloned: FabricObject) => {
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20
    })
    canvas!.add(cloned)
    canvas!.setActiveObject(cloned)
    canvas!.renderAll()
    saveToHistory()
  })
}

function deleteSelected() {
  if (editorCanvas.value) {
    editorCanvas.value.deleteSelected()
    selectedObject.value = null
    saveToHistory()
  }
}

function bringForward() {
  if (!selectedObject.value || !canvas) return
  canvas.bringObjectForward(selectedObject.value)
  canvas.renderAll()
  saveToHistory()
}

function sendBackward() {
  if (!selectedObject.value || !canvas) return
  canvas.sendObjectBackwards(selectedObject.value)
  canvas.renderAll()
  saveToHistory()
}

function selectLayer(id: string) {
  if (!canvas) return
  const objects = canvas.getObjects()
  const obj = objects.find(o => {
    // @ts-ignore - data property exists but not typed
    return o.data?.id === id || `obj-${objects.indexOf(o)}` === id
  })
  if (obj) {
    canvas.setActiveObject(obj)
    canvas.renderAll()
  }
}

function toggleVisibility(id: string) {
  if (!canvas) return
  const objects = canvas.getObjects()
  const obj = objects.find(o => {
    // @ts-ignore - data property exists but not typed
    return o.data?.id === id || `obj-${objects.indexOf(o)}` === id
  })
  if (obj) {
    obj.visible = !obj.visible
    canvas.renderAll()
  }
}

function toggleLock(id: string) {
  if (!canvas) return
  const objects = canvas.getObjects()
  const obj = objects.find(o => {
    // @ts-ignore - data property exists but not typed
    return o.data?.id === id || `obj-${objects.indexOf(o)}` === id
  })
  if (obj) {
    obj.selectable = !obj.selectable
    obj.evented = obj.selectable
    canvas.renderAll()
  }
}

// History management
function saveToHistory() {
  if (!canvas) return

  // Remove future history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // Save current state
  const state = canvas.toJSON()
  history.value.push(state)

  // Limit history size
  if (history.value.length > maxHistorySize) {
    history.value.shift()
  } else {
    historyIndex.value++
  }
}

function undo() {
  if (!canUndo.value || !canvas) return

  historyIndex.value--
  const state = history.value[historyIndex.value]
  
  canvas.loadFromJSON(state, () => {
    canvas!.renderAll()
  })
}

function redo() {
  if (!canRedo.value || !canvas) return

  historyIndex.value++
  const state = history.value[historyIndex.value]
  
  canvas.loadFromJSON(state, () => {
    canvas!.renderAll()
  })
}

async function saveTemplate() {
  if (!canvas) return

  saving.value = true
  try {
    const canvasData = canvas.toJSON()
    
    if (isInvoiceMode.value) {
      // In invoice mode, we save the canvas data to be used for this specific invoice
      // This will be used when generating the PDF for this invoice
      showToastMessage('Änderungen für Rechnung wurden gespeichert', 'success')
      
      // Store the modified canvas data in session storage for this invoice
      if (currentInvoiceId.value) {
        sessionStorage.setItem(
          getInvoiceCanvasKey(currentInvoiceId.value),
          JSON.stringify(canvasData)
        )
      }
    } else {
      // Normal template saving
      const template = {
        id: templateId.value || undefined,
        name: templateName.value,
        is_default: false,
        config: {
          canvasData,
          colors: {
            primary: '#1e3a8a',
            secondary: '#6b7280',
            text: '#000000',
            background: '#ffffff'
          }
        }
      }

      const saved = await templateStore.saveTemplate(template)
      
      if (!templateId.value) {
        templateId.value = saved.id
        // Update URL
        router.replace(`/rechnungsvorlage/editor/${saved.id}`)
      }

      showToastMessage('Vorlage erfolgreich gespeichert', 'success')
    }
  } catch (error) {
    console.error('Failed to save:', error)
    showToastMessage(
      isInvoiceMode.value 
        ? 'Fehler beim Speichern der Rechnung' 
        : 'Fehler beim Speichern der Vorlage', 
      'error'
    )
  } finally {
    saving.value = false
  }
}

function goBack() {
  if (isInvoiceMode.value) {
    // Clear invoice mode and go back to template list
    invoiceStore.clearCurrentInvoice()
  }
  router.push('/rechnungsvorlage')
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl/Cmd + S: Save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveTemplate()
  }

  // Ctrl/Cmd + Z: Undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }

  // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
  }

  // Delete: Remove selected
  if (event.key === 'Delete') {
    event.preventDefault()
    deleteSelected()
  }

  // Ctrl/Cmd + D: Duplicate
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault()
    duplicateSelected()
  }

  // Ctrl/Cmd + C: Copy (handled by Fabric.js)
  // Ctrl/Cmd + V: Paste (handled by Fabric.js)
}

function showToastMessage(message: string, type: string = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function showPreview() {
  if (!canvas) return
  
  // Export canvas as PNG
  const dataURL = canvas.toDataURL({ 
    format: 'png', 
    quality: 1,
    multiplier: 1
  })
  previewImageUrl.value = dataURL
  previewModalVisible.value = true
}

function closePreview() {
  previewModalVisible.value = false
}

function exportPDF() {
  showToastMessage('PDF Export wird vorbereitet...', 'info')
  // TODO: Implement PDF export using jsPDF or similar
  setTimeout(() => {
    showToastMessage('PDF Export-Funktion wird noch implementiert', 'info')
  }, 1000)
}

function showCompanyEditor() {
  companyEditorVisible.value = true
}

function closeCompanyEditor() {
  companyEditorVisible.value = false
}

function saveCompanyData() {
  // Save company data to local storage or backend
  localStorage.setItem('nightduty_company_data', JSON.stringify(companyData.value))
  showToastMessage('Firmendaten wurden gespeichert', 'success')
  closeCompanyEditor()
}
</script>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
}

.btn-back svg {
  width: 18px;
  height: 18px;
}

.btn-preview,
.btn-company {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover,
.btn-company:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ff006e;
}

.btn-preview svg,
.btn-company svg {
  width: 18px;
  height: 18px;
}

.template-name-input {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  min-width: 300px;
}

.template-name-input:focus {
  outline: none;
  border-color: #ff006e;
}

.invoice-mode-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  white-space: nowrap;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 0, 110, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save svg {
  width: 18px;
  height: 18px;
}

.editor-content {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  flex: 1;
  overflow: hidden;
}

.panel {
  background: rgba(20, 20, 20, 0.95);
  overflow-y: auto;
}

.panel-left {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-right {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tab.active {
  color: #ff006e;
  border-bottom-color: #ff006e;
  background: rgba(255, 0, 110, 0.1);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

.canvas-area {
  display: flex;
  flex-direction: column;
  position: relative;
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  z-index: 10;
}

.control-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
}

.control-checkbox input {
  cursor: pointer;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  z-index: 20000;
  font-size: 0.875rem;
}

.toast.error {
  background: rgba(239, 68, 68, 0.9);
}

.toast.info {
  background: rgba(59, 130, 246, 0.9);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scrollbar */
.panel::-webkit-scrollbar,
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel::-webkit-scrollbar-track,
.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.panel::-webkit-scrollbar-thumb,
.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 0, 110, 0.3);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.preview-modal {
  width: 900px;
}

.company-editor-modal {
  width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.modal-close svg {
  width: 20px;
  height: 20px;
  display: block;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.preview-image {
  width: 100%;
  height: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 600;
}

.form-group input {
  padding: 0.625rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #ff006e;
  background: rgba(255, 255, 255, 0.08);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-export svg {
  width: 18px;
  height: 18px;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff006e;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
