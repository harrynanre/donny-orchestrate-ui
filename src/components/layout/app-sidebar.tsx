"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FolderOpen,
  Bot,
  CheckSquare,
  Terminal,
  Database,
  Activity,
  Store,
  BarChart3,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Youtube
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { title: "Home", url: "/user", icon: Home },
  { title: "My Projects", url: "/user/projects", icon: FolderOpen },
  { title: "My Agents", url: "/user/agents", icon: Bot },
  { title: "Tasks", url: "/user/tasks", icon: CheckSquare },
  { title: "Terminal", url: "/user/terminal", icon: Terminal },
  { title: "Memory", url: "/user/memory", icon: Database },
  { title: "YouTube Processor", url: "/user/youtube", icon: Youtube },
  { title: "Activity", url: "/user/activity", icon: Activity },
  { title: "Marketplace", url: "/user/marketplace", icon: Store },
  { title: "Analytics", url: "/user/analytics", icon: BarChart3 },
]

const settingsItems = [
  { title: "Settings", url: "/user/settings", icon: Settings },
  { title: "Billing", url: "/user/billing", icon: CreditCard },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const currentPath = pathname

  const isActive = (path: string) => {
    if (path === "/user") {
      return currentPath === "/user"
    }
    return currentPath.startsWith(path)
  }

  const getNavClassName = (path: string) => {
    const baseClass = "sidebar-nav-item"
    return isActive(path) ? `${baseClass} sidebar-nav-item-active` : baseClass
  }

  return (
    <Sidebar 
      className={`transition-all duration-300 ${state === "collapsed" ? "w-16" : "w-64"}`}
      collapsible="icon"
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {state !== "collapsed" && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sidebar-foreground">Donny Hub</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {state === "collapsed" ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {state !== "collapsed" && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-3 py-2">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <Link 
                      href={item.url} 
                      className={getNavClassName(item.url)}
                      title={state === "collapsed" ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          {state !== "collapsed" && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-3 py-2">
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <Link 
                      href={item.url} 
                      className={getNavClassName(item.url)}
                      title={state === "collapsed" ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}