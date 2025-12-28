const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateExistingTemplate() {
  try {
    console.log('🔍 Searching for template with ID 1...')
    
    // Template mit ID 1 finden und aktualisieren
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: 1 }
    })

    if (template) {
      console.log('✅ Template found:', template.name)
      
      // Config erweitern für Multi-Logo Support
      const config = template.config
      const updatedConfig = {
        ...config,
        logos: [
          {
            id: 'logo-main',
            x: config.logo?.x || 330,
            y: config.logo?.y || 65,
            width: config.logo?.width || 220,
            height: config.logo?.height || 80,
            url: config.logo?.url || '/images/logo.png',
            draggable: true,
            resizable: true
          }
        ]
      }

      // Altes Logo-Format entfernen (optional, für sauberere Daten)
      // delete updatedConfig.logo

      await prisma.invoiceTemplate.update({
        where: { id: 1 },
        data: {
          name: 'NIGHTDUTY Standard',
          is_default: true,
          config: updatedConfig
        }
      })

      console.log('✅ Template erfolgreich aktualisiert!')
      console.log('   - Name: NIGHTDUTY Standard')
      console.log('   - Standard: true')
      console.log('   - Logo-Format: Multi-Logo (Array)')
    } else {
      console.log('⚠️ Kein Template mit ID 1 gefunden')
      console.log('   Das Template muss möglicherweise manuell erstellt werden.')
    }
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren des Templates:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingTemplate()
