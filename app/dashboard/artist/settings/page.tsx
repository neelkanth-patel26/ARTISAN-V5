'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Loader2, Upload as UploadIcon, CheckCircle2, XCircle, User, CreditCard, FileDown, MapPin, Phone, Globe, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser, getProfile, updateProfile } from '@/lib/auth'
import { toast } from 'sonner'
import { ExportTransactions } from '@/components/export-transactions'
import { motion } from 'framer-motion'

const field = 'w-full px-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-amber-600/30 focus:bg-white/[0.05] transition-all'
const fieldDisabled = 'w-full px-5 py-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl text-sm text-neutral-600 cursor-not-allowed'
const label = 'block text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black mb-2'

const SECTIONS = [
  { id: 'profile', icon: User,       label: 'Profile'  },
  { id: 'payment', icon: CreditCard, label: 'Payment'  },
  { id: 'export',  icon: FileDown,   label: 'Export'   },
]

export default function ArtistSettings() {
  const [active, setActive]           = useState('profile')
  const [loading, setLoading]         = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)
  const [qrPreview, setQrPreview]     = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl]     = useState<string | null>(null)
  const [user, setUser]               = useState<any>(null)
  const [formData, setFormData]       = useState({
    full_name: '', email: '', phone: '', location: '', bio: '', website: '', upi_id: '',
  })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (!currentUser?.user_id) return
    const profile = await getProfile(currentUser.user_id)
    if (!profile) return
    setFormData({
      full_name: profile.full_name || '',
      email:     profile.email     || '',
      phone:     profile.phone     || '',
      location:  profile.location  || '',
      bio:       profile.bio       || '',
      website:   profile.website   || '',
      upi_id:    profile.upi_id    || '',
    })
    if (profile.avatar_url)  { setAvatarUrl(profile.avatar_url);  setAvatarPreview(profile.avatar_url) }
    if (profile.upi_qr_code) { setQrCodeUrl(profile.upi_qr_code); setQrPreview(profile.upi_qr_code)   }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'profiles')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFile(file)
      setAvatarPreview(url); setAvatarUrl(url)
      toast.success('Avatar uploaded')
    } catch { toast.error('Failed to upload avatar') }
  }

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFile(file)
      setQrPreview(url); setQrCodeUrl(url)
      toast.success('QR code uploaded')
    } catch { toast.error('Failed to upload QR code') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const u = getCurrentUser()
      if (!u?.user_id) throw new Error('Not authenticated')
      await updateProfile(u.user_id, {
        ...formData,
        avatar_url:   avatarUrl   || undefined,
        upi_qr_code:  qrCodeUrl   || undefined,
      })
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-600/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Profile updated</p>
            <p className="text-xs text-neutral-500">Changes saved successfully</p>
          </div>
        </div>,
        { duration: 3000, style: { background: '#0a0a0a', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '16px', padding: '14px' } }
      )
    } catch (err: any) {
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Update failed</p>
            <p className="text-xs text-neutral-500">{err.message || 'Please try again'}</p>
          </div>
        </div>,
        { duration: 4000, style: { background: '#0a0a0a', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '16px', padding: '14px' } }
      )
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen bg-neutral-950 overflow-hidden">

        {/* Atmospheric glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-900/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto p-4 lg:p-8 space-y-8">

          {/* Header */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="h-px w-8 bg-amber-600/40" />
              <span className="text-[10px] text-amber-600/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>
                Account Configuration
              </span>
            </motion.div>
            <h1 className="text-4xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>Settings</h1>
            <p className="text-neutral-500 text-sm font-light">Manage your profile, payment details and data exports</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar nav */}
            <div className="lg:w-56 shrink-0">
              <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-2 flex lg:flex-col gap-1">
                {SECTIONS.map(({ id, icon: Icon, label: lbl }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all ${
                      active === id
                        ? 'bg-amber-600/15 border border-amber-600/25 text-amber-400'
                        : 'text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{lbl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleSubmit}>

                {/* ── Profile Section ── */}
                {active === 'profile' && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Avatar */}
                    <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8">
                      <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black mb-6" style={{ fontFamily: 'Oughter, serif' }}>Profile Picture</p>
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-[1.25rem] bg-neutral-900 border border-white/5 overflow-hidden">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl text-neutral-700 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                {formData.full_name.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="cursor-pointer inline-block">
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-[10px] text-neutral-400 font-black uppercase tracking-widest hover:bg-white/[0.07] hover:text-white transition-all" style={{ fontFamily: 'Oughter, serif' }}>
                              <UploadIcon size={13} />
                              Upload Photo
                            </div>
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                          </label>
                          <p className="text-[9px] text-neutral-700 uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>Square · min 400×400px</p>
                        </div>
                      </div>
                    </div>

                    {/* Info fields */}
                    <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 space-y-6">
                      <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Profile Information</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={label} style={{ fontFamily: 'Oughter, serif' }}>Full Name</label>
                          <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={field} placeholder="Your name" />
                        </div>
                        <div>
                          <label className={label} style={{ fontFamily: 'Oughter, serif' }}>Email</label>
                          <input type="email" value={formData.email} disabled className={fieldDisabled} />
                        </div>
                        <div>
                          <label className={label} style={{ fontFamily: 'Oughter, serif' }}>
                            <span className="inline-flex items-center gap-1.5"><Phone size={9} />Phone</span>
                          </label>
                          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={field} placeholder="+91 00000 00000" />
                        </div>
                        <div>
                          <label className={label} style={{ fontFamily: 'Oughter, serif' }}>
                            <span className="inline-flex items-center gap-1.5"><MapPin size={9} />Location</span>
                          </label>
                          <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={field} placeholder="City, Country" />
                        </div>
                      </div>

                      <div>
                        <label className={label} style={{ fontFamily: 'Oughter, serif' }}>Biography</label>
                        <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4} className={`${field} resize-none leading-relaxed`} placeholder="Tell the world about your creative journey..." />
                      </div>

                      <div>
                        <label className={label} style={{ fontFamily: 'Oughter, serif' }}>
                          <span className="inline-flex items-center gap-1.5"><Globe size={9} />Website</span>
                        </label>
                        <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className={field} placeholder="https://yourwebsite.com" />
                      </div>
                    </div>

                    {/* Save */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 shadow-2xl"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
                    </button>
                  </motion.div>
                )}

                {/* ── Payment Section ── */}
                {active === 'payment' && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 space-y-6">
                      <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Payment Settings</p>

                      <div>
                        <label className={label} style={{ fontFamily: 'Oughter, serif' }}>
                          <span className="inline-flex items-center gap-1.5"><Wallet size={9} />UPI ID</span>
                        </label>
                        <input
                          type="text"
                          value={formData.upi_id}
                          onChange={e => setFormData({ ...formData, upi_id: e.target.value })}
                          className={field}
                          placeholder="yourname@upi"
                        />
                        <p className="text-[9px] text-neutral-700 uppercase tracking-widest mt-2" style={{ fontFamily: 'Oughter, serif' }}>Used for receiving support payments</p>
                      </div>

                      <div>
                        <label className={label} style={{ fontFamily: 'Oughter, serif' }}>UPI QR Code</label>
                        <label className="cursor-pointer block">
                          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center hover:border-amber-600/30 hover:bg-white/[0.03] transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-3 group-hover:border-amber-600/20 transition-all">
                              <UploadIcon size={20} className="text-neutral-600 group-hover:text-amber-600/60 transition-colors" />
                            </div>
                            <p className="text-neutral-500 text-sm font-light">Drop QR code here or click to browse</p>
                            <p className="text-[9px] text-neutral-700 uppercase tracking-widest mt-1 font-black" style={{ fontFamily: 'Oughter, serif' }}>PNG · JPG · up to 5MB</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
                        </label>
                      </div>

                      {qrPreview && (
                        <div className="space-y-3">
                          <label className={label} style={{ fontFamily: 'Oughter, serif' }}>Current QR Code</label>
                          <div className="inline-block rounded-2xl border border-white/5 bg-white p-4">
                            <img src={qrPreview} alt="UPI QR" className="h-44 w-44 object-contain" />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 shadow-2xl"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Payment Settings'}
                    </button>
                  </motion.div>
                )}

              </form>

              {/* ── Export Section ── */}
              {active === 'export' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Export Reports</p>
                      <h2 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Transaction History</h2>
                      <p className="text-neutral-600 text-sm font-light">Download your earnings and transaction records</p>
                    </div>
                    {user && <ExportTransactions userId={user.user_id} role="artist" />}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
