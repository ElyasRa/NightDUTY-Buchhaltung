import express from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

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
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.invoiceTemplate.findMany({
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' }
      ]
    })
    res.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// GET /api/templates/:id - Get one template
router.get('/:id', async (req, res) => {
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
    
    res.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    res.status(500).json({ error: 'Failed to fetch template' })
  }
})

// POST /api/templates - Create new template
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
      return res.status(400).json({ error: 'Cannot delete the default template' })
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
router.put('/:id/set-default', async (req, res) => {
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

// POST /api/templates/upload-logo - Upload logo
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    const logoUrl = `/uploads/logos/${req.file.filename}`
    res.json({ url: logoUrl, filename: req.file.filename })
  } catch (error) {
    console.error('Error uploading logo:', error)
    res.status(500).json({ error: 'Failed to upload logo' })
  }
})

export default router
