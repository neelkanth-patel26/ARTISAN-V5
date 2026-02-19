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
  source: 'local' | 'supabase'
  uploadedBy?: string
}

export default function StorageManagement() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'images' | 'documents' | 'videos'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'local' | 'supabase'>('all')
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

  const deleteFile = async (filename: string, source: 'local' | 'supabase') => {
    const confirmed = await new Promise<boolean>((resolve) => {
      const modal = document.createElement('div')
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px)'
      modal.innerHTML = `
        <div style="background:linear-gradient(135deg,#171717,#0a0a0a);border:1px solid #404040;border-radius:16px;padding:32px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05));display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
            <svg width="28" height="28" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
          </div>
          <h3 style="color:#fff;font-size:20px;font-weight:700;text-align:center;margin-bottom:12px">Delete File?</h3>
          <p style="color:#a3a3a3;font-size:15px;text-align:center;margin-bottom:28px;line-height:1.5">This will permanently delete <strong style="color:#fff;font-weight:600">${filename}</strong> from ${source} storage</p>
          <div style="display:flex;gap:12px">
            <button id="cancel" style="flex:1;padding:14px;background:#262626;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:15px;transition:all 0.2s">Cancel</button>
            <button id="confirm" style="flex:1;padding:14px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:15px;box-shadow:0 4px 12px rgba(239,68,68,0.3);transition:all 0.2s">Delete</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)
      const cancelBtn = modal.querySelector('#cancel') as HTMLElement
      const confirmBtn = modal.querySelector('#confirm') as HTMLElement
      cancelBtn.onmouseover = () => cancelBtn.style.background = '#404040'
      cancelBtn.onmouseout = () => cancelBtn.style.background = '#262626'
      confirmBtn.onmouseover = () => confirmBtn.style.transform = 'translateY(-2px)'
      confirmBtn.onmouseout = () => confirmBtn.style.transform = 'translateY(0)'
      cancelBtn.addEventListener('click', () => { document.body.removeChild(modal); resolve(false) })
      confirmBtn.addEventListener('click', () => { document.body.removeChild(modal); resolve(true) })
    })
    
    if (!confirmed) return
    
    try {
      const response = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, source })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      toast.success('File deleted successfully')
      loadFiles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const filteredFiles = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                        (f.uploadedBy && f.uploadedBy.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || 
      (filter === 'images' && f.type.startsWith('image/')) ||
      (filter === 'documents' && f.type.includes('pdf')) ||
      (filter === 'videos' && f.type.startsWith('video/'))
    const matchSource = sourceFilter === 'all' || f.source === sourceFilter
    const notLocal = f.source !== 'local'
    return matchSearch && matchFilter && matchSource && notLocal
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={20} className="text-blue-500" />
    if (type.startsWith('video/')) return <Film size={20} className="text-purple-500" />
    return <FileText size={20} className="text-green-500" />
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cloud Storage</h1>
          <p className="text-neutral-400">Manage uploaded files and storage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <HardDrive size={24} className="text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{files.length}</div>
                <div className="text-sm text-neutral-400">Total Files</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <HardDrive size={24} className="text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatSize(totalSize)}</div>
                <div className="text-sm text-neutral-400">Storage Used</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Image size={24} className="text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{files.filter(f => f.type.startsWith('image/')).length}</div>
                <div className="text-sm text-neutral-400">Images</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by filename or uploader..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:border-amber-600 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'images', 'documents', 'videos'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        filter === f ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Source:</span>
                {(['all', 'local', 'supabase'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSourceFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sourceFilter === s ? 'bg-neutral-700 text-white' : 'bg-neutral-800/50 text-neutral-500 hover:text-white'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                {(search || filter !== 'all' || sourceFilter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setFilter('all'); setSourceFilter('all') }}
                    className="ml-auto px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-400">Loading files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <HardDrive size={48} className="text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg">No files found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFiles.map((file) => (
                  <div key={file.name} className="group flex items-center gap-4 p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all">
                    {file.type.startsWith('image/') ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate mb-1">{file.name}</div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          file.source === 'supabase' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>{file.source}</span>
                        {file.uploadedBy && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-500">by {file.uploadedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.type.startsWith('image/') && (
                        <button
                          onClick={() => {
                            const modal = document.createElement('div')
                            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.96);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(20px);animation:fadeIn 0.25s;padding:40px'
                            modal.innerHTML = `
                              <style>
                                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                                @keyframes scaleIn{from{transform:scale(0.95)}to{transform:scale(1)}}
                                .viewer{animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)}
                                .zoom-btn:hover{transform:scale(1.1)}
                              </style>
                              <div class="viewer" style="width:100%;max-width:1400px;display:flex;flex-direction:column;gap:20px">
                                <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 10px">
                                  <div style="flex:1;min-width:0">
                                    <h2 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px 0">${file.name}</h2>
                                    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                                      <span style="color:#a3a3a3;font-size:14px">${formatSize(file.size)}</span>
                                      <span style="color:#404040">•</span>
                                      <span style="color:#a3a3a3;font-size:14px">${new Date(file.lastModified).toLocaleDateString()}</span>
                                      ${file.uploadedBy ? `<span style="color:#404040">•</span><span style="color:#a3a3a3;font-size:14px">by <strong style="color:#fff">${file.uploadedBy}</strong></span>` : ''}
                                      <span style="padding:4px 10px;background:${file.source === 'supabase' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)'};color:${file.source === 'supabase' ? '#60a5fa' : '#4ade80'};border-radius:6px;font-size:12px;font-weight:600;text-transform:uppercase">${file.source}</span>
                                    </div>
                                  </div>
                                  <button id="close" style="background:#171717;color:#fff;border:1px solid #262626;border-radius:12px;padding:12px 24px;cursor:pointer;font-weight:700;font-size:15px;transition:all 0.2s;margin-left:20px" onmouseover="this.style.background='#262626'" onmouseout="this.style.background='#171717'">✕ Close</button>
                                </div>
                                <div style="position:relative;background:#000;border-radius:20px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,0.9);border:1px solid #1a1a1a">
                                  <div style="display:flex;align-items:center;justify-content:center;min-height:400px;max-height:calc(90vh - 200px);overflow:auto">
                                    <img id="img" src="${file.url}" style="max-width:100%;max-height:calc(90vh - 200px);object-fit:contain;transition:transform 0.3s;user-select:none" draggable="false" />
                                  </div>
                                  <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.95),transparent);padding:24px;display:flex;justify-content:space-between;align-items:center">
                                    <div style="display:flex;gap:10px">
                                      <button class="zoom-btn" onclick="let img=document.getElementById('img');let s=(parseFloat(img.dataset.s)||1)*1.25;img.dataset.s=s;img.style.transform='scale('+s+')'" style="background:rgba(38,38,38,0.9);color:#fff;border:1px solid #404040;border-radius:10px;padding:10px;cursor:pointer;font-size:20px;font-weight:700;transition:all 0.2s;width:44px;height:44px" title="Zoom In">+</button>
                                      <button class="zoom-btn" onclick="let img=document.getElementById('img');let s=(parseFloat(img.dataset.s)||1)*0.8;img.dataset.s=s;img.style.transform='scale('+s+')'" style="background:rgba(38,38,38,0.9);color:#fff;border:1px solid #404040;border-radius:10px;padding:10px;cursor:pointer;font-size:20px;font-weight:700;transition:all 0.2s;width:44px;height:44px" title="Zoom Out">−</button>
                                      <button class="zoom-btn" onclick="let img=document.getElementById('img');img.dataset.s=1;img.style.transform='scale(1)'" style="background:rgba(38,38,38,0.9);color:#fff;border:1px solid #404040;border-radius:10px;padding:10px 16px;cursor:pointer;font-size:13px;font-weight:700;transition:all 0.2s" title="Reset">1:1</button>
                                    </div>
                                    <a href="${file.url}" download style="display:flex;align-items:center;gap:10px;background:rgba(217,119,6,0.9);color:#fff;border:none;border-radius:10px;padding:12px 20px;text-decoration:none;font-weight:700;font-size:14px;transition:all 0.2s" onmouseover="this.style.background='rgba(217,119,6,1)'" onmouseout="this.style.background='rgba(217,119,6,0.9)'">
                                      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                      Download
                                    </a>
                                  </div>
                                </div>
                              </div>
                            `
                            document.body.appendChild(modal)
                            modal.addEventListener('click', (e) => { if (e.target === modal) document.body.removeChild(modal) })
                            modal.querySelector('#close')?.addEventListener('click', () => document.body.removeChild(modal))
                            document.addEventListener('keydown', function h(e) { if (e.key === 'Escape') { document.body.removeChild(modal); document.removeEventListener('keydown', h) } })
                          }}
                          className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="text-white" />
                        </button>
                      )}
                      <a
                        href={file.url}
                        download
                        className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={16} className="text-white" />
                      </a>
                      <button
                        onClick={() => deleteFile(file.name, file.source)}
                        className="p-2 bg-neutral-700 hover:bg-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
