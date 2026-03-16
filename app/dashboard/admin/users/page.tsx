'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, Search, Ban, CheckCircle, AlertTriangle, Edit, X, Mail, Phone, MapPin, Calendar, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

function ViewUserModal({ user, onClose, loadUserStats }: any) {
  const [stats, setStats] = useState({ artworks: 0, exhibitions: 0 })
  const [loading, setLoading] = useState(true)

  const getProfileImage = (user: any) => user.avatar_url || null

  useEffect(() => {
    loadUserStats(user.id).then((data: any) => {
      setStats(data)
      setLoading(false)
    })
  }, [user.id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-[20px] z-[200] flex items-center justify-center p-4 lg:p-8"
      onClick={onClose}
    >
      {/* Background glow */}
      <div className="absolute inset-x-0 top-0 h-64 bg-orange-600/[0.03] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-neutral-900/60 backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>User Portfolio</h2>
            <p className="text-xs tracking-[0.2em] text-orange-500/60 uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Detailed Identity Insight</p>
          </div>
          <button 
            onClick={onClose} 
            className="group relative p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-2xl transition-all duration-300"
          >
            <X className="text-neutral-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative group overflow-hidden flex flex-col items-center text-center p-8 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.05]">
              {/* Card internal glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-700" />
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {getProfileImage(user) ? (
                  <img src={getProfileImage(user)} alt={user.full_name} className="relative h-32 w-32 rounded-full object-cover border-2 border-white/10 ring-4 ring-orange-500/10" />
                ) : (
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 text-4xl font-light text-white border-2 border-white/10 ring-4 ring-orange-500/10 shadow-inner">
                    {(user.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-2 right-2 h-6 w-6 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.6)]'}`} />
                </div>
              </div>

              <h3 className="text-2xl font-light text-white mb-2 tracking-wide" style={{ fontFamily: 'ForestSmooth, serif' }}>{user.full_name}</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="rounded-full px-4 py-1 text-[10px] tracking-widest uppercase font-black bg-orange-600/10 text-orange-400 border border-orange-500/20">
                  {user.role}
                </span>
                <span className={`rounded-full px-4 py-1 text-[10px] tracking-widest uppercase font-black ${
                  user.status === 'active' ? 'bg-green-600/10 text-green-400 border border-green-500/20' :
                  user.status === 'suspended' ? 'bg-yellow-600/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-red-600/10 text-red-400 border border-red-500/20'
                }`}>
                  {user.status}
                </span>
              </div>
              
              <div className="w-full pt-6 border-t border-white/[0.05]">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500 mb-1">Internal Reference</p>
                <p className="text-[11px] font-mono text-neutral-400 bg-white/[0.02] py-2 px-3 rounded-xl border border-white/[0.03]">
                  {user.id}
                </p>
              </div>
            </div>

            {user.role === 'artist' && (
              <div className="p-6 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60 mb-6" style={{ fontFamily: 'Oughter, serif' }}>Artist Performance</h4>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.03]">
                      <span className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Artworks</span>
                      <span className="text-2xl font-light text-white">{stats.artworks}</span>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.03]">
                      <span className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Exhibitions</span>
                      <span className="text-2xl font-light text-white">{stats.exhibitions}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-600/10 rounded-xl">
                    <Mail size={16} className="text-orange-400" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60" style={{ fontFamily: 'Oughter, serif' }}>Communication</h4>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-bold">Primary Email</label>
                    <div className="text-sm font-light text-white/90 group-hover:text-orange-200 transition-colors duration-300 select-all">{user.email}</div>
                  </div>
                  {user.phone && (
                    <div className="group">
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-bold">Secure Phone</label>
                      <div className="text-sm font-light text-white/90 group-hover:text-orange-200 transition-colors duration-300">{user.phone}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-600/10 rounded-xl">
                    <Calendar size={16} className="text-orange-400" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60" style={{ fontFamily: 'Oughter, serif' }}>Account History</h4>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-bold">Member Since</label>
                    <div className="text-sm font-light text-white/90">
                      {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 font-bold">Last Activity</label>
                    <div className="text-sm font-light text-white/90">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {user.location && (
              <div className="p-8 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-600/10 rounded-xl">
                    <MapPin size={16} className="text-orange-400" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60" style={{ fontFamily: 'Oughter, serif' }}>Geographic Context</h4>
                </div>
                <div className="text-sm font-light text-white/90 tracking-wide">{user.location}</div>
              </div>
            )}

            {user.bio && (
              <div className="p-8 bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-600/10 rounded-xl">
                    <Eye size={16} className="text-orange-400" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60" style={{ fontFamily: 'Oughter, serif' }}>Biography</h4>
                </div>
                <p className="text-sm font-light text-neutral-300 leading-relaxed italic border-l-2 border-orange-500/30 pl-4">
                  "{user.bio}"
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-black tracking-[0.3em] uppercase text-white rounded-2xl transition-all duration-300"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}


export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'artist' | 'collector'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewingUser, setViewingUser] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    role: ''
  })

  const getProfileImage = (user: any) => user.avatar_url || null

  useEffect(() => {
    loadUsers()
  }, [filter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('id, email, full_name, role, status, phone, location, bio, avatar_url, created_at, updated_at')
        .order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('role', filter)
      const { data, error } = await query
      if (error) throw error
      setUsers(data || [])
    } catch {
      try {
        const rpc = filter === 'all'
          ? await supabase.rpc('get_all_users')
          : await supabase.rpc('get_users_by_role', { user_role: filter })
        if (!rpc.error) setUsers(rpc.data || [])
        else toast.error('Failed to load users')
      } catch {
        toast.error('Failed to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (userId: string) => {
    const [artworks, exhibitions] = await Promise.all([
      supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('artist_id', userId),
      supabase.from('exhibitions').select('id', { count: 'exact', head: true }).eq('artist_id', userId)
    ])
    return { artworks: artworks.count || 0, exhibitions: exhibitions.count || 0 }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      const { data, error } = await supabase.rpc('update_user_status', {
        user_id: id,
        new_status: status
      })
      if (!error && data) {
        toast.success(`User ${status}`)
        loadUsers()
      }
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      role: user.role || ''
    })
  }

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase.rpc('admin_update_user', {
        p_user_id: editingUser.id,
        p_full_name: editForm.full_name,
        p_phone: editForm.phone,
        p_location: editForm.location,
        p_bio: editForm.bio,
        p_role: editForm.role
      })
      if (error) throw error
      toast.success('User updated successfully')
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      toast.error('Failed to update user')
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen space-y-10 p-6 lg:p-12 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-700/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <PageHeader 
              title="Identity Oracle" 
              description="Orchestrating the ecosystem's human capital" 
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex p-1.5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.05]">
                {(['all', 'artist', 'collector'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`relative px-6 py-2.5 rounded-xl text-[10px] tracking-[0.2em] uppercase font-black transition-all duration-500 ${
                      filter === f
                        ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors duration-300" size={18} />
                <input
                  type="text"
                  placeholder="Scan Identities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-2xl text-white text-xs tracking-wider placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-500 shadow-inner"
                  style={{ fontFamily: 'Oughter, serif' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-2 border-orange-500/10 border-t-orange-500" />
                <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border border-orange-500/20 scale-150 opacity-20" />
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-32 text-center bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/[0.05]">
              <Users className="mx-auto mb-6 text-neutral-700" size={64} strokeWidth={1} />
              <p className="text-sm tracking-[0.2em] uppercase font-black text-neutral-500" style={{ fontFamily: 'Oughter, serif' }}>No Identities Detected</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-700 shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Card glow effect */}
                  <div className="absolute -top-24 -right-24 h-48 w-48 bg-orange-500/5 rounded-full blur-[80px] group-hover:bg-orange-500/10 transition-all duration-700" />
                  
                  <div className="relative p-7 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        {getProfileImage(user) ? (
                          <img src={getProfileImage(user)} alt={user.full_name} className="relative h-16 w-16 rounded-2xl object-cover border border-white/10" />
                        ) : (
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 text-xl font-light text-white border border-white/10">
                            {(user.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-neutral-900 ${user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.4)]'}`} />
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <h3 className="text-xl font-light text-white mb-1.5 truncate tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{user.full_name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full px-2.5 py-0.5 text-[9px] tracking-widest uppercase font-black bg-white/[0.05] text-neutral-400 border border-white/[0.05]">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/[0.04]">
                      <div className="flex items-center gap-3 group/item">
                        <Mail size={14} className="text-neutral-600 group-hover/item:text-orange-400 transition-colors" />
                        <span className="text-[11px] font-light text-neutral-400 truncate group-hover/item:text-neutral-200 transition-colors">{user.email}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-3 group/item">
                          <MapPin size={14} className="text-neutral-600 group-hover/item:text-orange-400 transition-colors" />
                          <span className="text-[11px] font-light text-neutral-400 truncate group-hover/item:text-neutral-200 transition-colors">{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 group/item">
                        <Calendar size={14} className="text-neutral-600 group-hover/item:text-orange-400 transition-colors" />
                        <span className="text-[11px] font-light text-neutral-400 group-hover/item:text-neutral-200 transition-colors">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] py-2.5 text-[10px] font-black tracking-widest uppercase text-neutral-300 transition-all duration-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.1]"
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        <Eye size={14} className="opacity-60" />
                        Inspect
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-600/10 border border-orange-500/20 py-2.5 text-[10px] font-black tracking-widest uppercase text-orange-400 transition-all duration-300 hover:bg-orange-600 hover:text-white"
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        <Edit size={14} className="opacity-60" />
                        Modulate
                      </button>
                    </div>
                    
                    <div className="flex gap-2 pt-1">
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="flex-1 rounded-xl bg-green-600/10 border border-green-500/20 py-2 text-[9px] font-black tracking-widest uppercase text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300"
                          style={{ fontFamily: 'Oughter, serif' }}
                        >
                          Restore
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="flex-1 rounded-xl bg-yellow-600/10 border border-yellow-500/20 py-2 text-[9px] font-black tracking-widest uppercase text-yellow-500 hover:bg-yellow-600 hover:text-white transition-all duration-300"
                          style={{ fontFamily: 'Oughter, serif' }}
                        >
                          Suspend
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'banned')}
                          className="flex-1 rounded-xl bg-red-600/10 border border-red-500/20 py-2 text-[9px] font-black tracking-widest uppercase text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300"
                          style={{ fontFamily: 'Oughter, serif' }}
                        >
                          Vanish
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewingUser && (
          <ViewUserModal user={viewingUser} onClose={() => setViewingUser(null)} loadUserStats={loadUserStats} />
        )}

    {editingUser && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-[20px] z-[200] flex items-center justify-center p-4 lg:p-8"
        onClick={() => setEditingUser(null)}
      >
        {/* Background glow */}
        <div className="absolute inset-x-0 top-0 h-64 bg-orange-600/[0.03] blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-neutral-900/60 backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
        >
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>Modulate Identity</h2>
                  <p className="text-xs tracking-[0.2em] text-orange-500/60 uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Configuration Interface</p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="group relative p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-2xl transition-all duration-300"
                >
                  <X className="text-neutral-400 group-hover:text-white group-hover:rotate-90 transition-all duration-500" size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Preview */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="flex flex-col items-center text-center p-8 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.05]">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl opacity-50" />
                      {getProfileImage(editingUser) ? (
                        <img src={getProfileImage(editingUser)} alt={editForm.full_name} className="relative h-28 w-28 rounded-full object-cover border-2 border-white/10" />
                      ) : (
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 text-3xl font-light text-white border-2 border-white/10">
                          {(editForm.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-light text-white mb-1 tracking-wide" style={{ fontFamily: 'ForestSmooth, serif' }}>{editForm.full_name || 'Anonymous'}</h3>
                    <p className="text-[11px] text-neutral-500 mb-4 truncate w-full">{editingUser.email}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="rounded-full px-3 py-1 text-[9px] tracking-widest uppercase font-black bg-orange-600/10 text-orange-400 border border-orange-500/20">
                        {editForm.role}
                      </span>
                      <span className="rounded-full px-3 py-1 text-[9px] tracking-widest uppercase font-black bg-white/[0.05] text-neutral-400 border border-white/[0.05]">
                        {editingUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/60 mb-4" style={{ fontFamily: 'Oughter, serif' }}>Metadata</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">Creation Date</span>
                        <p className="text-xs font-light text-white">{new Date(editingUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block mb-1">Reference Hash</span>
                        <p className="text-[10px] font-mono text-neutral-400 truncate">{editingUser.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-black" style={{ fontFamily: 'Oughter, serif' }}>Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white text-sm tracking-wide focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-black" style={{ fontFamily: 'Oughter, serif' }}>Identity Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white text-sm tracking-wide focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300 appearance-none"
                        >
                          <option value="artist" className="bg-neutral-900">Artist</option>
                          <option value="collector" className="bg-neutral-900">Collector</option>
                          <option value="admin" className="bg-neutral-900">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-black" style={{ fontFamily: 'Oughter, serif' }}>Phone Protocol</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white text-sm tracking-wide focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder-neutral-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-black" style={{ fontFamily: 'Oughter, serif' }}>Geographic Node</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="City, Country"
                          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white text-sm tracking-wide focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2 font-black" style={{ fontFamily: 'Oughter, serif' }}>Biographic Narrative</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={5}
                      placeholder="Enter identity details..."
                      className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-white text-sm tracking-wide leading-relaxed focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all duration-300 placeholder-neutral-700 resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black tracking-[0.3em] uppercase rounded-2xl transition-all duration-300 shadow-xl shadow-orange-600/20 active:scale-95"
                    >
                      Commit Changes
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-black tracking-[0.3em] uppercase rounded-2xl transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </DashboardLayout>
  )
}
