<template>
  <div class="bank-details-form">
    <h3>💳 Bankverbindung</h3>
    
    <div class="form-group">
      <label>IBAN</label>
      <input
        v-model="bankDetails.iban"
        type="text"
        placeholder="z.B. DE 72 1001 9000 1000 0097 62"
        @input="emit('update', bankDetails)"
      />
    </div>

    <div class="form-group">
      <label>BIC</label>
      <input
        v-model="bankDetails.bic"
        type="text"
        placeholder="z.B. ADYBDEB2"
        @input="emit('update', bankDetails)"
      />
    </div>

    <div class="form-group">
      <label>Bank</label>
      <input
        v-model="bankDetails.bank"
        type="text"
        placeholder="z.B. Advancia Bank"
        @input="emit('update', bankDetails)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface BankDetails {
  iban: string
  bic: string
  bank: string
}

interface Props {
  modelValue: BankDetails
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: BankDetails]
}>()

const bankDetails = ref<BankDetails>({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  bankDetails.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.bank-details-form {
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

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: #ff006e;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
</style>
