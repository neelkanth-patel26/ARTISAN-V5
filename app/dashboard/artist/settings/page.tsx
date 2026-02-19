'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Loader2, Upload as UploadIcon, CheckCircle2, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser, getProfile, updateProfile } from '@/lib/auth'
import { toast } from 'sonner'
import { ExportTransactions } from '@/components/export-transactions'

const inputClass =
  'w-full rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-white focus:border-neutral-500 focus:outline-none'
const labelClass = 'mb-2 block text-sm font-medium text-neutral-300'

export default function ArtistSettings() {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    upi_id: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    if (currentUser?.user_id) {
      const profile = await getProfile(currentUser.user_id)
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          bio: profile.bio || '',
          website: profile.website || '',
          upi_id: profile.upi_id || '',
        })
        if (profile.upi_qr_code) {
          setQrCodeUrl(profile.upi_qr_code)
          setQrPreview(profile.upi_qr_code)
        }
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url)
          setAvatarPreview(profile.avatar_url)
        }
      }
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profiles')
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const { url } = await response.json()
      setAvatarPreview(url)
      setAvatarUrl(url)
      toast.success('Avatar uploaded')
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profiles')
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const { url } = await response.json()
      setQrPreview(url)
      setQrCodeUrl(url)
      toast.success('QR code uploaded')
    } catch (error) {
      toast.error('Failed to upload QR code')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user?.user_id) throw new Error('Not authenticated')
      await updateProfile(user.user_id, {
        ...formData,
        avatar_url: avatarUrl || undefined,
        upi_qr_code: qrCodeUrl || undefined,
      })
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-white">Profile updated!</p>
            <p className="text-xs text-neutral-400">Changes saved successfully</p>
          </div>
        </div>,
        { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
    } catch (error: any) {
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <XCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white">Update failed</p>
            <p className="text-xs text-neutral-400">{error.message || 'Please try again'}</p>
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
      <div className="mx-auto max-w-6xl p-6 lg:p-8">
        <PageHeader title="Settings" description="Manage your profile and payment settings" />

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-[1.5fr,1fr] gap-6">
            {/* Left Column - Profile Info */}
            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <h2 className="mb-6 text-lg font-semibold text-white">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-600">
                        {formData.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium transition-colors">
                      Upload Photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-neutral-500 mt-3">Recommended: Square image, at least 400x400px</p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <h2 className="mb-6 text-lg font-semibold text-white">Profile Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800/30 px-4 py-3 text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className={inputClass}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={inputClass}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-700 py-3 font-medium text-white transition-colors hover:bg-neutral-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>

            {/* Right Column - Payment Settings */}
            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <h2 className="mb-6 text-lg font-semibold text-white">Payment Settings</h2>
                <div>
                  <label className={labelClass}>UPI ID</label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    placeholder="yourname@upi"
                    className={inputClass}
                  />
                </div>

                <div className="mt-4">
                  <label className={labelClass}>UPI QR Code</label>
                  <label className="cursor-pointer block">
                    <div className="rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-800/30 p-6 text-center transition-colors hover:border-neutral-500">
                      <UploadIcon className="mx-auto mb-2 text-neutral-500" size={40} />
                      <p className="text-neutral-400 text-sm">Upload QR Code</p>
                      <p className="text-neutral-600 text-xs mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {qrPreview && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-neutral-300">Preview</label>
                    <div className="inline-block rounded-lg border border-neutral-700 bg-white p-4">
                      <img src={qrPreview} alt="UPI QR Code" className="h-48 w-48" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Export Section */}
        <div className="mt-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Export Reports</h2>
            <p className="text-sm text-neutral-400 mb-6">Download your transaction history and reports</p>
            {user && <ExportTransactions userId={user.user_id} role="artist" />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
