'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderPlus, X, Check, Trash2, Lock, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

interface Collection {
  id: string
  name: string
  description: string
  is_public: boolean
  artwork_count?: number
}

interface CollectionModalProps {
  artworkId?: string
  onClose: () => void
}

export function CollectionModal({ artworkId, onClose }: CollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: '', description: '', is_public: true })
  const [loading, setLoading] = useState(true)
  const [viewportHeight, setViewportHeight] = useState(0)
  const user = getCurrentUser()

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    if (user) loadCollections()
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }
    
    document.addEventListener('focusin', handleFocus)
    return () => document.removeEventListener('focusin', handleFocus)
  }, [user])

  const loadCollections = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_artworks(count)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCollections(data.map(c => ({
        ...c,
        artwork_count: c.collection_artworks?.[0]?.count || 0
      })))
    }
    setLoading(false)
  }

  const createCollection = async () => {
    if (!user || !newCollection.name.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.user_id,
        name: newCollection.name,
        description: newCollection.description,
        is_public: newCollection.is_public
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create collection')
      return
    }

    if (artworkId && data) {
      await addToCollection(data.id)
    }

    toast.success('Collection created')
    setNewCollection({ name: '', description: '', is_public: true })
    setShowCreate(false)
    loadCollections()
  }

  const addToCollection = async (collectionId: string) => {
    if (!artworkId) return

    const { error } = await supabase
      .from('collection_artworks')
      .insert({ collection_id: collectionId, artwork_id: artworkId })

    if (error) {
      if (error.code === '23505') {
        toast.error('Artwork already in this collection')
      } else {
        toast.error('Failed to add to collection')
      }
      return
    }

    toast.success('Added to collection')
    onClose()
  }

  const deleteCollection = async (id: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete collection')
      return
    }

    toast.success('Collection deleted')
    loadCollections()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ height: viewportHeight ? `${viewportHeight * 0.8}px` : '80vh' }}
          className="bg-neutral-950 border border-amber-600/30 rounded-2xl max-w-2xl w-full overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
              {artworkId ? 'Add to Collection' : 'My Collections'}
            </h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
            {/* Create New Button */}
            {!showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-neutral-700 hover:border-amber-600 text-neutral-400 hover:text-white transition-all mb-4"
              >
                <FolderPlus size={20} />
                Create New Collection
              </button>
            )}

            {/* Create Form */}
            {showCreate && (
              <div className="bg-neutral-900 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="Collection name"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
                />
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none resize-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newCollection.is_public}
                    onChange={(e) => setNewCollection({ ...newCollection, is_public: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-amber-600"
                  />
                  <label htmlFor="public" className="text-sm text-neutral-300 flex items-center gap-1">
                    {newCollection.is_public ? <Globe size={14} /> : <Lock size={14} />}
                    {newCollection.is_public ? 'Public' : 'Private'}
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createCollection}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Collections List */}
            {loading ? (
              <div className="text-center py-8 text-neutral-500">Loading...</div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">No collections yet</div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-amber-600/50 transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{collection.name}</h3>
                        {collection.is_public ? (
                          <Globe size={14} className="text-neutral-500" />
                        ) : (
                          <Lock size={14} className="text-neutral-500" />
                        )}
                      </div>
                      {collection.description && (
                        <p className="text-sm text-neutral-400 mt-1">{collection.description}</p>
                      )}
                      <p className="text-xs text-neutral-500 mt-1">{collection.artwork_count} artworks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {artworkId && (
                        <button
                          onClick={() => addToCollection(collection.id)}
                          className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCollection(collection.id)}
                        className="p-2 bg-neutral-800 hover:bg-red-600 text-neutral-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
