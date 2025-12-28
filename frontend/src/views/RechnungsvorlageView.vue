<template>
  <MainLayout>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>📄 Rechnungsvorlagen</h1>
          <p>Erstellen und bearbeiten Sie Ihre Rechnungsvorlagen mit Drag & Drop</p>
        </div>
        <div class="header-actions">
          <button v-if="!showEditor" @click="createNewTemplate" class="btn-primary">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Neue Vorlage
          </button>
          <button v-if="showEditor" @click="saveCurrentTemplate" class="btn-primary" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
              <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ saving ? 'Speichert...' : 'Speichern' }}
          </button>
          <button v-if="showEditor" @click="closeEditor" class="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Schließen
          </button>
        </div>
      </div>

      <!-- Template List View -->
      <div v-if="!showEditor">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Lade Vorlagen...</p>
        </div>

        <div v-else class="templates-grid">
          <div 
            v-for="template in sortedTemplates" 
            :key="template.id" 
            class="template-card"
            :class="{ 'is-default': template.is_default }"
          >
            <div class="template-preview">
              <div class="preview-content" :style="getPreviewStyle(template)">
                <div class="preview-header">
                  <div class="preview-logo"></div>
                  <div class="preview-info"></div>
                </div>
                <div class="preview-table"></div>
                <div class="preview-footer"></div>
              </div>
            </div>

            <div class="template-info">
              <div class="template-header-card">
                <h3>{{ template.name }}</h3>
                <span v-if="template.is_default" class="default-badge">Standard</span>
              </div>
              
              <div class="template-actions">
                <button @click="editTemplate(template)" class="btn-icon" title="Bearbeiten">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                
                <button 
                  v-if="!template.is_default" 
                  @click="setAsDefault(template.id)" 
                  class="btn-icon" 
                  title="Als Standard setzen"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                
                <button 
                  v-if="!template.is_default" 
                  @click="confirmDelete(template)" 
                  class="btn-icon btn-danger" 
                  title="Löschen"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor View (3-column layout) -->
      <div v-else class="editor-view">
        <div class="editor-layout">
          <!-- Left Sidebar -->
          <div class="sidebar sidebar-left">
            <div class="sidebar-section">
              <h3>Vorlagenname</h3>
              <input 
                v-model="editorStore.currentTemplate.name" 
                type="text" 
                placeholder="z.B. Meine Vorlage"
                class="form-input"
              />
            </div>

            <div class="sidebar-section">
              <h3>Farben</h3>
              <div class="color-input">
                <label>Primärfarbe</label>
                <input 
                  v-model="editorStore.currentTemplate.config.colors.primary" 
                  type="color"
                />
              </div>
              <div class="color-input">
                <label>Sekundärfarbe</label>
                <input 
                  v-model="editorStore.currentTemplate.config.colors.secondary" 
                  type="color"
                />
              </div>
              <div class="color-input">
                <label>Textfarbe</label>
                <input 
                  v-model="editorStore.currentTemplate.config.colors.text" 
                  type="color"
                />
              </div>
            </div>

            <div class="sidebar-section">
              <div class="grid-controls">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="editorStore.showGrid" @change="editorStore.toggleGrid()" />
                  <span>Raster anzeigen</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="editorStore.snapToGrid" @change="editorStore.toggleSnap()" />
                  <span>An Raster ausrichten</span>
                </label>
              </div>
            </div>

            <div class="sidebar-section">
              <div class="undo-redo-controls">
                <button 
                  @click="editorStore.undo()" 
                  :disabled="!editorStore.canUndo"
                  class="control-btn"
                  title="Rückgängig (Ctrl+Z)"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 7v6h6" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 13a9 9 0 1018 0 9 9 0 00-18 0" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  @click="editorStore.redo()" 
                  :disabled="!editorStore.canRedo"
                  class="control-btn"
                  title="Wiederholen (Ctrl+Y)"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 7v6h-6" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 13a9 9 0 11-18 0 9 9 0 0118 0" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Main Canvas Area -->
          <div class="editor-main">
            <TemplateCanvas
              :elements="editorStore.currentTemplate.config.elements"
              :selectedElement="editorStore.selectedElement"
              :zoom="editorStore.zoom"
              :showGrid="editorStore.showGrid"
              :snapToGrid="editorStore.snapToGrid"
              :gridSize="editorStore.gridSize"
              :mode="editorStore.previewMode"
              :testData="editorStore.getTestInvoiceData"
              @elementUpdate="onElementUpdate"
              @elementSelect="onElementSelect"
              @elementContextMenu="onElementContextMenu"
              @modeChange="onModeChange"
              @zoomChange="onZoomChange"
              @exportPdf="exportPdf"
            />
          </div>

          <!-- Right Sidebar (Tabs) -->
          <div class="sidebar sidebar-right">
            <div class="sidebar-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['tab-btn', { active: activeTab === tab.id }]"
                :title="tab.label"
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </div>

            <div class="sidebar-content">
              <!-- Logos Tab -->
              <div v-show="activeTab === 'logos'" class="tab-content">
                <LogoLibrary @logoAdded="onLogoAdded" />
              </div>

              <!-- Firmendaten Tab -->
              <div v-show="activeTab === 'company'" class="tab-content">
                <CompanyDataForm
                  :modelValue="editorStore.currentTemplate.config.companyData"
                  @update="onCompanyDataUpdate"
                />
              </div>

              <!-- Bank Tab -->
              <div v-show="activeTab === 'bank'" class="tab-content">
                <BankDetailsForm
                  :modelValue="editorStore.currentTemplate.config.bankDetails"
                  @update="onBankDetailsUpdate"
                />
              </div>

              <!-- Elements Tab -->
              <div v-show="activeTab === 'elements'" class="tab-content">
                <ElementToolbar @addElement="onAddElement" />
              </div>

              <!-- Properties Tab -->
              <div v-show="activeTab === 'properties'" class="tab-content">
                <PropertyPanel
                  :selectedElement="editorStore.selectedElement"
                  @update="onPropertyUpdate"
                  @close="editorStore.selectElement(null)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Vorlage löschen?</h2>
            <button @click="showDeleteModal = false" class="close-btn-modal">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>Möchten Sie die Vorlage "{{ templateToDelete?.name }}" wirklich löschen?</p>
            <p class="warning-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn-secondary">Abbrechen</button>
            <button @click="deleteTemplate" class="btn-danger">Löschen</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div v-if="showToast" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '../stores/templates'
