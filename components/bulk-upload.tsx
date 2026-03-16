'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Check, AlertCircle, GripVertical, Trash2, Grid3x3, List, Sparkles, Plus, DollarSign, Tag, Info, ArrowRight, Clock } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { triggerNotification, showUploadProgress } from '@/lib/notification-triggers'
import { motion, AnimatePresence } from 'framer-motion'

interface ArtworkData {
  id: string
  file: File
  preview: string
  title: string
  description: string
  category: string
  price: string
  medium: string
  dimensions: string
  year: string
  tags: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const categories = ['Painting', 'Sculpture', 'Photography', 'Digital Art', 'Mixed Media', 'Drawing']

function SortableGridItem({ artwork, updateArtwork, removeArtwork }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] overflow-hidden backdrop-blur-3xl hover:border-orange-500/30 transition-all duration-700 ${isDragging ? 'z-50 ring-2 ring-orange-500/50' : ''}`}
    >
      <div className="relative aspect-square bg-neutral-900/50">
        <img src={artwork.preview} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" />
        
        {/* Interaction Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <div className="absolute top-4 left-4 z-20">
          <div {...listeners} {...attributes} className="p-3 bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-orange-400 transition-colors">
            <GripVertical size={16} />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          {artwork.status === 'pending' && (
            <button onClick={() => removeArtwork(artwork.id)} className="p-3 bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition-all group/close">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Indications */}
        {artwork.status !== 'pending' && (
          <div className="absolute inset-0 z-30 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center">
            {artwork.status === 'uploading' && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-orange-500/20 border-t-orange-500" 
                  />
                  <div className="absolute inset-4 rounded-full border border-white/[0.05] animate-pulse flex items-center justify-center">
                    <Clock size={20} className="text-orange-500/50" />
                  </div>
                </div>
                <p className="text-[9px] uppercase font-black tracking-[0.4em] text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Synchronizing...</p>
              </div>
            )}
            {artwork.status === 'success' && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="flex flex-col items-center gap-4"
              >
                <div className="p-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400" style={{ fontFamily: 'Oughter, serif' }}>Authenticated</p>
              </motion.div>
            )}
            {artwork.status === 'error' && (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="p-5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-rose-400" style={{ fontFamily: 'Oughter, serif' }}>Transmission Fault</p>
                <p className="text-[11px] text-neutral-500 font-light">{artwork.error || 'System rejection'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 space-y-6 bg-gradient-to-b from-transparent to-neutral-950/20">
        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Designation</label>
          <input 
            type="text" 
            value={artwork.title} 
            onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)} 
            placeholder="Title *" 
            disabled={artwork.status !== 'pending'} 
            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-sm font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 focus:bg-white/[0.04] transition-all outline-none disabled:opacity-30" 
            style={{ fontFamily: 'ForestSmooth, serif' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Value (₹)</label>
            <div className="relative">
              <DollarSign size={10} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input 
                type="number" 
                value={artwork.price} 
                onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)} 
                placeholder="0.00" 
                disabled={artwork.status !== 'pending'} 
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl pl-10 pr-4 py-3 text-[13px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
                style={{ fontFamily: 'ForestSmooth, serif' }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Class</label>
            <select 
              value={artwork.category} 
              onChange={(e) => updateArtwork(artwork.id, 'category', e.target.value)} 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3 text-[11px] text-white focus:border-orange-500/40 transition-all outline-none appearance-none cursor-pointer disabled:opacity-30"
            >
              {categories.map(cat => <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Narrative Segment</label>
          <input 
            type="text" 
            value={artwork.description} 
            onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)} 
            placeholder="Description excerpt" 
            disabled={artwork.status !== 'pending'} 
            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-[11px] font-light text-neutral-400 placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Medium</label>
            <input 
              type="text" 
              value={artwork.medium} 
              onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)} 
              placeholder="Oil on Void" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Proportions</label>
            <input 
              type="text" 
              value={artwork.dimensions} 
              onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)} 
              placeholder="24x36 Aspect" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Origin Epoch</label>
            <input 
              type="text" 
              value={artwork.year} 
              onChange={(e) => updateArtwork(artwork.id, 'year', e.target.value)} 
              placeholder="2024" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.4em] font-black text-neutral-600 px-1" style={{ fontFamily: 'Oughter, serif' }}>Associative Tags</label>
            <input 
              type="text" 
              value={artwork.tags} 
              onChange={(e) => updateArtwork(artwork.id, 'tags', e.target.value)} 
              placeholder="ethereal, minimalist" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-3 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 transition-all outline-none disabled:opacity-30" 
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 px-1 text-neutral-700 group-hover:text-neutral-500 transition-colors">
            <Tag size={10} />
            <span className="text-[8px] uppercase tracking-[0.2em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Metadata Registry View</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SortableListItem({ artwork, updateArtwork, removeArtwork }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group relative rounded-3xl bg-white/[0.02] border border-white/[0.05] p-6 hover:bg-white/[0.04] hover:border-orange-500/20 transition-all duration-500 flex items-center gap-8 ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <div {...listeners} {...attributes} className="p-2 cursor-grab active:cursor-grabbing text-neutral-700 hover:text-orange-400 transition-colors">
        <GripVertical size={20} strokeWidth={1.5} />
      </div>

      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-900/50 border border-white/[0.05] shrink-0 relative group/img">
        <img src={artwork.preview} alt="" className="w-full h-full object-cover grayscale-[0.2] group-hover/img:grayscale-0 transition-all duration-700" />
        {artwork.status !== 'pending' && (
           <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center">
              {artwork.status === 'uploading' && <Clock size={16} className="text-orange-500 animate-pulse" />}
              {artwork.status === 'success' && <Check size={16} className="text-emerald-400" />}
              {artwork.status === 'error' && <X size={16} className="text-rose-400" />}
           </div>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Designation</p>
            <input 
              type="text" 
              value={artwork.title} 
              onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)} 
              placeholder="Title *" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-md font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
              style={{ fontFamily: 'ForestSmooth, serif' }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Value (₹)</p>
            <input 
              type="number" 
              value={artwork.price} 
              onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)} 
              placeholder="Price *" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-md font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
              style={{ fontFamily: 'ForestSmooth, serif' }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Class</p>
            <select 
              value={artwork.category} 
              onChange={(e) => updateArtwork(artwork.id, 'category', e.target.value)} 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[11px] text-white focus:border-orange-500/40 outline-none appearance-none cursor-pointer disabled:opacity-30"
            >
              {categories.map(cat => <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Narrative Segment</p>
            <input 
              type="text" 
              value={artwork.description} 
              onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)} 
              placeholder="Description excerpt" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[12px] font-light text-neutral-400 placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Medium</p>
            <input 
              type="text" 
              value={artwork.medium} 
              onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)} 
              placeholder="Oil on Void" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
            />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Proportions</p>
            <input 
              type="text" 
              value={artwork.dimensions} 
              onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)} 
              placeholder="24x36 Aspect" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
            />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Origin Epoch</p>
            <input 
              type="text" 
              value={artwork.year} 
              onChange={(e) => updateArtwork(artwork.id, 'year', e.target.value)} 
              placeholder="2024" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
            />
          </div>
          <div className="space-y-1">
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>Associative Tags</p>
            <input 
              type="text" 
              value={artwork.tags} 
              onChange={(e) => updateArtwork(artwork.id, 'tags', e.target.value)} 
              placeholder="ethereal, minimalist" 
              disabled={artwork.status !== 'pending'} 
              className="w-full bg-transparent border-b border-white/[0.05] py-2 text-[11px] font-light text-white placeholder:text-neutral-700 focus:border-orange-500/40 outline-none transition-all disabled:opacity-30" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pl-4 border-l border-white/[0.05]">
        {artwork.status === 'pending' && (
          <button onClick={() => removeArtwork(artwork.id)} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 hover:text-rose-400 hover:border-rose-500/20 transition-all">
            <Trash2 size={18} strokeWidth={1.5} />
          </button>
        )}
        {artwork.status === 'uploading' && (
          <div className="w-10 h-10 rounded-full border border-orange-500/20 border-t-orange-500 animate-spin" />
        )}
        {artwork.status === 'success' && (
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check size={18} />
          </div>
        )}
        {artwork.status === 'error' && (
          <div className="relative group/fault">
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-help">
              <AlertCircle size={18} />
            </div>
            <div className="absolute right-0 top-full mt-4 w-64 p-4 rounded-2xl bg-neutral-900 border border-rose-500/20 text-[11px] text-neutral-400 backdrop-blur-3xl opacity-0 group-hover/fault:opacity-100 transition-opacity z-[60] pointer-events-none">
               <p className="text-rose-400 uppercase font-black tracking-widest mb-1" style={{ fontFamily: 'Oughter, serif' }}>System Refusal</p>
               {artwork.error || 'Registry synchronization failed.'}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function BulkUpload({ artistId, onComplete }: { artistId: string; onComplete: () => void }) {
  const [artworks, setArtworks] = useState<ArtworkData[]>([])
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const sensors = useSensors(useSensor(PointerSensor))

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newArtworks = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      category: categories[0],
      price: '',
      medium: '',
      dimensions: '',
      year: '',
      tags: '',
      status: 'pending' as const
    }))
    setArtworks(prev => [...prev, ...newArtworks])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true
  })

  const updateArtwork = (id: string, field: keyof ArtworkData, value: any) => {
    setArtworks(prev => prev.map(art => art.id === id ? { ...art, [field]: value } : art))
  }

  const removeArtwork = (id: string) => {
    const artwork = artworks.find(a => a.id === id)
    if (artwork) URL.revokeObjectURL(artwork.preview)
    setArtworks(prev => prev.filter(a => a.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setArtworks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const uploadAll = async () => {
    setUploading(true)
    triggerNotification('UPLOAD_STARTED')
    
    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      if (artwork.status === 'success') continue
      
      updateArtwork(artwork.id, 'status', 'uploading')
      const progress = Math.round(((i + 1) / artworks.length) * 100)
      showUploadProgress(progress, `${i + 1}/${artworks.length} artworks`)
      
      try {
        const formData = new FormData()
        formData.append('file', artwork.file)
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadResponse.ok) throw new Error('Upload failed')
        const { url: publicUrl } = await uploadResponse.json()
        
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', artwork.category)
          .single()
        
        const { error: dbError } = await supabase.from('artworks').insert({
          artist_id: artistId,
          title: artwork.title,
          description: artwork.description,
          category_id: categoryData?.id || null,
          price: parseFloat(artwork.price),
          image_url: publicUrl,
          medium: artwork.medium || null,
          dimensions: artwork.dimensions || null,
          year_created: artwork.year ? parseInt(artwork.year) : null,
          tags: artwork.tags ? artwork.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
          status: 'pending'
        })
        if (dbError) throw dbError
        updateArtwork(artwork.id, 'status', 'success')
      } catch (error: any) {
        updateArtwork(artwork.id, 'status', 'error')
        const errorMsg = error.message || 'Upload failed'
        updateArtwork(artwork.id, 'error', errorMsg)
        toast.error(`Failed: ${artwork.title} - ${errorMsg}`)
      }
    }
    
    setUploading(false)
    triggerNotification('UPLOAD_COMPLETE')
    toast.success('Bulk succession authenticated')
    setTimeout(onComplete, 2000)
  }

  const allValid = artworks.every(a => a.title && a.price && parseFloat(a.price) > 0)
  const allUploaded = artworks.every(a => a.status === 'success')

  return (
    <div className="space-y-12">
      {/* ── Registry Acquisition Dropzone ── */}
      {!uploading && (
        <div 
          {...getRootProps()} 
          className={`group relative border-2 border-dashed rounded-[3.5rem] p-20 text-center cursor-pointer transition-all duration-1000 overflow-hidden ${
            isDragActive 
              ? 'border-orange-500 bg-orange-500/5' 
              : 'border-white/[0.05] hover:border-orange-500/30 bg-white/[0.01]'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/[0.02] to-blue-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <input {...getInputProps()} />
          <div className="relative z-10 space-y-8">
            <div className="w-28 h-28 mx-auto rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500/5 group-hover:border-orange-500/30 transition-all duration-1000">
              <Upload size={36} strokeWidth={1} className={`transition-colors duration-700 ${isDragActive ? 'text-orange-400' : 'text-neutral-700 group-hover:text-orange-400'}`} />
            </div>
            <div className="space-y-2">
               <h3 className="text-3xl font-light text-white tracking-widest" style={{ fontFamily: 'ForestSmooth, serif' }}>Initiate Registry Acquisition</h3>
               <p className="text-[10px] uppercase font-black tracking-[0.4em] text-neutral-600 group-hover:text-neutral-400 transition-colors" style={{ fontFamily: 'Oughter, serif' }}>
                 Relinquish artifacts or select via file navigator
               </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Registry Inventory View ── */}
      {artworks.length > 0 && (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="p-1 px-3 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Curatorial Buffer</span>
                 </div>
                 <Sparkles size={12} className="text-neutral-700" />
              </div>
              <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Inventory <span className="text-neutral-500 italic">Succession</span>
                <span className="ml-4 text-xs font-black tracking-[0.2em] uppercase text-neutral-700">({artworks.length} SEGMENTS)</span>
              </h3>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'Oughter, serif' }}>
                <GripVertical size={12} className="text-orange-500/40" />
                Orchestrate placement through tactical displacement
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Aesthetic Selector */}
              <div className="flex bg-white/[0.02] border border-white/[0.05] rounded-2xl p-1.5 backdrop-blur-2xl">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  <Grid3x3 size={18} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'list' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  <List size={18} strokeWidth={1.5} />
                </button>
              </div>

              {!uploading && !allUploaded && (
                <button 
                  onClick={uploadAll} 
                  disabled={!allValid} 
                  className="group relative px-10 py-4 bg-neutral-900 border border-white/[0.05] rounded-[2rem] overflow-hidden transition-all duration-700 hover:border-orange-500/40 hover:translate-y-[-4px] disabled:opacity-20 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  <div className="relative z-10 flex items-center gap-4">
                     <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                       <Plus size={16} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white" style={{ fontFamily: 'Oughter, serif' }}>Authenticate Succession</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* DnD Context with Artisan Styling */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={artworks.map(a => a.id)} strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
              <div className="relative min-h-[400px]">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artworks.map((artwork) => (
                      <SortableGridItem key={artwork.id} artwork={artwork} updateArtwork={updateArtwork} removeArtwork={removeArtwork} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {artworks.map((artwork) => (
                      <SortableListItem key={artwork.id} artwork={artwork} updateArtwork={updateArtwork} removeArtwork={removeArtwork} />
                    ))}
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
