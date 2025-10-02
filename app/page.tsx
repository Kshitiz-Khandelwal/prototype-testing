"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "@/components/chat-message"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string // This will now be set on the client for initial messages
}

// ✅ Updated: Calls our Next.js API route instead of dummy response
// ... (The sendMessageToGemini function is unchanged, but included for context)

// ... (Rest of sendMessageToGemini function)
async function sendMessageToGemini(userMessage: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    })

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.reply || `API call failed with status ${res.status}.`);
    }

    const data = await res.json()
    return data.reply || "Sorry, I didn’t get that."
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return `⚠️ Error: ${(error as Error).message || "Could not connect to Gemini API."}`
  }
}

// Line 41: Renamed state for the initial message.
const initialBotMessage: Message = {
  id: "1",
  text: "Hello! I'm Verdict AI. How can I assist you today?",
  sender: "bot",
  // Line 47: Changed initial timestamp to an empty string (rendered on server)
  timestamp: "", 
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasMounted, setHasMounted] = useState(false) // New state for hydration

  const getCurrentTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Line 61-63: Set initial timestamp and mark as mounted only on the client
  useEffect(() => {
    // Only run this once on the client after initial server render (hydration)
    if (!hasMounted) {
      setMessages(prev => prev.map(msg => 
        msg.id === "1" ? {...msg, timestamp: getCurrentTimestamp()} : msg
      ));
      setHasMounted(true);
    }
    scrollToBottom()
  }, [messages, hasMounted])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      // Line 80: Use the client-side helper function to get time for new messages
      timestamp: getCurrentTimestamp(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const botResponse = await sendMessageToGemini(userMessage.text)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        // Line 94: Use the client-side helper function to get time for new messages
        timestamp: getCurrentTimestamp(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("[Verdict AI] Error sending message:", error)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-card rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Verdict AI</h1>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              text={message.text}
              sender={message.sender}
              // Line 139: The ChatMessage component will render a blank timestamp 
              // on the server, which is then hydrated by the client-side useEffect.
              timestamp={message.timestamp} 
            />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 message-enter">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-secondary-foreground">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="border-t border-border px-6 py-4 bg-card">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Message"
              className="flex-1 bg-input border-0 rounded-full px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}