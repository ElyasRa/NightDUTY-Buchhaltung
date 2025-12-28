<template>
  <div class="invoice-info-element" :style="invoiceInfoStyle">
    <div v-for="field in element.fields" :key="field.label">
      <strong>{{ field.label }}:</strong> {{ getFieldValue(field) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceInfoElement, TestInvoiceData } from '../../../stores/invoiceTemplate'

interface Props {
  element: InvoiceInfoElement
  zoom?: number
  mode?: 'editor' | 'test'
  testData?: TestInvoiceData | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const invoiceInfoStyle = computed(() => ({
  fontSize: `${props.element.fontSize || 9}px`,
  color: props.element.color || '#000000',
  lineHeight: '1.4',
  fontFamily: props.element.fontFamily || 'Arial, sans-serif'
}))

const getFieldValue = (field: { label: string; value: string }) => {
  if (props.mode === 'test' && props.testData) {
    // Map placeholders to test data
    const mapping: Record<string, string> = {
      '{UST_ID}': props.testData.ustId || 'DE312802879',
      '{STEUERNUMMER}': props.testData.taxNumber || '111/57630795',
      '{DATUM}': props.testData.date || new Date().toLocaleDateString('de-DE'),
      '{KUNDENNUMMER}': props.testData.customerNumber || '10010',
      '{RECHNUNGSNUMMER}': props.testData.invoiceNumber || 'RE-2025-0002',
      '{BETREUER}': props.testData.accountManager || 'Max Mustermann'
    }
    return mapping[field.value] || field.value
  }
  return field.value
}
</script>

<style scoped>
.invoice-info-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
}

.invoice-info-element div {
  margin-bottom: 2px;
}

.invoice-info-element strong {
  font-weight: 600;
}
</style>
