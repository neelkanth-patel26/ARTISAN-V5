'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Edit, Trash2, Eye, Heart, Image, Package, CheckCircle, Clock, XCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ArtworkManagement() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    medium: '',
    dimensions: '',
    category_id: ''
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    loadArtworks()
    loadCategories()
    
    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => {
        loadArtworks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCategories(data || [])
  }

  const loadArtworks = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('artist_id', user.user_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error: any) {
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
    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: editForm.title,
          description: editForm.description,
          price: parseFloat(editForm.price),
          medium: editForm.medium,
          dimensions: editForm.dimensions,
          category_id: editForm.category_id
        })
        .eq('id', editingArtwork.id)

      if (error) throw error
      
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Artwork Updated</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Changes saved successfully</div>
          </div>
        </div>
      ))
      
      setEditingArtwork(null)
      loadArtworks()
    } catch (error: any) {
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Update Failed</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Could not save changes</div>
          </div>
        </div>
      ))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Artwork Deleted</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Removed from your collection</div>
          </div>
        </div>
      ))
      
      loadArtworks()
    } catch (error: any) {
      toast.custom((t) => (
        <div style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '2px' }}>Delete Failed</div>
            <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Could not remove artwork</div>
          </div>
        </div>
      ))
    }
  }

  const stats = {
    total: artworks.length,
    approved: artworks.filter(a => a.status === 'approved').length,
    pending: artworks.filter(a => a.status === 'pending').length,
    rejected: artworks.filter(a => a.status === 'rejected').length
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="My Artworks" description="Manage and track your artwork collection" />

        {!loading && artworks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Package size={20} className="text-neutral-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-neutral-400">Total Artworks</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.approved}</div>
              <div className="text-sm text-neutral-400">Approved</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock size={20} className="text-yellow-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.pending}</div>
              <div className="text-sm text-neutral-400">Pending Review</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle size={20} className="text-red-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.rejected}</div>
              <div className="text-sm text-neutral-400">Rejected</div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : artworks.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <EmptyState
              icon={Image}
              title="No artworks yet"
              description="Upload your first artwork to start selling on the platform"
              action={
                <Link
                  href="/dashboard/artist/upload"
                  className="rounded-lg bg-neutral-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-500"
                >
                  Upload Artwork
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800/30 transition-all hover:border-neutral-700"
              >
                <div className="relative h-56 overflow-hidden bg-neutral-900">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105" 
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {artwork.category?.name && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-900/80 backdrop-blur-sm text-neutral-300 border border-neutral-700">
                        {artwork.category.name}
                      </span>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      artwork.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      artwork.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {artwork.status}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{artwork.title}</h3>
                  <p className="mb-4 text-2xl font-bold text-white">₹{artwork.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-400 mb-5 pb-5 border-b border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <Eye size={16} className="text-neutral-500" />
                      <span className="font-medium">{artwork.views || 0}</span>
                      <span className="text-neutral-500">views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={16} className="text-neutral-500" />
                      <span className="font-medium">{artwork.likes_count || 0}</span>
                      <span className="text-neutral-500">likes</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(artwork)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-600"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-red-600 text-white text-sm rounded-lg transition-all"
                      title="Delete artwork"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {editingArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto" onClick={() => setEditingArtwork(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden my-8"
            >
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Edit Artwork</h2>
                <button
                  onClick={() => setEditingArtwork(null)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-800/30">
                    <img 
                      src={editingArtwork.image_url} 
                      alt={editingArtwork.title}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
                    <div className="text-sm text-neutral-400 mb-2">Preview</div>
                    <div className="text-lg font-bold text-white mb-1">{editForm.title || 'Untitled'}</div>
                    <div className="text-2xl font-bold text-white mb-3">₹{editForm.price ? parseFloat(editForm.price).toLocaleString() : '0'}</div>
                    <div className="flex gap-3 text-sm text-neutral-400">
                      {editForm.medium && <span>• {editForm.medium}</span>}
                      {editForm.dimensions && <span>• {editForm.dimensions}</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                      placeholder="Enter artwork title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
                      <div className="relative">
                        <select
                          value={editForm.category_id}
                          onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 appearance-none cursor-pointer"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Medium</label>
                      <input
                        type="text"
                        value={editForm.medium}
                        onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                        placeholder="e.g. Oil on Canvas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Dimensions</label>
                      <input
                        type="text"
                        value={editForm.dimensions}
                        onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                        placeholder="e.g. 24x36 inches"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 resize-none"
                      placeholder="Describe your artwork..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 rounded-lg bg-neutral-600 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-500"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingArtwork(null)}
                      className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
