'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

interface Message {
  id: string
  sender_id: string
  sender_name: string
  message: string
  created_at: string
  is_admin: boolean
}

export function LiveChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = getCurrentUser()

  useEffect(() => {
    if (isOpen && user) {
      initializeChat()
    }
  }, [isOpen, user])

  useEffect(() => {
    if (chatId) {
      subscribeToMessages()
    }
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    if (!user) return

    // Check for existing chat
    const { data: existingChat } = await supabase
      .from('support_chats')
      .select('id')
      .eq('user_id', user.user_id)
      .eq('status', 'active')
      .single()

    if (existingChat) {
      setChatId(existingChat.id)
      loadMessages(existingChat.id)
    } else {
      // Create new chat
      const { data: newChat } = await supabase
        .from('support_chats')
        .insert({
          user_id: user.user_id,
          status: 'active'
        })
        .select()
        .single()

      if (newChat) {
        setChatId(newChat.id)
      }
    }
  }

  const loadMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, users(full_name)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data.map(m => ({
        ...m,
        sender_name: m.users?.full_name || 'Support',
        is_admin: m.sender_id !== user?.user_id
      })))
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newMsg = payload.new as any
        setMessages(prev => [...prev, {
          ...newMsg,
          sender_name: newMsg.sender_id === user?.user_id ? user.full_name : 'Support',
          is_admin: newMsg.sender_id !== user?.user_id
        }])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user) return

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: user.user_id,
        message: newMessage
      })

    if (!error) {
      setNewMessage('')
    } else {
      toast.error('Failed to send message')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-2xl z-50 transition-all"
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 bg-neutral-950 border border-amber-600/30 rounded-2xl shadow-2xl z-50 flex flex-col ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-white font-medium">Live Support</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                      <MessageCircle size={48} className="mx-auto mb-4 text-neutral-700" />
                      <p>Start a conversation with our support team</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.is_admin
                              ? 'bg-neutral-900 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-neutral-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:border-amber-600 focus:outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    We typically respond within a few minutes
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
