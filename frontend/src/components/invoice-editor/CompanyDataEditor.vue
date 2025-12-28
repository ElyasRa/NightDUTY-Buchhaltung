<template>
  <div class="company-data-editor">
    <h3>🏢 Firmendaten</h3>
    <p class="subtitle">Bearbeiten Sie die Firmendaten für Ihre Rechnungsvorlage</p>

    <div class="form-section">
      <h4>Firmeninformationen</h4>
      <div class="form-group">
        <label>Firmenname</label>
        <input 
          type="text" 
          v-model="localCompanyData.name"
          @input="emitUpdate"
          placeholder="Firma GmbH"
        />
      </div>
      
      <div class="form-group">
        <label>Adresse</label>
        <input 
          type="text" 
          v-model="localCompanyData.address"
          @input="emitUpdate"
          placeholder="Musterstraße 123"
        />
      </div>
      
      <div class="form-group">
        <label>Stadt</label>
        <input 
          type="text" 
          v-model="localCompanyData.city"
          @input="emitUpdate"
          placeholder="12345 Musterstadt"
        />
      </div>
      
      <div class="form-group">
        <label>Telefon</label>
        <input 
          type="text" 
          v-model="localCompanyData.phone"
          @input="emitUpdate"
          placeholder="+49 123 456789"
        />
      </div>
      
      <div class="form-group">
        <label>E-Mail</label>
        <input 
          type="email" 
          v-model="localCompanyData.email"
          @input="emitUpdate"
          placeholder="info@firma.de"
        />
      </div>
      
      <div class="form-group">
        <label>Website</label>
        <input 
          type="text" 
          v-model="localCompanyData.website"
          @input="emitUpdate"
          placeholder="www.firma.de"
        />
      </div>
    </div>

    <div class="form-section">
      <h4>Bankverbindung</h4>
      <div class="form-group">
        <label>IBAN</label>
        <input 
          type="text" 
          v-model="localBankDetails.iban"
          @input="emitUpdate"
          placeholder="DE00 0000 0000 0000 0000 00"
        />
      </div>
      
      <div class="form-group">
        <label>BIC</label>
        <input 
          type="text" 
          v-model="localBankDetails.bic"
          @input="emitUpdate"
          placeholder="GENODEF1"
        />
      </div>
      
      <div class="form-group">
        <label>Bank</label>
        <input 
          type="text" 
          v-model="localBankDetails.bank"
          @input="emitUpdate"
          placeholder="Musterbank AG"
        />
      </div>
    </div>

    <div class="form-section">
      <h4>Zusätzliche Angaben</h4>
      <div class="form-group">
        <label>USt-ID</label>
        <input 
          type="text" 
          v-model="localCompanyData.ustId"
          @input="emitUpdate"
          placeholder="DE123456789"
        />
      </div>
      
      <div class="form-group">
        <label>Steuernummer</label>
        <input 
          type="text" 
          v-model="localCompanyData.taxNumber"
          @input="emitUpdate"
          placeholder="123/456/78901"
        />
      </div>
    </div>

    <div class="help-text">
      💡 Diese Daten werden automatisch in Ihre Rechnungen eingefügt, wenn Sie die entsprechenden Elemente zur Vorlage hinzufügen.
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
  ustId?: string
  taxNumber?: string
}

interface BankDetails {
  iban: string
  bic: string
  bank: string
}

interface Props {
  companyData: CompanyData
  bankDetails: BankDetails
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: { companyData: CompanyData; bankDetails: BankDetails }]
}>()

const localCompanyData = ref<CompanyData>({ ...props.companyData })
const localBankDetails = ref<BankDetails>({ ...props.bankDetails })

watch(() => props.companyData, (newData) => {
  localCompanyData.value = { ...newData }
}, { deep: true })

watch(() => props.bankDetails, (newData) => {
  localBankDetails.value = { ...newData }
}, { deep: true })

function emitUpdate() {
  emit('update', {
    companyData: localCompanyData.value,
    bankDetails: localBankDetails.value
  })
}
</script>

<style scoped>
.company-data-editor {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
  background: rgba(20, 20, 20, 0.95);
}

.company-data-editor h3 {
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

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ff006e;
  background: rgba(255, 255, 255, 0.08);
}

.help-text {
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: rgba(147, 197, 253, 0.9);
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 1rem;
}

/* Scrollbar */
.company-data-editor::-webkit-scrollbar {
  width: 6px;
}

.company-data-editor::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.company-data-editor::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 110, 0.3);
  border-radius: 10px;
}
</style>
