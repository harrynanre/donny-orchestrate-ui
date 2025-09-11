"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Bot, CheckSquare, Settings, FolderOpen, Terminal, Database, Youtube, Activity, Store, BarChart3, CreditCard, Search } from "lucide-react"

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const commands = [
    {
      group: "Quick Actions",
      items: [
        {
          title: "Create Agent",
          icon: Bot,
          action: () => console.log("Opening Create Agent drawer...")
        },
        {
          title: "Start Task", 
          icon: CheckSquare,
          action: () => console.log("Opening Start Task drawer...")
        },
      ]
    },
    {
      group: "Navigation",
      items: [
        {
          title: "Home",
          icon: Search,
          action: () => navigate("/user")
        },
        {
          title: "My Projects",
          icon: FolderOpen,
          action: () => navigate("/user/projects")
        },
        {
          title: "My Agents",
          icon: Bot,
          action: () => navigate("/user/agents")
        },
        {
          title: "Tasks",
          icon: CheckSquare,
          action: () => navigate("/user/tasks")
        },
        {
          title: "Terminal",
          icon: Terminal,
          action: () => navigate("/user/terminal")
        },
        {
          title: "Memory",
          icon: Database,
          action: () => navigate("/user/memory")
        },
        {
          title: "YouTube Processor",
          icon: Youtube,
          action: () => navigate("/user/youtube")
        },
        {
          title: "Activity",
          icon: Activity,
          action: () => navigate("/user/activity")
        },
        {
          title: "Marketplace",
          icon: Store,
          action: () => navigate("/user/marketplace")
        },
        {
          title: "Analytics",
          icon: BarChart3,
          action: () => navigate("/user/analytics")
        },
        {
          title: "Settings",
          icon: Settings,
          action: () => navigate("/user/settings")
        },
        {
          title: "Billing",
          icon: CreditCard,
          action: () => navigate("/user/billing")
        },
      ]
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.title}
                onSelect={() => runCommand(item.action)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}