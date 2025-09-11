"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { GlobalChat } from "@/components/chat/global-chat"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <GlobalChat />
      </div>
    </SidebarProvider>
  )
}