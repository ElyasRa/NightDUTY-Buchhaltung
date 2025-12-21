import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultTemplates = [
  {
    name: 'Klassisch',
    is_default: true,
    config: {
      logo: { x: 330, y: 65, width: 220, height: 80, url: '/images/logo.png' },
      companyData: {
        x: 340,
        y: 165,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 9,
        color: '#000000'
      },
      bankDetails: {
        x: 50,
        y: 745,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 6
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#6b7280',
        text: '#000000',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 350,
        width: 495,
        headerBg: '#f3f4f6',
        headerText: '#000000',
        rowBg: '#ffffff',
        alternateRowBg: '#fafafa',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 735,
        width: 495,
        text: 'NIGHTDUTY GmbH • Westendohrf 11 • 45143 Essen • UST-ID: DE312802879',
        fontSize: 7,
        color: '#64748b'
      }
    }
  },
  {
    name: 'Modern',
    is_default: false,
    config: {
      logo: { x: 50, y: 50, width: 150, height: 60, url: '/images/logo.png' },
      companyData: {
        x: 400,
        y: 50,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 8,
        color: '#334155'
      },
      bankDetails: {
        x: 50,
        y: 750,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 7
      },
      colors: {
        primary: '#0f172a',
        secondary: '#94a3b8',
        text: '#1e293b',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 300,
        width: 495,
        headerBg: '#0f172a',
        headerText: '#ffffff',
        rowBg: '#ffffff',
        alternateRowBg: '#f8fafc',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 740,
        width: 495,
        text: 'NIGHTDUTY GmbH • Westendohrf 11 • 45143 Essen',
        fontSize: 7,
        color: '#94a3b8'
      }
    }
  },
  {
    name: 'Corporate',
    is_default: false,
    config: {
      logo: { x: 50, y: 40, width: 180, height: 70, url: '/images/logo.png' },
      companyData: {
        x: 350,
        y: 150,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 9,
        color: '#1e40af'
      },
      bankDetails: {
        x: 50,
        y: 750,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 6
      },
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        text: '#1e293b',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 320,
        width: 495,
        headerBg: '#1e40af',
        headerText: '#ffffff',
        rowBg: '#ffffff',
        alternateRowBg: '#eff6ff',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 740,
        width: 495,
        text: 'NIGHTDUTY GmbH • UST-ID: DE312802879 • Steuernr: 111/5763/0795',
        fontSize: 7,
        color: '#64748b'
      }
    }
  },
  {
    name: 'Colorful',
    is_default: false,
    config: {
      logo: { x: 60, y: 60, width: 160, height: 65, url: '/images/logo.png' },
      companyData: {
        x: 380,
        y: 60,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 9,
        color: '#7c3aed'
      },
      bankDetails: {
        x: 50,
        y: 755,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 6
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#f59e0b',
        text: '#1e293b',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 310,
        width: 495,
        headerBg: '#7c3aed',
        headerText: '#ffffff',
        rowBg: '#ffffff',
        alternateRowBg: '#faf5ff',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 745,
        width: 495,
        text: 'NIGHTDUTY GmbH • Westendohrf 11 • 45143 Essen',
        fontSize: 7,
        color: '#a855f7'
      }
    }
  },
  {
    name: 'Elegant',
    is_default: false,
    config: {
      logo: { x: 380, y: 50, width: 180, height: 70, url: '/images/logo.png' },
      companyData: {
        x: 380,
        y: 140,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: 'www.nightduty.de',
        fontSize: 8,
        color: '#374151'
      },
      bankDetails: {
        x: 50,
        y: 755,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 6
      },
      colors: {
        primary: '#374151',
        secondary: '#9ca3af',
        text: '#1f2937',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 330,
        width: 495,
        headerBg: '#f9fafb',
        headerText: '#374151',
        rowBg: '#ffffff',
        alternateRowBg: '#fafafa',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 745,
        width: 495,
        text: 'NIGHTDUTY GmbH • Westendohrf 11 • 45143 Essen • UST-ID: DE312802879',
        fontSize: 7,
        color: '#9ca3af'
      }
    }
  },
  {
    name: 'Simple',
    is_default: false,
    config: {
      logo: { x: 50, y: 50, width: 140, height: 55, url: '/images/logo.png' },
      companyData: {
        x: 400,
        y: 50,
        name: 'NIGHTDUTY GmbH',
        address: 'Westendohrf 11',
        city: '45143 Essen',
        phone: '0201/8578670',
        email: 'buchhaltung@nightduty.de',
        website: '',
        fontSize: 8,
        color: '#000000'
      },
      bankDetails: {
        x: 50,
        y: 760,
        iban: 'DE 72 1001 9000 1000 0097 62',
        bic: 'ADYBDEB2',
        bank: 'Advancia Bank',
        fontSize: 7
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        text: '#000000',
        background: '#ffffff'
      },
      table: {
        x: 50,
        y: 300,
        width: 495,
        headerBg: '#ffffff',
        headerText: '#000000',
        rowBg: '#ffffff',
        alternateRowBg: '#ffffff',
        columns: [
          { name: 'Art-Nr.', width: '55' },
          { name: 'Bezeichnung', width: '200' },
          { name: 'Menge', width: '50' },
          { name: 'Einzelpreis', width: '70' },
          { name: 'Betrag', width: '62' }
        ]
      },
      footer: {
        x: 50,
        y: 750,
        width: 495,
        text: 'NIGHTDUTY GmbH',
        fontSize: 7,
        color: '#000000'
      }
    }
  }
]

async function seedTemplates() {
  console.log('🌱 Seeding invoice templates...')
  
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.invoiceTemplate.count()
    
    if (existingTemplates > 0) {
      console.log(`✓ Templates already exist (${existingTemplates} found). Skipping seed.`)
      return
    }
    
    // Create all templates
    for (const template of defaultTemplates) {
      await prisma.invoiceTemplate.create({
        data: template
      })
      console.log(`✓ Created template: ${template.name}`)
    }
    
    console.log(`✅ Successfully seeded ${defaultTemplates.length} invoice templates!`)
  } catch (error) {
    console.error('❌ Error seeding templates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedTemplates, defaultTemplates }
