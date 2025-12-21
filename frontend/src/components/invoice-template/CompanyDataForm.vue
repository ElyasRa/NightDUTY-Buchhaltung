<template>
  <div class="company-data-form">
    <h3>🏢 Firmendaten</h3>
    
    <div class="form-group">
      <label>Firmenname</label>
      <input
        v-model="companyData.name"
        type="text"
        placeholder="z.B. NIGHTDUTY GmbH"
        @input="emit('update', companyData)"
      />
    </div>

    <div class="form-group">
      <label>Adresse</label>
      <input
        v-model="companyData.address"
        type="text"
        placeholder="z.B. Westendohrf 11"
        @input="emit('update', companyData)"
      />
    </div>

    <div class="form-group">
      <label>Stadt</label>
      <input
        v-model="companyData.city"
        type="text"
        placeholder="z.B. 45143 Essen"
        @input="emit('update', companyData)"
      />
    </div>

    <div class="form-group">
      <label>Telefon</label>
      <input
        v-model="companyData.phone"
        type="text"
        placeholder="z.B. 0201/8578670"
        @input="emit('update', companyData)"
      />
    </div>

    <div class="form-group">
      <label>E-Mail</label>
      <input
        v-model="companyData.email"
        type="email"
        placeholder="z.B. info@nightduty.de"
        @input="emit('update', companyData)"
      />
    </div>

    <div class="form-group">
      <label>Website</label>
      <input
        v-model="companyData.website"
        type="text"
        placeholder="z.B. www.nightduty.de"
        @input="emit('update', companyData)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface CompanyData {
  name: string
  address: string
  city: string
  phone: string
  email: string
  website: string
}

interface Props {
  modelValue: CompanyData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: CompanyData]
}>()

const companyData = ref<CompanyData>({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  companyData.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
.company-data-form {
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
