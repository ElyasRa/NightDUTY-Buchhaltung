# Extending PDF Generator with Template Support

This document describes how to extend the `invoicePdfGenerator.ts` to use custom templates.

## Current Implementation

The current PDF generator has hardcoded values for:
- Colors (blue header, gray accents)
- Logo position (330, 65)
- Company data position (340, 165)
- Table layout (50, 350, width 495)
- Footer position (735)

## Template Integration Steps

### 1. Update InvoiceData Interface

Add an optional `templateConfig` parameter:

```typescript
interface InvoiceData {
  // ... existing fields
  templateConfig?: {
    logo: { x: number, y: number, width: number, height: number, url: string }
    companyData: { x: number, y: number, fontSize: number, color: string }
    colors: { primary: string, secondary: string, text: string, background: string }
    table: { x: number, y: number, width: number, headerBg: string, headerText: string }
    footer: { x: number, y: number, fontSize: number, color: string }
  }
}
```

### 2. Load Default Template

At the start of `generateInvoicePDF`, load the default template if none is provided:

```typescript
export async function generateInvoicePDF(data: InvoiceData, res: Response) {
  // Load template config
  let templateConfig = data.templateConfig
  
  if (!templateConfig) {
    // Load default template from database
    const prisma = new PrismaClient()
    const defaultTemplate = await prisma.invoiceTemplate.findFirst({
      where: { is_default: true }
    })
    templateConfig = defaultTemplate?.config || getHardcodedDefaultConfig()
  }
  
  // Continue with PDF generation...
}
```

### 3. Replace Hardcoded Values

Replace all hardcoded positions and colors with template values:

**Before:**
```typescript
doc.rect(0, 8, pageWidth, 28).fill('#1e3a8a')
```

**After:**
```typescript
doc.rect(0, 8, pageWidth, 28).fill(templateConfig.colors.primary)
```

**Before:**
```typescript
doc.image(logoPath, 330, y, { width: 220 })
```

**After:**
```typescript
doc.image(
  templateConfig.logo.url || logoPath, 
  templateConfig.logo.x, 
  templateConfig.logo.y, 
  { width: templateConfig.logo.width }
)
```

### 4. Update API Routes

Modify the invoice routes to accept and pass template ID:

```typescript
// In routes/invoices.ts
router.post('/generate-pdf/:id', async (req, res) => {
  const { id } = req.params
  const { templateId } = req.body
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: { company: true }
  })
  
  let templateConfig = null
  if (templateId) {
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: templateId }
    })
    templateConfig = template?.config
  }
  
  const invoiceData = {
    ...invoice,
    templateConfig
  }
  
  generateInvoicePDF(invoiceData, res)
})
```

### 5. Update Frontend Invoice Creation

In `RechnungErstellenView.vue`, add template selection:

```vue
<template>
  <div class="form-group">
    <label>Rechnungsvorlage</label>
    <select v-model="formData.templateId">
      <option :value="null">Standard</option>
      <option v-for="template in templates" :key="template.id" :value="template.id">
        {{ template.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '../stores/templates'

const templateStore = useTemplateStore()
const templates = computed(() => templateStore.templates)

onMounted(async () => {
  await templateStore.fetchTemplates()
})
</script>
```

## Implementation Priority

1. **Phase 1**: Add template parameter to PDF generator (keep backward compatible)
2. **Phase 2**: Update colors and basic styling from template
3. **Phase 3**: Update positions (logo, company data, table)
4. **Phase 4**: Update all typography (fonts, sizes)
5. **Phase 5**: Add custom footer text and layout

## Testing

After each phase:
1. Test with default template (should look unchanged)
2. Test with custom template (should use new values)
3. Test PDF generation with and without template ID
4. Verify PDF quality and layout consistency

## Backward Compatibility

To ensure existing invoices still work:
- Make `templateConfig` optional
- Use existing hardcoded values as fallback
- Don't modify existing invoice records

## Example Usage

```typescript
// Generate invoice with custom template
const templateConfig = {
  logo: { x: 50, y: 50, width: 180, height: 70, url: '/images/logo.png' },
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    text: '#1e293b',
    background: '#ffffff'
  },
  // ... rest of config
}

generateInvoicePDF({
  ...invoiceData,
  templateConfig
}, res)
```

## Notes

- Keep the existing PDF structure to maintain consistency
- Template only changes visual styling, not the invoice logic
- Always validate template config before using it
- Provide sensible defaults for missing values
