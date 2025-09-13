"use client"

import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface ProfileData {
  name: string
  email: string
  bio: string
  company: string
  timezone: string
  avatar?: string
}

export function AppHeader() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john@company.com",
    bio: "",
    company: "",
    timezone: ""
  })

  // Load profile data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('donny-hub-profile')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfileData(parsedProfile)
      } catch (error) {
        console.error('Failed to load profile from localStorage:', error)
      }
    }

    // Listen for custom profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      setProfileData(event.detail)
    }

    // Listen for storage changes to update profile in real-time
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'donny-hub-profile' && event.newValue) {
        try {
          const parsedProfile = JSON.parse(event.newValue)
          setProfileData(parsedProfile)
        } catch (error) {
          console.error('Failed to parse updated profile:', error)
        }
      }
    }

    window.addEventListener('profile-updated', handleProfileUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleNotificationClick = (type: 'agent' | 'task' | 'marketplace') => {
    switch (type) {
      case 'agent':
        navigate('/user/agents')
        break
      case 'task':
        navigate('/user/tasks')
        break
      case 'marketplace':
        navigate('/user/marketplace')
        break
    }
  }
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left Section - Logo and Workspace */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">Donny Hub</span>
          </div>
          
          <Select defaultValue="personal">
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="team">Team Workspace</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search agents, tasks, or ask Donny..."
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div 
                  className="p-3 rounded-lg bg-muted/50 text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleNotificationClick('agent')}
                >
                  <div className="font-medium">Agent "Data Analyzer" completed</div>
                  <div className="text-muted-foreground text-xs">2 minutes ago</div>
                </div>
                <div 
                  className="p-3 rounded-lg bg-muted/50 text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleNotificationClick('task')}
                >
                  <div className="font-medium">New task assigned by Donny</div>
                  <div className="text-muted-foreground text-xs">5 minutes ago</div>
                </div>
                <div 
                  className="p-3 rounded-lg bg-muted/50 text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleNotificationClick('marketplace')}
                >
                  <div className="font-medium">Marketplace update available</div>
                  <div className="text-muted-foreground text-xs">1 hour ago</div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profileData.avatar || "/placeholder-avatar.jpg"} alt="User" />
                  <AvatarFallback className="text-xs">{getInitials(profileData.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{profileData.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profileData.name}</p>
                  <p className="text-xs text-muted-foreground">{profileData.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/user/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/user/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => router.push('/')}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}