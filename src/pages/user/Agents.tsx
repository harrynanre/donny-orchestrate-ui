"use client"

import { useState } from "react"
import { Plus, Search, Filter, Bot, Play, Pause, Settings, MoreVertical, Clock, Zap } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Agents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

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
        <Button className="button-primary">
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
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`status-pill status-${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </Badge>
                        <Badge className={`text-xs px-2 py-1 rounded ${getModelColor(agent.model)}`}>
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
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                    {agent.tools.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
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
    </div>
  )
}