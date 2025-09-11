"use client"

import { useState } from "react"
import { MessageCircle, X, Send, Bot, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "donny"
  content: string
  timestamp: Date
}

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")
  const [command, setCommand] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "donny",
      content: "Hi! I'm Donny, your AI orchestrator. I can help you create agents, manage tasks, and coordinate your workflow. What would you like to accomplish today?",
      timestamp: new Date(Date.now() - 300000)
    }
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage("")
    
    // Simulate Donny's response
    setTimeout(() => {
      const donnyResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "donny",
        content: "I understand you'd like to " + message + ". Let me help you with that. I'll create a plan and coordinate the necessary agents to handle this task efficiently.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, donnyResponse])
    }, 1000)
  }

  const handleSendCommand = () => {
    if (!command.trim()) return
    
    const newCommand: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `[COMMAND] ${command}`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newCommand])
    setCommand("")
    
    // Simulate command processing
    setTimeout(() => {
      const commandResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "donny",
        content: `Command received and processed. I'm orchestrating the necessary agents to execute: "${command}". You'll receive updates as the task progresses.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, commandResponse])
    }, 1500)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full gradient-primary shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-96 h-[600px] bg-card border border-border rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/donny-avatar.jpg" alt="Donny" />
              <AvatarFallback className="gradient-primary text-white text-sm font-medium">
                D
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">Donny</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="command" className="flex items-center gap-2">
              <Command className="h-4 w-4" />
              Command
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-2">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                    {msg.type === "donny" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="gradient-primary text-white text-sm">
                          D
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] ${msg.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content.startsWith("[COMMAND]") ? (
                          <div>
                            <Badge variant="secondary" className="mb-2">Command</Badge>
                            <div>{msg.content.replace("[COMMAND]", "").trim()}</div>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask Donny anything..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="button-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="command" className="flex-1 flex flex-col mt-2">
            <div className="p-4 flex-1">
              <div className="mb-4">
                <h3 className="font-medium text-sm mb-2">Command Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Give direct orders to Donny for orchestrating agents and tasks.
                </p>
              </div>
              
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g., Create a content marketing agent that can write blog posts about AI trends..."
                className="min-h-[120px] mb-4"
              />
              
              <Button
                onClick={handleSendCommand}
                disabled={!command.trim()}
                className="button-primary w-full"
              >
                <Command className="h-4 w-4 mr-2" />
                Send Command
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}