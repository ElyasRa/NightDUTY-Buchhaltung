import nodemailer, { SendMailOptions } from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface EmailAttachment {
  filename: string
  content: Buffer
}

export interface EmailOptions {
  to: string
  subject: string
  body: string
  attachments?: EmailAttachment[]
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Get SMTP settings from database
  const settings = await prisma.systemSettings.findFirst({
    orderBy: {
      id: 'desc'
    }
  })
  
  if (!settings || !settings.smtp_host || !settings.smtp_port || !settings.smtp_user || !settings.smtp_password || !settings.smtp_from_address) {
    throw new Error('SMTP-Einstellungen sind nicht vollständig konfiguriert')
  }
  
  console.log(`📧 Sending email to ${options.to}`)
  console.log(`   Host: ${settings.smtp_host}:${settings.smtp_port}`)
  console.log(`   User: ${settings.smtp_user}`)
  
  // Create transporter with enhanced configuration
  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_port === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password
    },
    // IONOS-specific TLS options
    tls: {
      rejectUnauthorized: false, // For IONOS often necessary
      minVersion: 'TLSv1.2'
    },
    // Timeout configuration
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 15000,
    // Debug logging
    debug: process.env.NODE_ENV !== 'production',
    logger: true
  })
  
  // Prepare mail options
  const mailOptions: SendMailOptions = {
    from: settings.smtp_from_address,
    to: options.to,
    subject: options.subject,
    html: options.body.replace(/\n/g, '<br>')
  }
  
  // Add attachments if any
  if (options.attachments && options.attachments.length > 0) {
    mailOptions.attachments = options.attachments.map(att => ({
      filename: att.filename,
      content: att.content
    }))
  }
  
  try {
    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('❌ Error sending email:', error)
    
    let errorMessage = 'Fehler beim Senden der E-Mail'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Specific error messages
      if (errorMessage.includes('EAUTH')) {
        errorMessage = 'E-Mail-Authentifizierung fehlgeschlagen. Bitte überprüfen Sie die SMTP-Einstellungen.'
      } else if (errorMessage.includes('ECONNECTION') || errorMessage.includes('ETIMEDOUT')) {
        errorMessage = 'Verbindung zum E-Mail-Server fehlgeschlagen.'
      }
    }
    
    throw new Error(errorMessage)
  }
}

export async function testSmtpConnection(
  host: string,
  port: number,
  user: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      debug: true,
      logger: true
    })
    
    console.log(`🔌 Testing SMTP connection to ${host}:${port}...`)
    await transporter.verify()
    console.log('✅ SMTP connection successful!')
    
    return { success: true }
  } catch (error) {
    console.error('❌ SMTP connection test failed:', error)
    
    let errorMessage = 'Unbekannter Fehler'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Specific error messages
      if (errorMessage.includes('EAUTH')) {
        errorMessage = 'Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Benutzername und Passwort.'
      } else if (errorMessage.includes('ECONNECTION') || errorMessage.includes('ETIMEDOUT')) {
        errorMessage = 'Verbindung zum Server fehlgeschlagen. Bitte überprüfen Sie Host und Port.'
      } else if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = 'SMTP-Server nicht gefunden. Bitte überprüfen Sie den Hostnamen.'
      } else if (errorMessage.includes('CERT')) {
        errorMessage = 'SSL/TLS-Zertifikat-Problem. Verwenden Sie Port 587 anstatt 465.'
      }
    }
    
    return { success: false, error: errorMessage }
  }
}
