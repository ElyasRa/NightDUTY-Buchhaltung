<template>
  <div class="company-data-element" :style="companyDataStyle">
    <div v-if="element.name">{{ element.name }}</div>
    <div v-if="element.address">{{ element.address }}</div>
    <div v-if="element.city">{{ element.city }}</div>
    <div v-if="element.phone">{{ element.phone }}</div>
    <div v-if="element.email">{{ element.email }}</div>
    <div v-if="element.website">{{ element.website }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CompanyDataElement } from '../../../stores/invoiceTemplate'

interface Props {
  element: CompanyDataElement
  zoom?: number
  mode?: 'editor' | 'test'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})

const companyDataStyle = computed(() => ({
  fontSize: `${props.element.fontSize || 9}px`,
  color: props.element.color || '#000000',
  lineHeight: '1.4',
  fontFamily: props.element.fontFamily || 'Arial, sans-serif'
}))
</script>

<style scoped>
.company-data-element {
  width: 100%;
  height: 100%;
  padding: 4px;
  overflow: hidden;
}

.company-data-element div {
  margin-bottom: 2px;
}
</style>