import { useInvoiceTemplateStore } from '../stores/invoiceTemplate'
import type { InvoiceTemplate } from '../stores/templates'
import type { TemplateElement, TemplateConfig } from '../stores/invoiceTemplate'
import MainLayout from '../layouts/MainLayout.vue'
import TemplateCanvas from '../components/invoice-template/TemplateCanvas.vue'
import LogoLibrary from '../components/invoice-template/LogoLibrary.vue'
import CompanyDataForm from '../components/invoice-template/CompanyDataForm.vue'
import BankDetailsForm from '../components/invoice-template/BankDetailsForm.vue'
import ElementToolbar from '../components/invoice-template/ElementToolbar.vue'
import PropertyPanel from '../components/invoice-template/PropertyPanel.vue'

const templateStore = useTemplateStore()
const editorStore = useInvoiceTemplateStore()

const loading = ref(false)
const showEditor = ref(false)
const showDeleteModal = ref(false)
const templateToDelete = ref<InvoiceTemplate | null>(null)
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const activeTab = ref('logos')

const tabs = [
  { id: 'logos', icon: '🖼️', label: 'Logos' },
  { id: 'company', icon: '🏢', label: 'Firmendaten' },
  { id: 'bank', icon: '💳', label: 'Bank' },
  { id: 'elements', icon: '➕', label: 'Elemente' },
  { id: 'properties', icon: '⚙️', label: 'Eigenschaften' }
]

const sortedTemplates = computed(() => templateStore.sortedTemplates)

