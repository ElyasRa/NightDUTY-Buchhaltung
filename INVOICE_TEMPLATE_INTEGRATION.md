# Invoice Template System Integration

## Overview

This document describes the integration of the invoice template system with invoice creation and PDF generation. The template editor was already implemented; this update connects it to the invoice workflow.

## Features

### 1. Template Selection During Invoice Creation
- Users can select which template to use when creating an invoice
- Template dropdown appears in the "Firma & Zeitraum" section
- Default template is automatically pre-selected
- Shows which template is marked as default

### 2. Template-Based PDF Generation
- PDFs are generated using the selected template's configuration
- Template settings applied to PDF:
  - **Colors**: Primary, secondary, and text colors
  - **Logo**: Position, size, and file path from template
  - **Company Data**: Name, address, contact information
  - **Bank Details**: IBAN, BIC, bank name
  - **Layout**: Positioning and styling of all elements

### 3. Backward Compatibility
- Invoices created before this update continue to work
- If no template is selected, the system uses the default template
- If no default template exists, hardcoded values are used as fallback

## Database Changes

### Schema Updates

Added to `Invoice` model:
```prisma
model Invoice {
  // ... existing fields ...
  template_id     Int?
  template        InvoiceTemplate? @relation(fields: [template_id], references: [id])
  // ... rest of fields ...
}
```

Added to `InvoiceTemplate` model:
```prisma
model InvoiceTemplate {
  // ... existing fields ...
  invoices    Invoice[]
}
```

### Migration

The migration adds a nullable `template_id` field to the Invoice table, establishing a foreign key relationship with the InvoiceTemplate table.

## API Changes

### Invoice Creation Endpoint

**Endpoint**: `POST /api/invoices`

**New Field**:
- `template_id` (optional, integer): ID of the template to use for this invoice

**Example Request**:
```json
{
  "company_id": 1,
  "template_id": 2,
  "period_start": "2025-01-01",
  "period_end": "2025-01-31",
  "invoice_date": "2025-02-01",
  "due_date": "2025-02-15",
  "billing_type": "hourly",
  "total_hours": 160,
  "hourly_rate": 50
}
```

### PDF Generation Endpoint

**Endpoint**: `GET /api/invoices/:id/pdf`

The PDF generation now:
1. Loads the invoice with its associated template
2. If template_id is set, uses that template
3. If not, tries to load the default template
4. If no default exists, uses hardcoded fallback values

## Frontend Changes

### Invoice Creation Form

Location: `frontend/src/views/RechnungErstellenView.vue`

**New Elements**:
- Template selection dropdown
- Auto-population with default template
- Description text explaining template purpose

**User Flow**:
1. User selects a company
2. Template dropdown shows available templates
3. Default template is pre-selected
4. User can change template or leave as default
5. When invoice is created, selected template ID is sent

## Backend Implementation

### PDF Generator Updates

Location: `backend/src/utils/invoicePdfGenerator.ts`

**Key Changes**:
- Function signature now accepts optional `template` parameter
- Extracts configuration from template with fallback defaults
- Uses template colors throughout the PDF
- Applies template logo configuration
- Uses template company and bank data

**Template Configuration Usage**:
```typescript
const colors = config.colors || {
  primary: '#1e3a8a',
  secondary: '#6b7280',
  text: '#000000',
  background: '#ffffff'
}

const logoConfig = config.logo || config.logos?.[0] || {
  x: 330, y: 65, width: 220, url: '/images/logo.png'
}

const companyData = config.companyData || {
  name: 'NIGHTDUTY GmbH',
  // ... defaults
}

const bankDetails = config.bankDetails || {
  iban: 'DE 72 1001 9000 1000 0097 62',
  // ... defaults
}
```

## Type Safety

### Frontend Types

```typescript
import type { InvoiceTemplate } from '../stores/templates'

const templates = ref<InvoiceTemplate[]>([])
```

