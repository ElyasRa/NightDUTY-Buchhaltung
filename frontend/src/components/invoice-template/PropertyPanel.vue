<template>
  <div class="property-panel">
    <div v-if="!selectedElement" class="no-selection">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1v6m0 6v6M23 12h-6m-6 0H1" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>Kein Element ausgewählt</p>
      <p class="hint">Wählen Sie ein Element aus, um seine Eigenschaften zu bearbeiten</p>
    </div>

    <div v-else class="properties">
      <div class="property-header">
        <h3>{{ getElementTypeName(selectedElement.type) }}</h3>
        <button @click="emit('close')" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <!-- Common Properties -->
      <div class="property-section">
        <h4>Position & Größe</h4>
        
        <div class="property-grid">
          <div class="property-field">
            <label>X-Position</label>
            <input
              type="number"
              :value="selectedElement.x"
              @input="updateProperty('x', Number(($event.target as HTMLInputElement).value))"
              min="0"
            />
            <span class="unit">px</span>
          </div>

          <div class="property-field">
            <label>Y-Position</label>
            <input
              type="number"
              :value="selectedElement.y"
              @input="updateProperty('y', Number(($event.target as HTMLInputElement).value))"
              min="0"
            />
            <span class="unit">px</span>
          </div>

          <div class="property-field">
            <label>Breite</label>
            <input
              type="number"
              :value="selectedElement.width"
              @input="updateProperty('width', Number(($event.target as HTMLInputElement).value))"
              min="20"
            />
            <span class="unit">px</span>
          </div>

          <div class="property-field">
            <label>Höhe</label>
            <input
              type="number"
              :value="selectedElement.height"
              @input="updateProperty('height', Number(($event.target as HTMLInputElement).value))"
              min="20"
            />
            <span class="unit">px</span>
          </div>
        </div>

        <div class="property-field">
          <label>Z-Index (Ebene)</label>
          <input
            type="number"
            :value="selectedElement.zIndex"
            @input="updateProperty('zIndex', Number(($event.target as HTMLInputElement).value))"
            min="0"
          />
        </div>

        <div class="property-field checkbox">
          <label>
            <input
              type="checkbox"
              :checked="selectedElement.locked"
              @change="updateProperty('locked', ($event.target as HTMLInputElement).checked)"
            />
            Gesperrt (nicht verschiebbar)
          </label>
        </div>

        <div class="property-field checkbox">
          <label>
            <input
              type="checkbox"
              :checked="selectedElement.visible !== false"
              @change="updateProperty('visible', ($event.target as HTMLInputElement).checked)"
            />
            Sichtbar
          </label>
        </div>
      </div>

      <!-- Text-specific Properties -->
      <div v-if="selectedElement.type === 'text'" class="property-section">
        <h4>Text-Eigenschaften</h4>
        
        <div class="property-field">
          <label>Inhalt</label>
          <textarea
            :value="(selectedElement as TextElement).content"
            @input="updateProperty('content', ($event.target as HTMLTextAreaElement).value)"
            rows="4"
          ></textarea>
        </div>

        <div class="property-field">
          <label>Schriftart</label>
          <select
            :value="(selectedElement as TextElement).fontFamily"
            @change="updateProperty('fontFamily', ($event.target as HTMLSelectElement).value)"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
        </div>

        <div class="property-field">
          <label>Schriftgröße</label>
          <input
            type="number"
            :value="(selectedElement as TextElement).fontSize"
            @input="updateProperty('fontSize', Number(($event.target as HTMLInputElement).value))"
            min="8"
            max="72"
          />
          <span class="unit">pt</span>
        </div>

        <div class="property-field">
          <label>Farbe</label>
          <input
            type="color"
            :value="(selectedElement as TextElement).color"
            @input="updateProperty('color', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="property-field checkbox">
          <label>
            <input
              type="checkbox"
              :checked="(selectedElement as TextElement).bold"
              @change="updateProperty('bold', ($event.target as HTMLInputElement).checked)"
            />
            Fett
          </label>
        </div>

        <div class="property-field checkbox">
          <label>
            <input
              type="checkbox"
              :checked="(selectedElement as TextElement).italic"
              @change="updateProperty('italic', ($event.target as HTMLInputElement).checked)"
            />
            Kursiv
          </label>
        </div>

        <div class="property-field">
          <label>Ausrichtung</label>
          <select
            :value="(selectedElement as TextElement).align || 'left'"
            @change="updateProperty('align', ($event.target as HTMLSelectElement).value)"
          >
            <option value="left">Links</option>
            <option value="center">Zentriert</option>
            <option value="right">Rechts</option>
          </select>
        </div>
      </div>

      <!-- Placeholder-specific Properties -->
      <div v-if="selectedElement.type === 'placeholder'" class="property-section">
        <h4>Platzhalter-Eigenschaften</h4>
        
        <div class="property-field">
          <label>Platzhalter</label>
          <select
            :value="(selectedElement as PlaceholderElement).placeholder"
            @change="updateProperty('placeholder', ($event.target as HTMLSelectElement).value)"
          >
            <option value="{RECHNUNGSNUMMER}">Rechnungsnummer</option>
            <option value="{DATUM}">Datum</option>
            <option value="{FAELLIGKEITSDATUM}">Fälligkeitsdatum</option>
            <option value="{KUNDE_NAME}">Kundenname</option>
            <option value="{KUNDE_ADRESSE}">Kundenadresse</option>
            <option value="{KUNDE_STADT}">Kundenstadt</option>
            <option value="{BETRAG_NETTO}">Betrag Netto</option>
            <option value="{BETRAG_BRUTTO}">Betrag Brutto</option>
            <option value="{MWST}">MwSt</option>
          </select>
        </div>

        <div class="property-field">
          <label>Schriftgröße</label>
          <input
            type="number"
            :value="(selectedElement as PlaceholderElement).fontSize"
            @input="updateProperty('fontSize', Number(($event.target as HTMLInputElement).value))"
            min="8"
            max="72"
          />
          <span class="unit">pt</span>
        </div>

        <div class="property-field">
          <label>Farbe</label>
          <input
            type="color"
            :value="(selectedElement as PlaceholderElement).color"
            @input="updateProperty('color', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Line-specific Properties -->
      <div v-if="selectedElement.type === 'line'" class="property-section">
        <h4>Linien-Eigenschaften</h4>
        
        <div class="property-field">
          <label>Ausrichtung</label>
          <select
            :value="(selectedElement as LineElement).orientation"
            @change="updateProperty('orientation', ($event.target as HTMLSelectElement).value)"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertikal</option>
          </select>
        </div>

        <div class="property-field">
          <label>Dicke</label>
          <input
            type="number"
            :value="(selectedElement as LineElement).thickness"
            @input="updateProperty('thickness', Number(($event.target as HTMLInputElement).value))"
            min="1"
            max="20"
          />
          <span class="unit">px</span>
        </div>

        <div class="property-field">
          <label>Farbe</label>
          <input
            type="color"
            :value="(selectedElement as LineElement).color"
            @input="updateProperty('color', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TemplateElement, TextElement, PlaceholderElement, LineElement } from '../../stores/invoiceTemplate'

