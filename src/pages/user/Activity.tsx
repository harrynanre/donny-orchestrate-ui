"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Filter, Bot, CheckSquare, Settings, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { activityStore, ActivityItem } from "@/lib/activity-store"
import { agentStore } from "@/lib/agent-store"
import { taskStore } from "@/lib/task-store"

export default function Activity() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "agent" | "task" | "system">("all")

  // Real-time activities from shared store
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const initial = activityStore.getActivities()
    setActivities(initial)
    return activityStore.onActivitiesChange(setActivities)
  }, [])


  // Ingest updates from agent and task stores into activity feed
  useEffect(() => {
    let prevAgents: any[] = []
    let prevTasks: any[] = []
    try { prevAgents = agentStore.getAgents() } catch {}
    try { prevTasks = taskStore.getTasks() } catch {}

    const unsubAgents = agentStore.onAgentsChange?.((agents) => {
      // New agents
      agents.forEach((a: any) => {
        if (!prevAgents.find((p: any) => p.id === a.id)) {
          activityStore.addActivity({
            type: 'agent',
            title: `Agent "${a.name}" created`,
            description: a.goal || 'New agent added',
            status: 'success',
            agent: a.name,
          })
        }
      })
      // Agent status changes
      agents.forEach((a: any) => {
        const old = prevAgents.find((p: any) => p.id === a.id)
        if (old && old.status !== a.status) {
          activityStore.addActivity({
            type: 'agent',
            title: `Agent "${a.name}" ${a.status}`,
            description: `Status changed from ${old.status} to ${a.status}`,
            status: mapAgentStatus(a.status),
            agent: a.name,
          })
        }
      })
      prevAgents = agents
    })

    const unsubTasks = taskStore.onTasksChange?.((tasks: any[]) => {
      // New tasks
      tasks.forEach((t: any) => {
        if (!prevTasks.find((p: any) => p.id === t.id)) {
          activityStore.addActivity({
            type: 'task',
            title: `Task created: ${t.title}`,
            description: t.description,
            status: 'success',
            link: `/user/tasks/${t.id}`,
          })
        }
      })
      // Task status changes
      tasks.forEach((t: any) => {
        const old = prevTasks.find((p: any) => p.id === t.id)
        if (old && old.status !== t.status) {
          activityStore.addActivity({
            type: 'task',
            title: `Task ${t.status}: ${t.title}`,
            description: t.lastEvent || `Status changed from ${old.status} to ${t.status}`,
            status: mapTaskStatus(t.status),
            link: `/user/tasks/${t.id}`,
          })
        }
      })
      prevTasks = tasks
    })

    return () => {
      unsubAgents?.()
      unsubTasks?.()
    }
  }, [])

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

  const formatRelativeTime = (isoOrText: string) => {
    const d = new Date(isoOrText)
    if (!isNaN(d.getTime())) {
      const diff = Date.now() - d.getTime()
      const sec = Math.floor(diff / 1000)
      if (sec < 60) return 'Just now'
      const min = Math.floor(sec / 60)
      if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`
      const hr = Math.floor(min / 60)
      if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`
      const day = Math.floor(hr / 24)
      if (day === 1) return 'Yesterday'
      return `${day} days ago`
    }
    return isoOrText
  }

  const mapTaskStatus = (s: string) => {
    switch (s) {
      case 'failed': return 'error' as const
      case 'done': return 'success' as const
      case 'running': return 'warning' as const
      default: return undefined
    }
  }

  const mapAgentStatus = (s: string) => {
    switch (s) {
      case 'error': return 'error' as const
      case 'running': return 'success' as const
      case 'paused': return 'warning' as const
      default: return undefined
    }
  }

  const groupActivitiesByDate = (list: ActivityItem[]) => {
    const groups: { [key: string]: ActivityItem[] } = {}
    const now = new Date()
    const y = new Date(now)
    y.setDate(now.getDate() - 1)

    list.forEach(activity => {
      const d = new Date(activity.timestamp)
      let key = 'Earlier'
      if (!isNaN(d.getTime())) {
        if (d.toDateString() === now.toDateString()) key = 'Today'
        else if (d.toDateString() === y.toDateString()) key = 'Yesterday'
      } else {
        if (activity.timestamp.includes('minute') || activity.timestamp.includes('hour')) key = 'Today'
        else if (activity.timestamp.includes('Yesterday')) key = 'Yesterday'
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(activity)
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

  const DetailIcon = selectedActivity ? getActivityIcon(selectedActivity.type, selectedActivity.status) : null
  const detailColor = selectedActivity ? getActivityColor(selectedActivity.type, selectedActivity.status) : 'muted'

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
                  <Card key={activity.id} className="card-enterprise group cursor-pointer hover:scale-[1.01] transition-all duration-200" onClick={() => { setSelectedActivity(activity); setDetailOpen(true) }}>
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
                                  {formatRelativeTime(activity.timestamp)}
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

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={(o) => { setDetailOpen(o); if (!o) setSelectedActivity(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.title ?? "Activity details"}</DialogTitle>
            <DialogDescription>{selectedActivity ? formatRelativeTime(selectedActivity.timestamp) : ""}</DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${detailColor}/10`}>
                  {DetailIcon ? <DetailIcon className={`h-5 w-5 text-${detailColor}`} /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Type: {selectedActivity.type}</span>
                    {selectedActivity.agent && <span className="text-muted-foreground">Agent: {selectedActivity.agent}</span>}
                    {selectedActivity.status && <Badge className={`status-pill status-${detailColor}`}>{selectedActivity.status}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedActivity?.link && (
              <Button asChild>
                <a href={selectedActivity.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  Open Link
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}