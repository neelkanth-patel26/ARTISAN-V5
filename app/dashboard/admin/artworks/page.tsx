'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import {
  Image, CheckCircle, XCircle, Trash2, Search, Edit,
  User, Mail, Phone, X, LayoutGrid, List,
  TrendingUp, Clock, Ban, Layers, Eye, Tag, Ruler, Palette,
  Calendar, DollarSign
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'
type ViewMode = 'grid' | 'list'

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [editForm, setEditForm] = useState({
    title: '', description: '', price: '', medium: '', dimensions: '', category_id: ''
  })
  const [viewingArtwork, setViewingArtwork] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadArtworks(); loadCategories() }, [filter])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
    setCategories(data || [])
  }

  const loadArtworks = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('artworks')
        .select(`*, category:categories(name), artist:users!artworks_artist_id_fkey(full_name, email, phone)`)
        .order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setArtworks(data || [])
    } catch {
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const user = await getCurrentUser()
      const { error } = await supabase.rpc('approve_artwork', { artwork_id: id, admin_id: user?.user_id })
      if (error) throw error
      toast.success('Artwork approved')
      loadArtworks()
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.rpc('reject_artwork', { artwork_id: id })
      if (error) throw error
      toast.success('Artwork rejected')
      loadArtworks()
    } catch { toast.error('Failed to reject') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork permanently?')) return
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id)
      if (error) throw error
      toast.success('Artwork deleted')
      loadArtworks()
    } catch { toast.error('Failed to delete') }
  }

  const handleEdit = (artwork: any) => {
    setEditingArtwork(artwork)
    setEditForm({
      title: artwork.title,
      description: artwork.description || '',
      price: artwork.price.toString(),
      medium: artwork.medium || '',
      dimensions: artwork.dimensions || '',
      category_id: artwork.category_id || ''
    })
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('artworks').update({
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        medium: editForm.medium,
        dimensions: editForm.dimensions,
        category_id: editForm.category_id
      }).eq('id', editingArtwork.id)
      if (error) throw error
      toast.success('Artwork updated')
      setEditingArtwork(null)
      loadArtworks()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const filteredArtworks = artworks.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.artist?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const counts = {
    all: artworks.length,
    pending: artworks.filter(a => a.status === 'pending').length,
    approved: artworks.filter(a => a.status === 'approved').length,
    rejected: artworks.filter(a => a.status === 'rejected').length,
  }

  const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    approved: { label: 'Approved', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    pending:  { label: 'Pending',  dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    rejected: { label: 'Rejected', dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }

  const statsCards = [
    { icon: Layers,    label: 'Gallery Inventory', value: counts.all,      color: 'text-white',       border: 'border-white/5',       glow: 'bg-white/[0.02]' },
    { icon: Clock,     label: 'Awaiting Review',   value: counts.pending,  color: 'text-amber-400',   border: 'border-amber-500/10', glow: 'bg-amber-500/[0.03]' },
    { icon: TrendingUp,label: 'Verified Works',    value: counts.approved, color: 'text-emerald-400', border: 'border-emerald-500/10', glow: 'bg-emerald-500/[0.03]' },
    { icon: Ban,       label: 'Archived/Rejected', value: counts.rejected, color: 'text-rose-400',    border: 'border-rose-500/10',  glow: 'bg-rose-500/[0.03]' },
  ]

  const inputCls = 'w-full px-5 py-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[14px] text-white placeholder-neutral-700 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.04] transition-all'

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen p-6 lg:p-10 space-y-10">
        {/* Atmospheric Sentinel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-700/5 blur-[120px] pointer-events-none -z-10" />

        {/* Header: Global Gallery Sentinel */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-orange-500/30" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-500/50" style={{ fontFamily: 'Oughter, serif' }}>Curatorial Interface</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Gallery Sentinel
            </h1>
            <p className="text-[13px] text-neutral-500 max-w-md leading-relaxed">System-wide oversight of artistic submissions, verification status, and portfolio integrity.</p>
          </div>
          
          <div className="flex items-center gap-3 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.05] backdrop-blur-md">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'text-neutral-600 hover:text-neutral-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'list' ? 'bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'text-neutral-600 hover:text-neutral-400'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {statsCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative group rounded-[1.5rem] md:rounded-[2rem] border ${s.border} ${s.glow} p-4 md:p-6 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <s.icon size={40} strokeWidth={1} />
                </div>
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <p className="text-[9px] md:text-[10px] text-neutral-500 tracking-[0.25em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>{s.label}</p>
                  <p className={`text-2xl md:text-3xl lg:text-4xl font-light ${s.color} tracking-tighter`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sentinel Filtering */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.01] p-2 overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col xl:flex-row items-center gap-2">
            {/* Scan Query */}
            <div className="relative flex-1 w-full min-w-[300px]">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                placeholder="Scan artwork titles or creator identities…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-14 py-5 bg-transparent text-[15px] text-white placeholder-neutral-700 focus:outline-none transition-colors"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={14} className="text-neutral-500" />
                </button>
              )}
            </div>

            <div className="h-10 w-px bg-white/5 hidden xl:block" />

            {/* Nomenclature Filters */}
            <div className="flex flex-wrap items-center gap-2 p-2 w-full xl:w-auto">
              {(['all', 'pending', 'approved', 'rejected'] as FilterType[]).map(f => {
                const sc = statusConfig[f] || { dot: 'bg-white', badge: 'bg-white/10 text-white' }
                const active = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                      active
                        ? `bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-lg shadow-orange-500/5`
                        : 'text-neutral-600 border-transparent hover:text-neutral-400'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <div className={`w-1 h-1 rounded-full ${active ? 'bg-orange-400' : 'bg-neutral-600'} transition-colors`} />
                    {f}
                    <span className="ml-1 opacity-40 text-[9px]">({counts[f]})</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className={`grid gap-4 md:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[300px] md:h-[400px] rounded-[1.5rem] md:rounded-[2rem] border border-white/[0.05] bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="rounded-[2rem] md:rounded-[3rem] border border-white/[0.05] bg-white/[0.01] p-12 md:p-32 flex flex-col items-center gap-6 text-center">
            <div className="w-16 md:w-20 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex items-center justify-center">
              <Image size={28} className="text-orange-500/20" strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Empty Gallery</h3>
              <p className="text-[12px] md:text-[13px] text-neutral-600 max-w-sm mx-auto">No artistic records match the current identification parameters.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setFilter('all'); }}
              className="mt-4 px-6 md:px-8 py-2 md:py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] text-white font-black tracking-[0.3em] uppercase transition-all"
            >
              Reset Sentinel
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredArtworks.map((artwork, i) => {
              const sc = statusConfig[artwork.status] || statusConfig.pending
              return (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative rounded-[1.5rem] md:rounded-[2.5rem] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 overflow-hidden flex flex-col shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Exhibit Visual */}
                  <div className="relative h-40 md:h-64 overflow-hidden shrink-0">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale-[0.2] group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 z-20">
                      <div className={`flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-md border text-[7px] md:text-[8px] font-black tracking-[0.2em] uppercase ${sc.badge}`}>
                        <div className={`w-0.5 md:w-1 h-0.5 md:h-1 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 md:bottom-4 left-4 md:left-6 z-20">
                      <p className="text-lg md:text-2xl font-light text-white leading-none tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        ₹{Number(artwork.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 space-y-3 md:space-y-5 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <p className="text-[9px] md:text-[10px] text-orange-500/60 tracking-[0.2em] uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>{artwork.category?.name || 'Artistic Inquiry'}</p>
                      <h3 className="text-[14px] md:text-[16px] font-light text-white truncate group-hover:text-orange-400 transition-colors" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/[0.02] rounded-xl md:rounded-2xl border border-white/[0.04]">
                      <div className="w-6 md:w-8 h-6 md:h-8 rounded-lg md:rounded-full bg-orange-600/10 border border-orange-600/20 flex items-center justify-center shrink-0">
                        <span className="text-[8px] md:text-[10px] font-black text-orange-400">{(artwork.artist?.full_name || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-[11px] text-white font-light truncate">{artwork.artist?.full_name || 'Anonymous Creator'}</p>
                        <p className="text-[7px] md:text-[8px] text-neutral-600 tracking-widest uppercase font-black">Creator</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-2 md:pt-4 flex flex-col gap-2">
                      {artwork.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(artwork.id)} className="flex-1 py-2 md:py-3 rounded-lg md:rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1">
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => handleReject(artwork.id)} className="flex-1 py-2 md:py-3 rounded-lg md:rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] md:text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1">
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setViewingArtwork(artwork)} className="w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-white text-[8px] md:text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1">
                          <Eye size={11} strokeWidth={1.5} /> Inspect
                        </button>
                      )}
                      <div className="flex gap-1 md:gap-2">
                        <button onClick={() => handleEdit(artwork)} className="flex-1 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-neutral-400 hover:text-white transition-all">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => handleDelete(artwork.id)} className="flex-1 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 text-neutral-600 hover:text-rose-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1.2fr_auto] gap-6 px-10 py-6 border-b border-white/[0.05] text-[9px] text-neutral-600 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>
              <span>Exhibit Artifact</span><span>Creator</span><span>Category</span><span>Status</span><span>Protocols</span>
            </div>
            {filteredArtworks.map((artwork, i) => {
              const sc = statusConfig[artwork.status] || statusConfig.pending
              return (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2.5fr_1.5fr_1fr_1.2fr_auto] gap-6 px-10 py-5 border-b border-white/[0.03] last:border-0 items-center hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl border border-white/[0.08] overflow-hidden shrink-0">
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] text-white font-light truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.title}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">₹{Number(artwork.price).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-orange-600/10 border border-orange-600/20 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-black text-orange-400">{(artwork.artist?.full_name || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-[12px] text-neutral-400 truncate">{artwork.artist?.full_name || 'Anonymous'}</p>
                  </div>

                  <p className="text-[11px] text-neutral-500 truncate" style={{ fontFamily: 'Oughter, serif' }}>{artwork.category?.name || '—'}</p>
                  
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase ${sc.badge}`}>
                      <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {artwork.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(artwork.id)} className="p-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 transition-all"><CheckCircle size={14} /></button>
                        <button onClick={() => handleReject(artwork.id)} className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/10 transition-all"><XCircle size={14} /></button>
                      </>
                    )}
                    <button onClick={() => setViewingArtwork(artwork)} className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 text-neutral-500 hover:text-orange-400 border border-white/5 transition-all"><Eye size={14} /></button>
                    <button onClick={() => handleEdit(artwork)} className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-neutral-500 hover:text-white border border-white/5 transition-all"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(artwork.id)} className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 text-neutral-600 hover:text-rose-400 border border-white/5 transition-all"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* View Modal: Exhibit Inspection (Refined Immersive Version) */}
        <AnimatePresence>
          {viewingArtwork && (() => {
            const sc = statusConfig[viewingArtwork.status] || statusConfig.pending
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center"
              >
                {/* Clear, Light Backdrop Blur */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[20px]" onClick={() => setViewingArtwork(null)} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />
                
                {/* Suburban Ambient Glows */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0 left-0 w-full h-1/2 bg-orange-500/[0.03] blur-[120px] pointer-events-none" 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-[3rem] border border-white/[0.08] bg-neutral-950/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row"
                >
                  {/* Left Column: Immersion Frame */}
                  <div className="relative w-full lg:w-[50%] h-[45vh] lg:h-full bg-neutral-900/40 border-b lg:border-b-0 lg:border-r border-white/[0.05] overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
                    
                    {/* Identification Overlay */}
                    <div className="absolute top-8 left-8 z-40 flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border bg-black/60 backdrop-blur-xl text-[8px] font-black tracking-[0.25em] uppercase ${sc.badge}`}>
                        <div className={`w-1 h-1 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </div>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 font-black" style={{ fontFamily: 'Oughter, serif' }}>Curated Exhibit</p>
                    </div>

                    <div className="relative z-30 w-full h-full flex items-center justify-center p-10 lg:p-20">
                      <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        src={viewingArtwork.image_url}
                        alt={viewingArtwork.title}
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Right Column: Intelligence & Control */}
                  <div className="flex-1 flex flex-col h-full bg-transparent">
                    <div className="flex items-center justify-between px-10 py-8 border-b border-white/[0.05]">
                      <div className="space-y-0.5">
                        <p className="text-[8px] tracking-[0.4em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Registry Entry</p>
                        <p className="text-[10px] text-neutral-500 font-mono tracking-widest">{viewingArtwork.id.toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => { setViewingArtwork(null); handleEdit(viewingArtwork) }}
                          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] text-neutral-500 hover:text-white transition-all border border-white/5"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setViewingArtwork(null)} 
                          className="p-3 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition-all border border-white/5"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12">
                      <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                          <p className="text-[10px] text-orange-500/60 tracking-[0.4em] uppercase font-black mb-4" style={{ fontFamily: 'Oughter, serif' }}>Identity</p>
                          <h2 className="text-5xl lg:text-7xl font-light text-white leading-tight tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{viewingArtwork.title}</h2>
                        </motion.div>
                        
                        {/* Hero Valuation - Moved Here */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2">
                          <p className="text-[11px] text-neutral-500 tracking-[0.4em] uppercase font-black mb-2" style={{ fontFamily: 'Oughter, serif' }}>Evaluation Frame</p>
                          <p className="text-5xl font-light text-white tracking-tighter" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{Number(viewingArtwork.price).toLocaleString()}</p>
                        </motion.div>

                        {viewingArtwork.description && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[14px] text-neutral-400 font-light leading-relaxed max-w-lg pt-6 border-t border-white/[0.03]">
                            {viewingArtwork.description}
                          </motion.p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: Tag,      label: 'Nomenclature', value: viewingArtwork.category?.name || '—' },
                          { icon: Palette,  label: 'Medium Protocol', value: viewingArtwork.medium || '—' },
                          { icon: Ruler,    label: 'Physical Scale', value: viewingArtwork.dimensions || '—' },
                          { icon: Calendar, label: 'Registry Date', value: new Date(viewingArtwork.created_at).toLocaleDateString() },
                        ].map(({ icon: Icon, label, value }, idx) => (
                          <motion.div 
                            key={label} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.5 + idx * 0.05 }}
                            className="p-6 rounded-[2rem] border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col gap-2.5"
                          >
                            <div className="flex items-center gap-2 opacity-50">
                              <Icon size={11} className="text-orange-500" />
                              <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] font-black" style={{ fontFamily: 'Oughter, serif' }}>{label}</p>
                            </div>
                            <p className="text-[15px] text-neutral-200 font-light truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{value}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Artist attribution card */}
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.8 }}
                        className="p-8 rounded-[2.5rem] bg-orange-600/[0.02] border border-orange-500/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                            <span className="text-[20px] font-black text-orange-400">{(viewingArtwork.artist?.full_name || 'U').charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-orange-500/40 tracking-[0.2em] uppercase font-black mb-1" style={{ fontFamily: 'Oughter, serif' }}>Originator</p>
                            <p className="text-[20px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{viewingArtwork.artist?.full_name || 'Anonymous'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <CheckCircle size={14} className="text-emerald-500 inline mr-2" />
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Verified</span>
                        </div>
                      </motion.div>

                      {/* Control protocols */}
                      {viewingArtwork.status === 'pending' && (
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={() => { handleApprove(viewingArtwork.id); setViewingArtwork(null) }}
                            className="flex-3 py-5 px-10 rounded-[2rem] bg-orange-600 hover:bg-orange-500 text-black text-[11px] font-black tracking-[0.2em] uppercase transition-all shadow-xl shadow-orange-950/20 active:scale-95"
                          >
                            Commit Approval
                          </button>
                          <button
                            onClick={() => { handleReject(viewingArtwork.id); setViewingArtwork(null) }}
                            className="flex-1 py-5 rounded-[2rem] bg-white/[0.03] hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 text-[9px] font-black tracking-[0.2em] uppercase border border-white/5 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* Edit Modal: Curation Interface (Refined Immersive Version) */}
        <AnimatePresence>
          {editingArtwork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center"
            >
              {/* Light Backdrop Blur */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[20px]" onClick={() => setEditingArtwork(null)} />
              
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                onClick={e => e.stopPropagation()}
                className="relative w-full h-full md:h-[95vh] md:max-w-6xl md:rounded-[3rem] border border-white/[0.08] bg-neutral-950/60 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Left: Metadata & Attribution Profile */}
                <div className="w-full lg:w-[320px] bg-neutral-900/40 p-10 border-b lg:border-b-0 lg:border-r border-white/[0.05] flex flex-col gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Curation Index</p>
                    <div className="relative group rounded-3xl overflow-hidden border border-white/[0.05]">
                      <img src={editingArtwork.image_url} alt={editingArtwork.title} className="w-full aspect-[4/5] object-cover transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-orange-500/40 font-black" style={{ fontFamily: 'Oughter, serif' }}>Originator Identity</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                        <span className="text-[16px] font-black text-orange-400">{(editingArtwork.artist?.full_name || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[18px] text-white font-light leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>{editingArtwork.artist?.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-neutral-600 font-bold uppercase">Oracle Verified</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Parameter Configuration */}
                <div className="flex-1 flex flex-col h-full bg-transparent">
                  <div className="flex items-center justify-between px-10 py-10 border-b border-white/[0.05]">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>Curation Protocol</h2>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Refining Digital Artifact</p>
                    </div>
                    <button onClick={() => setEditingArtwork(null)} className="p-3 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 border border-white/5 transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12">
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Exhibit Title</label>
                          <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={`${inputCls} p-5 bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] text-[15px]`} />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Evaluation (₹)</label>
                          <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={`${inputCls} p-5 bg-white/[0.02] border-white/[0.05] focus:bg-white/[0.04] text-[15px] font-mono`} />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Artifact Category</label>
                          <select value={editForm.category_id} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })} className={`${inputCls} p-5 bg-white/[0.02] border-white/[0.05] appearance-none`}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Medium Protocol</label>
                          <input type="text" value={editForm.medium} onChange={e => setEditForm({ ...editForm, medium: e.target.value })} className={`${inputCls} p-5 bg-white/[0.02] border-white/[0.05]`} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Narrative Context</label>
                        <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} className={`${inputCls} p-5 bg-white/[0.02] border-white/[0.05] resize-none text-[14px] leading-relaxed`} />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex-1 py-5 rounded-[2rem] bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-800 text-black text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-xl shadow-orange-950/20 active:scale-95"
                      >
                        {saving ? 'Synchronizing...' : 'Commit Configuration'}
                      </button>
                      <button
                        onClick={() => setEditingArtwork(null)}
                        className="px-12 py-5 rounded-[2rem] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-500 hover:text-white text-[9px] font-black tracking-[0.3em] uppercase border border-white/5 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
