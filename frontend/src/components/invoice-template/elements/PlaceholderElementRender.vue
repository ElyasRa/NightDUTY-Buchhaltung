<template>
  <div
    class="placeholder-element"
    :style="placeholderStyle"
  >
    {{ displayText }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceholderElement, TestInvoiceData } from '../../../stores/invoiceTemplate'

interface Props {
  element: PlaceholderElement
  zoom?: number
  mode?: 'editor' | 'test'
  testData?: TestInvoiceData | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const placeholderStyle = computed(() => ({
  fontSize: `${props.element.fontSize}px`,
  fontFamily: props.element.fontFamily || 'Arial, sans-serif',
  color: props.mode === 'editor' ? '#999999' : (props.element.color || '#000000'),
  background: props.mode === 'editor' ? 'rgba(255, 0, 110, 0.1)' : 'transparent',
  border: props.mode === 'editor' ? '1px dashed rgba(255, 0, 110, 0.3)' : 'none',
  padding: '4px',
  fontStyle: props.mode === 'editor' ? 'italic' : 'normal'
}))

const displayText = computed(() => {
  if (props.mode === 'test' && props.testData) {
    return getTestValue()
  }
  return props.element.placeholder
})

const getTestValue = (): string => {
  if (!props.testData) return props.element.placeholder
  
  const placeholder = props.element.placeholder
  
  switch (placeholder) {
    case '{RECHNUNGSNUMMER}':
    case 'Rechnungsnummer':
      return props.testData.invoiceNumber
    case '{DATUM}':
    case 'Datum':
      return props.testData.date
    case '{FAELLIGKEITSDATUM}':
    case 'Fälligkeitsdatum':
      return props.testData.dueDate
    case '{KUNDE_NAME}':
    case 'Kundenname':
      return props.testData.customer.name
    case '{KUNDE_ADRESSE}':
    case 'Kundenadresse':
      return props.testData.customer.address
    case '{KUNDE_STADT}':
    case 'Kundenstadt':
      return props.testData.customer.city
    case '{BETRAG_NETTO}':
    case 'Betrag Netto':
      return `${props.testData.subtotal.toFixed(2)} €`
    case '{BETRAG_BRUTTO}':
    case 'Betrag Brutto':
      return `${props.testData.total.toFixed(2)} €`
    case '{MWST}':
    case 'MwSt':
      return `${props.testData.tax.toFixed(2)} €`
    default:
      return props.element.placeholder
  }
}
</script>

<style scoped>
.placeholder-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
