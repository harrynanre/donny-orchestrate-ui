"use client"

import { TrendingUp, TrendingDown, Bot, CheckSquare, Clock, Zap, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Analytics() {
  const kpis = [
    {
      title: "Active Agents",
      value: "12",
      change: "+2",
      trend: "up" as const,
      description: "Currently running",
      icon: Bot,
    },
    {
      title: "Tasks Completed",
      value: "247",
      change: "+18%",
      trend: "up" as const,
      description: "This month",
      icon: CheckSquare,
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up" as const,
      description: "Last 30 days",
      icon: Zap,
    },
    {
      title: "Avg Response Time",
      value: "1.3s",
      change: "-0.2s",
      trend: "up" as const,
      description: "System performance",
      icon: Clock,
    },
  ]

  const recentTrends = [
    {
      title: "Content Creator agent performance improved",
      description: "Success rate increased from 87% to 95% after optimization",
      timestamp: "2 hours ago",
      type: "improvement",
    },
    {
      title: "Peak usage detected",
      description: "30% increase in task volume during business hours",
      timestamp: "6 hours ago",
      type: "insight",
    },
    {
      title: "New integration opportunities",
      description: "3 API endpoints showing high usage patterns",
      timestamp: "1 day ago",
      type: "opportunity",
    },
    {
      title: "System maintenance completed",
      description: "All agents running at optimal performance",
      timestamp: "2 days ago",
      type: "system",
    },
  ]

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? TrendingUp : TrendingDown
  }

  const getTrendColor = (trend: "up" | "down") => {
    return trend === "up" ? "text-success" : "text-destructive"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "improvement": return "success"
      case "insight": return "primary"
      case "opportunity": return "accent"
      case "system": return "warning"
      default: return "muted"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor performance and optimize your AI agent workflows
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const TrendIcon = getTrendIcon(kpi.trend)
          
          return (
            <Card key={kpi.title} className="card-enterprise">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(kpi.trend)}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="font-medium">{kpi.change}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-sm font-medium">{kpi.title}</div>
                  <div className="text-xs text-muted-foreground">{kpi.description}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart Placeholder */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Task Performance Trends</CardTitle>
            <CardDescription>Success rate and completion time over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization would be rendered here</p>
                <p className="text-xs text-muted-foreground mt-1">Integration with chart library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Activity Chart Placeholder */}
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle>Agent Activity</CardTitle>
            <CardDescription>Task distribution across your active agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Agent activity chart would be rendered here</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time data visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Insights */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Trends & Insights</h2>
        <div className="space-y-3">
          {recentTrends.map((trend, index) => (
            <Card key={index} className="card-enterprise">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-${getTypeColor(trend.type)}/10 flex-shrink-0`}>
                    <TrendingUp className={`h-4 w-4 text-${getTypeColor(trend.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-sm leading-relaxed">
                          {trend.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {trend.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`status-pill status-${getTypeColor(trend.type)} text-xs`}>
                          {trend.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {trend.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-enterprise">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Most Active Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">Customer Support</div>
              <div className="text-sm text-muted-foreground">127 tasks completed</div>
              <div className="text-xs text-muted-foreground">98.5% success rate</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enterprise">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Peak Usage Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">2:00 PM - 3:00 PM</div>
              <div className="text-sm text-muted-foreground">45 tasks/hour average</div>
              <div className="text-xs text-muted-foreground">+23% above baseline</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enterprise">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Resource Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">94.2% Utilization</div>
              <div className="text-sm text-muted-foreground">Optimal performance</div>
              <div className="text-xs text-muted-foreground">No scaling needed</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}