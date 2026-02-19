import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ files: [], totalSize: 0 })
    }

    const files: any[] = []
    let totalSize = 0

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
            lastModified: stats.mtime
          })
          totalSize += stats.size
        }
      })
    }

    scanDir(uploadsDir)

    return NextResponse.json({ files, totalSize })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
