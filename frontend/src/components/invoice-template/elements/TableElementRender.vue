<template>
  <div class="table-element">
    <table>
      <thead :style="{ background: element.headerBg, color: element.headerText }">
        <tr>
          <th
            v-for="(col, index) in element.columns"
            :key="index"
            :style="{ width: `${col.width}px` }"
          >
            {{ col.name }}
          </th>
        </tr>
      </thead>
      <tbody v-if="mode === 'test' && testData">
        <tr
          v-for="(position, index) in testData.positions"
          :key="index"
          :style="{ 
            background: index % 2 === 0 ? element.rowBg : element.alternateRowBg 
          }"
        >
          <td>{{ position.pos }}</td>
          <td>{{ position.description }}</td>
          <td>{{ position.quantity }}</td>
          <td>{{ position.price.toFixed(2) }} €</td>
          <td>{{ position.total.toFixed(2) }} €</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr :style="{ background: element.rowBg }">
          <td v-for="(col, index) in element.columns" :key="index">
            Beispiel {{ index + 1 }}
          </td>
        </tr>
        <tr :style="{ background: element.alternateRowBg }">
          <td v-for="(col, index) in element.columns" :key="index">
            Beispiel {{ index + 1 }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableElement, TestInvoiceData } from '../../../stores/invoiceTemplate'

interface Props {
  element: TableElement
  zoom?: number
  mode?: 'editor' | 'test'
  testData?: TestInvoiceData | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'editor'
})
</script>

<style scoped>
.table-element {
  width: 100%;
  height: 100%;
  overflow: auto;
  font-size: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 6px 8px;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

th {
  font-weight: 600;
  font-size: 11px;
}

td {
  font-size: 10px;
}
</style>