onMounted(async () => {
  loading.value = true
  try {
    await templateStore.fetchTemplates()
    
    // Automatisch Standard-Vorlage laden und im Editor öffnen
    const defaultTemplate = templateStore.templates.find(t => t.is_default)
    if (defaultTemplate) {
      console.log('Loading default template:', defaultTemplate.name)
      editTemplate(defaultTemplate)
    } else if (templateStore.templates.length > 0) {
      // Falls kein Standard: Erstes Template laden
      console.log('Loading first template:', templateStore.templates[0].name)
      editTemplate(templateStore.templates[0])
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
    showToastMessage('Fehler beim Laden der Vorlagen', 'error')
  } finally {
    loading.value = false
  }
  
  // Register keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown)
})

function getPreviewStyle(template: InvoiceTemplate) {
  const config = template.config as any
  return {
    borderTop: `4px solid ${config?.colors?.primary || '#1e3a8a'}`,
    background: config?.colors?.background || '#ffffff'
  }
}

function createNewTemplate() {
  const newTemplate: any = {
    name: 'Neue Vorlage',
    is_default: false,
    config: {
      elements: [],
      colors: {
        primary: '#1e3a8a',
        secondary: '#6b7280',
        text: '#000000',
        background: '#ffffff'
      },
      companyData: {
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de'
      },
      bankDetails: {
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank'
      },
      grid: {
        enabled: true,
        size: 10,
        snap: true
      }
    }
  }
  
  editorStore.setCurrentTemplate(newTemplate as InvoiceTemplate)
  showEditor.value = true
}

function editTemplate(template: InvoiceTemplate) {
  // Convert old template format to new format if needed
  const templateConfig = template.config as any
  
  if (!templateConfig.elements) {
    // Migrate old format to new format
    const migratedConfig: TemplateConfig = {
      elements: [],
      colors: templateConfig.colors || {
        primary: '#1e3a8a',
        secondary: '#6b7280',
        text: '#000000',
        background: '#ffffff'
      },
      companyData: templateConfig.companyData || {
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        website: ''
      },
      bankDetails: templateConfig.bankDetails || {
        iban: '',
        bic: '',
        bank: ''
      },
      grid: {
        enabled: true,
        size: 10,
        snap: true
      }
    }
    
    // Convert logos array (new format) to elements
    if (templateConfig.logos && Array.isArray(templateConfig.logos)) {
      migratedConfig.elements = templateConfig.logos.map((logo: any) => ({
        id: logo.id || `logo-${Date.now()}`,
        type: 'logo' as const,
        x: logo.x,
        y: logo.y,
        width: logo.width,
        height: logo.height,
        zIndex: 1,
        logoId: logo.id || `logo-${Date.now()}`,
        url: logo.url,
        locked: false,
        visible: true
      }))
    }
    // Convert old single logo format (legacy support)
    else if (templateConfig.logo) {
      migratedConfig.elements = [{
        id: 'logo-main',
        type: 'logo' as const,
        x: templateConfig.logo.x,
        y: templateConfig.logo.y,
        width: templateConfig.logo.width,
        height: templateConfig.logo.height,
        zIndex: 1,
        logoId: 'logo-main',
        url: templateConfig.logo.url,
        locked: false,
        visible: true
      }]
    }
    
    template.config = migratedConfig
  }
  
  editorStore.setCurrentTemplate(JSON.parse(JSON.stringify(template)))
  showEditor.value = true
}

function closeEditor() {
  showEditor.value = false
  editorStore.setCurrentTemplate(null)
}

async function saveCurrentTemplate() {
  if (!editorStore.currentTemplate) return
  
  saving.value = true
  try {
    await templateStore.saveTemplate(editorStore.currentTemplate)
    showToastMessage('Vorlage erfolgreich gespeichert', 'success')
  } catch (error) {
    console.error('Failed to save template:', error)
    showToastMessage('Fehler beim Speichern der Vorlage', 'error')
  } finally {
    saving.value = false
  }
}

function confirmDelete(template: InvoiceTemplate) {
  templateToDelete.value = template
  showDeleteModal.value = true
}

async function deleteTemplate() {
  if (!templateToDelete.value) return

  try {
    await templateStore.deleteTemplate(templateToDelete.value.id)
    showToastMessage('Vorlage erfolgreich gelöscht', 'success')
    showDeleteModal.value = false
    templateToDelete.value = null
  } catch (error: any) {
    console.error('Failed to delete template:', error)
    showToastMessage(error.response?.data?.error || 'Fehler beim Löschen', 'error')
  }
}

async function setAsDefault(id: number) {
  try {
    await templateStore.setDefault(id)
    showToastMessage('Standard-Vorlage erfolgreich gesetzt', 'success')
  } catch (error) {
    console.error('Failed to set default:', error)
    showToastMessage('Fehler beim Setzen der Standard-Vorlage', 'error')
  }
}

// Editor event handlers
function onElementUpdate(element: TemplateElement) {
  editorStore.updateElement(element.id, element)
}

function onElementSelect(element: TemplateElement | null) {
  editorStore.selectElement(element)
  if (element) {
    activeTab.value = 'properties'
  }
}

function onElementContextMenu(action: string, element: TemplateElement) {
  switch (action) {
    case 'properties':
      editorStore.selectElement(element)
      activeTab.value = 'properties'
      break
    case 'duplicate':
      editorStore.duplicateElement(element.id)
      break
    case 'forward':
      editorStore.moveElementForward(element.id)
      break
    case 'backward':
      editorStore.moveElementBackward(element.id)
      break
    case 'delete':
      editorStore.removeElement(element.id)
      break
  }
}

function onModeChange(mode: 'editor' | 'test') {
  editorStore.setPreviewMode(mode)
}

function onZoomChange(zoom: number) {
  editorStore.setZoom(zoom)
}

function onAddElement(element: TemplateElement) {
  editorStore.addElement(element)
}

function onLogoAdded() {
  showToastMessage('Logo zur Vorlage hinzugefügt', 'success')
}

function onCompanyDataUpdate(data: any) {
  if (editorStore.currentTemplate) {
    editorStore.currentTemplate.config.companyData = data
  }
}

function onBankDetailsUpdate(data: any) {
  if (editorStore.currentTemplate) {
    editorStore.currentTemplate.config.bankDetails = data
  }
}

function onPropertyUpdate(property: string, value: any) {
  if (editorStore.selectedElement) {
    editorStore.updateElement(editorStore.selectedElement.id, {
      [property]: value
    })
  }
}

function exportPdf() {
  showToastMessage('PDF-Export wird in einem zukünftigen Update verfügbar sein', 'info')
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (!showEditor.value) return
  
  // Ctrl/Cmd + S: Save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveCurrentTemplate()
  }
  
  // Ctrl/Cmd + Z: Undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    editorStore.undo()
  }
  
  // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    editorStore.redo()
  }
  
  // Delete: Remove selected element
  if (event.key === 'Delete' && editorStore.selectedElement) {
    event.preventDefault()
    editorStore.removeElement(editorStore.selectedElement.id)
  }
  
  // Ctrl/Cmd + D: Duplicate selected element
  if ((event.ctrlKey || event.metaKey) && event.key === 'd' && editorStore.selectedElement) {
    event.preventDefault()
    editorStore.duplicateElement(editorStore.selectedElement.id)
  }
  
  // Arrow keys: Move selected element
  if (editorStore.selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    const step = event.shiftKey ? 10 : 1
    const element = editorStore.selectedElement
    
    switch (event.key) {
      case 'ArrowUp':
        editorStore.updateElement(element.id, { y: element.y - step })
        break
      case 'ArrowDown':
        editorStore.updateElement(element.id, { y: element.y + step })
        break
      case 'ArrowLeft':
        editorStore.updateElement(element.id, { x: element.x - step })
        break
      case 'ArrowRight':
        editorStore.updateElement(element.id, { x: element.x + step })
        break
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

function showToastMessage(message: string, type: string = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  background: rgba(20, 20, 20, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 0, 110, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 0, 110, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 0, 110, 0.3);
  border-top-color: #ff006e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  overflow-y: auto;
}

.template-card {
  background: rgba(20, 20, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 0, 110, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.template-card.is-default {
  border-color: rgba(255, 0, 110, 0.5);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.2);
}

.template-preview {
  height: 200px;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.preview-content {
  width: 100%;
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
}

.preview-logo {
  width: 60px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.preview-info {
  width: 80px;
  height: 32px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.preview-table {
  flex: 1;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-top: 0.75rem;
}

.preview-footer {
  height: 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.template-info {
  padding: 1rem;
}

.template-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.template-header-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.default-badge {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.btn-icon.btn-danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.btn-icon.btn-danger svg {
  color: #ff6b6b;
}

/* Editor View */
.editor-view {
  flex: 1;
  overflow: hidden;
}

.editor-layout {
  display: grid;
  grid-template-columns: 250px 1fr 320px;
  height: 100%;
  gap: 0;
}

.sidebar {
  background: rgba(20, 20, 20, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.sidebar-right {
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-section h3 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #ff006e;
}

.color-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}

.color-input label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.color-input input[type="color"] {
  width: 50px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

.grid-controls,
.undo-redo-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.undo-redo-controls {
  flex-direction: row;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.control-btn {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff006e;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn svg {
  width: 18px;
  height: 18px;
}

.sidebar-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #ff006e;
  border-bottom-color: #ff006e;
  background: rgba(255, 0, 110, 0.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.tab-content {
  height: 100%;
}

.editor-main {
  position: relative;
  overflow: hidden;
}

/* Modal */
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
  z-index: 10000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.modal {
  background: #1e293b;
  border: 1px solid rgba(255, 0, 110, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.close-btn-modal {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-modal:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn-modal svg {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.6);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.75rem 0;
}

.warning-text {
  color: #ff6b6b;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #ff6b6b;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
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
.sidebar::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar,
.templates-grid::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track,
.templates-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.sidebar::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb,
.templates-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
