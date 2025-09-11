"use client"

import { Plus, Bot, CheckSquare, BarChart3, Globe, Activity, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const quickActions = [
    { title: "Create Agent", icon: Bot, description: "Design and deploy a new AI agent" },
    { title: "Start Task", icon: CheckSquare, description: "Initiate a new task or workflow" },
    { title: "Open Chat", icon: Zap, description: "Get immediate help from Donny" },
  ]

  const features = [
    { title: "Create Agent", icon: Bot, description: "Build custom AI agents for any workflow" },
    { title: "Start Task", icon: CheckSquare, description: "Launch tasks and let Donny orchestrate" },
    { title: "Scan & Fix Website", icon: Globe, description: "Automated website analysis and optimization" },
    { title: "Chat with Donny", icon: Zap, description: "Get instant AI assistance and guidance" },
    { title: "Analytics", icon: BarChart3, description: "Track performance and optimize workflows" },
    { title: "Marketplace", icon: Activity, description: "Discover pre-built agents and templates" },
  ]

  const systemStatus = [
    { name: "UI", status: "operational", color: "success" },
    { name: "API", status: "operational", color: "success" },
    { name: "Doctor", status: "degraded", color: "warning" },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to Donny Hub</h1>
          <p className="text-xl opacity-90 mb-6">
            Create agents, start tasks, and let Donny orchestrate your AI workflow
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="secondary"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.title}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">System Status</h2>
        <Card className="card-enterprise">
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
            <CardDescription>Real-time status of all Donny Hub services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {systemStatus.map((service) => (
                <div key={service.name} className="flex items-center gap-3">
                  <Badge 
                    className={`status-pill status-${service.color}`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-current mr-2`} />
                    {service.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
        <Card className="card-enterprise">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-success/10">
                  <Bot className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Agent "Content Creator" deployed successfully</div>
                  <div className="text-xs text-muted-foreground">2 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Task "Website Analysis" completed</div>
                  <div className="text-xs text-muted-foreground">15 minutes ago</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Activity className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">3 new marketplace agents available</div>
                  <div className="text-xs text-muted-foreground">1 hour ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}