'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Plus, Edit, Trash2, MapPin, X, Upload, Calendar, Eye, Clock, User } from 'lucide-react'
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
    try {
      const { data, error } = await supabase.rpc('get_all_exhibitions')
      if (error) throw error
      setExhibitions(data || [])
    } catch (error: any) {
      toast.error('Failed to load exhibitions: ' + error.message)
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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData(prev => ({ ...prev, image_url: data.url }))
      toast.success('Image uploaded')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      image_url: '',
      start_date: '',
      end_date: '',
      status: 'upcoming',
      hours: '',
      artist: '',
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
        toast.success('Exhibition updated')
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
        toast.success('Exhibition created')
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
    if (!confirm('Are you sure you want to delete this exhibition?')) return

    try {
      const { error } = await supabase.rpc('delete_exhibition', { exhibition_id: id })
      if (error) throw error
      toast.success('Exhibition deleted')
      loadExhibitions()
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <PageHeader title="Exhibitions" description="Manage museum exhibitions and events" />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all "
          >
            <Plus size={20} />
            Add Exhibition
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                resetForm()
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit' : 'Create'} Exhibition</h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      resetForm()
                    }}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="text-neutral-400" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-semibold text-white mb-4">Exhibition Image</h4>
                        {formData.image_url ? (
                          <div className="space-y-3">
                            <img src={formData.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image_url: '' })}
                              className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <div className="w-full h-48 bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors flex flex-col items-center justify-center gap-2">
                              <Upload size={32} className="text-neutral-500" />
                              <span className="text-sm text-neutral-400">{uploading ? 'Uploading...' : 'Click to upload'}</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>

                      {editingId && (
                        <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                          <h4 className="text-xs font-semibold text-white mb-3">Exhibition Info</h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-neutral-400">Status</span>
                              <p className="text-white mt-0.5 capitalize">{formData.status}</p>
                            </div>
                            <div>
                              <span className="text-neutral-400">Current Title</span>
                              <p className="text-white mt-0.5">{editingId && exhibitions.find(e => e.id === editingId)?.title}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                      <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-semibold text-white mb-4">Basic Information</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-neutral-300 mb-2">Exhibition Title *</label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Enter exhibition title"
                              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-neutral-300 mb-2">Artist / Curator</label>
                              <input
                                type="text"
                                value={formData.artist}
                                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                                placeholder="e.g. Sarah Chen"
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-neutral-300 mb-2">Status *</label>
                              <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-semibold text-white mb-4">Location & Schedule</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-neutral-300 mb-2">Location *</label>
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="Gallery name or address"
                              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-neutral-300 mb-2">Start Date *</label>
                              <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-neutral-300 mb-2">End Date *</label>
                              <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-neutral-300 mb-2">Hours</label>
                            <input
                              type="text"
                              value={formData.hours}
                              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                              placeholder="e.g. 10:00 AM - 6:00 PM"
                              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <h4 className="text-sm font-semibold text-white mb-4">Description</h4>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          placeholder="Describe the exhibition..."
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      {loading ? 'Saving...' : editingId ? 'Update Exhibition' : 'Create Exhibition'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                        resetForm()
                      }}
                      className="flex-1 px-6 py-3 border border-neutral-700 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-500"></div>
          </div>
        ) : exhibitions.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
            <Calendar className="mx-auto mb-4 text-neutral-600" size={48} />
            <p className="text-neutral-400">No exhibitions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibitions.map((exhibition, index) => (
              <motion.div
                key={exhibition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all"
              >
                {exhibition.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={exhibition.image_url} 
                      alt={exhibition.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent"></div>
                    <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
                      exhibition.status === 'active' ? 'bg-green-600/80 text-white' :
                      exhibition.status === 'upcoming' ? 'bg-blue-600/80 text-white' :
                      exhibition.status === 'completed' ? 'bg-neutral-600/80 text-neutral-200' :
                      'bg-red-600/80 text-white'
                    }`}>
                      {exhibition.status}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">{exhibition.title}</h3>
                  
                  {exhibition.artist && (
                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                      <User size={12} />
                      <span>{exhibition.artist}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                    <MapPin size={12} />
                    <span className="line-clamp-1">{exhibition.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                    <Calendar size={12} />
                    <span className="text-[11px]">
                      {new Date(exhibition.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(exhibition.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {exhibition.hours && (
                    <div className="flex items-center gap-2 text-neutral-400 text-xs mb-3">
                      <Clock size={12} />
                      <span>{exhibition.hours}</span>
                    </div>
                  )}

                  {exhibition.description && (
                    <p className="text-neutral-400 text-xs mb-4 line-clamp-2 leading-relaxed">{exhibition.description}</p>
                  )}
                  
                  <div className="flex gap-2 pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => setViewingExhibition(exhibition)}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(exhibition)}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exhibition.id)}
                      className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-700"
                    >
                      <Trash2 size={12} />
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
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setViewingExhibition(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Exhibition Details</h2>
                  <button onClick={() => setViewingExhibition(null)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                    <X className="text-neutral-400" size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {viewingExhibition.image_url && (
                    <div className="relative h-64 rounded-xl overflow-hidden">
                      <img src={viewingExhibition.image_url} alt={viewingExhibition.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{viewingExhibition.title}</h3>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                      viewingExhibition.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      viewingExhibition.status === 'upcoming' ? 'bg-blue-600/20 text-blue-400' :
                      viewingExhibition.status === 'completed' ? 'bg-neutral-600/20 text-neutral-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {viewingExhibition.status.charAt(0).toUpperCase() + viewingExhibition.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingExhibition.artist && (
                      <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Artist / Curator</label>
                        <div className="flex items-center gap-2 text-white">
                          <User size={16} className="text-neutral-500" />
                          <span className="text-sm">{viewingExhibition.artist}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Location</label>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin size={16} className="text-neutral-500" />
                        <span className="text-sm">{viewingExhibition.location}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                      <label className="block text-xs font-medium text-neutral-400 mb-1">Duration</label>
                      <div className="flex items-center gap-2 text-white">
                        <Calendar size={16} className="text-neutral-500" />
                        <span className="text-sm">
                          {new Date(viewingExhibition.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(viewingExhibition.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {viewingExhibition.hours && (
                      <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                        <label className="block text-xs font-medium text-neutral-400 mb-1">Hours</label>
                        <div className="flex items-center gap-2 text-white">
                          <Clock size={16} className="text-neutral-500" />
                          <span className="text-sm">{viewingExhibition.hours}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {viewingExhibition.description && (
                    <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                      <label className="block text-xs font-medium text-neutral-400 mb-2">Description</label>
                      <p className="text-sm text-neutral-300 leading-relaxed">{viewingExhibition.description}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
