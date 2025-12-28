<template>
  <div class="template-card" :class="{ 'is-default': template.is_default }">
    <div class="card-preview">
      <div class="preview-badge" v-if="template.is_default">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
        </svg>
        Standard
      </div>
      <canvas ref="previewCanvas" width="200" height="283"></canvas>
    </div>

    <div class="card-content">
      <h3>{{ template.name }}</h3>
      <p class="card-date">
        Erstellt: {{ formatDate(template.created_at) }}
      </p>

      <div class="card-actions">
        <button @click="emit('edit', template)" class="btn-action primary" title="Bearbeiten">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Bearbeiten
        </button>

        <button 
          v-if="!template.is_default"
          @click="emit('setDefault', template.id)" 
          class="btn-action" 
          title="Als Standard setzen"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>

        <button 
          v-if="!template.is_default"
          @click="emit('delete', template)" 
          class="btn-action danger" 
          title="Löschen"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Template {
  id: number
  name: string
  is_default: boolean
  config: any
  created_at: string
  updated_at: string
}

interface Props {
  template: Template
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [template: Template]
  setDefault: [id: number]
  delete: [template: Template]
}>()

const previewCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  renderPreview()
})

function renderPreview() {
  if (!previewCanvas.value) return
  
  const ctx = previewCanvas.value.getContext('2d')
  if (!ctx) return

  // Draw white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 200, 283)

  // Draw colored header bar
  ctx.fillStyle = props.template.config?.colors?.primary || '#1e3a8a'
  ctx.fillRect(0, 0, 200, 8)

  // Draw logo placeholder
  ctx.fillStyle = '#e5e5e5'
  ctx.fillRect(15, 20, 40, 20)

  // Draw text lines
  ctx.fillStyle = '#d1d5db'
  ctx.fillRect(15, 50, 80, 4)
  ctx.fillRect(15, 58, 60, 4)
  ctx.fillRect(15, 66, 70, 4)

  // Draw table
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(15, 90, 170, 80)
  
  ctx.fillStyle = '#d1d5db'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(20, 100 + i * 16, 160, 8)
  }

  // Draw footer
  ctx.fillStyle = '#e5e5e5'
  ctx.fillRect(15, 260, 170, 3)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
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

.card-preview {
  position: relative;
  height: 283px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 12px;
  z-index: 1;
}

.preview-badge svg {
  width: 12px;
  height: 12px;
}

canvas {
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 1rem;
}

.card-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem 0;
}

.card-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 1rem 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.primary {
  flex: 1;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  border-color: transparent;
  color: white;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  transform: translateY(-1px);
}

.btn-action.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-action.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.btn-action svg {
  width: 14px;
  height: 14px;
}
</style>
