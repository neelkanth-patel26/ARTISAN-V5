'use client'

import { useState } from 'react'
import { Download, FileText, Calendar, Table2, FileBadge, CheckCircle2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function ExportTransactions({ userId, role }: { userId: string; role: string }) {
  const [format, setFormat]     = useState<'csv' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [exporting, setExporting] = useState(false)
  const [done, setDone]         = useState(false)

  const exportData = async () => {
    setExporting(true)
    setDone(false)
    try {
      let query = supabase
        .from('transactions')
        .select('*, artworks(title), users!buyer_id(full_name)')

      if (role === 'artist')    query = query.eq('artist_id', userId)
      else if (role === 'collector') query = query.eq('buyer_id', userId)
      if (dateRange.from) query = query.gte('created_at', dateRange.from)
      if (dateRange.to)   query = query.lte('created_at', dateRange.to)

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      if (format === 'csv') exportToCSV(data)
      else await exportToPDF(data)

      setDone(true)
      toast.success('Export completed')
      setTimeout(() => setDone(false), 2500)
    } catch {
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
      t.status,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `transactions-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async (data: any[]) => {
    const res  = await fetch('/api/export-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transactions: data, userId, role }) })
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `transactions-${Date.now()}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  const formats = [
    { id: 'csv' as const, label: 'CSV',  icon: Table2,    desc: 'Spreadsheet-ready'  },
    { id: 'pdf' as const, label: 'PDF',  icon: FileBadge, desc: 'Print-ready report'  },
  ]

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-600/15 border border-amber-600/25 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-base font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Export Transactions
          </h3>
          <p className="text-[11px] text-neutral-600 mt-0.5">Download your transaction history</p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Format */}
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.3em] uppercase font-black text-neutral-700">Format</p>
          <div className="grid grid-cols-2 gap-2.5">
            {formats.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all text-left ${
                  format === f.id
                    ? 'bg-amber-600/15 border-amber-600/30 shadow-[inset_0_0_0_1px_rgba(217,119,6,0.15)]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  format === f.id ? 'bg-amber-600/25' : 'bg-white/[0.04]'
                }`}>
                  <f.icon size={15} className={format === f.id ? 'text-amber-400' : 'text-neutral-600'} strokeWidth={1.5} />
                </div>
                <div>
                  <p className={`text-sm font-light transition-colors ${format === f.id ? 'text-amber-300' : 'text-neutral-400'}`}
                    style={{ fontFamily: 'Oughter, serif' }}>
                    {f.label}
                  </p>
                  <p className="text-[10px] text-neutral-700 mt-0.5">{f.desc}</p>
                </div>
                {format === f.id && (
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <p className="text-[10px] tracking-[0.3em] uppercase font-black text-neutral-700">Date Range</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: 'from' as const, label: 'From' },
              { key: 'to'   as const, label: 'To'   },
            ].map(({ key, label }) => (
              <div key={key} className="relative">
                <label className="block text-[11px] text-neutral-600 mb-1.5 ml-0.5">{label}</label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                  <input
                    type="date"
                    value={dateRange[key]}
                    onChange={e => setDateRange(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-600/40 focus:bg-amber-600/[0.03] transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            ))}
          </div>
          {(dateRange.from || dateRange.to) && (
            <button
              onClick={() => setDateRange({ from: '', to: '' })}
              className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors mt-1"
            >
              Clear range
            </button>
          )}
        </div>

        {/* Summary note */}
        <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3">
          <Sparkles size={12} className="text-amber-600/50 mt-0.5 shrink-0" />
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            Export includes transaction date, type, artwork, amount, platform fee, net earnings, and status.
          </p>
        </div>

        {/* Export Button */}
        <motion.button
          onClick={exportData}
          disabled={exporting}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-light tracking-wide transition-all ${
            done
              ? 'bg-emerald-600/20 border border-emerald-600/30 text-emerald-400'
              : exporting
              ? 'bg-white/[0.04] border border-white/[0.06] text-neutral-600 cursor-not-allowed'
              : 'bg-amber-600/20 border border-amber-600/30 text-amber-400 hover:bg-amber-600/30 hover:border-amber-600/50'
          }`}
          style={{ fontFamily: 'Oughter, serif' }}
        >
          {done ? (
            <>
              <CheckCircle2 size={16} strokeWidth={1.5} />
              Exported Successfully
            </>
          ) : exporting ? (
            <>
              <div className="w-4 h-4 border border-neutral-600 border-t-neutral-300 rounded-full animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download size={15} strokeWidth={1.5} />
              Export as {format.toUpperCase()}
            </>
          )}
        </motion.button>

      </div>
    </div>
  )
}
