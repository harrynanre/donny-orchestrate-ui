"use client"

import { useState } from "react"
import { Plus, Search, Filter, FolderOpen, Calendar, Users, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")

  const projects = [
    {
      id: "1",
      name: "E-commerce Automation",
      description: "Automated customer service and inventory management system",
      status: "active",
      agents: 5,
      lastUpdated: "2 hours ago",
      progress: 85,
    },
    {
      id: "2", 
      name: "Content Marketing Hub",
      description: "AI-powered content creation and social media management",
      status: "active",
      agents: 3,
      lastUpdated: "1 day ago",
      progress: 60,
    },
    {
      id: "3",
      name: "Data Analytics Pipeline",
      description: "Automated data processing and reporting workflows",
      status: "paused",
      agents: 2,
      lastUpdated: "3 days ago",
      progress: 40,
    },
    {
      id: "4",
      name: "Customer Support Bot",
      description: "24/7 intelligent customer support and ticket management",
      status: "active",
      agents: 4,
      lastUpdated: "5 hours ago",
      progress: 95,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success"
      case "paused": return "warning"
      case "completed": return "success"
      default: return "warning"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage your AI agent projects
          </p>
        </div>
        <Button className="button-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={`status-pill status-${getStatusColor(project.status)} mt-1`}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
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
                  <span>{project.agents} agents</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{project.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no projects) */}
      {projects.length === 0 && (
        <Card className="card-enterprise">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first AI agent project
            </p>
            <Button className="button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}