interface Props {
  selectedElement: TemplateElement | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [property: string, value: any]
  close: []
}>()

const getElementTypeName = (type: string): string => {
  const names: Record<string, string> = {
    logo: 'Logo',
    text: 'Textfeld',
    placeholder: 'Platzhalter',
    table: 'Tabelle',
    line: 'Linie'
  }
  return names[type] || type
}

const updateProperty = (property: string, value: any) => {
  emit('update', property, value)
}
</script>

<style scoped>
.property-panel {
  height: 100%;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.no-selection svg {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.no-selection p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.no-selection .hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.properties {
  padding: 1rem;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.property-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
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
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.property-section {
  margin-bottom: 1.5rem;
}

.property-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.property-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.property-field {
  margin-bottom: 0.75rem;
  position: relative;
}

.property-field label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.property-field input[type="number"],
.property-field input[type="text"],
.property-field input[type="color"],
.property-field select,
.property-field textarea {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
}

.property-field input[type="color"] {
  height: 36px;
  padding: 0.25rem;
  cursor: pointer;
}

.property-field textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.property-field input:focus,
.property-field select:focus,
.property-field textarea:focus {
  outline: none;
  border-color: #ff006e;
}

.property-field .unit {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  margin-top: 10px;
}

.property-field.checkbox {
  display: flex;
  align-items: center;
}

.property-field.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  cursor: pointer;
}

.property-field.checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

/* Scrollbar */
.property-panel::-webkit-scrollbar {
  width: 6px;
}

.property-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.property-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
