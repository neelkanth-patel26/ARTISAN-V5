import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const filename = request.nextUrl.searchParams.get('filename') || 'artwork.jpg'

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  const response = await fetch(url)
  const blob = await response.blob()

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
