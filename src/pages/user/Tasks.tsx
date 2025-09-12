"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Clock, CheckCircle2, XCircle, Play, MoreVertical, Edit, Copy, Trash2, Eye, X, AlertCircle, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { taskStore, type Task } from "@/lib/task-store"
import { agentStore, type Agent } from "@/lib/agent-store"

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    agent: [] as string[]
  })
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableStatuses] = useState(["queued", "running", "done", "failed"])
  const [availablePriorities] = useState(["low", "medium", "high"])

  // Form state for creating/editing tasks
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedAgent: "",
    status: "queued" as Task['status'],
    priority: "medium" as Task['priority'],
    category: ""
  })

  // Load tasks and agents on mount
  useEffect(() => {
    setTasks(taskStore.getTasks())
    setAgents(agentStore.getAgents())
    setAvailableCategories(taskStore.getAvailableCategories())
    
    const unsubscribeTasks = taskStore.onTasksChange(setTasks)
    const unsubscribeAgents = agentStore.onAgentsChange(setAgents)
    
    return () => {
      unsubscribeTasks()
      unsubscribeAgents()
    }
  }, [])

  // Pre-fill form when editing
  useEffect(() => {
    if (editingTask) {
      setNewTask({
        title: editingTask.title,
        description: editingTask.description,
        assignedAgent: editingTask.assignedAgent,
        status: editingTask.status,
        priority: editingTask.priority,
        category: editingTask.category
      })
    }
  }, [editingTask])

  // Filter and search logic
  const filteredTasks = tasks.filter(task => {
    const assignedAgent = agents.find(a => a.id === task.assignedAgent)
    const agentName = assignedAgent?.name || ""

    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agentName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatusFilter = filters.status.length === 0 || filters.status.includes(task.status)
    const matchesPriorityFilter = filters.priority.length === 0 || filters.priority.includes(task.priority)
    const matchesCategoryFilter = filters.category.length === 0 || filters.category.includes(task.category)
    const matchesAgentFilter = filters.agent.length === 0 || filters.agent.includes(task.assignedAgent)

    return matchesSearch && matchesStatusFilter && matchesPriorityFilter && matchesCategoryFilter && matchesAgentFilter
  })

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      agent: []
    })
  }

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.category.length > 0 || filters.agent.length > 0

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "queued":
        return { color: "warning", icon: Clock, label: "Queued" }
      case "running":
        return { color: "primary", icon: Play, label: "Running" }
      case "done":
        return { color: "success", icon: CheckCircle2, label: "Done" }
      case "failed":
        return { color: "error", icon: XCircle, label: "Failed" }
      default:
        return { color: "warning", icon: Clock, label: "Unknown" }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim() || !newTask.assignedAgent) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (editingTask) {
        // Update existing task
        const success = taskStore.updateTask(editingTask.id, {
          title: newTask.title,
          description: newTask.description,
          assignedAgent: newTask.assignedAgent,
          status: newTask.status,
          priority: newTask.priority,
          category: newTask.category
        })

        if (success) {
          toast({
            title: "Task Updated",
            description: `"${newTask.title}" has been updated successfully.`,
          })
        }
      } else {
        // Create new task
        const task = taskStore.addTask({
          title: newTask.title,
          description: newTask.description,
          assignedAgent: newTask.assignedAgent,
          status: newTask.status,
          priority: newTask.priority,
          category: newTask.category
        })
        
        toast({
          title: "Task Created Successfully",
          description: `"${task.title}" has been assigned to agent.`,
        })
      }

      // Reset form and close sheet
      setShowCreateTask(false)
      setEditingTask(null)
      setNewTask({
        title: "",
        description: "",
        assignedAgent: "",
        status: "queued",
        priority: "medium",
        category: ""
      })
    } catch (error) {
      toast({
        title: `Error ${editingTask ? 'Updating' : 'Creating'} Task`,
        description: `Failed to ${editingTask ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive"
      })
    }
  }

  // Task action handlers
  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    setEditingTask(task)
    setShowCreateTask(true)
  }

  const handleDuplicateTask = (taskId: string) => {
    const duplicated = taskStore.duplicateTask(taskId)
    if (duplicated) {
      toast({
        title: "Task Duplicated",
        description: `"${duplicated.title}" has been created successfully.`,
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    const success = taskStore.deleteTask(taskId)
    if (success) {
      toast({
        title: "Task Deleted",
        description: `"${task.title}" has been removed successfully.`,
        variant: "destructive"
      })
    }
  }

  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    setSelectedTask(task)
    setShowTaskDetails(true)
  }

  const handleRestartTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    const success = taskStore.updateTask(taskId, { 
      status: "queued",
      lastEvent: "Task restarted",
      duration: undefined
    })
    if (success) {
      toast({
        title: "Task Restarted",
        description: `"${task.title}" has been restarted.`,
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

  const getTaskAgent = (task: Task) => {
    return agents.find(agent => agent.id === task.assignedAgent)
  }

  const statusColumns = [
    { status: "queued", title: "Queued", count: getTasksByStatus("queued").length },
    { status: "running", title: "Running", count: getTasksByStatus("running").length },
    { status: "done", title: "Done", count: getTasksByStatus("done").length },
    { status: "failed", title: "Failed", count: getTasksByStatus("failed").length },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Monitor and manage agent tasks in real-time across your organization
          </p>
        </div>
        <Button 
          className="button-primary shadow-lg hover:shadow-xl transition-shadow px-6 py-2 h-auto"
          onClick={() => setShowCreateTask(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card 
          className={`p-4 border-l-4 border-l-primary cursor-pointer transition-all hover:shadow-md ${
            filters.status.length === 0 ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('queued') ? 'ring-2 ring-yellow-500 bg-yellow-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('queued')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Queued</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'queued').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('running') ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('running')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Running</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'running').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-blue-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('done') ? 'ring-2 ring-green-500 bg-green-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('done')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Done</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'done').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('failed') ? 'ring-2 ring-red-500 bg-red-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('failed')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.status === 'failed').length}
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
              placeholder="Search tasks..."
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
                  {filters.status.length + filters.priority.length + filters.category.length + filters.agent.length}
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

                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    {availablePriorities.map((priority) => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-priority-${priority}`}
                          checked={filters.priority.includes(priority)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, priority: [...prev.priority, priority] }))
                            } else {
                              setFilters(prev => ({ ...prev, priority: prev.priority.filter(p => p !== priority) }))
                            }
                          }}
                        />
                        <Label htmlFor={`filter-priority-${priority}`} className="text-sm capitalize cursor-pointer">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-category-${category}`}
                          checked={filters.category.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, category: [...prev.category, category] }))
                            } else {
                              setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }))
                            }
                          }}
                        />
                        <Label htmlFor={`filter-category-${category}`} className="text-sm cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Agent</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-agent-${agent.id}`}
                          checked={filters.agent.includes(agent.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, agent: [...prev.agent, agent.id] }))
                            } else {
                              setFilters(prev => ({ ...prev, agent: prev.agent.filter(a => a !== agent.id) }))
                            }
                          }}
                        />
                        <Label htmlFor={`filter-agent-${agent.id}`} className="text-sm cursor-pointer">
                          {agent.name}
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
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredTasks.length === tasks.length 
            ? `Showing all ${tasks.length} tasks` 
            : `Showing ${filteredTasks.length} of ${tasks.length} tasks`
          }
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear filters
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const statusConfig = getStatusConfig(column.status)
          const columnTasks = getTasksByStatus(column.status)
          
          return (
            <div key={column.status} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <statusConfig.icon className={`h-4 w-4 text-${statusConfig.color}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {column.count}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const taskAgent = getTaskAgent(task)
                  return (
                    <Card key={task.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium leading-relaxed pr-2">
                            {task.title}
                          </CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewTask(task.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRestartTask(task.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Restart
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTask(task.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Clone
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent onClick={() => handleViewTask(task.id)}>
                        {/* Agent */}
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="gradient-primary text-white text-xs">
                              {taskAgent ? taskAgent.name.split(' ').map(n => n[0]).join('') : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {taskAgent?.name || 'Unknown Agent'}
                          </span>
                        </div>

                        {/* Priority and Category */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {task.category}
                          </Badge>
                        </div>

                        {/* Status and Last Event */}
                        <div className="space-y-2">
                          <Badge className={`status-pill status-${statusConfig.color} text-xs`}>
                            {statusConfig.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {task.lastEvent}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.timestamp}</span>
                            {task.duration && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {task.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                
                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center text-muted-foreground">
                    <statusConfig.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No {column.title.toLowerCase()} tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Task Sheet */}
      <Sheet open={showCreateTask} onOpenChange={setShowCreateTask}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {editingTask ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingTask ? "Edit Task" : "Create New Task"}
            </SheetTitle>
            <SheetDescription>
              {editingTask 
                ? "Modify your task configuration and assigned agent" 
                : "Configure your new task with specific requirements and assign to an agent"
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Generate blog post about AI trends"
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this task should accomplish..."
                rows={3}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskAgent">Assigned Agent</Label>
              <Select value={newTask.assignedAgent} onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedAgent: value }))}>
                <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span>{agent.name}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {agent.model}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskStatus">Status</Label>
                <Select value={newTask.status} onValueChange={(value: Task['status']) => setNewTask(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskCategory">Category</Label>
                <Input
                  id="taskCategory"
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Content"
                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateTask(false)
                  setEditingTask(null)
                  setNewTask({
                    title: "",
                    description: "",
                    assignedAgent: "",
                    status: "queued",
                    priority: "medium",
                    category: ""
                  })
                }}
                className="flex-1 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.description || !newTask.assignedAgent}
                className="flex-1 button-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Task details and assigned agent information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={`status-pill status-${getStatusConfig(selectedTask.status).color} mt-1`}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <Badge className={`mt-1 text-xs px-2 py-1 ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm leading-relaxed">{selectedTask.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <p className="mt-1">{selectedTask.category}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Assigned Agent</Label>
                <div className="mt-2">
                  {(() => {
                    const taskAgent = getTaskAgent(selectedTask)
                    return taskAgent ? (
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {taskAgent.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{taskAgent.name}</p>
                            <p className="text-xs text-muted-foreground">{taskAgent.goal}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`status-pill status-${getStatusConfig(taskAgent.status).color}`}>
                            {taskAgent.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {taskAgent.model}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No agent assigned to this task.
                      </p>
                    )
                  })()}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Event</Label>
                <p className="mt-1 text-sm">{selectedTask.lastEvent}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span>Created: {selectedTask.createdDate}</span>
                <span>Last updated: {selectedTask.timestamp}</span>
                {selectedTask.duration && <span>Duration: {selectedTask.duration}</span>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}