'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Image, CheckCircle, XCircle, Trash2, Search, Edit, User, Mail, Phone, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingArtwork, setEditingArtwork] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    medium: '',
    dimensions: '',
    category_id: ''
  })

  useEffect(() => {
    loadArtworks()
    loadCategories()
  }, [filter])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCategories(data || [])
  }

  const loadArtworks = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('artworks')
        .select(`
          *,
          category:categories(name),
          artist:users!artworks_artist_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setArtworks(data || [])
    } catch (error: any) {
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const user = await getCurrentUser()
      const { error } = await supabase.rpc('approve_artwork', {
        artwork_id: id,
        admin_id: user?.user_id
      })
      if (error) throw error
      toast.success('Artwork approved')
      loadArtworks()
    } catch (error: any) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.rpc('reject_artwork', { artwork_id: id })
      if (error) throw error
      toast.success('Artwork rejected')
      loadArtworks()
    } catch (error: any) {
      toast.error('Failed to reject')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this artwork permanently?')) return
    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Artwork deleted')
      loadArtworks()
    } catch (error: any) {
      toast.error('Failed to delete')
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
      toast.success('Artwork updated')
      setEditingArtwork(null)
      loadArtworks()
    } catch (error: any) {
      toast.error('Failed to update')
    }
  }

  const filteredArtworks = artworks.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.artist?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filterButtons = [
    { value: 'all', label: 'All', count: artworks.length, color: 'bg-neutral-700' },
    { value: 'pending', label: 'Pending', count: artworks.filter(a => a.status === 'pending').length, color: 'bg-neutral-600' },
    { value: 'approved', label: 'Approved', count: artworks.filter(a => a.status === 'approved').length, color: 'bg-neutral-600' },
    { value: 'rejected', label: 'Rejected', count: artworks.filter(a => a.status === 'rejected').length, color: 'bg-neutral-700' },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="space-y-6 p-6 lg:p-10">
        <PageHeader title="Artworks Management" description="Review and manage all artworks on the platform" />

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === btn.value
                    ? `${btn.color} text-white shadow-lg`
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {btn.label} <span className="ml-2 font-bold">({btn.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredArtworks.length === 0 ? (
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-6">
            <EmptyState icon={Image} title="No artworks found" description="No artworks match your current filters" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/50 transition-all duration-300 hover:border-neutral-600"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title} 
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    artwork.status === 'approved' ? 'bg-neutral-700 text-white' :
                    artwork.status === 'pending' ? 'bg-neutral-600 text-white' :
                    'bg-neutral-800 text-white'
                  }`}>
                    {artwork.status}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 truncate">{artwork.title}</h3>
                  <p className="text-sm text-neutral-400 mb-1 truncate">by {artwork.artist?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-neutral-500 mb-2">{artwork.category?.name || 'Uncategorized'}</p>
                  <p className="text-lg font-bold text-neutral-300 mb-3">₹{Number(artwork.price).toLocaleString()}</p>
                  
                  <div className="mb-3 pb-3 border-b border-neutral-800 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Mail size={12} />
                      <span className="truncate">{artwork.artist?.email || 'N/A'}</span>
                    </div>
                    {artwork.artist?.phone && (
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Phone size={12} />
                        <span>{artwork.artist.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {artwork.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(artwork.id)}
                          className="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(artwork.id)}
                          className="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(artwork)}
                      className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
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
              className="w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden my-8"
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

              <div className="grid lg:grid-cols-2 gap-6 p-6">
                <div>
                  <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-800/30 mb-4">
                    <img 
                      src={editingArtwork.image_url} 
                      alt={editingArtwork.title}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
                    <div className="text-sm text-neutral-400 mb-2">Artist Information</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <User size={14} className="text-neutral-500" />
                        <span>{editingArtwork.artist?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <Mail size={14} className="text-neutral-500" />
                        <span className="truncate">{editingArtwork.artist?.email || 'N/A'}</span>
                      </div>
                      {editingArtwork.artist?.phone && (
                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                          <Phone size={14} className="text-neutral-500" />
                          <span>{editingArtwork.artist.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
                      <select
                        value={editForm.category_id}
                        onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                      >
                        <option value="">Select</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Dimensions</label>
                      <input
                        type="text"
                        value={editForm.dimensions}
                        onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
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
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 rounded-lg bg-neutral-600 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-500"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingArtwork(null)}
                      className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
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
