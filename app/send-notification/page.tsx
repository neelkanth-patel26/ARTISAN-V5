'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export default function SendNotificationPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const sendNotification = async () => {
    setLoading(true)
    setResult('')
    try {
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url })
      })
      const data = await response.json()
      setResult(data.message || data.error)
    } catch (error: any) {
      setResult(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Send Push Notification</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notification message" rows={4} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">URL (optional)</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/" />
          </div>
          
          <Button onClick={sendNotification} disabled={loading || !title || !body} className="w-full">
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
          
          {result && (
            <div className={`p-4 rounded ${result.includes('error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {result}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
