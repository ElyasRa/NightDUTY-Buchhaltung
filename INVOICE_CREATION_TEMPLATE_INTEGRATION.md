# Integrating Template Selection in Invoice Creation

This document describes how to add template selection to the `RechnungErstellenView.vue`.

## Implementation Steps

### 1. Import Template Store

Add import at the top of the script section (around line 218):

```typescript
import { useTemplateStore } from '../stores/templates'
```

### 2. Initialize Template Store

Add to the component setup (around line 220):

```typescript
const templateStore = useTemplateStore()
```

### 3. Fetch Templates on Mount

Add to the `onMounted` hook (around line 222):

```typescript
onMounted(async () => {
  await fetchCompanies()
  await templateStore.fetchTemplates()  // Add this line
  
  // Set today's date
  const today = new Date().toISOString().split('T')[0]
  // ... rest of existing code
})
```

### 4. Add Template Field to Form Data

Add `templateId` to the `formData` ref (around line 230):

```typescript
const formData = ref({
  company_id: null,
  period_start: '',
  period_end: '',
  invoice_date: '',
  due_date: '',
  total_hours: 0,
  regular_hours: 0,
  holiday_hours: 0,
  takeover_hours: 0,
  takeover_rate: 0,
  count_pkw: 0,
  count_lkw: 0,
  count_oilspill: 0,
  service_fee: 0,
  monthly_rate: 0,
  templateId: null  // Add this line
})
```

### 5. Add Template Selection to Form UI

Add this form section after the "Rechnungsdatum" section (around line 79):

```vue
<div class="form-group">
  <label>Rechnungsvorlage (optional)</label>
  <select v-model="formData.templateId">
    <option :value="null">Standard-Vorlage verwenden</option>
    <option 
      v-for="template in templateStore.templates" 
      :key="template.id" 
      :value="template.id"
    >
      {{ template.name }}
      <span v-if="template.is_default">(Standard)</span>
    </option>
  </select>
  <small class="form-hint">
    Wählen Sie eine Vorlage für das Design der Rechnung. 
    <router-link to="/rechnungsvorlage">Vorlagen verwalten</router-link>
  </small>
</div>
```

### 6. CSS for Form Hint

Add to the style section:

```css
.form-hint {
  display: block;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.form-hint a {
  color: #ff006e;
  text-decoration: none;
}

.form-hint a:hover {
  text-decoration: underline;
}
```

### 7. Include Template in API Request

Update the `createInvoice` function to include templateId (around line 400):

```typescript
async function createInvoice() {
  if (!validateForm()) return

  isSubmitting.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(
      `${API_BASE_URL}/invoices`,
      {
        ...formData.value,
        templateId: formData.value.templateId  // Add this line
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    
    // ... rest of existing code
  } catch (err: any) {
    // ... error handling
  } finally {
    isSubmitting.value = false
  }
}
```

## Visual Preview (Optional Enhancement)

To show a visual preview of the selected template, add:

```vue
<div v-if="formData.templateId" class="template-preview-mini">
  <div class="preview-label">Ausgewählte Vorlage:</div>
  <div class="preview-card">
    <div 
      class="preview-header" 
      :style="{ borderTopColor: selectedTemplate?.config.colors.primary }"
    >
      {{ selectedTemplate?.name }}
    </div>
  </div>
</div>
```

Add a computed property for the selected template:

```typescript
const selectedTemplate = computed(() => {
  if (!formData.value.templateId) return null
  return templateStore.templates.find(t => t.id === formData.value.templateId)
})
```

## Backend Integration

The backend invoice creation route should be updated to accept and store the templateId:

```typescript
// In backend/src/routes/invoices.ts
router.post('/', authenticateToken, async (req, res) => {
  // ... existing code ...
  
  const { templateId } = req.body
  
  const invoice = await prisma.invoice.create({
    data: {
      // ... existing fields ...
      // Store templateId if you want to remember which template was used
      // This requires adding a templateId field to the Invoice model
    }
  })
  
  // ... rest of code
})
```

## Testing

1. Navigate to "Rechnung erstellen"
2. Verify template dropdown appears
3. Select different templates
4. Create an invoice
5. Verify the invoice is created successfully
6. Check PDF uses the selected template (once PDF generator is updated)

## Backward Compatibility

- Template selection is optional (defaults to null)
- Existing invoices without template work as before
- If no template is selected, system uses default template or hardcoded values

## Notes

- Template selection doesn't break existing functionality
- PDF generator needs to be updated separately to use template config
- Default template is automatically marked in the dropdown
- Users can manage templates via "Rechnungsvorlage" menu
