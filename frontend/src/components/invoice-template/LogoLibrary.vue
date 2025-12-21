<template>
  <div class="logo-library">
    <div class="library-header">
      <h3>🖼️ Logo-Bibliothek</h3>
      <label class="upload-btn">
        <input
          type="file"
          multiple
          accept="image/*"
          @change="onFileSelect"
          style="display: none"
        />
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Upload
      </label>
    </div>

    <div v-if="store.loadingLogos" class="loading">
      <div class="spinner"></div>
      <p>Lade Logos...</p>
    </div>

    <div v-else-if="store.logos.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
        <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>Keine Logos vorhanden</p>
      <p class="hint">Klicken Sie auf "Upload" um Logos hinzuzufügen</p>
    </div>

    <div v-else class="logo-grid">
      <div
        v-for="logo in store.logos"
        :key="logo.id"
        class="logo-item"
      >
        <div class="logo-preview">
          <img :src="getLogoUrl(logo.url)" :alt="logo.name" />
        </div>
        <div class="logo-info">
          <span class="logo-name" :title="logo.name">{{ logo.name }}</span>
          <span class="logo-size">{{ formatFileSize(logo.size) }}</span>
        </div>
        <div class="logo-actions">
          <button
            @click="addToTemplate(logo)"
            class="action-btn"
            title="Zur Vorlage hinzufügen"
          >
            👁️
          </button>
          <button
            @click="deleteLogo(logo)"
            class="action-btn delete"
            title="Löschen"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInvoiceTemplateStore } from '../../stores/invoiceTemplate'
import type { Logo, LogoElement } from '../../stores/invoiceTemplate'
import { API_BASE_URL } from '../../config'

const store = useInvoiceTemplateStore()
const uploading = ref(false)

const emit = defineEmits<{
  logoAdded: [logo: Logo]
}>()

onMounted(async () => {
  await store.fetchLogos()
})

const getLogoUrl = (url: string) => {
  if (url.startsWith('http')) return url
  return `${API_BASE_URL.replace('/api', '')}${url}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const onFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return
  
  uploading.value = true
  
  try {
    const fileArray = Array.from(files)
    await store.uploadLogos(fileArray)
    
    // Reset input
    target.value = ''
  } catch (error) {
    console.error('Failed to upload logos:', error)
    alert('Fehler beim Hochladen der Logos')
  } finally {
    uploading.value = false
  }
}

const addToTemplate = (logo: Logo) => {
  if (!store.currentTemplate) {
    alert('Bitte wählen Sie zuerst eine Vorlage aus')
    return
  }

  // Create a new logo element
  const logoElement: LogoElement = {
    id: `logo-${Date.now()}`,
    type: 'logo',
    logoId: logo.id,
    url: logo.url,
    x: 100,
    y: 100,
    width: 150,
    height: 80,
    zIndex: 0
  }

  store.addElement(logoElement)
  emit('logoAdded', logo)
}

const deleteLogo = async (logo: Logo) => {
  if (!confirm(`Möchten Sie "${logo.name}" wirklich löschen?`)) {
    return
  }

  try {
    await store.deleteLogo(logo.id)
  } catch (error) {
    console.error('Failed to delete logo:', error)
    alert('Fehler beim Löschen des Logos')
  }
}
</script>

<style scoped>
.logo-library {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.library-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 0, 110, 0.3);
}

.upload-btn svg {
  width: 14px;
  height: 14px;
}

.loading,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 0, 110, 0.3);
  border-top-color: #ff006e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.empty-state .hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0.25rem;
}

.logo-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.logo-item:hover {
  border-color: rgba(255, 0, 110, 0.3);
  transform: translateY(-2px);
}

.logo-preview {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  overflow: hidden;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-info {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.logo-name {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.logo-size {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.5);
}

.logo-actions {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Scrollbar */
.logo-grid::-webkit-scrollbar {
  width: 6px;
}

.logo-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.logo-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
