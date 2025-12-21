import { defineStore } from 'pinia'
import axios from 'axios'
import config from '../config'

export interface InvoiceTemplateConfig {
  logo: {
    x: number
    y: number
    width: number
    height: number
    url: string
  }
  companyData: {
    x: number
    y: number
    name: string
    address: string
    city: string
    phone: string
    email: string
    website: string
    fontSize: number
    color: string
  }
  bankDetails: {
    x: number
    y: number
    iban: string
    bic: string
    bank: string
    fontSize: number
  }
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
  table: {
    x: number
    y: number
    width: number
    headerBg: string
    headerText: string
    rowBg: string
    alternateRowBg: string
    columns: Array<{ name: string; width: string }>
  }
  footer: {
    x: number
    y: number
    width: number
    text: string
    fontSize: number
    color: string
  }
}

export interface InvoiceTemplate {
  id: number
  name: string
  is_default: boolean
  config: InvoiceTemplateConfig
  created_by?: string
  created_at: string
  updated_at: string
}

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: [] as InvoiceTemplate[],
    currentTemplate: null as InvoiceTemplate | null,
    defaultTemplate: null as InvoiceTemplate | null,
    isEditing: false,
    loading: false,
    error: null as string | null
  }),

  getters: {
    getTemplateById: (state) => (id: number) => {
      return state.templates.find(t => t.id === id)
    },
    
    sortedTemplates: (state) => {
      return [...state.templates].sort((a, b) => {
        if (a.is_default) return -1
        if (b.is_default) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
  },

  actions: {
    async fetchTemplates() {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${config.apiUrl}/api/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.templates = response.data
        this.defaultTemplate = this.templates.find(t => t.is_default) || null
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch templates'
        console.error('Error fetching templates:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTemplate(id: number) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${config.apiUrl}/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch template'
        console.error('Error fetching template:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveTemplate(template: Partial<InvoiceTemplate>) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        
        if (template.id) {
          // Update existing template
          const response = await axios.put(
            `${config.apiUrl}/api/templates/${template.id}`,
            template,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          // Update in local state
          const index = this.templates.findIndex(t => t.id === template.id)
          if (index !== -1) {
            this.templates[index] = response.data
          }
          
          return response.data
        } else {
          // Create new template
          const response = await axios.post(
            `${config.apiUrl}/api/templates`,
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
        this.loading = false
      }
    },

    async deleteTemplate(id: number) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${config.apiUrl}/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Remove from local state
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
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.put(
          `${config.apiUrl}/api/templates/${id}/set-default`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Update all templates
        this.templates = this.templates.map(t => ({
          ...t,
          is_default: t.id === id
        }))
        
        this.defaultTemplate = this.templates.find(t => t.id === id) || null
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to set default template'
        console.error('Error setting default:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadLogo(file: File) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('logo', file)
        
        const response = await axios.post(
          `${config.apiUrl}/api/templates/upload-logo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to upload logo'
        console.error('Error uploading logo:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentTemplate(template: InvoiceTemplate | null) {
      this.currentTemplate = template
    },

    updateElement(elementKey: string, properties: any) {
      if (!this.currentTemplate) return
      
      // Deep update of nested config properties
      this.currentTemplate = {
        ...this.currentTemplate,
        config: {
          ...this.currentTemplate.config,
          [elementKey]: {
            ...(this.currentTemplate.config as any)[elementKey],
            ...properties
          }
        }
      }
    },

    setEditing(value: boolean) {
      this.isEditing = value
    }
  }
})
