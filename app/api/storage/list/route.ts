import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const files: any[] = []
    let totalSize = 0

    // Get files from local uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (fs.existsSync(uploadsDir)) {
      const scanDir = (dir: string, baseUrl: string = '/uploads') => {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        items.forEach(item => {
          const fullPath = path.join(dir, item.name)
          if (item.isDirectory()) {
            scanDir(fullPath, `${baseUrl}/${item.name}`)
          } else {
            const stats = fs.statSync(fullPath)
            const ext = path.extname(item.name).toLowerCase()
            let type = 'application/octet-stream'
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = `image/${ext.slice(1)}`
            else if (['.mp4', '.webm', '.mov'].includes(ext)) type = `video/${ext.slice(1)}`
            else if (ext === '.pdf') type = 'application/pdf'
            files.push({
              name: item.name,
              size: stats.size,
              type,
              url: `${baseUrl}/${item.name}`,
              lastModified: stats.mtime,
              source: 'local'
            })
            totalSize += stats.size
          }
        })
      }
      scanDir(uploadsDir)
    }

    // Get files from Supabase storage
    const { data: supabaseFiles } = await supabase.storage.from('artworks').list()
    if (supabaseFiles) {
      for (const file of supabaseFiles) {
        const { data: publicUrl } = supabase.storage.from('artworks').getPublicUrl(file.name)
        
        // Get uploader info from artworks table
        const { data: artworkData } = await supabase
          .from('artworks')
          .select('artist_id, users!artworks_artist_id_fkey(full_name, email)')
          .eq('image_url', publicUrl.publicUrl)
          .single()
        
        const ext = path.extname(file.name).toLowerCase()
        let type = 'application/octet-stream'
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = `image/${ext.slice(1)}`
        
        files.push({
          name: file.name,
          size: file.metadata?.size || 0,
          type,
          url: publicUrl.publicUrl,
          lastModified: file.created_at,
          source: 'supabase',
          uploadedBy: artworkData?.users?.full_name || artworkData?.users?.email || 'Unknown'
        })
        totalSize += file.metadata?.size || 0
      }
    }

    return NextResponse.json({ files, totalSize })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
