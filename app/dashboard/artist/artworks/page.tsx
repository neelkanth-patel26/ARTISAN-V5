'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Edit, Trash2, Eye, Heart, Image, CheckCircle, Clock, XCircle, X, Plus, ArrowRight, Package, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArtworkManagement() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', medium: '', dimensions: '', category_id: '' })
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadArtworks()
    loadCategories()
    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, loadArtworks)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
    setCategories(data || [])
  }

  const loadArtworks = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return
      const { data, error } = await supabase
        .from('artworks')
        .select('*, category:categories(name)')
        .eq('artist_id', user.user_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setArtworks(data || [])
    } catch {
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
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
      const { error } = await supabase
        .from('artworks')
        .update({
          title: editForm.title,
          description: editForm.description,
          price: parseFloat(editForm.price),
          medium: editForm.medium,
          dimensions: editForm.dimensions,
          category_id: editForm.category_id || null
        })
        .eq('id', editingArtwork.id)
      if (error) throw error
      toast.success('Artwork updated')
      setEditingArtwork(null)
      loadArtworks()
    } catch {
      toast.error('Failed to update artwork')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork? This action is irreversible.')) return
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id)
      if (error) throw error
      toast.success('Artwork deleted')
      loadArtworks()
    } catch {
      toast.error('Failed to delete artwork')
    }
  }

  const stats = {
    total: artworks.length,
    approved: artworks.filter(a => a.status === 'approved').length,
    pending: artworks.filter(a => a.status === 'pending').length,
    rejected: artworks.filter(a => a.status === 'rejected').length,
  }

  const inputCls = 'w-full px-5 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all'

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen">
        {/* Atmospheric Sentinel Glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Gallery Archive</span>
                </div>
                <Sparkles size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                My <span className="text-neutral-500 italic">Artworks</span>
              </h1>
              <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
                Manage and curate your creative portfolio.
              </p>
            </div>
            <Link
              href="/dashboard/artist/upload"
              className="group relative flex items-center gap-4 px-8 py-4 rounded-3xl bg-neutral-900 border border-white/[0.05] hover:border-orange-500/30 transition-all duration-700 hover:translate-y-[-4px]"
            >
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500">
                <Plus size={18} />
              </div>
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-white/90" style={{ fontFamily: 'Oughter, serif' }}>Upload Artwork</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : artworks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 rounded-[3.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl flex flex-col items-center gap-8 text-center"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                <Image size={32} className="text-neutral-700" strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>No Artworks Yet</h3>
                <p className="text-[13px] text-neutral-500 font-light max-w-xs">Upload your first artwork to start building your portfolio.</p>
              </div>
              <Link
                href="/dashboard/artist/upload"
                className="px-8 py-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-orange-600/20 transition-all duration-500"
                style={{ fontFamily: 'Oughter, serif' }}
              >
                Upload Artwork
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Artworks', value: stats.total, icon: Package, color: 'text-blue-400', glow: 'bg-blue-500/5' },
                  { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-400', glow: 'bg-emerald-500/5' },
                  { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-400', glow: 'bg-amber-500/5' },
                  { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-400', glow: 'bg-rose-500/5' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group hover:border-orange-500/20 transition-all duration-700 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${stat.glow}`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] ${stat.color} group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-700`}>
                          <stat.icon size={18} strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-[9px] tracking-[0.4em] uppercase font-black text-neutral-600 group-hover:text-neutral-400 transition-colors mb-2" style={{ fontFamily: 'Oughter, serif' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Section Header */}
              <div className="flex items-end justify-between px-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Portfolio Registry</p>
                  <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>All <span className="text-neutral-500">Creations</span></h2>
                </div>
                <span className="text-[10px] text-neutral-600 font-black tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{artworks.length} works</span>
              </div>

              {/* Artwork Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {artworks.map((artwork, i) => (
                    <motion.div
                      key={artwork.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                      className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] overflow-hidden backdrop-blur-3xl hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={artwork.image_url}
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute top-6 right-6">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${
                              artwork.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : artwork.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                            style={{ fontFamily: 'Oughter, serif' }}
                          >
                            {artwork.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-10 space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-light text-white group-hover:text-orange-400 transition-colors duration-700 line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {artwork.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="h-px w-8 bg-orange-500/20" />
                            <p className="text-[11px] text-neutral-500 tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{artwork.category?.name || 'Uncategorized'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-[10px] text-neutral-600 font-black tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>
                          <div className="flex items-center gap-2">
                            <Eye size={13} className="text-neutral-700" />
                            <span>{artwork.views || artwork.views_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart size={13} className="text-neutral-700" />
                            <span>{artwork.likes_count || 0}</span>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/[0.03] flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Price</p>
                            <p className="text-xl text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{Number(artwork.price).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(artwork)}
                              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 hover:text-white hover:border-orange-500/30 transition-all duration-500"
                            >
                              <Edit size={16} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(artwork.id)}
                              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-500"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[20px]"
              onClick={() => setEditingArtwork(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-[2.5rem] border border-white/[0.08] bg-neutral-950 overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)]"
            >
              <div className="flex flex-col lg:flex-row" style={{ maxHeight: '88vh' }}>
                {/* Left — Image Preview (Hidden on Mobile) */}
                <div className="relative hidden lg:block lg:w-[380px] shrink-0 bg-neutral-900 overflow-hidden" style={{ minHeight: 260 }}>
                  <img
                    src={editingArtwork.image_url}
                    alt={editingArtwork.title}
                    className="w-full h-full object-cover opacity-60"
                    style={{ minHeight: 260 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                  {/* Live preview card */}
                  <div className="absolute bottom-8 left-8 right-8 p-6 rounded-[1.5rem] bg-black/50 backdrop-blur-2xl border border-white/[0.08] space-y-3">
                    <p className="text-[9px] text-orange-500/60 font-black uppercase tracking-[0.4em]" style={{ fontFamily: 'Oughter, serif' }}>Live Preview</p>
                    <h4 className="text-xl font-light text-white leading-tight line-clamp-2" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {editForm.title || 'Untitled'}
                    </h4>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                      <p className="text-lg font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        ₹{editForm.price ? parseFloat(editForm.price).toLocaleString() : '0'}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        editingArtwork.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : editingArtwork.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`} style={{ fontFamily: 'Oughter, serif' }}>{editingArtwork.status}</span>
                    </div>
                  </div>
                </div>

                {/* Right — Form */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Modal Header */}
                  <div className="px-10 py-8 border-b border-white/[0.05] flex items-center justify-between shrink-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                          <span className="text-[9px] tracking-[0.4em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Edit Artwork</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        Refine <span className="text-neutral-500 italic">Details</span>
                      </h2>
                    </div>
                    <button
                      onClick={() => setEditingArtwork(null)}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-500 hover:text-white hover:border-white/[0.1] transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          className={inputCls}
                          placeholder="Artwork title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Price (₹)</label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                          className={inputCls}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Category</label>
                        <select
                          value={editForm.category_id}
                          onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                          className={inputCls + ' appearance-none cursor-pointer'}
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Medium</label>
                        <input
                          type="text"
                          value={editForm.medium}
                          onChange={e => setEditForm({ ...editForm, medium: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. Oil on canvas"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Dimensions</label>
                      <input
                        type="text"
                        value={editForm.dimensions}
                        onChange={e => setEditForm({ ...editForm, dimensions: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. 24 × 36 inches"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                        className={inputCls + ' resize-none leading-relaxed'}
                        placeholder="Describe your artwork..."
                      />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="px-10 py-8 border-t border-white/[0.05] flex gap-4 shrink-0 bg-neutral-950/60">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditingArtwork(null)}
                      className="px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[9px] text-neutral-400 font-black tracking-widest uppercase hover:bg-white/[0.06] transition-all"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
