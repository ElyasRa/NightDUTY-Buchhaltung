<template>
  <div class="element-toolbar">
    <h3>➕ Elemente hinzufügen</h3>
    
    <div class="toolbar-buttons">
      <button @click="addTextElement" class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Textfeld</span>
      </button>

      <button @click="addPlaceholderElement" class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
          <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Platzhalter</span>
      </button>

      <button @click="addLineElement('horizontal')" class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>H-Linie</span>
      </button>

      <button @click="addLineElement('vertical')" class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>V-Linie</span>
      </button>

      <button @click="addTableElement" class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
          <path d="M3 9h18M3 15h18M12 3v18" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Tabelle</span>
      </button>
    </div>

    <div class="help-text">
      <p>💡 Tipp: Klicken Sie auf ein Element in der Logo-Bibliothek, um es zur Vorlage hinzuzufügen.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { 
  TextElement, 
  PlaceholderElement, 
  LineElement, 
  TableElement 
} from '../../stores/invoiceTemplate'

const emit = defineEmits<{
  addElement: [element: TextElement | PlaceholderElement | LineElement | TableElement]
}>()

const addTextElement = () => {
  const textElement: TextElement = {
    id: uuidv4(),
    type: 'text',
    content: 'Neuer Text',
    x: 100,
    y: 100,
    width: 200,
    height: 40,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    zIndex: 0
  }
  emit('addElement', textElement)
}

const addPlaceholderElement = () => {
  const placeholderElement: PlaceholderElement = {
    id: uuidv4(),
    type: 'placeholder',
    placeholder: '{RECHNUNGSNUMMER}',
    x: 100,
    y: 150,
    width: 200,
    height: 30,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    zIndex: 0
  }
  emit('addElement', placeholderElement)
}

const addLineElement = (orientation: 'horizontal' | 'vertical') => {
  const lineElement: LineElement = {
    id: uuidv4(),
    type: 'line',
    orientation,
    x: 100,
    y: 200,
    width: orientation === 'horizontal' ? 300 : 2,
    height: orientation === 'horizontal' ? 2 : 100,
    thickness: 2,
    color: '#000000',
    zIndex: 0
  }
  emit('addElement', lineElement)
}

const addTableElement = () => {
  const tableElement: TableElement = {
    id: uuidv4(),
    type: 'table',
    x: 50,
    y: 350,
    width: 495,
    height: 200,
    headerBg: '#f3f4f6',
    headerText: '#000000',
    rowBg: '#ffffff',
    alternateRowBg: '#fafafa',
    columns: [
      { name: 'Pos', width: 40 },
      { name: 'Beschreibung', width: 200 },
      { name: 'Menge', width: 60 },
      { name: 'Preis', width: 80 },
      { name: 'Gesamt', width: 80 }
    ],
    zIndex: 0
  }
  emit('addElement', tableElement)
}
</script>

<style scoped>
.element-toolbar {
  padding: 1rem;
}

h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toolbar-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 110, 0.3);
  transform: translateY(-2px);
}

.tool-btn:active {
  transform: translateY(0);
}

.tool-btn svg {
  width: 24px;
  height: 24px;
}

.tool-btn span {
  font-size: 0.75rem;
  font-weight: 500;
}

.help-text {
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  margin-top: 1rem;
}

.help-text p {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}
</style>