### Backend Types

```typescript
interface TemplateConfig {
  logo?: { x?: number; y?: number; width?: number; height?: number; url?: string }
  logos?: Array<{ x?: number; y?: number; width?: number; height?: number; url?: string }>
  companyData?: { name?: string; address?: string; city?: string; phone?: string; email?: string; website?: string }
  bankDetails?: { iban?: string; bic?: string; bank?: string }
  colors?: { primary: string; secondary: string; text: string; background: string }
}

interface InvoiceTemplate {
  id: number
  name: string
  is_default: boolean
  config: TemplateConfig
}
```

## Testing Checklist

### Manual Testing

- [ ] Create invoice without selecting template (should use default)
- [ ] Create invoice with specific template selected
- [ ] Download PDF and verify template styling is applied:
  - [ ] Colors match template
  - [ ] Logo position and size correct
  - [ ] Company data from template
  - [ ] Bank details from template
- [ ] Create another invoice (template should reset to default)
- [ ] Test with different templates
- [ ] Verify old invoices (without template_id) still generate PDFs correctly

### Automated Testing

All TypeScript checks pass:
```bash
cd frontend && npm run type-check  # ✓ Passes
```

Security scan passes:
- CodeQL analysis: 0 vulnerabilities found

## Deployment Instructions

### Prerequisites
- PostgreSQL database running
- Node.js 20+ installed
- npm dependencies installed

### Deployment Steps

1. **Pull latest changes**:
   ```bash
   cd ~/nightduty
   git pull origin main
   ```

2. **Backend deployment**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   pm2 restart nightduty-backend
   ```

3. **Frontend deployment**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   pm2 restart nightduty-frontend
   ```

4. **Verify templates exist**:
   - Log into the application
   - Navigate to "Rechnungsvorlage"
   - Ensure at least one template exists and one is marked as default
   - If no templates exist, run seed script:
     ```bash
     cd ~/nightduty/backend
     npx ts-node prisma/seed-templates.ts
     ```

5. **Test invoice creation**:
   - Create a new invoice
   - Verify template dropdown appears
   - Download PDF and check styling

## Troubleshooting

### Template dropdown is empty
- Check that templates exist in database: `SELECT * FROM "InvoiceTemplates";`
- Run seed script if needed: `npx ts-node prisma/seed-templates.ts`

### PDF has default styling instead of template styling
- Check that invoice has template_id set: `SELECT template_id FROM "Invoice" WHERE id = ?;`
- Verify template configuration is valid JSON
- Check server logs for errors during PDF generation

### "Template not found" error
- Verify template_id exists in InvoiceTemplates table
- Check foreign key constraint is properly set up
- Ensure template hasn't been deleted

## Known Limitations

1. **Logo Upload**: Logo must be uploaded separately through the template editor
2. **Font Support**: Limited to built-in PDFKit fonts (Helvetica, Times, Courier)
3. **Complex Layouts**: Very complex custom layouts may not render perfectly
4. **Image Formats**: Logo must be PNG, JPG, or SVG

## Future Enhancements

1. **Template Preview**: Show PDF preview when selecting template
2. **Custom Fonts**: Support for uploading and using custom fonts
3. **More Elements**: Support for tables, charts, and other complex elements from template editor
4. **Template Versioning**: Track changes to templates over time
5. **Template Categories**: Organize templates by type or purpose

## Support

For issues or questions:
- Check server logs: `pm2 logs nightduty-backend`
- Check browser console for frontend errors
- Verify database state using Prisma Studio: `npx prisma studio`
- Review this documentation for common issues

## References

- [Invoice Template Editor Documentation](./INVOICE_TEMPLATE_EDITOR.md)
- [Prisma Schema](./backend/prisma/schema.prisma)
- [PDF Generator](./backend/src/utils/invoicePdfGenerator.ts)
- [Invoice Creation View](./frontend/src/views/RechnungErstellenView.vue)
