import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '../config'

// Logo interface
export interface Logo {
  id: string
  name: string
  filename: string
  url: string
  size: number
  uploaded_at: string
}

// Draggable element interfaces
export interface DraggableElement {
  id: string
  type: 'logo' | 'text' | 'placeholder' | 'table' | 'line'
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  locked?: boolean
  visible?: boolean
}

export interface LogoElement extends DraggableElement {
  type: 'logo'
  logoId: string
  url: string
}

export interface TextElement extends DraggableElement {
  type: 'text'
  content: string
  fontSize: number
  fontFamily: string
  color: string
  bold?: boolean
  italic?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface PlaceholderElement extends DraggableElement {
  type: 'placeholder'
  placeholder: string
  fontSize: number
  fontFamily: string
  color: string
}

export interface TableElement extends DraggableElement {
  type: 'table'
  headerBg: string
  headerText: string
  rowBg: string
  alternateRowBg: string
  columns: Array<{ name: string; width: number }>
}

export interface LineElement extends DraggableElement {
  type: 'line'
  orientation: 'horizontal' | 'vertical'
  thickness: number
  color: string
}

export type TemplateElement = LogoElement | TextElement | PlaceholderElement | TableElement | LineElement

// Template configuration
export interface TemplateConfig {
  elements: TemplateElement[]
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
  companyData: {
    name: string
    address: string
    city: string
    phone: string
    email: string
    website: string
  }
  bankDetails: {
    iban: string
    bic: string
    bank: string
  }
  grid: {
    enabled: boolean
    size: number
    snap: boolean
  }
}

export interface InvoiceTemplate {
  id: number
  name: string
  is_default: boolean
  config: TemplateConfig
  created_by?: string
  created_at: string
  updated_at: string
}

// Test invoice data
export interface TestInvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customer: {
    name: string
    address: string
    city: string
  }
  positions: Array<{
    pos: number
    description: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
}

export const useInvoiceTemplateStore = defineStore('invoiceTemplate', {
  state: () => ({
    // Logos
    logos: [] as Logo[],
    loadingLogos: false,
    
    // Templates
    templates: [] as InvoiceTemplate[],
    currentTemplate: null as InvoiceTemplate | null,
    
    // Editor state
    selectedElement: null as TemplateElement | null,
    zoom: 100,
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
    
    // Preview mode
    previewMode: 'editor' as 'editor' | 'test',
    testData: null as TestInvoiceData | null,
    
    // History for undo/redo
    history: [] as TemplateConfig[],
    historyIndex: -1,
    maxHistorySize: 50,
    
    // Loading states
    loading: false,
    saving: false,
    error: null as string | null
  }),

  getters: {
    canUndo: (state) => state.historyIndex > 0,
    canRedo: (state) => state.historyIndex < state.history.length - 1,
    
    sortedElements: (state) => {
      if (!state.currentTemplate?.config?.elements) return []
      return [...state.currentTemplate.config.elements].sort((a, b) => a.zIndex - b.zIndex)
    },
    
    getTestInvoiceData: (state) => {
      if (state.testData) return state.testData
      
      // Generate default test data
      return {
        invoiceNumber: 'RE-2025-001',
        date: new Date().toLocaleDateString('de-DE'),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
        customer: {
          name: 'Musterfirma GmbH',
          address: 'Musterstraße 123',
          city: '12345 Musterstadt'
        },
        positions: [
          { pos: 1, description: 'Nachtdienst 01.12.2025', quantity: 8, price: 45.00, total: 360.00 },
          { pos: 2, description: 'Nachtdienst 08.12.2025', quantity: 8, price: 45.00, total: 360.00 },
          { pos: 3, description: 'Frühzeitige Übernahme', quantity: 2, price: 25.00, total: 50.00 },
          { pos: 4, description: 'Pauschale Dezember', quantity: 1, price: 150.00, total: 150.00 }
        ],
        subtotal: 920.00,
        tax: 174.80,
        total: 1094.80
      } as TestInvoiceData
    }
  },

  actions: {
    // ========== Logo Management ==========
    async fetchLogos() {
      this.loadingLogos = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/templates/logos`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.logos = response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch logos'
        console.error('Error fetching logos:', error)
        throw error
      } finally {
        this.loadingLogos = false
      }
    },

    async uploadLogos(files: File[]) {
      this.loadingLogos = true
      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        
        files.forEach(file => {
          formData.append('logos', file)
        })
        
        const response = await axios.post(
          `${API_BASE_URL}/templates/upload-logo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        const uploadedLogos = response.data.logos
        this.logos.push(...uploadedLogos)
        
        return uploadedLogos
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to upload logos'
        console.error('Error uploading logos:', error)
        throw error
      } finally {
        this.loadingLogos = false
      }
    },

    async deleteLogo(id: string) {
      this.loadingLogos = true
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/templates/logos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.logos = this.logos.filter(logo => logo.id !== id)
        
        // Remove logo elements from current template
        if (this.currentTemplate?.config?.elements) {
          this.currentTemplate.config.elements = this.currentTemplate.config.elements.filter(
            el => !(el.type === 'logo' && (el as LogoElement).logoId === id)
          )
          this.saveHistory()
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete logo'
        console.error('Error deleting logo:', error)
        throw error
      } finally {
        this.loadingLogos = false
      }
    },

    // ========== Template Management ==========
    async fetchTemplates() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.templates = response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch templates'
        console.error('Error fetching templates:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveTemplate(template: Partial<InvoiceTemplate>) {
      this.saving = true
      try {
        const token = localStorage.getItem('token')
        
        if (template.id) {
          const response = await axios.put(
            `${API_BASE_URL}/templates/${template.id}`,
            template,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          const index = this.templates.findIndex(t => t.id === template.id)
          if (index !== -1) {
            this.templates[index] = response.data
          }
          
          if (this.currentTemplate?.id === template.id) {
            this.currentTemplate = response.data
          }
          
          return response.data
        } else {
          const response = await axios.post(
            `${API_BASE_URL}/templates`,
            template,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          this.templates.push(response.data)
          return response.data
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to save template'
        console.error('Error saving template:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteTemplate(id: number) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.templates = this.templates.filter(t => t.id !== id)
        
        if (this.currentTemplate?.id === id) {
          this.currentTemplate = null
        }
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to delete template'
        console.error('Error deleting template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async setDefault(id: number) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `${API_BASE_URL}/templates/${id}/set-default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        this.templates = this.templates.map(t => ({
          ...t,
          is_default: t.id === id
        }))
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to set default template'
        console.error('Error setting default:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== Element Management ==========
    addElement(element: TemplateElement) {
      if (!this.currentTemplate?.config) return
      
      const maxZIndex = Math.max(
        0,
        ...this.currentTemplate.config.elements.map(el => el.zIndex)
      )
      element.zIndex = maxZIndex + 1
      
      this.currentTemplate.config.elements.push(element)
      this.saveHistory()
    },

    removeElement(elementId: string) {
      if (!this.currentTemplate?.config) return
      
      this.currentTemplate.config.elements = this.currentTemplate.config.elements.filter(
        el => el.id !== elementId
      )
      
      if (this.selectedElement?.id === elementId) {
        this.selectedElement = null
      }
      
      this.saveHistory()
    },

    updateElement(elementId: string, updates: Partial<TemplateElement>) {
      if (!this.currentTemplate?.config) return
      
      const index = this.currentTemplate.config.elements.findIndex(el => el.id === elementId)
      if (index !== -1) {
        this.currentTemplate.config.elements[index] = {
          ...this.currentTemplate.config.elements[index],
          ...updates
        }
        
        if (this.selectedElement?.id === elementId) {
          this.selectedElement = this.currentTemplate.config.elements[index]
        }
      }
    },

    duplicateElement(elementId: string) {
      if (!this.currentTemplate?.config) return
      
      const element = this.currentTemplate.config.elements.find(el => el.id === elementId)
      if (!element) return
      
      const duplicate = {
        ...JSON.parse(JSON.stringify(element)),
        id: `element-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
        zIndex: Math.max(...this.currentTemplate.config.elements.map(el => el.zIndex)) + 1
      }
      
      this.currentTemplate.config.elements.push(duplicate)
      this.saveHistory()
    },

    moveElementForward(elementId: string) {
      if (!this.currentTemplate?.config) return
      
      const element = this.currentTemplate.config.elements.find(el => el.id === elementId)
      if (!element) return
      
      const nextHigher = this.currentTemplate.config.elements
        .filter(el => el.zIndex > element.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0]
      
      if (nextHigher) {
        const temp = element.zIndex
        element.zIndex = nextHigher.zIndex
        nextHigher.zIndex = temp
      }
      
      this.saveHistory()
    },

    moveElementBackward(elementId: string) {
      if (!this.currentTemplate?.config) return
      
      const element = this.currentTemplate.config.elements.find(el => el.id === elementId)
      if (!element) return
      
      const nextLower = this.currentTemplate.config.elements
        .filter(el => el.zIndex < element.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0]
      
      if (nextLower) {
        const temp = element.zIndex
        element.zIndex = nextLower.zIndex
        nextLower.zIndex = temp
      }
      
      this.saveHistory()
    },

    selectElement(element: TemplateElement | null) {
      this.selectedElement = element
    },

    // ========== History Management (Undo/Redo) ==========
    saveHistory() {
      if (!this.currentTemplate?.config) return
      
      // Remove future history if we're not at the end
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      
      // Add current state to history
      this.history.push(JSON.parse(JSON.stringify(this.currentTemplate.config)))
      
      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift()
      } else {
        this.historyIndex++
      }
    },

    undo() {
      if (!this.canUndo || !this.currentTemplate) return
      
      this.historyIndex--
      this.currentTemplate.config = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
    },

    redo() {
      if (!this.canRedo || !this.currentTemplate) return
      
      this.historyIndex++
      this.currentTemplate.config = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
    },

    initializeHistory() {
      if (!this.currentTemplate?.config) return
      
      this.history = [JSON.parse(JSON.stringify(this.currentTemplate.config))]
      this.historyIndex = 0
    },

    // ========== Editor State ==========
    setZoom(zoom: number) {
      this.zoom = Math.max(50, Math.min(150, zoom))
    },

    toggleGrid() {
      this.showGrid = !this.showGrid
    },

    toggleSnap() {
      this.snapToGrid = !this.snapToGrid
    },

    setPreviewMode(mode: 'editor' | 'test') {
      this.previewMode = mode
    },

    setCurrentTemplate(template: InvoiceTemplate | null) {
      this.currentTemplate = template
      if (template) {
        this.initializeHistory()
      }
    }
  }
})
