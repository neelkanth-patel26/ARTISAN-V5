import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  const nets = os.networkInterfaces()
  let localIP = ''

  for (const name of Object.keys(nets)) {
    const netInterface = nets[name]
    if (!netInterface) continue
    
    for (const net of netInterface) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        localIP = net.address
        break
      }
    }
    if (localIP) break
  }

  return NextResponse.json({ ip: localIP || '192.168.1.1', port: '3000' })
}
