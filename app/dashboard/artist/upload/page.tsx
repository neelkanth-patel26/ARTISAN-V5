'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Upload, Loader2, Image as ImageIcon, CheckCircle2, XCircle, Sparkles, Plus, Info, Palette, Clock, Tag, Box, Ruler, DollarSign, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BulkUpload } from '@/components/bulk-upload'
import { triggerNotification, showUploadProgress } from '@/lib/notification-triggers'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadArtwork() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    medium: '',
    dimensions: '',
    year_created: '',
    tags: '',
  })

  useEffect(() => {
    loadCategories()
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
    setCategories(data || [])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user || !user.user_id) throw new Error('Not authenticated')

      const imageInput = document.getElementById('image') as HTMLInputElement
      const file = imageInput.files?.[0]
      if (!file) throw new Error('Please select an image')

      triggerNotification('UPLOAD_STARTED')

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          if (progress % 25 === 0) showUploadProgress(progress, file.name)
        }
      })

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const { url } = JSON.parse(xhr.responseText)
            resolve(url)
          } else {
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('POST', '/api/upload')
        xhr.send(uploadFormData)
      })

      const publicUrl = await uploadPromise

      triggerNotification('UPLOAD_COMPLETE')

      const { data, error: insertError } = await supabase.from('artworks').insert({
        artist_id: user.user_id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        medium: formData.medium,
        dimensions: formData.dimensions,
        year_created: formData.year_created ? parseInt(formData.year_created) : null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        image_url: publicUrl,
        status: 'pending'
      }).select().single()

      if (insertError) throw insertError

      triggerNotification('ARTWORK_UPLOADED')

      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="font-medium text-white">Artwork authenticated!</p>
            <p className="text-xs text-neutral-400">Awaiting curatorial approval</p>
          </div>
        </div>,
        { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
      router.push('/dashboard/artist')
    } catch (error: any) {
      const errorMessage = error.message || 'Please try again'
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <XCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white">Submission Interrupted</p>
            <p className="text-xs text-neutral-400">{errorMessage}</p>
          </div>
        </div>,
        { duration: 4000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] right-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
          {/* ── Submission Command Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400">Atelier Portal</span>
                </div>
                <Sparkles size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Manifest <span className="text-neutral-500 italic">Creation</span>
              </h1>
              <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
                Infuse the digital registry with your latest aesthetic contribution.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="inline-flex rounded-2xl bg-white/[0.02] p-1 border border-white/[0.05] backdrop-blur-3xl">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all duration-500 ${
                  activeTab === 'single'
                    ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20'
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
                style={{ fontFamily: 'Oughter, serif' }}
              >
                Single Artifact
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all duration-500 ${
                  activeTab === 'bulk'
                    ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20'
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
                style={{ fontFamily: 'Oughter, serif' }}
              >
                Bulk Succession
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'single' ? (
              <motion.form
                key="single"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                onSubmit={handleSubmit}
                className="grid lg:grid-cols-[1.2fr,1fr] gap-12"
              >
                {/* Left - Aesthetic Parameters */}
                <div className="space-y-10">
                  <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-orange-400">
                        <Info size={18} />
                      </div>
                      <h3 className="text-xl font-light text-white uppercase tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Aesthetic Identity</h3>
                    </div>

                    <div className="grid gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Designation *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white/[0.01] border border-white/[0.05] rounded-3xl px-8 py-4 text-lg font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 focus:bg-white/[0.02] transition-all outline-none"
                          placeholder="Epoch of Serenity"
                          required
                          style={{ fontFamily: 'ForestSmooth, serif' }}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Exchange Valve (₹) *</label>
                          <div className="relative">
                             <DollarSign size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                             <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-3xl pl-12 pr-8 py-4 text-xl font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 focus:bg-white/[0.02] transition-all outline-none"
                              placeholder="0.00"
                              required
                              style={{ fontFamily: 'ForestSmooth, serif' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Curatorial Category</label>
                          <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full bg-white/[0.01] border border-white/[0.05] rounded-3xl px-8 py-4 text-[13px] text-white focus:border-orange-500/40 focus:bg-white/[0.02] transition-all outline-none appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-neutral-900 border-none">Select Class</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id} className="bg-neutral-900">{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Conceptual Narrative</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={5}
                          className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[2rem] px-8 py-6 text-[15px] font-light text-neutral-400 placeholder:text-neutral-700 focus:border-orange-500/40 focus:bg-white/[0.02] transition-all outline-none resize-none leading-relaxed"
                          placeholder="Elucidate the soul of this manifestation..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Specifics */}
                  <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/[0.03] space-y-8 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-blue-400">
                        <Box size={18} />
                      </div>
                      <h3 className="text-xl font-light text-white uppercase tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Physical Specifics</h3>
                    </div>

                    <div className="grid gap-8">
                       <div className="grid md:grid-cols-3 gap-8">
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Medium</label>
                            <input
                              type="text"
                              value={formData.medium}
                              onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                              placeholder="Oil on Void"
                              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-2xl px-6 py-3.5 text-sm font-light text-white placeholder:text-neutral-700 focus:border-blue-500/40 transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Proportions</label>
                            <input
                              type="text"
                              value={formData.dimensions}
                              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                              placeholder="24x36 Aspect"
                              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-2xl px-6 py-3.5 text-sm font-light text-white placeholder:text-neutral-700 focus:border-blue-500/40 transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Origin Epoch</label>
                            <input
                              type="number"
                              value={formData.year_created}
                              onChange={(e) => setFormData({ ...formData, year_created: e.target.value })}
                              placeholder="2024"
                              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-2xl px-6 py-3.5 text-sm font-light text-white placeholder:text-neutral-700 focus:border-blue-500/40 transition-all outline-none"
                            />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Associative Tags</label>
                          <div className="relative">
                            <Tag size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                            <input
                              type="text"
                              value={formData.tags}
                              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                              placeholder="ethereal, minimalist, transcendent"
                              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-2xl pl-12 pr-6 py-3.5 text-sm font-light text-white placeholder:text-neutral-700 focus:border-blue-500/40 transition-all outline-none"
                            />
                          </div>
                        </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full p-8 rounded-[2.5rem] bg-neutral-900 border border-white/[0.05] overflow-hidden transition-all duration-700 hover:border-orange-500/40 hover:translate-y-[-4px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/[0.03] to-amber-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center justify-center gap-6">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin text-orange-400" size={24} />
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Synchronizing Artifact...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500">
                            <Upload size={20} />
                          </div>
                          <span className="text-xl font-light text-white tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Authenticate Manifestation</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Right - Visual Capture & Registry Preview */}
                <div className="space-y-12">
                  {/* Visual Capture Area */}
                  <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-cyan-400">
                        <ImageIcon size={18} />
                      </div>
                      <h3 className="text-xl font-light text-white uppercase tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Visual Capture</h3>
                    </div>

                    <label className="block cursor-pointer group relative">
                      <div className="relative aspect-[4/5] rounded-[2.5rem] border-2 border-dashed border-white/[0.05] overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-700 hover:border-orange-500/40 hover:bg-white/[0.01]">
                        {uploading && (
                          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-20 space-y-6">
                            <motion.div 
                               animate={{ rotate: 360 }} 
                               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                               className="w-24 h-24 rounded-full border border-orange-500/20 border-t-orange-500" 
                            />
                            <p className="text-[10px] uppercase font-black tracking-widest text-orange-400 animate-pulse" style={{ fontFamily: 'Oughter, serif' }}>Processing Optic Data...</p>
                          </div>
                        )}
                        
                        {imagePreview ? (
                          <div className="relative w-full h-full">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2rem] grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                              <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                 <Plus size={24} className="text-white" />
                              </div>
                              <p className="text-[10px] uppercase font-black tracking-widest text-white" style={{ fontFamily: 'Oughter, serif' }}>Replace Specimen</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-6 relative z-10">
                            <div className="w-28 h-28 mx-auto rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500/5 group-hover:border-orange-500/20 transition-all duration-700">
                              <Upload size={36} strokeWidth={1} className="text-neutral-700 group-hover:text-orange-400" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-lg font-light text-white tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Initiate Optic Upload</p>
                               <p className="text-[9px] uppercase font-black tracking-[0.3em] text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>High Fidelity PNG/JPG • up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>

                  {/* Registry Tag Preview */}
                  <AnimatePresence>
                    {imagePreview && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-10 rounded-[3rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl space-y-8"
                      >
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                               <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Manifestation Registry</p>
                               <h4 className="text-xl font-light text-white uppercase" style={{ fontFamily: 'ForestSmooth, serif' }}>Live Tag <span className="text-neutral-600">Preview</span></h4>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-white/[0.05] flex items-center justify-center animate-pulse">
                               <div className="w-2 h-2 rounded-full bg-orange-500" />
                            </div>
                         </div>

                         <div className="group relative rounded-[2.5rem] bg-neutral-900 border border-white/[0.05] overflow-hidden transition-all duration-700">
                            <div className="aspect-[4/3] overflow-hidden relative">
                              <img src={imagePreview} alt="Final Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-60" />
                              <div className="absolute top-6 right-6">
                                <div className="px-5 py-2 rounded-full bg-neutral-900/60 backdrop-blur-md border border-white/5 flex items-center gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-neutral-300" style={{ fontFamily: 'Oughter, serif' }}>AUTHENTICATING</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-10 space-y-6">
                               <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h3 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{formData.title || 'Artifact Untitled'}</h3>
                                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>
                                      {categories.find(c => c.id === formData.category_id)?.name || 'Unclassified Segment'}
                                    </p>
                                  </div>
                               </div>

                               <div className="pt-8 border-t border-white/[0.03] flex items-end justify-between">
                                  <div className="space-y-2">
                                     <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Acquisition Value</p>
                                     <p className="text-4xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                       ₹{formData.price ? parseFloat(formData.price).toLocaleString() : '0'}
                                     </p>
                                  </div>
                                  <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] text-neutral-800">
                                     <ArrowRight size={24} strokeWidth={1} />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl"
              >
                {user && <BulkUpload artistId={user.user_id} onComplete={() => router.push('/dashboard/artist/artworks')} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  )
}
