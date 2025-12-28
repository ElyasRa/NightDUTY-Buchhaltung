<template>
  <div class="bank-details-element" :style="bankDetailsStyle">
    <div v-if="element.iban">IBAN: {{ element.iban }}</div>
    <div v-if="element.bic">BIC: {{ element.bic }}</div>
    <div v-if="element.bank">Bank: {{ element.bank }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BankDetailsElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: BankDetailsElement
  zoom?: number
  mode?: 'editor' | 'test'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const bankDetailsStyle = computed(() => ({
  fontSize: `${props.element.fontSize || 6}px`,
  color: props.element.color || '#000000',
  lineHeight: '1.3',
  fontFamily: props.element.fontFamily || 'Arial, sans-serif'
}))
</script>

<style scoped>
.bank-details-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
}

.bank-details-element div {
  margin-bottom: 2px;
}
</style>
