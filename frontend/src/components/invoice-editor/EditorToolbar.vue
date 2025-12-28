<template>
  <div class="editor-toolbar">
    <div class="toolbar-section">
      <button @click="emit('addElement', 'text')" class="tool-btn" title="Text hinzufügen">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="2"/>
        </svg>
        Text
      </button>

      <button @click="emit('addElement', 'rectangle')" class="tool-btn" title="Rechteck">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
        </svg>
        Rechteck
      </button>

      <button @click="emit('addElement', 'circle')" class="tool-btn" title="Kreis">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
        Kreis
      </button>

      <button @click="emit('addElement', 'line')" class="tool-btn" title="Linie">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14" stroke="currentColor" stroke-width="2"/>
        </svg>
        Linie
      </button>

      <button @click="emit('addElement', 'image')" class="tool-btn" title="Bild hochladen">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2"/>
        </svg>
        Bild
      </button>
    </div>

    <div class="toolbar-section">
      <button @click="emit('undo')" :disabled="!canUndo" class="tool-btn" title="Rückgängig (Ctrl+Z)">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 7v6h6" stroke="currentColor" stroke-width="2"/>
          <path d="M21 13a9 9 0 11-18 0 9 9 0 0118 0" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button @click="emit('redo')" :disabled="!canRedo" class="tool-btn" title="Wiederholen (Ctrl+Y)">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M21 7v6h-6" stroke="currentColor" stroke-width="2"/>
          <path d="M3 13a9 9 0 1018 0 9 9 0 00-18 0" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button @click="emit('deleteSelected')" :disabled="!hasSelection" class="tool-btn" title="Löschen (DELETE)">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <div class="toolbar-section">
      <button @click="emit('bringForward')" :disabled="!hasSelection" class="tool-btn" title="Nach vorne">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button @click="emit('sendBackward')" :disabled="!hasSelection" class="tool-btn" title="Nach hinten">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  canUndo?: boolean
  canRedo?: boolean
  hasSelection?: boolean
}

withDefaults(defineProps<Props>(), {
  canUndo: false,
  canRedo: false,
  hasSelection: false
})

const emit = defineEmits<{
  addElement: [type: string]
  undo: []
  redo: []
  deleteSelected: []
  bringForward: []
  sendBackward: []
}>()
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-section:last-child {
  border-right: none;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff006e;
  transform: translateY(-1px);
}

.tool-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tool-btn svg {
  width: 20px;
  height: 20px;
}
</style>
