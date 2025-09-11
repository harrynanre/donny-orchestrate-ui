"use client"

import { useState } from "react"
import { HelpCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function HelpSystem() {
  const [question, setQuestion] = useState("")
  const [conversations, setConversations] = useState([
    {
      id: "1",
      question: "What does Scan & Fix Website do?",
      answer: "Scan & Fix Website is an automated tool that analyzes your website for performance issues, SEO problems, security vulnerabilities, and accessibility concerns. It provides detailed reports and can automatically fix many common issues, helping you maintain a high-quality web presence.",
      timestamp: "2 minutes ago"
    }
  ])

  const handleAskQuestion = () => {
    if (!question.trim()) return

    // Simulate AI response based on context (UI-only)
    const contextualAnswers: Record<string, string> = {
      "create agent": "Creating an agent involves defining its purpose, selecting an AI model (GPT, Claude, etc.), configuring tools and capabilities, and setting up its operational parameters. Agents can be specialized for tasks like content creation, data analysis, or web monitoring.",
      "start task": "Starting a task allows you to assign work to your agents. You can specify the task parameters, select which agent should handle it, set priorities, and monitor progress through the task dashboard.",
      "memory": "The Memory system stores persistent information that agents can reference across sessions. It includes user preferences, agent learning, and document knowledge to improve performance over time.",
      "terminal": "The Terminal provides direct access to AI providers and allows you to execute commands, manage connections, and interact with agents at a lower level for advanced users."
    }

    const answer = Object.entries(contextualAnswers).find(([key]) => 
      question.toLowerCase().includes(key)
    )?.[1] || "I'd be happy to help! Could you provide more details about what you're trying to accomplish? I can explain features, guide you through processes, or help troubleshoot issues."

    const newConversation = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: "Just now"
    }

    setConversations(prev => [newConversation, ...prev])
    setQuestion("")
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg button-primary"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Help Assistant</SheetTitle>
            <SheetDescription>
              Ask questions about Donny Hub features and get instant help
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col h-full mt-6">
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-4">
                {conversations.length === 0 && (
                  <Card>
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
                  <Card key={conv.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium">
                          {conv.question}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {conv.timestamp}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {conv.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about features, workflows..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAskQuestion()
                    }
                  }}
                />
                <Button onClick={handleAskQuestion} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Context-aware help based on your current page
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}