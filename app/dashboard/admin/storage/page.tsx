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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Download started')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
      // Fallback: open in new tab if blob download fails
      window.open(url, '_blank')
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFiles.map((file) => (
                  <div key={file.name} className="group relative flex flex-col shadow-xl bg-neutral-800/40 hover:bg-neutral-800 rounded-2xl border border-neutral-800/50 hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
                    {/* Preview Area */}
                    <div className="aspect-square relative overflow-hidden bg-neutral-900/50 border-b border-neutral-800/30">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="scale-150 opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                            {getFileIcon(file.type)}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Overlay (Desktop Hover) */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        {file.type.startsWith('image/') && (
                          <button
                            onClick={() => {
                              const modal = document.createElement('div')
                              modal.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at center, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.98) 100%);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(24px);animation:premiumFadeIn 0.4s cubic-bezier(0.16,1,0.3,1);padding:max(20px, 4vw)'
                              modal.innerHTML = `
                                <style>
                                  @keyframes premiumFadeIn{from{opacity:0;backdrop-filter:blur(0px)}to{opacity:1;backdrop-filter:blur(24px)}}
                                  @keyframes premiumScaleIn{from{transform:scale(0.9) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
                                  @keyframes premiumFadeOut{from{opacity:1;backdrop-filter:blur(24px)}to{opacity:0;backdrop-filter:blur(0px)}}
                                  .viewer{animation:premiumScaleIn 0.5s cubic-bezier(0.16,1,0.3,1);will-change:transform, opacity}
                                  .premium-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
                                  .premium-btn:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.3);transform:translateY(-2px);box-shadow:0 10px 20px rgba(0,0,0,0.3)}
                                  .premium-btn:active{transform:translateY(0);scale:0.95}
                                  .download-btn{background:linear-gradient(135deg, #d97706, #b45309);border:none;color:#fff;border-radius:12px;padding:0 24px;height:48px;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:0 10px 25px rgba(180,83,9,0.3)}
                                  .download-btn:hover{transform:translateY(-2px);box-shadow:0 15px 30px rgba(180,83,9,0.5);filter:brightness(1.1)}
                                  .download-btn:active{transform:translateY(0);scale:0.95}
                                  .glass-container{background:rgba(10,10,10,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;box-shadow:0 100px 100px rgba(0,0,0,0.8);backdrop-filter:blur(16px)}
                                  .meta-tag{padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase}
                                  @media (max-width: 640px) {
                                    .viewer-header { flex-direction: column; gap: 16px; align-items: flex-start !important; }
                                    .viewer-footer { padding: 20px !important; flex-direction: column-reverse; gap: 16px; align-items: stretch !important; }
                                    .zoom-controls { justify-content: center; }
                                    .download-btn { width: 100%; height: 52px; }
                                  }
                                </style>
                                <div class="viewer" style="width:100%;max-width:1300px;display:flex;flex-direction:column;gap:24px">
                                  <div class="viewer-header" style="display:flex;justify-content:space-between;align-items:center;padding:0 8px">
                                    <div style="flex:1;min-width:0">
                                      <h2 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.02em;word-break:break-all">${file.name}</h2>
                                      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                                        <span style="color:#888;font-size:14px;font-weight:500">${formatSize(file.size)}</span>
                                        <span style="color:rgba(255,255,255,0.1)">•</span>
                                        <span style="color:#888;font-size:14px;font-weight:500">${new Date(file.lastModified).toLocaleDateString()}</span>
                                        ${file.uploadedBy ? `<span style="color:rgba(255,255,255,0.1)">•</span><span style="color:#888;font-size:14px;font-weight:500">by <span style="color:#fff;font-weight:600">${file.uploadedBy}</span></span>` : ''}
                                        <span class="meta-tag" style="background:${file.source === 'supabase' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)'};color:${file.source === 'supabase' ? '#60a5fa' : '#4ade80'}">${file.source}</span>
                                      </div>
                                    </div>
                                    <button id="close" class="premium-btn" style="width:48px;height:48px;border-radius:14px;font-size:20px;flex-shrink:0">✕</button>
                                  </div>
                                  
                                  <div class="glass-container" style="position:relative">
                                    <div style="display:flex;align-items:center;justify-content:center;min-height:350px;max-height:calc(85vh - 220px);overflow:auto;background:radial-gradient(circle at center, #111, #050505);padding:8px">
                                      <img id="img" src="${file.url}" style="max-width:100%;max-height:calc(85vh - 220px);object-fit:contain;transition:transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);user-select:none;filter:drop-shadow(0 20px 40px rgba(0,0,0,0.5))" draggable="false" />
                                    </div>
                                    
                                    <div class="viewer-footer" style="padding:24px 32px;display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.05)">
                                      <div class="zoom-controls" style="display:flex;gap:12px">
                                        <button id="zoom-out" class="premium-btn" style="width:44px;height:44px" title="Zoom Out">
                                          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 10h10"/></svg>
                                        </button>
                                        <button id="zoom-reset" class="premium-btn" style="padding:0 16px;font-size:13px;font-weight:700" title="Reset Zoom">Fit View</button>
                                        <button id="zoom-in" class="premium-btn" style="width:44px;height:44px" title="Zoom In">
                                          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10 5v10M5 10h10"/></svg>
                                        </button>
                                      </div>
                                      <button id="download-btn" class="download-btn">
                                        <div style="display:flex;align-items:center;gap:12px">
                                          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                          <span>Download Artwork</span>
                                        </div>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              `
                              document.body.appendChild(modal)
                              
                              const img = modal.querySelector('#img') as HTMLImageElement
                              let scale = 1
                              
                              const updateScale = (delta: number) => {
                                scale = Math.max(0.1, Math.min(10, scale * delta))
                                img.style.transform = `scale(${scale})`
                              }

                              modal.querySelector('#zoom-in')?.addEventListener('click', () => updateScale(1.4))
                              modal.querySelector('#zoom-out')?.addEventListener('click', () => updateScale(0.7))
                              modal.querySelector('#zoom-reset')?.addEventListener('click', () => { scale = 1; img.style.transform = 'scale(1)' })
                              modal.querySelector('#download-btn')?.addEventListener('click', () => handleDownload(file.url, file.name))
                              
                              const close = () => {
                                  modal.querySelector('.viewer')?.setAttribute('style', 'animation: premiumFadeOut 0.3s forwards cubic-bezier(0.16,1,0.3,1);')
                                  modal.style.opacity = '0'
                                  modal.style.transition = 'opacity 0.3s ease'
                                  setTimeout(() => document.body.removeChild(modal), 300)
                              }
                              
                              modal.addEventListener('click', (e) => { if (e.target === modal) close() })
                              modal.querySelector('#close')?.addEventListener('click', close)
                              const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler) } }
                              document.addEventListener('keydown', escHandler)
                            }}
                            className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file.url, file.name)}
                          className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => deleteFile(file.name, file.source)}
                          className="w-10 h-10 bg-red-600/80 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="text-white font-semibold truncate group-hover:text-amber-500 transition-colors" title={file.name}>
                        {file.name}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                          file.source === 'supabase' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {file.source}
                        </span>
                        <span className="text-xs text-neutral-500">{formatSize(file.size)}</span>
                      </div>

                      <div className="mt-2 pt-3 border-t border-neutral-800/50 flex items-center justify-between text-[11px] text-neutral-500">
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                        {file.uploadedBy && (
                          <span className="truncate max-w-[100px]" title={`Uploaded by ${file.uploadedBy}`}>
                            by <span className="text-neutral-400 font-medium">{file.uploadedBy}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Actions (Visible on touch) */}
                    <div className="lg:hidden flex border-t border-neutral-800/50 bg-neutral-900/30">
                      <button onClick={() => file.type.startsWith('image/') && handleDownload(file.url, file.name)} className="flex-1 py-3 flex items-center justify-center gap-2 text-xs text-neutral-400 hover:text-white border-r border-neutral-800/50">
                        <Download size={14} /> Download
                      </button>
                      <button onClick={() => deleteFile(file.name, file.source)} className="flex-1 py-3 flex items-center justify-center gap-2 text-xs text-red-500/60 hover:text-red-500">
                        <Trash2 size={14} /> Delete
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
