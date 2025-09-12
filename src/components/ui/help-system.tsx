"use client"

import { useState, useRef, useEffect } from "react"
import { HelpCircle, Send, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function HelpSystem() {
  const [question, setQuestion] = useState("")
  const [position, setPosition] = useState({ x: 20, y: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const [conversations, setConversations] = useState([
    {
      id: "1",
      question: "What does Scan & Fix Website do?",
      answer: "Scan & Fix Website is an automated tool that analyzes your website for performance issues, SEO problems, security vulnerabilities, and accessibility concerns. It provides detailed reports and can automatically fix many common issues, helping you maintain a high-quality web presence.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60)
      }))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 60))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 60))
    
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const handleAskQuestion = () => {
    if (!question.trim()) return

    const contextualAnswers: Record<string, string> = {
      "agents": "Agents let you create and manage AI workers that can perform various tasks automatically. Each agent can be configured with specific tools, schedules, and goals to help automate your workflows.",
      "tasks": "Tasks allow you to assign specific work to your agents. You can create, monitor, and manage tasks through the task dashboard, setting priorities and tracking progress in real-time.",
      "memory": "The Memory system stores persistent information that agents can reference across sessions. It includes user preferences, agent learning, and document knowledge to improve performance over time.",
      "terminal": "The Terminal provides direct access to AI providers and allows you to execute commands, manage connections, and interact with agents at a lower level for advanced users.",
      "marketplace": "The Marketplace offers pre-built agent templates and tools that you can install and customize for your specific needs.",
      "analytics": "Analytics provides insights into your agents' performance, task completion rates, and system usage statistics.",
      "billing": "Billing section shows your current plan, usage metrics, and payment information for managing your Donny Hub subscription."
    }

    const answer = Object.entries(contextualAnswers).find(([key]) => 
      question.toLowerCase().includes(key)
    )?.[1] || "I'd be happy to help! Could you provide more details about what you're trying to accomplish? I can explain features, guide you through processes, or help troubleshoot issues. This is a demo response."

    const newConversation = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setConversations(prev => [newConversation, ...prev])
    setQuestion("")
  }

  return (
    <div 
      className="fixed z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Sheet>
        <SheetTrigger asChild>
          <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 hover:scale-105"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-96 sm:max-w-96 flex flex-col h-full">
          <SheetHeader className="space-y-2 flex-shrink-0">
            <SheetTitle className="text-lg font-semibold">Help Assistant</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Ask questions about Donny Hub features and get instant help
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col flex-1 mt-6 min-h-0">
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-3 pb-4">
                {conversations.length === 0 && (
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Ask me anything about Donny Hub!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {conversations.map((conv) => (
                  <Card key={conv.id} className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="pb-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {conv.question}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0 rounded-full">
                          {conv.timestamp}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {conv.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t border-border/50 pt-4 space-y-3 flex-shrink-0 bg-background">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about Donny Hub..."
                  className="flex-1 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleAskQuestion()
                    }
                  }}
                />
                <Button 
                  onClick={handleAskQuestion} 
                  size="icon"
                  className="rounded-xl bg-blue-500 hover:bg-blue-600 transition-all duration-200"
                  disabled={!question.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Context-aware help • Drag the help button to reposition
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}