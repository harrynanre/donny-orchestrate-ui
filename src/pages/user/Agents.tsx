"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Bot, Play, Pause, Settings, MoreVertical, Clock, Zap, X, Cpu, BarChart3, Trash2, MoreHorizontal, XCircle } from "lucide-react"
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
  DropdownMenuSeparator,
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
import { agentStore, type Agent } from "@/lib/agent-store"

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    model: [] as string[],
    status: [] as string[],
    tools: [] as string[]
  })
  const [newAgent, setNewAgent] = useState({
    name: "",
    goal: "",
    model: "GPT-4",
    tools: [],
    schedule: "manual"
  })
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const [availableModels, setAvailableModels] = useState<string[]>([])
  const availableStatuses = ["running", "idle", "paused", "error"]
  const availableTools = ["Web Scraper", "Image Generator", "SEO Optimizer", "Data Processor", "Chart Generator", "Report Builder", "Ticket System", "Knowledge Base", "Email Sender", "Social API", "Image Editor", "Analytics"]

  const [agents, setAgents] = useState<Agent[]>([])

  // Load agents and models on mount and subscribe to changes
  useEffect(() => {
    const loadData = () => {
      setAgents(agentStore.getAgents())
      setAvailableModels(agentStore.getAvailableModelNames())
    }

    loadData()
    
    const unsubscribeAgents = agentStore.onAgentsChange(setAgents)
    const unsubscribeModels = agentStore.onModelsChange(() => {
      setAvailableModels(agentStore.getAvailableModelNames())
    })

    return () => {
      unsubscribeAgents()
      unsubscribeModels()
    }
  }, [])

  // Pre-fill form when editing
  useEffect(() => {
    if (editingAgent) {
      setNewAgent({
        name: editingAgent.name,
        goal: editingAgent.goal,
        model: editingAgent.model,
        tools: editingAgent.tools,
        schedule: "manual"
      })
    }
  }, [editingAgent])

  // Filter and search logic
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tools.some(tool => tool.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         agent.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesModelFilter = filters.model.length === 0 || filters.model.includes(agent.model)
    const matchesStatusFilter = filters.status.length === 0 || filters.status.includes(agent.status)
    const matchesToolsFilter = filters.tools.length === 0 || 
                              filters.tools.some(filterTool => agent.tools.includes(filterTool))

    return matchesSearch && matchesModelFilter && matchesStatusFilter && matchesToolsFilter
  })

  const clearFilters = () => {
    setFilters({
      model: [],
      status: [],
      tools: []
    })
  }

  const hasActiveFilters = filters.model.length > 0 || filters.status.length > 0 || filters.tools.length > 0

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
    if (!newAgent.name.trim() || !newAgent.goal.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both agent name and goal.",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (editingAgent) {
        // Update existing agent
        const success = agentStore.updateAgent(editingAgent.id, {
          name: newAgent.name,
          goal: newAgent.goal,
          model: newAgent.model,
          tools: newAgent.tools as string[]
        })

        if (success) {
          toast({
            title: "Agent Updated",
            description: `"${newAgent.name}" has been updated successfully.`,
          })
        }
      } else {
        // Create new agent
        const agent = agentStore.addAgent({
          name: newAgent.name,
          goal: newAgent.goal,
          model: newAgent.model,
          tools: newAgent.tools as string[]
        })
        
        toast({
          title: "Agent Created Successfully",
          description: `"${agent.name}" is now ready to deploy and run tasks.`,
        })
      }

      // Reset form and close sheet
      setShowCreateAgent(false)
      setEditingAgent(null)
      setNewAgent({
        name: "",
        goal: "",
        model: availableModels[0] || "GPT-4", 
        tools: [],
        schedule: "manual"
      })
    } catch (error) {
      toast({
        title: `Error ${editingAgent ? 'Updating' : 'Creating'} Agent`,
        description: `Failed to ${editingAgent ? 'update' : 'create'} agent. Please try again.`,
        variant: "destructive"
      })
    }
  }

  // Agent action handlers
  const handleRunAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const success = agentStore.updateAgent(agentId, { 
      status: "running",
      lastRun: "Just now"
    })
    if (success) {
      toast({
        title: "Agent Started",
        description: `${agent.name} is now running successfully.`,
      })
    }
  }

  const handleConfigureAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    setEditingAgent(agent)
    setShowCreateAgent(true)
    
    toast({
      title: "Configure Agent",
      description: `Opening configuration for ${agent.name}.`,
    })
  }

  const handlePauseAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const newStatus = agent.status === "running" ? "paused" : "running"
    const success = agentStore.updateAgent(agentId, { 
      status: newStatus
    })
    if (success) {
      toast({
        title: newStatus === "paused" ? "Agent Paused" : "Agent Resumed",
        description: `${agent.name} has been ${newStatus === "paused" ? "paused" : "resumed"}.`,
      })
    }
  }

  const handleDeleteAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    const success = agentStore.deleteAgent(agentId)
    if (success) {
      toast({
        title: "Agent Deleted",
        description: `${agent.name} has been removed successfully.`,
        variant: "destructive"
      })
    }
  }

  // Status card click handler
  const handleStatusCardClick = (status: string) => {
    if (filters.status.includes(status)) {
      // Remove filter if already active
      setFilters(prev => ({
        ...prev,
        status: prev.status.filter(s => s !== status)
      }))
    } else {
      // Add filter
      setFilters(prev => ({
        ...prev,
        status: [...prev.status, status]
      }))
    }
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            My Agents
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Manage and monitor your AI agents across your organization
          </p>
        </div>
        <Button 
          className="button-primary shadow-lg hover:shadow-xl transition-shadow px-6 py-2 h-auto" 
          onClick={() => setShowCreateAgent(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Agent
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card 
          className={`p-4 border-l-4 border-l-primary cursor-pointer transition-all hover:shadow-md ${
            filters.status.length === 0 ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <Bot className="h-8 w-8 text-primary opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('running') ? 'ring-2 ring-green-500 bg-green-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('running')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Running</p>
              <p className="text-2xl font-bold text-green-600">
                {agents.filter(a => a.status === 'running').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('idle') ? 'ring-2 ring-yellow-500 bg-yellow-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('idle')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Idle</p>
              <p className="text-2xl font-bold text-yellow-600">
                {agents.filter(a => a.status === 'idle').length}
              </p>
            </div>
            <Pause className="h-8 w-8 text-yellow-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('error') ? 'ring-2 ring-red-500 bg-red-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('error')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error</p>
              <p className="text-2xl font-bold text-red-600">
                {agents.filter(a => a.status === 'error').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500 opacity-75" />
          </div>
        </Card>
      </div>

       {/* Search and Filters */}
       <div className="flex items-center justify-between flex-wrap gap-4">
         <div className="flex gap-4 items-center">
           <div className="relative max-w-sm">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search agents..."
               className="pl-10 bg-background"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <Popover open={showFilters} onOpenChange={setShowFilters}>
             <PopoverTrigger asChild>
               <Button variant="outline" className={`gap-2 ${hasActiveFilters ? 'border-primary bg-primary/5' : ''}`}>
                 <Filter className="h-4 w-4" />
                 Filter
                 {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                   {filters.model.length + filters.status.length + filters.tools.length}
                 </Badge>}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-80 bg-background border border-border" align="start">
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h4 className="font-medium">Filters</h4>
                   {hasActiveFilters && (
                     <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                       Clear all
                     </Button>
                   )}
                 </div>
                 
                 {/* Status Filter */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium">Status</Label>
                   <div className="flex flex-wrap gap-2">
                     {availableStatuses.map((status) => (
                       <div key={status} className="flex items-center space-x-2">
                         <Checkbox
                           id={`filter-status-${status}`}
                           checked={filters.status.includes(status)}
                           onCheckedChange={(checked) => {
                             if (checked) {
                               setFilters(prev => ({ ...prev, status: [...prev.status, status] }))
                             } else {
                               setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }))
                             }
                           }}
                         />
                         <Label htmlFor={`filter-status-${status}`} className="text-sm capitalize cursor-pointer">
                           {status}
                         </Label>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Model Filter */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium">AI Model</Label>
                   <div className="flex flex-wrap gap-2">
                     {availableModels.map((model) => (
                       <div key={model} className="flex items-center space-x-2">
                         <Checkbox
                           id={`filter-model-${model}`}
                           checked={filters.model.includes(model)}
                           onCheckedChange={(checked) => {
                             if (checked) {
                               setFilters(prev => ({ ...prev, model: [...prev.model, model] }))
                             } else {
                               setFilters(prev => ({ ...prev, model: prev.model.filter(m => m !== model) }))
                             }
                           }}
                         />
                         <Label htmlFor={`filter-model-${model}`} className="text-sm cursor-pointer">
                           {model}
                         </Label>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Tools Filter */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium">Tools</Label>
                   <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                     {availableTools.slice(0, 8).map((tool) => (
                       <div key={tool} className="flex items-center space-x-2">
                         <Checkbox
                           id={`filter-tool-${tool}`}
                           checked={filters.tools.includes(tool)}
                           onCheckedChange={(checked) => {
                             if (checked) {
                               setFilters(prev => ({ ...prev, tools: [...prev.tools, tool] }))
                             } else {
                               setFilters(prev => ({ ...prev, tools: prev.tools.filter(t => t !== tool) }))
                             }
                           }}
                         />
                         <Label htmlFor={`filter-tool-${tool}`} className="text-xs cursor-pointer truncate">
                           {tool}
                         </Label>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </PopoverContent>
           </Popover>

           {searchTerm && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span>Search: "{searchTerm}"</span>
               <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="h-auto p-1">
                 <X className="h-3 w-3" />
               </Button>
             </div>
           )}
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

       {/* Results Info */}
       <div className="flex items-center justify-between text-sm text-muted-foreground">
         <span>
           {filteredAgents.length === agents.length 
             ? `Showing all ${agents.length} agents` 
             : `Showing ${filteredAgents.length} of ${agents.length} agents`
           }
         </span>
         {hasActiveFilters && (
           <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
             Clear filters
           </Button>
         )}
       </div>

       {/* Agents View */}
       {viewMode === "cards" ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredAgents.length === 0 ? (
             <div className="col-span-full text-center py-12">
               <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="font-medium text-lg mb-2">No agents found</h3>
               <p className="text-muted-foreground mb-4">
                 {searchTerm || hasActiveFilters 
                   ? "Try adjusting your search or filters" 
                   : "Create your first agent to get started"
                 }
               </p>
               {!searchTerm && !hasActiveFilters && (
                 <Button onClick={() => setShowCreateAgent(true)} className="button-primary">
                   <Plus className="h-4 w-4 mr-2" />
                   Create Agent
                 </Button>
               )}
             </div>
           ) : (
             filteredAgents.map((agent) => (
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
                       <DropdownMenuItem onClick={() => handleRunAgent(agent.id)}>
                         <Play className="h-4 w-4 mr-2" />
                         Run
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleConfigureAgent(agent.id)}>
                         <Settings className="h-4 w-4 mr-2" />
                         Configure
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handlePauseAgent(agent.id)}>
                         <Pause className="h-4 w-4 mr-2" />
                         {agent.status === "running" ? "Pause" : "Resume"}
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem 
                         className="text-destructive"
                         onClick={() => handleDeleteAgent(agent.id)}
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Delete
                       </DropdownMenuItem>
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
           ))
           )}
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
               {filteredAgents.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={8} className="h-32 text-center">
                     <div className="flex flex-col items-center justify-center">
                       <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                       <p className="text-muted-foreground">
                         {searchTerm || hasActiveFilters 
                           ? "No agents match your search criteria" 
                           : "No agents found"
                         }
                       </p>
                     </div>
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredAgents.map((agent) => (
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
                         <DropdownMenuItem onClick={() => handleRunAgent(agent.id)}>
                           <Play className="h-4 w-4 mr-2" />
                           Run
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleConfigureAgent(agent.id)}>
                           <Settings className="h-4 w-4 mr-2" />
                           Configure
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handlePauseAgent(agent.id)}>
                           <Pause className="h-4 w-4 mr-2" />
                           {agent.status === "running" ? "Pause" : "Resume"}
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           className="text-destructive"
                           onClick={() => handleDeleteAgent(agent.id)}
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
                           Delete
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                 </TableRow>
               ))
               )}
             </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Create Agent Drawer */}
      <Sheet open={showCreateAgent} onOpenChange={setShowCreateAgent}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border overflow-y-auto">
           <SheetHeader>
             <SheetTitle className="flex items-center gap-2">
               {editingAgent ? <Settings className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
               {editingAgent ? "Configure Agent" : "Create New Agent"}
             </SheetTitle>
             <SheetDescription>
               {editingAgent 
                 ? "Modify your AI agent configuration and capabilities" 
                 : "Configure your new AI agent with specific goals and capabilities"
               }
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
                 onClick={() => {
                   setShowCreateAgent(false)
                   setEditingAgent(null)
                   setNewAgent({
                     name: "",
                     goal: "",
                     model: availableModels[0] || "GPT-4",
                     tools: [],
                     schedule: "manual"
                   })
                 }}
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
                 {editingAgent ? "Update Agent" : "Create Agent"}
               </Button>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}