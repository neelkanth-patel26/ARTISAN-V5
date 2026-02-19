'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { useState, useEffect } from 'react'
import { HardDrive, Trash2, Download, Eye, Search, Filter, Image, FileText, Film } from 'lucide-react'
import { toast } from 'sonner'

interface StorageFile {
  name: string
  size: number
  type: string
  url: string
  lastModified: Date
}

export default function StorageManagement() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'images' | 'documents' | 'videos'>('all')
  const [totalSize, setTotalSize] = useState(0)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/storage/list')
      const data = await response.json()
      setFiles(data.files || [])
      setTotalSize(data.totalSize || 0)
    } catch (error) {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return
    try {
      const response = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })
      if (!response.ok) throw new Error('Delete failed')
      toast.success('File deleted')
      loadFiles()
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const filteredFiles = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || 
      (filter === 'images' && f.type.startsWith('image/')) ||
      (filter === 'documents' && f.type.includes('pdf')) ||
      (filter === 'videos' && f.type.startsWith('video/'))
    return matchSearch && matchFilter
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={20} className="text-blue-500" />
    if (type.startsWith('video/')) return <Film size={20} className="text-purple-500" />
    return <FileText size={20} className="text-green-500" />
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <PageHeader title="Cloud Storage" description="Manage uploaded files and storage" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <HardDrive size={20} className="text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{files.length}</div>
                <div className="text-sm text-neutral-400">Total Files</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <HardDrive size={20} className="text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatSize(totalSize)}</div>
                <div className="text-sm text-neutral-400">Storage Used</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Image size={20} className="text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{files.filter(f => f.type.startsWith('image/')).length}</div>
                <div className="text-sm text-neutral-400">Images</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'images', 'documents', 'videos'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-neutral-400">Loading...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">No files found</div>
            ) : (
              filteredFiles.map((file) => (
                <div key={file.name} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{file.name}</div>
                    <div className="text-sm text-neutral-400">{formatSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={16} className="text-white" />
                    </a>
                    <a
                      href={file.url}
                      download
                      className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} className="text-white" />
                    </a>
                    <button
                      onClick={() => deleteFile(file.name)}
                      className="p-2 bg-neutral-700 hover:bg-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
