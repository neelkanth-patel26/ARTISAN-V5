'use client'

import { useState } from 'react'
import { Download, FileText, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function ExportTransactions({ userId, role }: { userId: string; role: string }) {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [exporting, setExporting] = useState(false)

  const exportData = async () => {
    setExporting(true)

    try {
      // Fetch transactions
      let query = supabase
        .from('transactions')
        .select('*, artworks(title), users!buyer_id(full_name)')

      if (role === 'artist') {
        query = query.eq('artist_id', userId)
      } else if (role === 'collector') {
        query = query.eq('buyer_id', userId)
      }

      if (dateRange.from) {
        query = query.gte('created_at', dateRange.from)
      }
      if (dateRange.to) {
        query = query.lte('created_at', dateRange.to)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      if (format === 'csv') {
        exportToCSV(data)
      } else {
        exportToPDF(data)
      }

      toast.success('Export completed')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data: any[]) => {
    const headers = ['Date', 'Type', 'Artwork', 'Buyer', 'Amount', 'Platform Fee', 'Net Earnings', 'Status']
    const rows = data.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.transaction_type,
      t.artworks?.title || 'N/A',
      t.users?.full_name || 'N/A',
      t.amount,
      t.platform_fee,
      t.artist_earnings,
      t.status
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async (data: any[]) => {
    // Generate PDF using jsPDF or similar library
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: data, userId, role })
    })

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={24} className="text-amber-600" />
        <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
          Export Transactions
        </h3>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm text-neutral-400 mb-2">Export Format</label>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat('csv')}
            className={`flex-1 py-3 rounded-lg border transition-all ${
              format === 'csv'
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
            }`}
          >
            CSV
          </button>
          <button
            onClick={() => setFormat('pdf')}
            className={`flex-1 py-3 rounded-lg border transition-all ${
              format === 'pdf'
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-amber-600/50'
            }`}
          >
            PDF
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportData}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg transition-all"
      >
        {exporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={20} />
            Export Transactions
          </>
        )}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Export includes all transaction details, fees, and earnings
      </p>
    </div>
  )
}
