'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { useState, useEffect } from 'react'
import { HardDrive, Trash2, Download, Eye, Search, Filter, Image, FileText, Film } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-orange-700/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
          {/* ── Registry Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-400">Vault Protocol</span>
                </div>
                <HardDrive size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Asset <span className="text-neutral-500">Registry</span>
              </h1>
              <p className="text-[14px] text-neutral-500 font-light tracking-wide max-w-md">
                Overseeing the digital inventory and orchestrating cloud resource distribution.
              </p>
            </div>

            {/* Metrics Nucleus */}
            {!loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Assets', value: files.length, icon: HardDrive, glow: 'bg-blue-500/10' },
                  { label: 'Cloud Saturation', value: formatSize(totalSize), icon: HardDrive, glow: 'bg-purple-500/10' },
                  { label: 'Visual Archives', value: files.filter(f => f.type.startsWith('image/')).length, icon: Image, glow: 'bg-green-500/10' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl group hover:border-orange-500/20 transition-all duration-500"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-[9px] tracking-[0.3em] uppercase font-black text-neutral-600 group-hover:text-neutral-400 transition-colors">
                        {stat.label}
                      </p>
                    </div>
                    <p className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10">
            {/* Protocol Controls */}
            <div className="p-8 rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl space-y-6">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Scan asset nomenclature..."
                    className="w-full pl-12 pr-4 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[13px] placeholder:text-neutral-700 focus:outline-none focus:border-orange-500/30 transition-all"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    {(['all', 'images', 'documents', 'videos'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2.5 rounded-xl text-[11px] font-light tracking-[0.2em] uppercase transition-all duration-500 ${
                          filter === f ? 'bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.1)]' : 'text-neutral-600 hover:text-neutral-300'
                        }`}
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    {(['all', 'supabase'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSourceFilter(s)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-light tracking-[0.15em] uppercase transition-all duration-500 ${
                          sourceFilter === s ? 'bg-white/10 text-white' : 'text-neutral-600 hover:text-neutral-300'
                        }`}
                        style={{ fontFamily: 'Oughter, serif' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {(search || filter !== 'all' || sourceFilter !== 'all') && (
                    <button
                      onClick={() => { setSearch(''); setFilter('all'); setSourceFilter('all') }}
                      className="px-4 py-2 text-[10px] text-neutral-600 hover:text-white uppercase tracking-widest font-black transition-colors"
                    >
                      Reset Protocol
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
               <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-[2rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />)}
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredFiles.map((file, i) => (
                    <motion.div
                      key={file.name}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="group relative flex flex-col rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl overflow-hidden hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                    >
                      {/* Asset Visual Domain */}
                      <div className="aspect-square relative overflow-hidden bg-black/40 border-b border-white/[0.05]">
                        {file.type.startsWith('image/') ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="p-8 rounded-full bg-white/[0.02] border border-white/[0.05] opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                              {getFileIcon(file.type)}
                            </div>
                          </div>
                        )}
                        
                        {/* Intelligence Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center gap-4 backdrop-blur-md">
                          {file.type.startsWith('image/') && (
                            <button
                              onClick={() => {
                                const modal = document.createElement('div')
                                modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(40px);padding:40px'
                                modal.innerHTML = `
                                  <div style="width:100%;max-width:1400px;display:flex;flex-direction:column;gap:32px;animation:artisanFadeIn 0.8s ease">
                                    <style>
                                      @keyframes artisanFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                                    </style>
                                    <div style="display:flex;justify-content:space-between;align-items:flex-end">
                                      <div style="space-y-1">
                                        <p style="color:rgba(234,88,12,0.6);font-size:10px;text-transform:uppercase;letter-spacing:0.5em;font-weight:900">Asset Inspection</p>
                                        <h2 style="color:#fff;font-size:32px;font-family:ForestSmooth, serif;font-weight:100;letter-spacing:-0.03em">${file.name}</h2>
                                      </div>
                                      <button id="close" style="padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:16px;cursor:pointer">✕</button>
                                    </div>
                                    <div style="position:relative;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:40px;overflow:hidden;box-shadow:0 60px 100px rgba(0,0,0,0.8)">
                                      <img src="${file.url}" style="width:100%;max-height:75vh;object-fit:contain;padding:16px" />
                                    </div>
                                  </div>
                                `
                                document.body.appendChild(modal)
                                const close = () => { modal.style.opacity = '0'; modal.style.transition = 'opacity 0.4s ease'; setTimeout(() => document.body.removeChild(modal), 400) }
                                modal.addEventListener('click', (e) => { if (e.target === modal) close() })
                                modal.querySelector('#close')?.addEventListener('click', close)
                              }}
                              className="w-12 h-12 bg-orange-600/20 border border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-400 shadow-2xl hover:bg-orange-600/30 transition-all hover:scale-110"
                              title="Inspect Essence"
                            >
                              <Eye size={20} strokeWidth={1.5} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file.url, file.name)}
                            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:bg-white/10 transition-all hover:scale-110"
                            title="Harvest Artifact"
                          >
                            <Download size={20} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => deleteFile(file.name, file.source)}
                            className="w-12 h-12 bg-rose-600/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 shadow-2xl hover:bg-rose-600/30 transition-all hover:scale-110"
                            title="Terminate Sequence"
                          >
                            <Trash2 size={20} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                      {/* Content Metadata */}
                      <div className="p-8 space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-[15px] font-medium text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }} title={file.name}>
                            {file.name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${
                            file.source === 'supabase' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {file.source}
                          </div>
                          <span className="text-[11px] text-neutral-600 font-black tracking-widest uppercase">{formatSize(file.size)}</span>
                        </div>

                        <div className="pt-4 border-t border-white/[0.03] flex items-center justify-between">
                          <span className="text-[10px] text-neutral-500 font-light tracking-wide uppercase">{new Date(file.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {file.uploadedBy && (
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] text-neutral-700 uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Curated By</span>
                               <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[80px]" title={file.uploadedBy}>{file.uploadedBy.split('@')[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty Protocol */}
            {!loading && filteredFiles.length === 0 && (
              <div className="py-32 flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-24 h-24 rounded-[2.5rem] bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-2xl">
                  <HardDrive size={32} className="text-orange-500/30" strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>Void Registry</p>
                  <p className="text-[13px] text-neutral-600 font-light">The digital vault remains unoccupied in this specific sector.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
