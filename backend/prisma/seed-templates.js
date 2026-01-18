const { PrismaClient } = require('@prisma/client')

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
        headerBg: '#f1f5f9',
        headerText: '#334155',
        rowBg: '#ffffff',
        alternateRowBg: '#f8fafc',
        columns: [
          { name: 'Pos', width: '40' },
          { name: 'Leistung', width: '230' },
          { name: 'Anz.', width: '40' },
          { name: 'Preis', width: '70' },
          { name: 'Gesamt', width: '65' }
        ]
      },
      footer: {
        x: 50,
        y: 750,
        width: 495,
        text: 'NIGHTDUTY GmbH | Essen',
        fontSize: 8,
        color: '#94a3b8'
      }
    }
  }
]

async function main() {
  console.log('🌱 Starte Seeding für Rechnungsvorlagen...')
  
  for (const template of defaultTemplates) {
    const existing = await prisma.invoiceTemplate.findFirst({
      where: { name: template.name }
    })
    
    if (!existing) {
      await prisma.invoiceTemplate.create({
        data: template
      })
      console.log(`✅ Vorlage erstellt: ${template.name}`)
    } else {
      console.log(`ℹ️ Vorlage existiert bereits: ${template.name}`)
    }
  }
  
  console.log('🏁 Seeding abgeschlossen.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })