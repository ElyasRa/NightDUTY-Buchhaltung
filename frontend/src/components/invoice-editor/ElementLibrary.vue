<template>
  <div class="element-library">
    <h3>📚 Element-Bibliothek</h3>
    <p class="subtitle">Klicken Sie auf ein Element, um es hinzuzufügen</p>

    <div class="library-section">
      <h4>Basis-Elemente</h4>
      <div class="element-list">
        <div class="element-item" @click="addElement('text')">
          <span class="element-icon">📝</span>
          <span class="element-label">Textfeld</span>
        </div>
        <div class="element-item" @click="addElement('rectangle')">
          <span class="element-icon">◻️</span>
          <span class="element-label">Rechteck</span>
        </div>
        <div class="element-item" @click="addElement('circle')">
          <span class="element-icon">⭕</span>
          <span class="element-label">Kreis</span>
        </div>
        <div class="element-item" @click="addElement('line')">
          <span class="element-icon">—</span>
          <span class="element-label">Linie</span>
        </div>
        <div class="element-item" @click="addElement('image')">
          <span class="element-icon">🖼️</span>
          <span class="element-label">Bild hochladen</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Firmendaten</h4>
      <div class="element-list">
        <div class="element-item" @click="addInvoiceElement('companyData')">
          <span class="element-icon">🏢</span>
          <span class="element-label">Firmendaten</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('bankDetails')">
          <span class="element-icon">💳</span>
          <span class="element-label">Bankverbindung</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Rechnungsdaten</h4>
      <div class="element-list">
        <div class="element-item" @click="addInvoiceElement('customerAddress')">
          <span class="element-icon">👤</span>
          <span class="element-label">Kundenadresse</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('invoiceInfo')">
          <span class="element-icon">ℹ️</span>
          <span class="element-label">Rechnungsinfo</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('table')">
          <span class="element-icon">📋</span>
          <span class="element-label">Rechnungstabelle</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('totals')">
          <span class="element-icon">💰</span>
          <span class="element-label">Summen</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('footer')">
          <span class="element-icon">📄</span>
          <span class="element-label">Fußzeile</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Design-Elemente</h4>
      <div class="element-list">
        <div class="element-item" @click="addInvoiceElement('colorStripe')">
          <span class="element-icon">🎨</span>
          <span class="element-label">Farbstreifen</span>
        </div>
        <div class="element-item" @click="addInvoiceElement('watermark')">
          <span class="element-icon">💧</span>
          <span class="element-label">Wasserzeichen</span>
        </div>
        <div class="element-item" @click="addColoredLine('horizontal')">
          <span class="element-icon">—</span>
          <span class="element-label">H-Linie (farbig)</span>
        </div>
        <div class="element-item" @click="addColoredLine('vertical')">
          <span class="element-icon">|</span>
          <span class="element-label">V-Linie (farbig)</span>
        </div>
      </div>
    </div>

    <div class="library-section">
      <h4>Schnellstart</h4>
      <div class="element-list">
        <button class="template-btn" @click="createNightDutyTemplate">
          <span class="element-icon">⚡</span>
          <span>NIGHTDUTY Vorlage erstellen</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  addElement: [type: string]
  addInvoiceElement: [type: string]
  addColoredLine: [orientation: 'horizontal' | 'vertical']
  createTemplate: [templateName: string]
}>()

function addElement(type: string) {
  emit('addElement', type)
}

function addInvoiceElement(type: string) {
  emit('addInvoiceElement', type)
}

function addColoredLine(orientation: 'horizontal' | 'vertical') {
  emit('addColoredLine', orientation)
}

function createNightDutyTemplate() {
  emit('createTemplate', 'nightduty')
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
  background: rgba(255, 0, 110, 0.2);
  transform: translateX(2px);
}

.element-icon {
  font-size: 1.25rem;
}

.element-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.template-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 0, 110, 0.3);
}

.template-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 0, 110, 0.4);
}

.template-btn .element-icon {
  font-size: 1.5rem;
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
