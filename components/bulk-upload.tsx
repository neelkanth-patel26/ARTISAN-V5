'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Check, AlertCircle, GripVertical, Trash2, Grid3x3, List } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden group hover:border-amber-600/50 transition-colors ${isDragging ? 'shadow-2xl shadow-amber-600/20 scale-105 z-50' : ''}`}>
      <div className="relative aspect-square bg-neutral-800">
        <img src={artwork.preview} alt="" className="w-full h-full object-cover" />
        <div {...listeners} {...attributes} className="absolute top-2 left-2 cursor-grab active:cursor-grabbing">
          <div className="p-1.5 bg-neutral-900/90 rounded-lg hover:bg-amber-600 transition-colors">
            <GripVertical size={16} className="text-neutral-400" />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          {artwork.status === 'pending' && (
            <button onClick={() => removeArtwork(artwork.id)} className="p-1.5 bg-neutral-900/90 hover:bg-red-600 rounded-lg transition-colors">
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
        {artwork.status !== 'pending' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {artwork.status === 'uploading' && <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />}
            {artwork.status === 'success' && <div className="p-3 bg-green-600 rounded-full"><Check size={24} className="text-white" /></div>}
            {artwork.status === 'error' && <div className="p-3 bg-red-600 rounded-full" title={artwork.error}><AlertCircle size={24} className="text-white" /></div>}
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <input type="text" value={artwork.title} onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)} placeholder="Title *" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={artwork.price} onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)} placeholder="Price *" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <select value={artwork.category} onChange={(e) => updateArtwork(artwork.id, 'category', e.target.value)} disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <input type="text" value={artwork.medium} onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)} placeholder="Medium" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={artwork.dimensions} onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)} placeholder="Dimensions" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <input type="text" value={artwork.year} onChange={(e) => updateArtwork(artwork.id, 'year', e.target.value)} placeholder="Year" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
        </div>
        <input type="text" value={artwork.tags} onChange={(e) => updateArtwork(artwork.id, 'tags', e.target.value)} placeholder="Tags (comma separated)" disabled={artwork.status !== 'pending'} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
      </div>
    </div>
  )
}

function SortableListItem({ artwork, updateArtwork, removeArtwork }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-neutral-900 rounded-xl p-4 border border-neutral-800 hover:border-amber-600/50 transition-colors ${isDragging ? 'shadow-2xl shadow-amber-600/20 z-50' : ''}`}>
      <div className="flex gap-4 items-center">
        <div {...listeners} {...attributes} className="p-2 cursor-grab active:cursor-grabbing hover:text-amber-600 transition-colors">
          <GripVertical size={20} className="text-neutral-400" />
        </div>
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
          <img src={artwork.preview} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 grid grid-cols-4 gap-3">
          <input type="text" value={artwork.title} onChange={(e) => updateArtwork(artwork.id, 'title', e.target.value)} placeholder="Title *" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <input type="number" value={artwork.price} onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)} placeholder="Price *" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <select value={artwork.category} onChange={(e) => updateArtwork(artwork.id, 'category', e.target.value)} disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="text" value={artwork.description} onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)} placeholder="Description" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
        </div>
        <div className="flex-1 grid grid-cols-4 gap-3 mt-2">
          <input type="text" value={artwork.medium} onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)} placeholder="Medium" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <input type="text" value={artwork.dimensions} onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)} placeholder="Dimensions" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <input type="text" value={artwork.year} onChange={(e) => updateArtwork(artwork.id, 'year', e.target.value)} placeholder="Year" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
          <input type="text" value={artwork.tags} onChange={(e) => updateArtwork(artwork.id, 'tags', e.target.value)} placeholder="Tags" disabled={artwork.status !== 'pending'} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-600 focus:outline-none disabled:opacity-50" />
        </div>
        <div className="flex items-center gap-2">
          {artwork.status === 'pending' && <button onClick={() => removeArtwork(artwork.id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>}
          {artwork.status === 'uploading' && <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />}
          {artwork.status === 'success' && <div className="p-2 bg-green-600 rounded-full"><Check size={18} className="text-white" /></div>}
          {artwork.status === 'error' && <div className="p-2 bg-red-600 rounded-full" title={artwork.error}><AlertCircle size={18} className="text-white" /></div>}
        </div>
      </div>
    </div>
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
    for (const artwork of artworks) {
      if (artwork.status === 'success') continue
      updateArtwork(artwork.id, 'status', 'uploading')
      try {
        const formData = new FormData()
        formData.append('file', artwork.file)
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadResponse.ok) throw new Error('Upload failed')
        const { url: publicUrl } = await uploadResponse.json()
        
        // Get category_id from category name
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
        updateArtwork(artwork.id, 'error', error.message)
      }
    }
    setUploading(false)
    toast.success('Bulk upload completed')
    setTimeout(onComplete, 2000)
  }

  const allValid = artworks.every(a => a.title && a.price && parseFloat(a.price) > 0)
  const allUploaded = artworks.every(a => a.status === 'success')

  return (
    <div className="space-y-6">
      {!uploading && (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${isDragActive ? 'border-amber-600 bg-amber-600/10' : 'border-neutral-700 hover:border-amber-600 bg-neutral-900'}`}>
          <input {...getInputProps()} />
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center">
            <Upload size={40} className="text-neutral-600" />
          </div>
          <p className="text-white text-lg font-medium mb-2">Drop images here or click to browse</p>
          <p className="text-neutral-500">Support for PNG, JPG, JPEG, WEBP</p>
        </div>
      )}

      {artworks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-lg font-medium">{artworks.length} Artworks</h3>
              <p className="text-neutral-400 text-sm flex items-center gap-1.5">
                <GripVertical size={14} className="text-amber-600" />
                Drag to reorder items
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'}`}>
                  <Grid3x3 size={18} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'}`}>
                  <List size={18} />
                </button>
              </div>
              {!uploading && !allUploaded && (
                <button onClick={uploadAll} disabled={!allValid} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg transition-all font-medium">
                  Upload All
                </button>
              )}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={artworks.map(a => a.id)} strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {artworks.map((artwork) => (
                    <SortableGridItem key={artwork.id} artwork={artwork} updateArtwork={updateArtwork} removeArtwork={removeArtwork} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {artworks.map((artwork) => (
                    <SortableListItem key={artwork.id} artwork={artwork} updateArtwork={updateArtwork} removeArtwork={removeArtwork} />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}
