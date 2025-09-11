"use client"

import { useState } from "react"
import { Plus, Search, Filter, Clock, CheckCircle2, XCircle, Play, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  agent: string
  status: "queued" | "running" | "done" | "failed"
  lastEvent: string
  timestamp: string
  duration?: string
}

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("")

  const tasks: Task[] = [
    {
      id: "1",
      title: "Generate blog post about AI trends",
      agent: "Content Creator",
      status: "running",
      lastEvent: "Researching AI trends...",
      timestamp: "5 minutes ago",
    },
    {
      id: "2", 
      title: "Analyze customer feedback data",
      agent: "Data Analyzer",
      status: "done",
      lastEvent: "Report generated successfully",
      timestamp: "1 hour ago",
      duration: "45 minutes",
    },
    {
      id: "3",
      title: "Schedule social media posts",
      agent: "Social Media Manager", 
      status: "queued",
      lastEvent: "Waiting for approval",
      timestamp: "2 hours ago",
    },
    {
      id: "4",
      title: "Process support tickets",
      agent: "Customer Support",
      status: "running",
      lastEvent: "Responding to ticket #1234",
      timestamp: "10 minutes ago",
    },
    {
      id: "5",
      title: "Update product descriptions",
      agent: "Content Creator",
      status: "failed",
      lastEvent: "API connection timeout",
      timestamp: "3 hours ago",
    },
    {
      id: "6",
      title: "Generate marketing report",
      agent: "Data Analyzer",
      status: "done",
      lastEvent: "Report sent to team",
      timestamp: "1 day ago",
      duration: "2 hours",
    },
  ]

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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
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
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage agent tasks in real-time
          </p>
        </div>
        <Button className="button-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
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
                {columnTasks.map((task) => (
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Restart</DropdownMenuItem>
                            <DropdownMenuItem>Clone</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Agent */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="gradient-primary text-white text-xs">
                            {task.agent.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.agent}</span>
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
                ))}
                
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
    </div>
  )
}