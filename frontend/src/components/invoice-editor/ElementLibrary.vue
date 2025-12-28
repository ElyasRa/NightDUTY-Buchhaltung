<template>
  <div class="element-library">
    <h3>📚 Element-Bibliothek</h3>
    <p class="subtitle">Klicken Sie auf ein Element, um es hinzuzufügen</p>

    <div class="library-section">
      <h4>Text & Inhalt</h4>
      <div class="element-list">
        <div 
          v-for="element in textElements" 
          :key="element.type"
          class="element-item" 
          :data-type="element.type"
          @click="handleElementClick(element.type)"
        >
          <span class="element-icon">{{ element.icon }}</span>
          <span class="element-label">{{ element.label }}</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Firmendaten</h4>
      <div class="element-list">
        <div 
          v-for="element in companyElements" 
          :key="element.type"
          class="element-item" 
          :data-type="element.type"
          @click="handleElementClick(element.type)"
        >
          <span class="element-icon">{{ element.icon }}</span>
          <span class="element-label">{{ element.label }}</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Rechnungsdaten</h4>
      <div class="element-list">
        <div 
          v-for="element in invoiceElements" 
          :key="element.type"
          class="element-item" 
          :data-type="element.type"
          @click="handleElementClick(element.type)"
        >
          <span class="element-icon">{{ element.icon }}</span>
          <span class="element-label">{{ element.label }}</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Visuelle Elemente</h4>
      <div class="element-list">
        <div 
          v-for="element in visualElements" 
          :key="element.type"
          class="element-item" 
          :data-type="element.type"
          @click="handleElementClick(element.type)"
        >
          <span class="element-icon">{{ element.icon }}</span>
          <span class="element-label">{{ element.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  elementDrop: [type: string]
}>()

const textElements = ref([
  { type: 'text', icon: '📝', label: 'Textfeld' },
  { type: 'heading', icon: '📰', label: 'Überschrift' }
])

const companyElements = ref([
  { type: 'companyData', icon: '🏢', label: 'Firmendaten' },
  { type: 'logo', icon: '🖼️', label: 'Logo' },
  { type: 'bankDetails', icon: '💳', label: 'Bankverbindung' }
])

const invoiceElements = ref([
  { type: 'customerAddress', icon: '👤', label: 'Kundenadresse' },
  { type: 'invoiceInfo', icon: 'ℹ️', label: 'Rechnungsinfo' },
  { type: 'table', icon: '📋', label: 'Tabelle' },
  { type: 'totals', icon: '💰', label: 'Summen' },
  { type: 'footer', icon: '📄', label: 'Fußzeile' }
])

const visualElements = ref([
  { type: 'colorStripe', icon: '🎨', label: 'Farbstreifen' },
  { type: 'watermark', icon: '💧', label: 'Wasserzeichen' },
  { type: 'box', icon: '◻️', label: 'Box' },
  { type: 'line', icon: '—', label: 'Linie' },
  { type: 'shape', icon: '⭕', label: 'Form' }
])

function handleElementClick(type: string) {
  emit('elementDrop', type)
}
</script>

<style scoped>
.element-library {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
  background: rgba(20, 20, 20, 0.95);
}

.element-library h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1.5rem 0;
}

.library-section {
  margin-bottom: 1.5rem;
}

.library-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.element-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.element-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff006e;
  transform: translateX(4px);
}

.element-item:active {
  transform: translateX(2px);
  background: rgba(255, 0, 110, 0.2);
}

.element-icon {
  font-size: 1.25rem;
}

.element-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Scrollbar */
.element-library::-webkit-scrollbar {
  width: 6px;
}

.element-library::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.element-library::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
