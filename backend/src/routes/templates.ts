import express from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Configuration constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/logos')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'))
    }
  }
})

// GET /api/templates - List all templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await prisma.invoiceTemplate.findMany({
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' }
      ]
    })
    
    // Legacy-Format konvertieren für alle Templates (non-destructive)
    const convertedTemplates = templates.map(template => {
      const config = template.config as any
      if (config.logo && !config.logos) {
        // Add new format while keeping old format for backward compatibility
        config.logos = [{
          id: 'logo-main',
          x: config.logo.x,
          y: config.logo.y,
          width: config.logo.width,
          height: config.logo.height,
          url: config.logo.url,
          draggable: true,
          resizable: true
        }]
        // Keep old format for backward compatibility
        template.config = config
      }
      return template
    })
    
    res.json(convertedTemplates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// GET /api/templates/:id - Get one template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const templateId = parseInt(id)
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' })
    }
    
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: templateId }
    })
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    
    // Legacy-Format konvertieren (altes "logo" → neues "logos" Array)
    const config = template.config as any
    if (config.logo && !config.logos) {
      // Add new format while keeping old format for backward compatibility
      config.logos = [{
        id: 'logo-main',
        x: config.logo.x,
        y: config.logo.y,
        width: config.logo.width,
        height: config.logo.height,
        url: config.logo.url,
        draggable: true,
        resizable: true
      }]
      // Keep old format for backward compatibility
      template.config = config
    }
    
    res.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    res.status(500).json({ error: 'Failed to fetch template' })
  }
})

// POST /api/templates - Create new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, config, is_default, created_by } = req.body
    
    // If this template is being set as default, unset all others
    if (is_default) {
      await prisma.invoiceTemplate.updateMany({
        where: { is_default: true },
        data: { is_default: false }
      })
    }
    
    const template = await prisma.invoiceTemplate.create({
      data: {
        name,
        config,
        is_default: is_default || false,
        created_by
      }
    })
    
    res.status(201).json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
})

// PUT /api/templates/:id - Update template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const templateId = parseInt(id)
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' })
    }
    
    const { name, config, is_default } = req.body
    
    // If this template is being set as default, unset all others
    if (is_default) {
      await prisma.invoiceTemplate.updateMany({
        where: { 
          is_default: true,
          id: { not: templateId }
        },
        data: { is_default: false }
      })
    }
    
    const template = await prisma.invoiceTemplate.update({
      where: { id: templateId },
      data: {
        name,
        config,
        is_default
      }
    })
    
    res.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})

// DELETE /api/templates/:id - Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const templateId = parseInt(id)
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' })
    }
    
    // Check if it's the default template
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: templateId }
    })
    
    if (template?.is_default) {
      return res.status(400).json({ 
        error: 'Cannot delete the default template. Please set another template as default first.' 
      })
    }
    
    await prisma.invoiceTemplate.delete({
      where: { id: templateId }
    })
    
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

// PUT /api/templates/:id/set-default - Set template as default
router.put('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const templateId = parseInt(id)
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' })
    }
    
    // Unset all other defaults
    await prisma.invoiceTemplate.updateMany({
      where: { is_default: true },
      data: { is_default: false }
    })
    
    // Set this one as default
    const template = await prisma.invoiceTemplate.update({
      where: { id: templateId },
      data: { is_default: true }
    })
    
    res.json(template)
  } catch (error) {
    console.error('Error setting default template:', error)
    res.status(500).json({ error: 'Failed to set default template' })
  }
})

// POST /api/templates/upload-logo - Upload logo (supports multiple)
router.post('/upload-logo', authenticateToken, upload.array('logos', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    
    // Prepare data for batch insert
    const logosData = req.files.map(file => ({
      id: randomUUID(),
      name: file.originalname,
      filename: file.filename,
      url: `/uploads/logos/${file.filename}`,
      size: file.size
    }))
    
    // Batch insert for better performance
    await prisma.logo.createMany({
      data: logosData
    })
    
    // Fetch the created logos to return them
    const uploadedLogos = await prisma.logo.findMany({
      where: {
        filename: {
          in: req.files.map(f => f.filename)
        }
      }
    })
    
    res.json({ logos: uploadedLogos })
  } catch (error) {
    console.error('Error uploading logos:', error)
    res.status(500).json({ error: 'Failed to upload logos' })
  }
})

// GET /api/templates/logos - Get all logos
router.get('/logos', authenticateToken, async (req, res) => {
  try {
    const logos = await prisma.logo.findMany({
      orderBy: { uploaded_at: 'desc' }
    })
    res.json(logos)
  } catch (error) {
    console.error('Error fetching logos:', error)
    res.status(500).json({ error: 'Failed to fetch logos' })
  }
})

// DELETE /api/templates/logos/:id - Delete logo
router.delete('/logos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    
    const logo = await prisma.logo.findUnique({
      where: { id }
    })
    
    if (!logo) {
      return res.status(404).json({ error: 'Logo not found' })
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../public', logo.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    // Delete from database
    await prisma.logo.delete({
      where: { id }
    })
    
    res.json({ message: 'Logo deleted successfully' })
  } catch (error) {
    console.error('Error deleting logo:', error)
    res.status(500).json({ error: 'Failed to delete logo' })
  }
})

export default router
