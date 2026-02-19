import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json()
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Search for file in all subdirectories
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

    const deleted = findAndDelete(uploadsDir)
    
    if (!deleted) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
