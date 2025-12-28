<template>
  <div class="properties-panel">
    <div v-if="selectedObject" class="panel-content">
      <h3>⚙️ Eigenschaften</h3>
      
      <div class="property-section">
        <h4>Position</h4>
        <div class="property-group">
          <label>
            X:
            <input type="number" v-model.number="left" @change="updateProperty('left', left)" />
          </label>
          <label>
            Y:
            <input type="number" v-model.number="top" @change="updateProperty('top', top)" />
          </label>
        </div>
      </div>

      <div class="property-section">
        <h4>Größe</h4>
        <div class="property-group">
          <label>
            Breite:
            <input type="number" v-model.number="width" @change="updateProperty('width', width)" />
          </label>
          <label>
            Höhe:
            <input type="number" v-model.number="height" @change="updateProperty('height', height)" />
          </label>
        </div>
      </div>

      <div class="property-section" v-if="objectType === 'i-text'">
        <h4>Text</h4>
        <div class="property-group">
          <label>
            Schriftart:
            <select v-model="fontFamily" @change="updateProperty('fontFamily', fontFamily)">
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
              <option value="Verdana">Verdana</option>
            </select>
          </label>
          <label>
            Schriftgröße:
            <input type="number" v-model.number="fontSize" @change="updateProperty('fontSize', fontSize)" />
          </label>
        </div>
      </div>

      <div class="property-section">
        <h4>Farbe</h4>
        <div class="property-group">
          <label>
            Füllfarbe:
            <input type="color" v-model="fill" @change="updateProperty('fill', fill)" />
          </label>
          <label v-if="objectType !== 'line'">
            Rahmenfarbe:
            <input type="color" v-model="stroke" @change="updateProperty('stroke', stroke)" />
          </label>
          <label v-if="objectType !== 'line'">
            Rahmenbreite:
            <input type="number" v-model.number="strokeWidth" @change="updateProperty('strokeWidth', strokeWidth)" min="0" max="20" />
          </label>
        </div>
      </div>

      <div class="property-section">
        <h4>Transformationen</h4>
        <div class="property-group">
          <label>
            Drehung (°):
            <input type="number" v-model.number="angle" @change="updateProperty('angle', angle)" min="0" max="360" />
          </label>
          <label>
            Transparenz:
            <input type="range" v-model.number="opacity" @change="updateProperty('opacity', opacity)" min="0" max="1" step="0.1" />
            <span>{{ Math.round(opacity * 100) }}%</span>
          </label>
        </div>
      </div>

      <div class="property-actions">
        <button @click="emit('duplicate')" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          Duplizieren
        </button>
        <button @click="emit('delete')" class="action-btn danger">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
          Löschen
        </button>
      </div>
    </div>

    <div v-else class="no-selection">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>Kein Element ausgewählt</p>
      <span>Wählen Sie ein Element auf der Leinwand aus, um seine Eigenschaften zu bearbeiten.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FabricObject } from 'fabric'

interface Props {
  selectedObject: FabricObject | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateProperty: [property: string, value: any]
  duplicate: []
  delete: []
}>()

const left = ref(0)
const top = ref(0)
const width = ref(0)
const height = ref(0)
const fill = ref('#000000')
const stroke = ref('#000000')
const strokeWidth = ref(1)
const angle = ref(0)
const opacity = ref(1)
const fontFamily = ref('Arial')
const fontSize = ref(20)
const objectType = ref('')

watch(() => props.selectedObject, (obj) => {
  if (obj) {
    left.value = Math.round(obj.left || 0)
    top.value = Math.round(obj.top || 0)
    width.value = Math.round((obj.width || 0) * (obj.scaleX || 1))
    height.value = Math.round((obj.height || 0) * (obj.scaleY || 1))
    fill.value = (obj.fill as string) || '#000000'
    stroke.value = (obj.stroke as string) || '#000000'
    strokeWidth.value = obj.strokeWidth || 1
    angle.value = Math.round(obj.angle || 0)
    opacity.value = obj.opacity || 1
    objectType.value = obj.type || ''
    
    if (obj.type === 'i-text') {
      fontFamily.value = (obj as any).fontFamily || 'Arial'
      fontSize.value = (obj as any).fontSize || 20
    }
  }
}, { immediate: true })

function updateProperty(property: string, value: any) {
  emit('updateProperty', property, value)
}
</script>

<style scoped>
.properties-panel {
  height: 100%;
  overflow-y: auto;
  background: rgba(20, 20, 20, 0.95);
  padding: 1rem;
}

.panel-content h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.property-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.property-section:last-of-type {
  border-bottom: none;
}

.property-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.property-group label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.property-group input[type="number"],
.property-group select {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
}

.property-group input[type="color"] {
  height: 40px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.property-group input[type="range"] {
  width: 100%;
}

.property-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff006e;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  min-height: 300px;
}

.no-selection svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-selection p {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.no-selection span {
  font-size: 0.75rem;
  max-width: 200px;
}

/* Scrollbar */
.properties-panel::-webkit-scrollbar {
  width: 6px;
}

.properties-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.properties-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
