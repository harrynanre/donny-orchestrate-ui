"use client"

import { useState } from "react"
import { Search, Filter, Star, Download, Eye, Bot, Zap, BarChart3, MessageSquare, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  category: string
  rating: number
  downloads: number
  price: "free" | "premium"
  author: string
  tags: string[]
  featured?: boolean
}

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const agents: MarketplaceAgent[] = [
    {
      id: "1",
      name: "SEO Content Optimizer",
      description: "Automatically optimize your content for search engines with AI-powered keyword analysis and content suggestions.",
      category: "content",
      rating: 4.8,
      downloads: 1250,
      price: "free",
      author: "DonnyLabs",
      tags: ["SEO", "Content", "Keywords"],
      featured: true,
    },
    {
      id: "2",
      name: "Social Media Scheduler",
      description: "Smart social media posting with optimal timing, content adaptation, and multi-platform management.",
      category: "marketing",
      rating: 4.9,
      downloads: 890,
      price: "premium",
      author: "MarketBot Inc",
      tags: ["Social Media", "Scheduling", "Marketing"],
      featured: true,
    },
    {
      id: "3",
      name: "Customer Support Chatbot",
      description: "24/7 intelligent customer support with natural language processing and ticket escalation.",
      category: "support",
      rating: 4.7,
      downloads: 2100,
      price: "free",
      author: "AI Support Co",
      tags: ["Support", "Chatbot", "NLP"],
    },
    {
      id: "4",
      name: "Data Analytics Reporter",
      description: "Automated data analysis and report generation with visual charts and actionable insights.",
      category: "analytics",
      rating: 4.6,
      downloads: 675,
      price: "premium",
      author: "DataViz Pro",
      tags: ["Analytics", "Reports", "Visualization"],
    },
    {
      id: "5",
      name: "Website Monitor",
      description: "Continuous website monitoring with uptime alerts, performance tracking, and security scanning.",
      category: "monitoring",
      rating: 4.5,
      downloads: 450,
      price: "free",
      author: "WebGuard",
      tags: ["Monitoring", "Uptime", "Security"],
    },
    {
      id: "6",
      name: "Email Campaign Manager",
      description: "Intelligent email marketing with A/B testing, personalization, and conversion tracking.",
      category: "marketing",
      rating: 4.8,
      downloads: 1100,
      price: "premium",
      author: "EmailPro",
      tags: ["Email", "Campaigns", "Marketing"],
    },
  ]

  const categories = [
    { value: "all", label: "All Categories", icon: Bot, count: agents.length },
    { value: "content", label: "Content", icon: MessageSquare, count: agents.filter(a => a.category === "content").length },
    { value: "marketing", label: "Marketing", icon: Zap, count: agents.filter(a => a.category === "marketing").length },
    { value: "support", label: "Support", icon: MessageSquare, count: agents.filter(a => a.category === "support").length },
    { value: "analytics", label: "Analytics", icon: BarChart3, count: agents.filter(a => a.category === "analytics").length },
    { value: "monitoring", label: "Monitoring", icon: Shield, count: agents.filter(a => a.category === "monitoring").length },
  ]

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredAgents = agents.filter(agent => agent.featured)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover and add pre-built AI agents to your workspace
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.label}
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {category.count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Featured Agents */}
      {selectedCategory === "all" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Featured Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <Card key={agent.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200 relative">
                <div className="absolute top-3 right-3">
                  <Badge className="gradient-primary text-white">Featured</Badge>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="gradient-primary text-white font-medium">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg pr-12">{agent.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{agent.rating}</span>
                        </div>
                        <Badge variant={agent.price === "free" ? "secondary" : "outline"} className="text-xs">
                          {agent.price === "free" ? "Free" : "Premium"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {agent.description}
                  </CardDescription>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{agent.downloads.toLocaleString()}</span>
                      </div>
                      <span>by {agent.author}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="button-primary">
                        Add to Workspace
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Agents */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory === "all" ? "All Agents" : `${categories.find(c => c.value === selectedCategory)?.label} Agents`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="card-enterprise group cursor-pointer hover:scale-[1.02] transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="gradient-primary text-white font-medium">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{agent.rating}</span>
                      </div>
                      <Badge variant={agent.price === "free" ? "secondary" : "outline"} className="text-xs">
                        {agent.price === "free" ? "Free" : "Premium"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {agent.description}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{agent.downloads.toLocaleString()}</span>
                    </div>
                    <span>by {agent.author}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="button-primary">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card className="card-enterprise">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms or filters" : "No agents available in this category"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}