"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, CheckSquare, BarChart3, Globe, Activity, Zap, Play, Eye, MessageCircle, ChevronDown, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { agentStore, type Agent } from "@/lib/agent-store"
import { useWiringManifest, sortFeatures, FeatureStatus } from "@/lib/wiring"
import { StatusTile } from "@/components/wiring/StatusTile"
import { Legend } from "@/components/wiring/Legend"

export default function Dashboard() {
  const router = useRouter()
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [showCreateAgentModal, setShowCreateAgentModal] = useState(false)
  const [showStartTaskModal, setShowStartTaskModal] = useState(false)
  
  // Wiring Status-Lens integration
  const { manifest, loading: manifestLoading, error: manifestError, refresh } = useWiringManifest()

  // Load agents and subscribe to live updates
  useEffect(() => {
    const loadAgents = () => {
      const agents = agentStore.getAgents()
      setAvailableAgents(agents)
      if (!selectedAgent && agents.length > 0) {
        setSelectedAgent(agents[0].id)
      }
    }

    loadAgents()
    const unsubscribe = agentStore.onAgentsChange(loadAgents)
    return unsubscribe
  }, [selectedAgent])

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'create-agent':
        router.push('/user/agents')
        break
      case 'start-task':
        router.push('/user/tasks')
        break
    }
  }

  // Calculate features for Status-Lens
  const allFeatures = manifest ? sortFeatures(manifest.features) : []
  // Fallback: ensure quickActions exists to prevent runtime errors
  const quickActions = [
    { id: 'create-agent', label: 'Create Agent', icon: Bot },
    { id: 'start-task', label: 'Start Task', icon: CheckSquare },
  ]

  // Helper to get selected agent details
  const getSelectedAgent = () => availableAgents.find(a => a.id === selectedAgent)

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
              <SelectValue>
                {getSelectedAgent() ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-xs">{getSelectedAgent()?.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getSelectedAgent()?.name}</span>
                  </div>
                ) : "Select Agent"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              {availableAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-3 agent-selector-content">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="text-xs">{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium agent-selector-text">{agent.name}</span>
                      <span className="text-xs text-muted-foreground agent-selector-text">{agent.goal}</span>
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
                        {getSelectedAgent()?.name === "Content Creator" 
                          ? "https://blog.example.com/ai-automation-guide"
                          : getSelectedAgent()?.name === "Data Analyzer"
                          ? "https://analytics.company.com/dashboard" 
                          : "https://support.helpdesk.com/tickets"
                        }
                      </span>
                    </div>
                    
                    {/* 25% AI Name Display - Shows only selected agent name */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-background rounded border border-border min-w-0" style={{width: '25%'}}>
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {getSelectedAgent()?.name[0] || "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">
                        {getSelectedAgent()?.name || "Select Agent"}
                      </span>
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
                          <AvatarFallback className="text-xs">
                            {getSelectedAgent()?.name[0] || "AI"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {getSelectedAgent()?.name || "Select Agent"}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {getSelectedAgent()?.status || "idle"}
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

      {/* Wiring Status-Lens Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">System Wiring Status</h2>
            <p className="text-muted-foreground">Real-time system health from manifest</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={manifestLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${manifestLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Legend - 1 column */}
          <div className="lg:col-span-1">
            <Legend />
          </div>

          {/* Status Grid - 3 columns */}
          <div className="lg:col-span-3">
            {manifestError ? (
              <Card className="border-rose-200 bg-rose-50/50">
                <CardContent className="p-6 text-center">
                  <div className="text-rose-600 mb-2">Failed to load manifest</div>
                  <div className="text-sm text-rose-500">{manifestError}</div>
                </CardContent>
              </Card>
            ) : manifestLoading && !manifest ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">Loading manifest...</div>
                </CardContent>
              </Card>
            ) : !manifest || allFeatures.length === 0 ? (
              <Card className="border-slate-200 bg-slate-50/20">
                <CardContent className="p-6 text-center">
                  <div className="text-slate-600 mb-2">No features available</div>
                  <div className="text-sm text-slate-500">
                    Check your manifest configuration
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allFeatures.map(([key, feature]) => (
                  <StatusTile
                    key={key}
                    feature={feature}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/user/wiring?feature=${encodeURIComponent(key)}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Environment Info */}
        {manifest && (
          <div className="mt-6">
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">Environment:</span> {manifest.env.name}
                  </div>
                  <div>
                    <span className="font-medium">Generated:</span>{' '}
                    {new Date(manifest.generated_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Features:</span> {allFeatures.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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