<template>
  <MainLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>📄 Rechnungsvorlagen</h1>
          <p>Verwalten Sie Ihre Rechnungsvorlagen</p>
        </div>
        <button @click="createNewTemplate" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Neue Vorlage
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Lade Vorlagen...</p>
      </div>

      <div v-else class="templates-grid">
        <div 
          v-for="template in templateStore.sortedTemplates" 
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
            <div class="template-header">
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

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Vorlage löschen?</h2>
            <button @click="showDeleteModal = false" class="close-btn">
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

      <!-- Editor Modal -->
      <div v-if="showEditorModal" class="modal-overlay editor-modal" @click="closeEditor">
        <div class="modal editor-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingTemplate?.id ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen' }}</h2>
            <button @click="closeEditor" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          
          <div v-if="editingTemplate && editingTemplate.config" class="editor-layout">
            <!-- Left Sidebar: Template List -->
            <div class="editor-sidebar">
              <h3>Vorlagenname</h3>
              <input 
                v-model="editingTemplate.name" 
                type="text" 
                placeholder="z.B. Meine Vorlage"
                class="form-input"
              />
              
              <h3>Basis auswählen</h3>
              <select v-model="selectedBaseTemplate" @change="applyBaseTemplate" class="form-select">
                <option value="">-- Wählen Sie eine Basis --</option>
                <option value="klassisch">Klassisch</option>
                <option value="modern">Modern</option>
                <option value="corporate">Corporate</option>
                <option value="colorful">Colorful</option>
                <option value="elegant">Elegant</option>
                <option value="simple">Simple</option>
              </select>

              <div class="form-section">
                <h3>Farben</h3>
                <div class="color-input">
                  <label>Primärfarbe</label>
                  <input 
                    v-model="editingTemplate.config.colors.primary" 
                    type="color"
                  />
                </div>
                <div class="color-input">
                  <label>Sekundärfarbe</label>
                  <input 
                    v-model="editingTemplate.config.colors.secondary" 
                    type="color"
                  />
                </div>
                <div class="color-input">
                  <label>Textfarbe</label>
                  <input 
                    v-model="editingTemplate.config.colors.text" 
                    type="color"
                  />
                </div>
              </div>
            </div>

            <!-- Main Preview Area -->
            <div class="editor-main">
              <div class="preview-paper" :style="getPaperStyle()">
                <div class="preview-text">Vorschau-Bereich</div>
                <div class="color-preview" :style="{ background: editingTemplate.config.colors.primary }">
                  Primärfarbe
                </div>
              </div>
            </div>

            <!-- Right Sidebar: Properties -->
            <div class="editor-properties">
              <h3>Eigenschaften</h3>
              
              <div class="form-section">
                <h4>Firmendaten</h4>
                <div class="form-group">
                  <label>Firmenname</label>
                  <input v-model="editingTemplate.config.companyData.name" type="text" />
                </div>
                <div class="form-group">
                  <label>Adresse</label>
                  <input v-model="editingTemplate.config.companyData.address" type="text" />
                </div>
                <div class="form-group">
                  <label>Stadt</label>
                  <input v-model="editingTemplate.config.companyData.city" type="text" />
                </div>
                <div class="form-group">
                  <label>Telefon</label>
                  <input v-model="editingTemplate.config.companyData.phone" type="text" />
                </div>
                <div class="form-group">
                  <label>E-Mail</label>
                  <input v-model="editingTemplate.config.companyData.email" type="email" />
                </div>
              </div>

              <div class="form-section">
                <h4>Bankverbindung</h4>
                <div class="form-group">
                  <label>IBAN</label>
                  <input v-model="editingTemplate.config.bankDetails.iban" type="text" />
                </div>
                <div class="form-group">
                  <label>BIC</label>
                  <input v-model="editingTemplate.config.bankDetails.bic" type="text" />
                </div>
                <div class="form-group">
                  <label>Bank</label>
                  <input v-model="editingTemplate.config.bankDetails.bank" type="text" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditor" class="btn-secondary">Abbrechen</button>
            <button @click="saveTemplate" class="btn-primary" :disabled="saving">
              {{ saving ? 'Speichert...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success Toast -->
      <div v-if="showToast" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTemplateStore } from '../stores/templates'
import type { InvoiceTemplate } from '../stores/templates'
import MainLayout from '../layouts/MainLayout.vue'

const templateStore = useTemplateStore()
const loading = ref(false)
const showDeleteModal = ref(false)
const showEditorModal = ref(false)
const templateToDelete = ref<InvoiceTemplate | null>(null)
const editingTemplate = ref<Partial<InvoiceTemplate> | null>(null)
const selectedBaseTemplate = ref('')
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

onMounted(async () => {
  loading.value = true
  try {
    await templateStore.fetchTemplates()
  } catch (error) {
    console.error('Failed to load templates:', error)
    showToastMessage('Fehler beim Laden der Vorlagen', 'error')
  } finally {
    loading.value = false
  }
})

function getPreviewStyle(template: InvoiceTemplate) {
  return {
    borderTop: `4px solid ${template.config?.colors?.primary || '#1e3a8a'}`,
    background: template.config?.colors?.background || '#ffffff'
  }
}

function getPaperStyle() {
  if (!editingTemplate.value?.config) return {}
  return {
    background: editingTemplate.value.config.colors?.background || '#ffffff'
  }
}

function createNewTemplate() {
  editingTemplate.value = {
    name: 'Neue Vorlage',
    is_default: false,
    config: {
      logo: { x: 330, y: 65, width: 220, height: 80, url: '/images/logo.png' },
      companyData: {
        x: 340, y: 165,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 9,
        color: '#000000'
      },
      bankDetails: {
        x: 50, y: 745,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 6
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#6b7280',
        text: '#000000',
        background: '#ffffff'
      },
      table: {
        x: 50, y: 350, width: 495,
        headerBg: '#f3f4f6',
        headerText: '#000000',
        rowBg: '#ffffff',
        alternateRowBg: '#fafafa',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50, y: 735, width: 495,
        text: 'NIGHTDUTY GmbH • Westendohrf 11 • 45143 Essen',
        fontSize: 7,
        color: '#64748b'
      }
    }
  }
  showEditorModal.value = true
}

function editTemplate(template: InvoiceTemplate) {
  editingTemplate.value = JSON.parse(JSON.stringify(template))
  showEditorModal.value = true
}

function applyBaseTemplate() {
  // Base template application will be implemented in future enhancement
  // For now, users can create templates from scratch
  if (selectedBaseTemplate.value) {
    showToastMessage(`Hinweis: Basis-Templates werden in einem zukünftigen Update unterstützt`, 'info')
  }
}

function closeEditor() {
  showEditorModal.value = false
  editingTemplate.value = null
  selectedBaseTemplate.value = ''
}

async function saveTemplate() {
  if (!editingTemplate.value || !editingTemplate.value.name?.trim()) {
    showToastMessage('Bitte geben Sie einen Namen ein', 'error')
    return
  }

  saving.value = true
  try {
    await templateStore.saveTemplate(editingTemplate.value)
    showToastMessage('Vorlage erfolgreich gespeichert', 'success')
    closeEditor()
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
  padding: 2rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
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
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 0, 110, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 0, 110, 0.4);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

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

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: rgba(20, 20, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
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
  height: 250px;
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
  align-items: flex-start;
}

.preview-logo {
  width: 80px;
  height: 30px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.preview-info {
  width: 100px;
  height: 40px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.preview-table {
  flex: 1;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-top: 1rem;
}

.preview-footer {
  height: 20px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.template-info {
  padding: 1rem;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.template-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.default-badge {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
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
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.btn-danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.btn-danger svg {
  color: #ff6b6b;
}

/* Modal Styles */
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
  z-index: 1000;
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

.editor-modal .modal {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem 0;
}

.warning-text {
  color: #ff6b6b;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-danger.btn-secondary {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ff6b6b;
}

.btn-danger.btn-secondary:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Editor Layout */
.editor-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow: hidden;
}

.editor-sidebar,
.editor-properties {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
}

.editor-sidebar h3,
.editor-properties h3,
.editor-properties h4 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.editor-properties h4 {
  font-size: 0.8rem;
  margin-top: 1rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #ff006e;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
}

.color-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.color-input label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.color-input input[type="color"] {
  width: 60px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

.editor-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
}

.preview-paper {
  width: 595px;
  height: 842px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.preview-text {
  color: #666;
  font-size: 1.5rem;
  font-weight: 600;
}

.color-preview {
  width: 200px;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
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
  z-index: 2000;
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
.editor-sidebar::-webkit-scrollbar,
.editor-properties::-webkit-scrollbar {
  width: 6px;
}

.editor-sidebar::-webkit-scrollbar-track,
.editor-properties::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.editor-sidebar::-webkit-scrollbar-thumb,
.editor-properties::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
