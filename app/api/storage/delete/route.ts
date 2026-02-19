import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: NextRequest) {
  try {
    const { filename, source } = await req.json()
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    if (source === 'supabase') {
      const { error } = await supabase.storage.from('artworks').remove([filename])
      if (error) throw error
    } else {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      const findAndDelete = (dir: string): boolean => {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        for (const item of items) {
          const fullPath = path.join(dir, item.name)
          if (item.isDirectory()) {
            if (findAndDelete(fullPath)) return true
          } else if (item.name === filename) {
            fs.unlinkSync(fullPath)
            return true
          }
        }
        return false
      }
      if (!findAndDelete(uploadsDir)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
