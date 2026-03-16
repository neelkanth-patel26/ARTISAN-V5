'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { 
  Plus, Edit, Trash2, MapPin, X, Upload, 
  Calendar, Eye, Clock, User, ArrowUpRight,
  Globe, Sparkles, LayoutGrid, List
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminExhibitions() {
  const [exhibitions, setExhibitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewingExhibition, setViewingExhibition] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    image_url: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'completed' | 'cancelled',
    hours: '',
    artist: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadExhibitions()
  }, [])

  const loadExhibitions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_all_exhibitions')
      if (error) throw error
      setExhibitions(data || [])
    } catch (error: any) {
      toast.error('Failed to load exhibitions')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'exhibitions')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData(prev => ({ ...prev, image_url: data.url }))
      toast.success('Visual Artifact Link Established')
    } catch (error) {
      toast.error('Failed to upload visual')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '', description: '', location: '', image_url: '',
      start_date: '', end_date: '', status: 'upcoming',
      hours: '', artist: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (editingId) {
        const { error } = await supabase.rpc('update_exhibition', {
          p_id: editingId,
          p_title: formData.title,
          p_description: formData.description,
          p_location: formData.location,
          p_image_url: formData.image_url,
          p_start_date: formData.start_date,
          p_end_date: formData.end_date,
          p_status: formData.status,
          p_hours: formData.hours || null,
          p_artist: formData.artist || null,
        })
        if (error) throw error
        toast.success('Exhibition Protocol Updated')
      } else {
        const { error } = await supabase.rpc('create_exhibition', {
          p_title: formData.title,
          p_description: formData.description,
          p_location: formData.location,
          p_image_url: formData.image_url,
          p_start_date: formData.start_date,
          p_end_date: formData.end_date,
          p_status: formData.status,
          p_created_by: user?.user_id,
          p_hours: formData.hours || null,
          p_artist: formData.artist || null,
        })
        if (error) throw error
        toast.success('New Exhibition Sequence Created')
      }

      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadExhibitions()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (exhibition: any) => {
    setEditingId(exhibition.id)
    setFormData({
      title: exhibition.title,
      description: exhibition.description || '',
      location: exhibition.location,
      image_url: exhibition.image_url || '',
      start_date: exhibition.start_date?.split('T')[0] ?? '',
      end_date: exhibition.end_date?.split('T')[0] ?? '',
      status: exhibition.status,
      hours: exhibition.hours ?? '',
      artist: exhibition.artist ?? '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exhibition sequence?')) return

    try {
      const { error } = await supabase.rpc('delete_exhibition', { exhibition_id: id })
      if (error) throw error
      toast.success('Exhibition Protocol Terminated')
      loadExhibitions()
    } catch (error: any) {
      toast.error('Failed to terminate sequence: ' + error.message)
    }
  }

  const statusColors: any = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    upcoming: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    completed: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen p-6 lg:p-12 space-y-12 overflow-hidden">
        {/* Atmospheric Sentinel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-700/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 space-y-10">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <PageHeader 
              title="Exhibition Registry" 
              description="Orchestrating global artifact showcases and immersive curations" 
            />
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-4 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black rounded-[2rem] transition-all shadow-xl shadow-orange-950/20 active:scale-95 text-[11px] font-black uppercase tracking-[0.3em]"
              style={{ fontFamily: 'Oughter, serif' }}
            >
              <Plus size={18} />
              Initiate Showcase
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10"
              >
                {/* Light Backdrop Blur */}
                <div 
                  className="absolute inset-0 bg-black/20 backdrop-blur-[20px]" 
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm() }} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full h-full md:max-w-6xl md:h-[95vh] bg-neutral-950/60 backdrop-blur-3xl border border-white/[0.08] md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row"
                >
                  {/* Left: Metadata Side */}
                  <div className="w-full lg:w-[320px] bg-neutral-900/40 p-10 border-b lg:border-b-0 lg:border-r border-white/[0.05] flex flex-col gap-10">
                    <div className="space-y-4">
                      <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Visual Key</p>
                      <div className="relative group rounded-3xl overflow-hidden border border-white/[0.05] bg-black/40 aspect-[4/5]">
                        {formData.image_url ? (
                          <>
                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group-hover:bg-white/[0.02] transition-colors">
                            <Upload size={32} className="text-neutral-700 mb-4 group-hover:text-orange-500 transition-colors" />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-600 group-hover:text-orange-400 transition-colors font-black">Upload Artifact</p>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-orange-500/40 font-black" style={{ fontFamily: 'Oughter, serif' }}>Curation Info</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Globe size={14} className="text-neutral-600" />
                          <span className="text-[12px] font-light text-neutral-400 capitalize">{formData.status} Protocol</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Sparkles size={14} className="text-neutral-600" />
                          <span className="text-[12px] font-light text-neutral-400">Scan ID: {editingId ? editingId.slice(0, 8) : 'New Entry'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Curatorial Form */}
                  <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
                    <div className="flex items-center justify-between px-10 py-10 border-b border-white/[0.05]">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Showcase Protocol</h2>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Defining Environmental Context</p>
                      </div>
                      <button onClick={() => { setShowForm(false); setEditingId(null); resetForm() }} className="p-3 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 border border-white/5 transition-all">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-full space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Exhibition Nomenclature</label>
                          <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" placeholder="e.g. Renaissance Revived" required />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Lead Curator / Artist</label>
                          <input type="text" value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" placeholder="Name or Identity" />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Status Configuration</label>
                          <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all appearance-none">
                            <option value="upcoming" className="bg-neutral-900">Upcoming Sequence</option>
                            <option value="active" className="bg-neutral-900">Active Showcase</option>
                            <option value="completed" className="bg-neutral-900">Archived Collection</option>
                            <option value="cancelled" className="bg-neutral-900">Terminated Protocol</option>
                          </select>
                        </div>
                        <div className="col-span-full space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Physical Identification (Location)</label>
                          <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" placeholder="Gallery Address" required />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Inception Date</label>
                          <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" required />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Termination Date</label>
                          <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" required />
                        </div>
                        <div className="col-span-full space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Operational Hours</label>
                          <input type="text" value={formData.hours} onChange={e => setFormData({ ...formData, hours: e.target.value })} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[15px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all" placeholder="e.g. 09:00 - 21:00 Daily" />
                        </div>
                        <div className="col-span-full space-y-3">
                          <label className="block text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] ml-2">Curatorial Narrative</label>
                          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[14px] text-white focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.04] transition-all resize-none" placeholder="Elaborate on the artistic intent..." />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 py-5 rounded-[2rem] bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-800 text-black text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-xl shadow-orange-950/20 active:scale-95">
                          {loading ? 'Synchronizing Archive...' : editingId ? 'Commit Modifications' : 'Commit New Identity'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm() }} className="px-12 py-5 rounded-[2rem] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-500 hover:text-white text-[9px] font-black tracking-[0.3em] uppercase border border-white/5 transition-all">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="w-16 h-16 border-t-2 border-orange-600 rounded-full animate-spin" />
              <p className="text-[10px] tracking-[0.5em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Synchronizing Showcase Data</p>
            </div>
          ) : exhibitions.length === 0 ? (
            <div className="py-40 bg-white/[0.01] border border-white/[0.05] border-dashed rounded-[3rem] text-center flex flex-col items-center gap-6">
              <Calendar className="text-neutral-800" size={64} />
              <p className="text-[10px] tracking-[0.5em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>The Registry is Silent</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exhibitions.map((exhibition, index) => (
                <motion.div
                  key={exhibition.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-neutral-900/30 border border-white/[0.05] rounded-[2.5rem] overflow-hidden hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-700 shadow-2xl relative"
                >
                  <div className="relative h-[280px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <img
                      src={exhibition.image_url || '/placeholder.jpg'}
                      alt={exhibition.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
                    
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${statusColors[exhibition.status]}`}>
                        {exhibition.status}
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-8 right-8">
                      <h3 className="text-2xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{exhibition.title}</h3>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      {exhibition.artist && (
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-500 group-hover/item:text-orange-500 transition-colors">
                            <User size={16} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Curator / Artist</p>
                            <p className="text-[14px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{exhibition.artist}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-500 group-hover/item:text-orange-500 transition-colors">
                          <MapPin size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Location Vector</p>
                          <p className="text-[14px] font-light text-white truncate max-w-[200px]" style={{ fontFamily: 'ForestSmooth, serif' }}>{exhibition.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-500 group-hover/item:text-orange-500 transition-colors">
                          <Calendar size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Showcase Window</p>
                          <p className="text-[14px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {new Date(exhibition.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(exhibition.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-white/[0.03]">
                      <button
                        onClick={() => setViewingExhibition(exhibition)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-all border border-white/5"
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        <Eye size={14} />
                        Inspect
                      </button>
                      <button
                        onClick={() => handleEdit(exhibition)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/[0.03] hover:bg-orange-600/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-orange-400 transition-all border border-white/5"
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        <Edit size={14} />
                        Refine
                      </button>
                      <button
                        onClick={() => handleDelete(exhibition.id)}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-rose-500/10 text-neutral-600 hover:text-rose-400 border border-white/5 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {viewingExhibition && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10"
              >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[20px]" onClick={() => setViewingExhibition(null)} />
                <motion.div
                  initial={{ scale: 0.98, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.98, opacity: 0, y: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-neutral-950/60 backdrop-blur-3xl border border-white/[0.08] md:rounded-[3rem] p-10 max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <p className="text-[10px] tracking-[0.5em] uppercase text-orange-500/60 font-black" style={{ fontFamily: 'Oughter, serif' }}>Exhibition Inspection</p>
                      <h2 className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>Showcase Intelligence</h2>
                    </div>
                    <button onClick={() => setViewingExhibition(null)} className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-neutral-500 transition-all border border-white/5">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-12">
                    {viewingExhibition.image_url && (
                      <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        <img src={viewingExhibition.image_url} alt={viewingExhibition.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8">
                          <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${statusColors[viewingExhibition.status]}`}>
                            {viewingExhibition.status} showcase
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Exhibit Nomenclature</h3>
                        <p className="text-2xl font-light text-white leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{viewingExhibition.title}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-1">
                          <p className="text-[8px] tracking-[0.2em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Launch Sequence</p>
                          <p className="text-[15px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {new Date(viewingExhibition.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-1">
                          <p className="text-[8px] tracking-[0.2em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Archival Limit</p>
                          <p className="text-[15px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {new Date(viewingExhibition.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Location Vector</h3>
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-orange-500/50" />
                          <p className="text-lg font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{viewingExhibition.location}</p>
                        </div>
                      </div>

                      <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Operational Registry</h3>
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-orange-500/50" />
                          <p className="text-lg font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{viewingExhibition.hours || 'Adaptive Hours'}</p>
                        </div>
                      </div>

                      <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] md:col-span-2 space-y-4">
                        <h3 className="text-[10px] tracking-[0.3em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Curatorial Narrative</h3>
                        <p className="text-lg font-light text-neutral-400 leading-relaxed italic" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          "{viewingExhibition.description || 'No narrative provided for this sequence.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  )
}
