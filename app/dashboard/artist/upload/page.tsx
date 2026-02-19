'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Upload, Loader2, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { BulkUpload } from '@/components/bulk-upload'

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

      // Upload to local API instead of Supabase Storage
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) throw new Error('Image upload failed')

      const { url: publicUrl } = await uploadResponse.json()

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

      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-white">Artwork uploaded!</p>
            <p className="text-xs text-neutral-400">Awaiting admin approval</p>
          </div>
        </div>,
        { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '16px', borderRadius: '12px' } }
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
            <p className="font-medium text-white">Upload failed</p>
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
      <div className="p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Upload Artwork</h1>
          <p className="text-neutral-400">Add new artworks to your portfolio</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 inline-flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Single Upload
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bulk'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bulk Upload
          </button>
        </div>

        {activeTab === 'single' ? (
          <form onSubmit={handleSubmit} className="max-w-7xl">
            <div className="grid lg:grid-cols-[1.2fr,1fr] gap-8">
              {/* Left - Form */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
                  <h3 className="text-lg font-medium text-white mb-6">Basic Information</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                        placeholder="Enter artwork title"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none resize-none transition-colors"
                        placeholder="Describe your artwork..."
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
                  <h3 className="text-lg font-medium text-white mb-6">Additional Details</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Medium</label>
                        <input
                          type="text"
                          value={formData.medium}
                          onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                          placeholder="Oil on canvas"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Dimensions</label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          placeholder="24x36 in"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Year</label>
                        <input
                          type="number"
                          value={formData.year_created}
                          onChange={(e) => setFormData({ ...formData, year_created: e.target.value })}
                          placeholder="2024"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="abstract, modern, colorful"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Artwork
                    </>
                  )}
                </button>
              </div>

              {/* Right - Image & Preview */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8">
                  <h3 className="text-lg font-medium text-white mb-6">Artwork Image *</h3>
                  <label className="block cursor-pointer group">
                    <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-12 hover:border-amber-600 transition-all group-hover:bg-neutral-800/50 relative overflow-hidden">
                      {uploading && (
                        <div className="absolute inset-0 bg-neutral-900/90 flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                              <div className="absolute inset-0 rounded-full border-4 border-amber-600/20" />
                              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin" />
                              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-amber-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" style={{ animationDuration: '2s' }} />
                            </div>
                            <p className="text-neutral-300 text-sm font-medium">Processing image...</p>
                          </div>
                        </div>
                      )}
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="w-full h-72 object-contain rounded-xl" />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                            <p className="text-white text-sm">Click to change image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImageIcon className="text-neutral-600 group-hover:text-amber-600 transition-colors" size={32} />
                          </div>
                          <p className="text-neutral-300 font-medium mb-1">Click to upload</p>
                          <p className="text-neutral-500 text-sm">PNG, JPG up to 10MB</p>
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

                {/* Preview Card */}
                {imagePreview && (
                  <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                    <div className="p-4 border-b border-neutral-800">
                      <h3 className="text-sm font-medium text-neutral-400">Preview</h3>
                    </div>
                    <div className="p-6">
                      <div className="bg-neutral-800 rounded-xl overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full aspect-square object-cover" />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-white text-2xl font-semibold">
                              {formData.price ? `₹${parseFloat(formData.price).toLocaleString()}` : '₹0'}
                            </span>
                            {formData.category_id && (
                              <span className="text-xs text-neutral-400 bg-neutral-700 px-3 py-1 rounded-full">
                                {categories.find(c => c.id === formData.category_id)?.name}
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-medium text-lg mb-2">
                            {formData.title || 'Artwork Title'}
                          </h4>
                          {formData.description && (
                            <p className="text-neutral-400 text-sm line-clamp-2">{formData.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : (
          user && <BulkUpload artistId={user.user_id} onComplete={() => router.push('/dashboard/artist/artworks')} />
        )}
      </div>
    </DashboardLayout>
  )
}
