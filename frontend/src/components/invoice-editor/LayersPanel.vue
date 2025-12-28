<template>
  <div class="layers-panel">
    <h3>🎚️ Ebenen</h3>
    
    <div v-if="layers.length > 0" class="layers-list">
      <div 
        v-for="layer in sortedLayers" 
        :key="layer.id"
        :class="['layer-item', { selected: layer.selected }]"
        @click="emit('selectLayer', layer.id)"
      >
        <div class="layer-info">
          <span class="layer-icon">{{ getLayerIcon(layer.type) }}</span>
          <span class="layer-name">{{ getLayerName(layer) }}</span>
        </div>
        
        <div class="layer-actions">
          <button 
            @click.stop="emit('toggleVisibility', layer.id)"
            class="icon-btn"
            :title="layer.visible ? 'Ausblenden' : 'Einblenden'"
          >
            <svg v-if="layer.visible" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <button 
            @click.stop="emit('toggleLock', layer.id)"
            class="icon-btn"
            :title="layer.locked ? 'Entsperren' : 'Sperren'"
          >
            <svg v-if="layer.locked" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" stroke="currentColor" stroke-width="2" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" stroke="currentColor" stroke-width="2" rx="2"/>
              <path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-layers">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>Keine Ebenen</p>
      <span>Fügen Sie Elemente zur Leinwand hinzu, um Ebenen zu erstellen.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Layer {
  id: string
  type: string
  name?: string
  visible: boolean
  locked: boolean
  selected: boolean
  zIndex: number
}

interface Props {
  layers: Layer[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectLayer: [id: string]
  toggleVisibility: [id: string]
  toggleLock: [id: string]
}>()

const sortedLayers = computed(() => {
  return [...props.layers].sort((a, b) => b.zIndex - a.zIndex)
})

function getLayerIcon(type: string): string {
  const icons: Record<string, string> = {
    'i-text': '📝',
    'text': '📝',
    'rect': '◻️',
    'rectangle': '◻️',
    'circle': '⭕',
    'line': '—',
    'image': '🖼️',
    'companyData': '🏢',
    'logo': '🎨',
    'table': '📋'
  }
  return icons[type] || '📄'
}

function getLayerName(layer: Layer): string {
  if (layer.name) return layer.name
  
  const names: Record<string, string> = {
    'i-text': 'Text',
    'text': 'Text',
    'rect': 'Rechteck',
    'rectangle': 'Rechteck',
    'circle': 'Kreis',
    'line': 'Linie',
    'image': 'Bild',
    'companyData': 'Firmendaten',
    'logo': 'Logo',
    'table': 'Tabelle'
  }
  return names[layer.type] || 'Element'
}
</script>

<style scoped>
.layers-panel {
  height: 100%;
  overflow-y: auto;
  background: rgba(20, 20, 20, 0.95);
  padding: 1rem;
}

.layers-panel h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.layer-item.selected {
  background: rgba(255, 0, 110, 0.2);
  border-color: #ff006e;
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.layer-icon {
  font-size: 1.25rem;
}

.layer-name {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.layer-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  width: 28px;
  height: 28px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.no-layers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  min-height: 300px;
}

.no-layers svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.no-layers p {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.no-layers span {
  font-size: 0.75rem;
  max-width: 200px;
}

/* Scrollbar */
.layers-panel::-webkit-scrollbar {
  width: 6px;
}

.layers-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.layers-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
