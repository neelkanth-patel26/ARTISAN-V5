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
    const filePath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({ message: 'File deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
