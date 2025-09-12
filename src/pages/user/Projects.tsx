"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, FolderOpen, Calendar, Users, MoreVertical, Edit, Copy, Archive, Trash2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { projectStore, type Project } from "@/lib/project-store"
import { agentStore, type Agent } from "@/lib/agent-store"

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: [] as string[],
    category: [] as string[]
  })
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableStatuses] = useState(["active", "paused", "completed", "archived"])

  // Form state for creating/editing projects
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active" as Project['status'],
    assignedAgents: [] as string[],
    progress: 0,
    category: ""
  })

  // Load projects and agents on mount
  useEffect(() => {
    setProjects(projectStore.getProjects())
    setAgents(agentStore.getAgents())
    setAvailableCategories(projectStore.getAvailableCategories())
    
    const unsubscribeProjects = projectStore.onProjectsChange(setProjects)
    const unsubscribeAgents = agentStore.onAgentsChange(setAgents)
    
    return () => {
      unsubscribeProjects()
      unsubscribeAgents()
    }
  }, [])

  // Pre-fill form when editing
  useEffect(() => {
    if (editingProject) {
      setNewProject({
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        assignedAgents: editingProject.assignedAgents,
        progress: editingProject.progress,
        category: editingProject.category
      })
    }
  }, [editingProject])

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatusFilter = filters.status.length === 0 || filters.status.includes(project.status)
    const matchesCategoryFilter = filters.category.length === 0 || filters.category.includes(project.category)

    return matchesSearch && matchesStatusFilter && matchesCategoryFilter
  })

  const clearFilters = () => {
    setFilters({
      status: [],
      category: []
    })
  }

  const hasActiveFilters = filters.status.length > 0 || filters.category.length > 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success"
      case "paused": return "warning"
      case "completed": return "success"
      case "archived": return "secondary"
      default: return "warning"
    }
  }

  const handleCreateProject = () => {
    if (!newProject.name.trim() || !newProject.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both project name and description.",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (editingProject) {
        // Update existing project
        const success = projectStore.updateProject(editingProject.id, {
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          assignedAgents: newProject.assignedAgents,
          progress: newProject.progress,
          category: newProject.category
        })

        if (success) {
          toast({
            title: "Project Updated",
            description: `"${newProject.name}" has been updated successfully.`,
          })
        }
      } else {
        // Create new project
        const project = projectStore.addProject({
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          assignedAgents: newProject.assignedAgents,
          progress: newProject.progress,
          category: newProject.category
        })
        
        toast({
          title: "Project Created Successfully",
          description: `"${project.name}" is now ready for your agents.`,
        })
      }

      // Reset form and close sheet
      setShowCreateProject(false)
      setEditingProject(null)
      setNewProject({
        name: "",
        description: "",
        status: "active",
        assignedAgents: [],
        progress: 0,
        category: ""
      })
    } catch (error) {
      toast({
        title: `Error ${editingProject ? 'Updating' : 'Creating'} Project`,
        description: `Failed to ${editingProject ? 'update' : 'create'} project. Please try again.`,
        variant: "destructive"
      })
    }
  }

  // Project action handlers
  const handleEditProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    setEditingProject(project)
    setShowCreateProject(true)
  }

  const handleDuplicateProject = (projectId: string) => {
    const duplicated = projectStore.duplicateProject(projectId)
    if (duplicated) {
      toast({
        title: "Project Duplicated",
        description: `"${duplicated.name}" has been created successfully.`,
      })
    }
  }

  const handleArchiveProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    const success = projectStore.archiveProject(projectId)
    if (success) {
      toast({
        title: "Project Archived",
        description: `"${project.name}" has been archived.`,
      })
    }
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    const success = projectStore.deleteProject(projectId)
    if (success) {
      toast({
        title: "Project Deleted",
        description: `"${project.name}" has been removed successfully.`,
        variant: "destructive"
      })
    }
  }

  const handleViewProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    setSelectedProject(project)
    setShowProjectDetails(true)
  }

  const toggleAgent = (agentId: string) => {
    setNewProject(prev => ({
      ...prev,
      assignedAgents: prev.assignedAgents.includes(agentId) 
        ? prev.assignedAgents.filter(id => id !== agentId)
        : [...prev.assignedAgents, agentId]
    }))
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

  const getProjectAgents = (project: Project) => {
    return agents.filter(agent => project.assignedAgents.includes(agent.id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            My Projects
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Organize and manage your AI agent projects across your organization
          </p>
        </div>
        <Button 
          className="button-primary shadow-lg hover:shadow-xl transition-shadow px-6 py-2 h-auto"
          onClick={() => setShowCreateProject(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
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
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('active') ? 'ring-2 ring-green-500 bg-green-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('active')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('paused') ? 'ring-2 ring-yellow-500 bg-yellow-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('paused')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">
                {projects.filter(p => p.status === 'paused').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500 opacity-75" />
          </div>
        </Card>
        <Card 
          className={`p-4 border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-md ${
            filters.status.includes('completed') ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
          }`}
          onClick={() => handleStatusCardClick('completed')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-75" />
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
              placeholder="Search projects..."
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
                  {filters.status.length + filters.category.length}
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
          {filteredProjects.length === projects.length 
            ? `Showing all ${projects.length} projects` 
            : `Showing ${filteredProjects.length} of ${projects.length} projects`
          }
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear filters
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || hasActiveFilters 
                ? "Try adjusting your search or filters" 
                : "Create your first project to get started"
              }
            </p>
            {!searchTerm && !hasActiveFilters && (
              <Button onClick={() => setShowCreateProject(true)} className="button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`status-pill status-${getStatusColor(project.status)} flex-shrink-0`}>
                          {project.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-2 py-1 flex-shrink-0">
                          {project.category}
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
                      <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleViewProject(project.id)}>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {project.description}
                </CardDescription>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project.assignedAgents.length} agents</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{project.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Project Sheet */}
      <Sheet open={showCreateProject} onOpenChange={setShowCreateProject}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {editingProject ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingProject ? "Edit Project" : "Create New Project"}
            </SheetTitle>
            <SheetDescription>
              {editingProject 
                ? "Modify your project configuration and assigned agents" 
                : "Configure your new project with specific goals and assign agents"
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., E-commerce Automation"
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this project aims to accomplish..."
                rows={3}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectStatus">Status</Label>
                <Select value={newProject.status} onValueChange={(value: Project['status']) => setNewProject(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectCategory">Category</Label>
                <Input
                  id="projectCategory"
                  value={newProject.category}
                  onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., E-commerce, Marketing"
                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectProgress">Progress (%)</Label>
              <Input
                id="projectProgress"
                type="number"
                min="0"
                max="100"
                value={newProject.progress}
                onChange={(e) => setNewProject(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Assigned Agents</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-agent-${agent.id}`}
                      checked={newProject.assignedAgents.includes(agent.id)}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                    <Label htmlFor={`project-agent-${agent.id}`} className="text-sm flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{agent.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {agent.model}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {newProject.assignedAgents.length} agents
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateProject(false)
                  setEditingProject(null)
                  setNewProject({
                    name: "",
                    description: "",
                    status: "active",
                    assignedAgents: [],
                    progress: 0,
                    category: ""
                  })
                }}
                className="flex-1 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProject.name || !newProject.description}
                className="flex-1 button-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Project Details Dialog */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              Project details and assigned agents
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={`status-pill status-${getStatusColor(selectedProject.status)} mt-1`}>
                    {selectedProject.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="mt-1">{selectedProject.category}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm leading-relaxed">{selectedProject.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Completion</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Assigned Agents ({selectedProject.assignedAgents.length})</Label>
                <div className="mt-2 space-y-2">
                  {getProjectAgents(selectedProject).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.goal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`status-pill status-${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {agent.model}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {selectedProject.assignedAgents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No agents assigned to this project yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span>Created: {selectedProject.createdDate}</span>
                <span>Last updated: {selectedProject.lastUpdated}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}