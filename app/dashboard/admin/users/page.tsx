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
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>User Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <X className="text-neutral-400" size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col items-center text-center p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
              {getProfileImage(user) ? (
                <img src={getProfileImage(user)} alt={user.full_name} className="h-24 w-24 rounded-full object-cover mb-4" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-700 text-3xl font-bold text-white mb-4">
                  {(user.full_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-xl font-light text-white mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>{user.full_name}</h3>
              <div className="flex gap-2 mb-3">
                <span className="rounded-full px-3 py-1 text-xs bg-neutral-700 text-neutral-300">
                  {user.role}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${
                  user.status === 'active' ? 'bg-green-600/20 text-green-400' :
                  user.status === 'suspended' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-red-600/20 text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400">ID: {user.id.slice(0, 8)}...</p>
            </div>

            {user.role === 'artist' && (
              <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <h4 className="text-sm font-light text-white mb-3" style={{ fontFamily: 'Oughter, serif' }}>Statistics</h4>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-400">Artworks</span>
                      <span className="text-sm font-semibold text-white">{stats.artworks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-400">Exhibitions</span>
                      <span className="text-sm font-semibold text-white">{stats.exhibitions}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
              <h4 className="text-sm font-light text-white mb-4" style={{ fontFamily: 'Oughter, serif' }}>Contact Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
                  <div className="flex items-center gap-2 text-white">
                    <Mail size={16} className="text-neutral-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                {user.phone && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Phone Number</label>
                    <div className="flex items-center gap-2 text-white">
                      <Phone size={16} className="text-neutral-500" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Location</label>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin size={16} className="text-neutral-500" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
              <h4 className="text-sm font-light text-white mb-4" style={{ fontFamily: 'Oughter, serif' }}>Account Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Account Created</label>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar size={16} className="text-neutral-500" />
                    <span className="text-sm">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {user.updated_at && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Last Updated</label>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={16} className="text-neutral-500" />
                      <span className="text-sm">{new Date(user.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Account Status</label>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs ${
                    user.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    user.status === 'suspended' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-red-600/20 text-red-400'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <h4 className="text-sm font-light text-white mb-3" style={{ fontFamily: 'Oughter, serif' }}>Biography</h4>
                <p className="text-sm text-neutral-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
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
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Users Management" description="Manage all users and their access levels" />

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            {(['all', 'artist', 'collector'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === f
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-4 text-neutral-600" size={48} />
              <p className="text-neutral-400">No users found</p>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {getProfileImage(user) ? (
                        <img src={getProfileImage(user)} alt={user.full_name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-lg font-bold text-white">
                          {(user.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-light text-white mb-1 truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{user.full_name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="rounded-full px-2 py-0.5 text-xs bg-neutral-700 text-neutral-300">
                            {user.role}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            user.status === 'active' ? 'bg-green-600/20 text-green-400' :
                            user.status === 'suspended' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-400 mb-4 pb-4 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-neutral-500" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-neutral-500" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-neutral-500" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-neutral-500" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                      >
                        <Eye size={12} />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                        >
                          Activate
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="rounded-lg bg-neutral-700 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-600"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'banned')}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-700"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
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
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Edit User Profile</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="text-neutral-400" size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col items-center text-center p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    {getProfileImage(editingUser) ? (
                      <img src={getProfileImage(editingUser)} alt={editForm.full_name} className="h-24 w-24 rounded-full object-cover mb-4" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-700 text-3xl font-bold text-white mb-4">
                        {(editForm.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-lg font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{editForm.full_name || 'No Name'}</h3>
                    <p className="text-xs text-neutral-400 mb-3">{editingUser.email}</p>
                    <div className="flex gap-2">
                      <span className="rounded-full px-3 py-1 text-xs bg-neutral-700 text-neutral-300">
                        {editForm.role}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs ${
                        editingUser.status === 'active' ? 'bg-green-600/20 text-green-400' :
                        editingUser.status === 'suspended' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {editingUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-xs font-light text-white mb-3" style={{ fontFamily: 'Oughter, serif' }}>Account Info</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-400">User ID</span>
                        <p className="text-white font-mono text-[10px] mt-0.5">{editingUser.id}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Created</span>
                        <p className="text-white mt-0.5">{new Date(editingUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      {editingUser.updated_at && (
                        <div>
                          <span className="text-neutral-400">Last Updated</span>
                          <p className="text-white mt-0.5">{new Date(editingUser.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-xs font-light text-white mb-3" style={{ fontFamily: 'Oughter, serif' }}>Current Values</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-400">Phone</span>
                        <p className="text-white mt-0.5">{editingUser.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Location</span>
                        <p className="text-white mt-0.5">{editingUser.location || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-light text-white mb-4" style={{ fontFamily: 'Oughter, serif' }}>Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                        >
                          <option value="artist">Artist</option>
                          <option value="collector">Collector</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-light text-white mb-4" style={{ fontFamily: 'Oughter, serif' }}>Contact Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Location</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="City, Country"
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-light text-white mb-4" style={{ fontFamily: 'Oughter, serif' }}>Biography</h4>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-6 py-3 border border-neutral-700 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
