"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bot, CheckSquare, BarChart3, Globe, Activity, Zap, Play, Eye, MessageCircle, ChevronDown, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  const navigate = useNavigate()
  const [selectedAgent, setSelectedAgent] = useState("content-creator")
  const [chatMessage, setChatMessage] = useState("")
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false)
  const [showStartTaskModal, setShowStartTaskModal] = useState(false)

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-agent':
        navigate('/user/agents')
        break
      case 'start-task':
        navigate('/user/tasks')
        break
    }
  }
  // Fallback: ensure quickActions exists to prevent runtime errors
  const quickActions = [
    { id: 'create-agent', label: 'Create Agent', icon: Bot },
    { id: 'start-task', label: 'Start Task', icon: CheckSquare },
  ]

  const availableAgents = [
    { 
      id: "content-creator", 
      name: "Content Creator", 
      tagline: "Generates and optimizes content across platforms",
      avatar: "/placeholder-avatar.jpg",
      status: "active"
    },
    { 
      id: "data-analyzer", 
      name: "Data Analyzer", 
      tagline: "Processes and analyzes complex datasets",
      avatar: "/placeholder-avatar.jpg",
      status: "idle"
    },
    { 
      id: "web-scanner", 
      name: "Web Scanner", 
      tagline: "Monitors and optimizes website performance",
      avatar: "/placeholder-avatar.jpg",
      status: "running"
    },
  ]

  const agentLogs = [
    { timestamp: "14:23:45", level: "info", message: "Starting content generation task..." },
    { timestamp: "14:23:47", level: "success", message: "Successfully connected to OpenAI API" },
    { timestamp: "14:23:50", level: "info", message: "Analyzing target audience preferences..." },
    { timestamp: "14:24:15", level: "success", message: "Generated 3 content variations" },
    { timestamp: "14:24:18", level: "info", message: "Optimizing for SEO keywords..." },
  ]

  const chatHistory = [
    { role: "agent", message: "Hello! I'm your Content Creator agent. How can I help you today?", timestamp: "14:20:00" },
    { role: "user", message: "Can you help me write a blog post about AI automation?", timestamp: "14:20:30" },
    { role: "agent", message: "Absolutely! I'd be happy to help you create a blog post about AI automation. Let me start by researching the latest trends and best practices.", timestamp: "14:20:45" },
  ]

  const systemStatus = [
    { name: "UI", status: "operational", color: "success" },
    { name: "API", status: "operational", color: "success" },
    { name: "Doctor", status: "degraded", color: "warning" },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to Donny Hub</h1>
          <p className="text-xl opacity-90 mb-6">
            Create agents, start tasks, and let Donny orchestrate your AI workflow
          </p>
          
          {/* Quick Actions */}
           <div className="flex flex-wrap gap-3">
             {quickActions.map((action) => (
               <Button
                 key={action.id}
                 variant="secondary"
                 className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                 onClick={() => handleQuickAction(action.id)}
               >
                 <action.icon className="h-4 w-4 mr-2" />
                 {action.label}
               </Button>
             ))}
           </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
      </div>

      {/* Live Preview Panel */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Live Preview</h2>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-64 focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              {availableAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-3 agent-selector-content">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="text-xs">{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium agent-selector-text">{agent.name}</span>
                      <span className="text-xs text-muted-foreground agent-selector-text">{agent.tagline}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="card-enterprise">
          <Tabs defaultValue="logs" className="w-full">
            <div className="border-b">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger value="logs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Activity className="h-4 w-4 mr-2" />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="browser" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  <Eye className="h-4 w-4 mr-2" />
                  Browser
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="logs" className="mt-0">
              <div className="p-6">
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-2">
                    {agentLogs.map((log, index) => (
                      <div key={index} className="flex gap-3 text-sm font-mono">
                        <span className="text-muted-foreground">[{log.timestamp}]</span>
                        <span className={`${
                          log.level === "success" ? "text-green-600 dark:text-green-400" :
                          log.level === "error" ? "text-red-600 dark:text-red-400" :
                          log.level === "warning" ? "text-yellow-600 dark:text-yellow-400" :
                          "text-foreground"
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">[live]</span>
                      <span className="text-green-500 animate-pulse">●</span>
                      <span className="text-muted-foreground">Real-time stream active</span>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="browser" className="mt-0">
              <div className="p-6">
                {/* Address Bar with 75/25 split */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border">
                    {/* 75% Browser URL Section */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-background rounded border border-border flex-1">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground truncate">
                        {availableAgents.find(a => a.id === selectedAgent)?.name === "Content Creator" 
                          ? "https://blog.example.com/ai-automation-guide"
                          : availableAgents.find(a => a.id === selectedAgent)?.name === "Data Analyzer"
                          ? "https://analytics.company.com/dashboard" 
                          : "https://support.helpdesk.com/tickets"
                        }
                      </span>
                    </div>
                    
                    {/* 25% AI Selector Section */}
                    <div className="flex items-center gap-2 min-w-0" style={{width: '25%'}}>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="h-10 focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background border-border">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={availableAgents.find(a => a.id === selectedAgent)?.avatar} />
                              <AvatarFallback className="text-xs">
                                {availableAgents.find(a => a.id === selectedAgent)?.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">
                              {availableAgents.find(a => a.id === selectedAgent)?.name}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          {availableAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id} className="focus:bg-accent focus:text-accent-foreground">
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={agent.avatar} alt={agent.name} />
                                  <AvatarFallback className="text-xs font-medium">
                                    {agent.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm">{agent.name}</span>
                                  <span className="text-xs text-muted-foreground">{agent.tagline}</span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    agent.status === 'active' ? 'border-green-200 text-green-700 bg-green-50' :
                                    agent.status === 'running' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                    'border-gray-200 text-gray-600 bg-gray-50'
                                  }`}
                                >
                                  {agent.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Split View: 75% Browser, 25% Chat */}
                <div className="flex gap-4 h-96">
                  {/* 75% Browser Viewport */}
                  <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border flex-1 flex items-center justify-center" style={{width: '75%'}}>
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Browser Viewport</h3>
                      <p className="text-sm text-muted-foreground">
                        Live view of what the agent is browsing will appear here
                      </p>
                    </div>
                  </div>
                  
                  {/* 25% Chat Section */}
                  <div className="flex flex-col border border-border rounded-lg bg-background" style={{width: '25%'}}>
                    {/* Chat Header */}
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={availableAgents.find(a => a.id === selectedAgent)?.avatar} />
                          <AvatarFallback className="text-xs">
                            {availableAgents.find(a => a.id === selectedAgent)?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {availableAgents.find(a => a.id === selectedAgent)?.name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {availableAgents.find(a => a.id === selectedAgent)?.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                            {msg.role === "agent" && (
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage src={availableAgents.find(a => a.id === selectedAgent)?.avatar} />
                                <AvatarFallback className="text-xs">AI</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                              <div className={`p-2 rounded-lg text-xs ${
                                msg.role === "user" 
                                  ? "bg-primary text-primary-foreground ml-auto" 
                                  : "bg-muted"
                              }`}>
                                <p>{msg.message}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {msg.timestamp}
                              </p>
                            </div>
                            {msg.role === "user" && (
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarFallback className="text-xs">U</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Chat Input */}
                    <div className="border-t border-border p-3">
                      <div className="flex gap-2">
                        <Input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Chat with AI..."
                          className="flex-1 text-xs h-8"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              // Handle send message (UI-only)
                              setChatMessage("")
                            }
                          }}
                        />
                        <Button size="sm" className="button-primary px-2 h-8">
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">System Status</h2>
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
            <CardDescription>Real-time status of all Donny Hub services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {systemStatus.map((service) => (
                <div key={service.name} className="flex items-center gap-3">
                  <Badge 
                    className={`status-pill status-${service.color}`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-current mr-2`} />
                    {service.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
        <Card className="card-enterprise">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-success/10">
                  <Bot className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Agent "Content Creator" deployed successfully</div>
                  <div className="text-xs text-muted-foreground">2 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Task "Website Analysis" completed</div>
                  <div className="text-xs text-muted-foreground">15 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Activity className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">3 new marketplace agents available</div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}