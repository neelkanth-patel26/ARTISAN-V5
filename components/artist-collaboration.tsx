'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, X, Check, Clock, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Collaboration {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed'
  created_at: string
  collaborators: Array<{ id: string; name: string; avatar_url?: string; role: string }>
}

export function ArtistCollaboration({ userId }: { userId: string }) {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newCollab, setNewCollab] = useState({ title: '', description: '', collaboratorEmail: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollaborations()
  }, [userId])

  const loadCollaborations = async () => {
    const { data, error } = await supabase
      .from('collaborations')
      .select(`
        *,
        collaboration_members(
          user_id,
          role,
          users(id, full_name, avatar_url)
        )
      `)
      .or(`creator_id.eq.${userId},collaboration_members.user_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCollaborations(data.map(c => ({
        ...c,
        collaborators: c.collaboration_members?.map((m: any) => ({
          id: m.users.id,
          name: m.users.full_name,
          avatar_url: m.users.avatar_url,
          role: m.role
        })) || []
      })))
    }
    setLoading(false)
  }

  const createCollaboration = async () => {
    if (!newCollab.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    // Find collaborator by email
    const { data: collaborator } = await supabase
      .from('users')
      .select('id')
      .eq('email', newCollab.collaboratorEmail)
      .eq('role', 'artist')
      .single()

    if (!collaborator) {
      toast.error('Artist not found')
      return
    }

    // Create collaboration
    const { data: collab, error } = await supabase
      .from('collaborations')
      .insert({
        creator_id: userId,
        title: newCollab.title,
        description: newCollab.description,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create collaboration')
      return
    }

    // Add collaborator
    await supabase
      .from('collaboration_members')
      .insert([
        { collaboration_id: collab.id, user_id: userId, role: 'creator' },
        { collaboration_id: collab.id, user_id: collaborator.id, role: 'collaborator' }
      ])

    toast.success('Collaboration created')
    setNewCollab({ title: '', description: '', collaboratorEmail: '' })
    setShowCreate(false)
    loadCollaborations()
  }

  const updateStatus = async (id: string, status: 'active' | 'completed') => {
    const { error } = await supabase
      .from('collaborations')
      .update({ status })
      .eq('id', id)

    if (!error) {
      toast.success(`Collaboration ${status}`)
      loadCollaborations()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
          Collaborations
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          New Collaboration
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 space-y-4"
        >
          <h3 className="text-white font-medium">Create New Collaboration</h3>
          <input
            type="text"
            value={newCollab.title}
            onChange={(e) => setNewCollab({ ...newCollab, title: e.target.value })}
            placeholder="Collaboration title"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
          />
          <textarea
            value={newCollab.description}
            onChange={(e) => setNewCollab({ ...newCollab, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none resize-none"
          />
          <input
            type="email"
            value={newCollab.collaboratorEmail}
            onChange={(e) => setNewCollab({ ...newCollab, collaboratorEmail: e.target.value })}
            placeholder="Collaborator email"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={createCollaboration}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg transition-all"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Collaborations List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading...</div>
      ) : collaborations.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 rounded-xl border border-neutral-800">
          <Users size={48} className="mx-auto mb-4 text-neutral-700" />
          <p className="text-neutral-500">No collaborations yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {collaborations.map((collab) => (
            <motion.div
              key={collab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 rounded-xl p-6 border border-neutral-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium text-lg mb-1">{collab.title}</h3>
                  <p className="text-neutral-400 text-sm">{collab.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  collab.status === 'pending' ? 'bg-yellow-600/20 text-yellow-600' :
                  collab.status === 'active' ? 'bg-green-600/20 text-green-600' :
                  'bg-neutral-700 text-neutral-400'
                }`}>
                  {collab.status}
                </span>
              </div>

              {/* Collaborators */}
              <div className="flex items-center gap-3 mb-4">
                {collab.collaborators.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-sm">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">{c.name}</p>
                      <p className="text-neutral-500 text-xs">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {collab.status === 'pending' && (
                <button
                  onClick={() => updateStatus(collab.id, 'active')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all"
                >
                  Start Collaboration
                </button>
              )}
              {collab.status === 'active' && (
                <button
                  onClick={() => updateStatus(collab.id, 'completed')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-all"
                >
                  Mark as Completed
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
