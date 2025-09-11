"use client"

import { useState } from "react"
import { Plus, Search, Filter, Bot, Play, Pause, Settings, MoreVertical, Clock, Zap, X, Cpu, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    model: [],
    status: [],
    tools: []
  })
  const [newAgent, setNewAgent] = useState({
    name: "",
    goal: "",
    model: "GPT-4",
    tools: [],
    schedule: "manual"
  })

  const availableModels = ["GPT-4", "Claude-3", "Gemini-Pro"]
  const availableStatuses = ["running", "idle", "paused", "error"]
  const availableTools = ["Web Scraper", "Image Generator", "SEO Optimizer", "Data Processor", "Chart Generator", "Report Builder", "Ticket System", "Knowledge Base", "Email Sender", "Social API", "Image Editor", "Analytics"]

  const agents = [
    {
      id: "1",
      name: "Content Creator",
      goal: "Generate blog posts and social media content",
      model: "GPT-4",
      tools: ["Web Scraper", "Image Generator", "SEO Optimizer"],
      status: "running",
      lastRun: "2 minutes ago",
      successRate: 95,
    },
    {
      id: "2",
      name: "Data Analyzer",
      goal: "Process and analyze customer data for insights",
      model: "Claude-3",
      tools: ["Data Processor", "Chart Generator", "Report Builder"],
      status: "idle",
      lastRun: "1 hour ago", 
      successRate: 98,
    },
    {
      id: "3",
      name: "Customer Support",
      goal: "Handle customer inquiries and support tickets",
      model: "GPT-4",
      tools: ["Ticket System", "Knowledge Base", "Email Sender"],
      status: "running",
      lastRun: "30 seconds ago",
      successRate: 87,
    },
    {
      id: "4",
      name: "Social Media Manager",
      goal: "Schedule and manage social media posts",
      model: "Claude-3",
      tools: ["Social API", "Image Editor", "Analytics"],
      status: "paused",
      lastRun: "2 days ago",
      successRate: 92,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "success"
      case "idle": return "warning"
      case "paused": return "warning"
      case "error": return "error"
      default: return "warning"
    }
  }

  const getModelColor = (model: string) => {
    switch (model) {
      case "GPT-4": return "bg-primary/10 text-primary"
      case "Claude-3": return "bg-accent/10 text-accent"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const handleCreateAgent = () => {
    console.log("Creating agent:", newAgent)
    setShowCreateAgent(false)
    setNewAgent({
      name: "",
      goal: "",
      model: "GPT-4", 
      tools: [],
      schedule: "manual"
    })
    toast({
      title: "Agent Created",
      description: `Agent "${newAgent.name}" has been successfully created (mock).`,
    })
  }

  const toggleTool = (tool: string) => {
    setNewAgent(prev => ({
      ...prev,
      tools: prev.tools.includes(tool) 
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Agents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your AI agents
          </p>
        </div>
        <Button className="button-primary" onClick={() => setShowCreateAgent(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search agents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {/* Agents View */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-primary text-white font-medium">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`status-pill status-${getStatusColor(agent.status)} flex-shrink-0`}>
                            {agent.status}
                          </Badge>
                          <Badge className={`text-xs px-2 py-1 rounded flex-shrink-0 ${getModelColor(agent.model)}`}>
                            {agent.model}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {agent.goal}
                </p>
                
                {/* Tools */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Tools</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.slice(0, 2).map((tool, index) => (
                        <Badge key={index} variant="secondary" className="text-xs truncate max-w-[120px]">
                          {tool}
                        </Badge>
                      ))}
                      {agent.tools.length > 2 && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          +{agent.tools.length - 2} more
                        </Badge>
                      )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{agent.successRate}% success</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{agent.lastRun}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-enterprise">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="gradient-primary text-white text-sm">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-muted-foreground">{agent.goal}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs px-2 py-1 rounded ${getModelColor(agent.model)}`}>
                      {agent.model}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {agent.tools.slice(0, 2).map((tool, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                      {agent.tools.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{agent.tools.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`status-pill status-${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agent.lastRun}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {agent.successRate}%
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Create Agent Drawer */}
      <Sheet open={showCreateAgent} onOpenChange={setShowCreateAgent}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Agent</SheetTitle>
            <SheetDescription>
              Configure your new AI agent with specific goals and capabilities
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                value={newAgent.name}
                onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Content Creator"
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentGoal">Goal & Purpose</Label>
              <Textarea
                id="agentGoal"
                value={newAgent.goal}
                onChange={(e) => setNewAgent(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="Describe what this agent should accomplish..."
                rows={3}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentModel">AI Model</Label>
              <Select value={newAgent.model} onValueChange={(value) => setNewAgent(prev => ({ ...prev, model: value }))}>
                <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        {model}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tools & Capabilities</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                {availableTools.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-agent-tool-${tool}`}
                      checked={newAgent.tools.includes(tool)}
                      onCheckedChange={() => toggleTool(tool)}
                    />
                    <Label htmlFor={`new-agent-tool-${tool}`} className="text-sm truncate">
                      {tool}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {newAgent.tools.length} tools
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agentSchedule">Schedule</Label>
              <Select value={newAgent.schedule} onValueChange={(value) => setNewAgent(prev => ({ ...prev, schedule: value }))}>
                <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateAgent(false)}
                className="flex-1 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAgent}
                disabled={!newAgent.name || !newAgent.goal}
                className="flex-1 button-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Bot className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}