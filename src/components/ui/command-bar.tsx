"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Bot, CheckSquare, Settings, FolderOpen, Terminal, Database, Youtube, Activity, Store, BarChart3, CreditCard, Search } from "lucide-react"

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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
          action: () => router.push("/user")
        },
        {
          title: "My Projects",
          icon: FolderOpen,
          action: () => router.push("/user/projects")
        },
        {
          title: "My Agents",
          icon: Bot,
          action: () => router.push("/user/agents")
        },
        {
          title: "Tasks",
          icon: CheckSquare,
          action: () => router.push("/user/tasks")
        },
        {
          title: "Terminal",
          icon: Terminal,
          action: () => router.push("/user/terminal")
        },
        {
          title: "Memory",
          icon: Database,
          action: () => router.push("/user/memory")
        },
        {
          title: "YouTube Processor",
          icon: Youtube,
          action: () => router.push("/user/youtube")
        },
        {
          title: "Activity",
          icon: Activity,
          action: () => router.push("/user/activity")
        },
        {
          title: "Marketplace",
          icon: Store,
          action: () => router.push("/user/marketplace")
        },
        {
          title: "Analytics",
          icon: BarChart3,
          action: () => router.push("/user/analytics")
        },
        {
          title: "Settings",
          icon: Settings,
          action: () => router.push("/user/settings")
        },
        {
          title: "Billing",
          icon: CreditCard,
          action: () => router.push("/user/billing")
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