"use client"

import { useState } from "react"
import { User, Building, Bell, Key, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@company.com",
    bio: "AI workflow enthusiast and automation specialist",
    company: "TechCorp Inc",
    timezone: "UTC-8 (Pacific Time)",
  })

  const [workspaceData, setWorkspaceData] = useState({
    name: "TechCorp Workspace",
    description: "Main workspace for AI agent management and automation",
  })

  const [notifications, setNotifications] = useState({
    taskComplete: true,
    agentStatus: true,
    systemUpdates: false,
    weeklyReports: true,
    emailNotifications: true,
  })

  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "dk_1234...5678",
      created: "2024-01-15",
      lastUsed: "2 hours ago",
      status: "active",
    },
    {
      id: "2", 
      name: "Development API Key",
      key: "dk_9876...3210",
      created: "2024-02-01",
      lastUsed: "1 week ago",
      status: "active",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, workspace, and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="gradient-primary text-white text-xl font-bold">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={profileData.timezone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button className="button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Manage your workspace and team settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={workspaceData.name}
                    onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceDescription">Description</Label>
                  <Textarea
                    id="workspaceDescription"
                    value={workspaceData.description}
                    onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your workspace..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Team Members</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="gradient-primary text-white text-sm">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">John Doe</div>
                        <div className="text-xs text-muted-foreground">john@company.com</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Owner</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Invite Team Member
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about agent activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="taskComplete">Task Completions</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when agents complete tasks
                    </p>
                  </div>
                  <Switch
                    id="taskComplete"
                    checked={notifications.taskComplete}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskComplete: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="agentStatus">Agent Status Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when agents start, stop, or encounter errors
                    </p>
                  </div>
                  <Switch
                    id="agentStatus"
                    checked={notifications.agentStatus}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, agentStatus: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="systemUpdates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about platform updates and maintenance
                    </p>
                  </div>
                  <Switch
                    id="systemUpdates"
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{key.name}</div>
                      <Badge className={`status-pill status-${key.status === 'active' ? 'success' : 'warning'}`}>
                        {key.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="font-mono bg-muted px-2 py-1 rounded text-xs">
                        {key.key}
                      </div>
                      <div className="flex justify-between">
                        <span>Created: {key.created}</span>
                        <span>Last used: {key.lastUsed}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="button-primary">
                <Key className="h-4 w-4 mr-2" />
                Create New API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}