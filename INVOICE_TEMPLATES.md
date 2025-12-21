# Invoice Template System

This directory contains the invoice template editor system implementation.

## Features

### Backend
- Full REST API for template CRUD operations
- File upload support for logos
- 6 predefined professional templates
- Default template management
- PostgreSQL storage via Prisma

### Frontend
- Template management UI
- Color customization
- Company data and bank details editor
- Template preview
- Set default template
- Delete templates (except default)

## API Endpoints

```
GET    /api/templates           - List all templates
GET    /api/templates/:id       - Get one template
POST   /api/templates           - Create new template
PUT    /api/templates/:id       - Update template
DELETE /api/templates/:id       - Delete template
PUT    /api/templates/:id/set-default - Set as default
POST   /api/templates/upload-logo - Upload logo
```

## Database Setup

1. Run Prisma migration:
```bash
cd backend
npx prisma db push
```

2. Seed default templates:
```bash
npx ts-node prisma/seed-templates.ts
```

## Default Templates

1. **Klassisch** - Traditional German invoice layout (default)
2. **Modern** - Minimalist with lots of white space
3. **Corporate** - Professional with blue accents
4. **Colorful** - Colorful, modern design
5. **Elegant** - High-quality, subtle
6. **Simple** - Very reduced, clean

## Template Configuration

Each template includes:
- Logo positioning and size
- Company data (name, address, contact info)
- Bank details (IBAN, BIC, bank name)
- Color scheme (primary, secondary, text, background)
- Table layout (position, width, column configuration)
- Footer (text, position, styling)

## Usage

Access the template editor via the main menu:
**Rechnungsvorlage** → Create, edit, and manage invoice templates

Templates are automatically used when generating invoices through the existing invoice system.

## Future Enhancements

- Full drag-and-drop positioning
- Visual WYSIWYG editor
- More template options
- Template duplication
- Import/Export templates
- Template preview with real invoice data
