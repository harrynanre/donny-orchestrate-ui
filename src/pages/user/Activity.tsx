"use client"

import { useState } from "react"
import { Search, Filter, Bot, CheckSquare, Settings, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ActivityItem {
  id: string
  type: "agent" | "task" | "system"
  title: string
  description: string
  timestamp: string
  status?: "success" | "warning" | "error"
  agent?: string
  link?: string
}

export default function Activity() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "agent" | "task" | "system">("all")

  const activities: ActivityItem[] = [
    // Today
    {
      id: "1",
      type: "agent",
      title: 'Agent "Content Creator" completed task',
      description: "Successfully generated blog post about AI trends in marketing",
      timestamp: "2 minutes ago",
      status: "success",
      agent: "Content Creator",
      link: "/user/tasks/1",
    },
    {
      id: "2",
      type: "task",
      title: "New task assigned by Donny",
      description: "Analyze customer feedback data for Q4 insights",
      timestamp: "15 minutes ago",
      agent: "Data Analyzer",
      link: "/user/tasks/2",
    },
    {
      id: "3",
      type: "system",
      title: "Marketplace update available",
      description: "3 new pre-built agents added to the marketplace",
      timestamp: "1 hour ago",
      status: "success",
      link: "/user/marketplace",
    },
    {
      id: "4",
      type: "agent",
      title: 'Agent "Customer Support" paused',
      description: "Manual pause triggered by user action",
      timestamp: "2 hours ago",
      status: "warning",
      agent: "Customer Support",
    },
    
    // Yesterday
    {
      id: "5",
      type: "task",
      title: 'Task "Social Media Posting" failed',
      description: "API rate limit exceeded, retrying in 30 minutes",
      timestamp: "Yesterday, 11:30 PM",
      status: "error",
      agent: "Social Media Manager",
      link: "/user/tasks/5",
    },
    {
      id: "6",
      type: "agent",
      title: 'Agent "Data Analyzer" deployed',
      description: "New agent successfully configured and activated",
      timestamp: "Yesterday, 6:45 PM",
      status: "success",
      agent: "Data Analyzer",
    },
    {
      id: "7",
      type: "system",
      title: "Weekly usage report generated",
      description: "Your agents processed 47 tasks this week with 94% success rate",
      timestamp: "Yesterday, 2:00 PM",
      status: "success",
      link: "/user/analytics",
    },
    
    // Earlier
    {
      id: "8",
      type: "task",
      title: "Batch processing completed",
      description: "Successfully processed 25 customer support tickets",
      timestamp: "3 days ago",
      status: "success",
      agent: "Customer Support",
      link: "/user/tasks/8",
    },
    {
      id: "9",
      type: "agent",
      title: 'Agent "Website Monitor" created',
      description: "New monitoring agent configured for website health checks",
      timestamp: "5 days ago",
      status: "success",
      agent: "Website Monitor",
    },
    {
      id: "10",
      type: "system",
      title: "Platform maintenance completed",
      description: "Scheduled maintenance window finished, all services restored",
      timestamp: "1 week ago",
      status: "success",
    },
  ]

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "agent":
        return Bot
      case "task":
        return CheckSquare
      case "system":
        return status === "error" ? AlertCircle : Settings
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string, status?: string) => {
    if (status === "error") return "destructive"
    if (status === "warning") return "warning"
    if (status === "success") return "success"
    
    switch (type) {
      case "agent": return "primary"
      case "task": return "accent"
      case "system": return "muted"
      default: return "muted"
    }
  }

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const groups: { [key: string]: ActivityItem[] } = {}
    
    activities.forEach(activity => {
      let dateGroup = "Earlier"
      
      if (activity.timestamp.includes("minute") || activity.timestamp.includes("hour")) {
        dateGroup = "Today"
      } else if (activity.timestamp.includes("Yesterday")) {
        dateGroup = "Yesterday"
      }
      
      if (!groups[dateGroup]) {
        groups[dateGroup] = []
      }
      groups[dateGroup].push(activity)
    })
    
    return groups
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || activity.type === filterType
    
    return matchesSearch && matchesFilter
  })

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  const filterOptions = [
    { value: "all", label: "All", count: activities.length },
    { value: "agent", label: "Agents", count: activities.filter(a => a.type === "agent").length },
    { value: "task", label: "Tasks", count: activities.filter(a => a.type === "task").length },
    { value: "system", label: "System", count: activities.filter(a => a.type === "system").length },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-1">
          Track all agent activities, tasks, and system events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filterType === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(option.value as any)}
              className="gap-2"
            >
              {option.label}
              <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {option.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
          <div key={dateGroup}>
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              {dateGroup}
            </h3>
            <div className="space-y-3">
              {groupActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type, activity.status)
                const color = getActivityColor(activity.type, activity.status)
                
                return (
                  <Card key={activity.id} className="card-enterprise group cursor-pointer hover:scale-[1.01] transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg bg-${color}/10 flex-shrink-0`}>
                          <Icon className={`h-4 w-4 text-${color}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm leading-relaxed">
                                {activity.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {activity.description}
                              </p>
                              
                              {/* Meta Information */}
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs text-muted-foreground">
                                  {activity.timestamp}
                                </span>
                                
                                {activity.agent && (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="gradient-primary text-white text-xs">
                                        {activity.agent.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {activity.agent}
                                    </span>
                                  </div>
                                )}
                                
                                {activity.status && (
                                  <Badge className={`status-pill status-${color} text-xs`}>
                                    {activity.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Action */}
                            {activity.link && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <Card className="card-enterprise">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms" : "Activities will appear here as your agents work"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}