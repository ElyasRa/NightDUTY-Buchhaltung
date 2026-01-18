import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '../config'

export interface Invoice {
  id: number
  invoice_number: string
  company_id: number
  company?: {
    id: number
    name: string
    address?: string
    city?: string
    email?: string
    phone?: string
  }
  template_id?: number
  invoice_date: string
  due_date: string
  period_start: string
  period_end: string
  billing_type: string
  total_hours?: number
  hourly_rate?: number
  takeover_hours?: number
  takeover_rate?: number
  count_pkw?: number
  count_lkw?: number
  count_oilspill?: number
  price_pkw?: number
  price_lkw?: number
  price_oilspill?: number
  service_fee?: number
  monthly_rate?: number
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: string
  paid_date?: string
  dunning_level: number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    currentInvoice: null as Invoice | null,
    invoices: [] as Invoice[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchInvoice(id: number) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/invoices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch invoice'
        console.error('Error fetching invoice:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setCurrentInvoice(invoice: Invoice | null) {
      this.currentInvoice = invoice
      // Store in session storage for persistence across navigation
      if (invoice) {
        sessionStorage.setItem('currentInvoice', JSON.stringify(invoice))
      } else {
        sessionStorage.removeItem('currentInvoice')
      }
    },

    loadCurrentInvoiceFromSession() {
      const stored = sessionStorage.getItem('currentInvoice')
      if (stored) {
        try {
          this.currentInvoice = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored invoice from session storage:', e)
          sessionStorage.removeItem('currentInvoice')
        }
      }
    },

    clearCurrentInvoice() {
      this.currentInvoice = null
      sessionStorage.removeItem('currentInvoice')
    }
  }
})
