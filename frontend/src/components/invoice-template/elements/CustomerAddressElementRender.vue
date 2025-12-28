<template>
  <div class="customer-address-element" :style="customerAddressStyle">
    <div>{{ getCustomerName() }}</div>
    <div>{{ getCustomerAddress() }}</div>
    <div>{{ getCustomerCity() }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerAddressElement, TestInvoiceData } from '../../../stores/invoiceTemplate'

interface Props {
  element: CustomerAddressElement
  zoom?: number
  mode?: 'editor' | 'test'
  testData?: TestInvoiceData | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const customerAddressStyle = computed(() => ({
  fontSize: `${props.element.fontSize || 10}px`,
  color: props.element.color || '#000000',
  lineHeight: '1.4',
  fontFamily: props.element.fontFamily || 'Arial, sans-serif'
}))

const getCustomerName = () => {
  if (props.mode === 'test' && props.testData?.customer?.name) {
    return props.testData.customer.name
  }
  return '{KUNDE_NAME}'
}

const getCustomerAddress = () => {
  if (props.mode === 'test' && props.testData?.customer?.address) {
    return props.testData.customer.address
  }
  return '{KUNDE_ADRESSE}'
}

const getCustomerCity = () => {
  if (props.mode === 'test' && props.testData?.customer?.city) {
    return props.testData.customer.city
  }
  return '{KUNDE_STADT}'
}
</script>

<style scoped>
.customer-address-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
}

.customer-address-element div {
  margin-bottom: 2px;
}
</style>
