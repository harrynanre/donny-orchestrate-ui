"use client"

import { useState, useEffect } from "react"
import { User, Building, Bell, Key, Save, Shield, Eye, EyeOff, Plus, Globe, CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { agentStore, type ActiveModel } from "@/lib/agent-store"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'revoke' | 'edit', keyId: string } | null>(null)
  const [newApiKey, setNewApiKey] = useState({ name: "", key: "", isVerified: false })
  const [testingKey, setTestingKey] = useState(false)
  const [activeModels, setActiveModels] = useState<ActiveModel[]>([])
  const [newModel, setNewModel] = useState({ name: "", provider: "OpenAI", key: "", isVerified: false })
  
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

  const [credentials, setCredentials] = useState({
    siteName: "",
    baseUrl: "",
    websiteAddress: "",
    loginType: "form",
    username: "",
    password: "",
    twoFA: "",
    usernameSelector: "",
    passwordSelector: "",
    submitSelector: "",
    oauthProvider: "",
    cookieString: "",
    vaultGroup: "website-creds",
  })

  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "reachable" | "unreachable" | "testing">("unknown")
  const [profileFormDirty, setProfileFormDirty] = useState(false)
  const [workspaceFormDirty, setWorkspaceFormDirty] = useState(false)
  const [initialProfileData, setInitialProfileData] = useState(profileData)
  const [initialWorkspaceData, setInitialWorkspaceData] = useState(workspaceData)

  useEffect(() => {
    setInitialProfileData(profileData)
  }, [])

  useEffect(() => {
    setInitialWorkspaceData(workspaceData)
  }, [])

  // Load active models and subscribe to changes
  useEffect(() => {
    const loadModels = () => setActiveModels(agentStore.getActiveModels())
    loadModels()
    const unsubscribe = agentStore.onModelsChange(loadModels)
    return unsubscribe
  }, [])

  const [showPassword, setShowPassword] = useState(false)

  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "dk_1234...5678",
      created: "2024-01-15",
      lastUsed: "2 hours ago",
      status: "active"
    },
    {
      id: "2",
      name: "Development API Key", 
      key: "dk_9876...3210",
      created: "2024-02-01",
      lastUsed: "1 week ago",
      status: "active"
    },
  ]

  const handleSecureAction = (type: 'revoke' | 'edit', keyId: string) => {
    setPendingAction({ type, keyId })
    setShowPasswordModal(true)
  }

  const handlePasswordConfirm = (password: string) => {
    if (pendingAction) {
      // Simulate password verification
      console.log(`${pendingAction.type} action confirmed for key ${pendingAction.keyId}`)
      setShowPasswordModal(false)
      setPendingAction(null)
    }
  }

  const handleTestKey = async () => {
    setTestingKey(true)
    // Simulate API key testing
    setTimeout(() => {
      setNewApiKey(prev => ({ ...prev, isVerified: true }))
      setTestingKey(false)
    }, 2000)
  }

  const handleSubmitKey = () => {
    if (newApiKey.isVerified) {
      console.log("Submitting verified API key:", newApiKey)
      setNewApiKey({ name: "", key: "", isVerified: false })
      toast({
        title: "API Key Added",
        description: "Your API key has been successfully added to the vault (mock).",
      })
    }
  }

  const validateWebsiteUrl = (url: string) => {
    const urlPattern = /^https?:\/\/.+/
    return urlPattern.test(url)
  }

  const handleTestConnection = async () => {
    if (!credentials.websiteAddress) {
      toast({
        title: "Error",
        description: "Please enter a website address first",
        variant: "destructive"
      })
      return
    }

    if (!validateWebsiteUrl(credentials.websiteAddress)) {
      toast({
        title: "Invalid URL",
        description: "Website address must include https:// or http://",
        variant: "destructive"
      })
      return
    }

    setConnectionStatus("testing")
    
    // Mock connection test with random result
    setTimeout(() => {
      const isReachable = Math.random() > 0.5
      setConnectionStatus(isReachable ? "reachable" : "unreachable")
      
      toast({
        title: isReachable ? "Site reachable" : "Could not reach site",
        description: isReachable 
          ? "Successfully connected to the website" 
          : "Unable to establish connection to the website",
        variant: isReachable ? "default" : "destructive"
      })
    }, 2000)
  }

  const handleProfileSave = () => {
    setProfileFormDirty(false)
    setInitialProfileData(profileData)
    toast({
      title: "Profile Saved",
      description: "Your profile has been successfully updated (mock).",
    })
  }

  const handleWorkspaceSave = () => {
    setWorkspaceFormDirty(false)
    setInitialWorkspaceData(workspaceData)
    toast({
      title: "Workspace Saved", 
      description: "Your workspace settings have been successfully updated (mock).",
    })
  }

  const checkProfileDirty = (newData: typeof profileData) => {
    const isDirty = JSON.stringify(newData) !== JSON.stringify(initialProfileData)
    setProfileFormDirty(isDirty)
  }

  const checkWorkspaceDirty = (newData: typeof workspaceData) => {
    const isDirty = JSON.stringify(newData) !== JSON.stringify(initialWorkspaceData)
    setWorkspaceFormDirty(isDirty)
  }

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case "reachable":
        return <Badge className="status-pill status-success"><CheckCircle className="h-3 w-3 mr-1" />Reachable</Badge>
      case "unreachable":
        return <Badge className="status-pill status-error"><XCircle className="h-3 w-3 mr-1" />Unreachable</Badge>
      case "testing":
        return <Badge className="status-pill status-warning"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Testing...</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>
    }
  }

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
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Website Credentials
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
                    onChange={(e) => {
                      const newData = { ...profileData, name: e.target.value }
                      setProfileData(newData)
                      checkProfileDirty(newData)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      const newData = { ...profileData, email: e.target.value }
                      setProfileData(newData)
                      checkProfileDirty(newData)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-12:00 (Baker Island)">UTC-12:00 (Baker Island)</SelectItem>
                      <SelectItem value="UTC-11:00 (American Samoa)">UTC-11:00 (American Samoa)</SelectItem>
                      <SelectItem value="UTC-10:00 (Hawaii)">UTC-10:00 (Hawaii)</SelectItem>
                      <SelectItem value="UTC-09:00 (Alaska)">UTC-09:00 (Alaska)</SelectItem>
                      <SelectItem value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</SelectItem>
                      <SelectItem value="UTC-07:00 (Mountain Time)">UTC-07:00 (Mountain Time)</SelectItem>
                      <SelectItem value="UTC-06:00 (Central Time)">UTC-06:00 (Central Time)</SelectItem>
                      <SelectItem value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</SelectItem>
                      <SelectItem value="UTC-04:00 (Atlantic Time)">UTC-04:00 (Atlantic Time)</SelectItem>
                      <SelectItem value="UTC-03:00 (Argentina)">UTC-03:00 (Argentina)</SelectItem>
                      <SelectItem value="UTC-02:00 (Mid-Atlantic)">UTC-02:00 (Mid-Atlantic)</SelectItem>
                      <SelectItem value="UTC-01:00 (Azores)">UTC-01:00 (Azores)</SelectItem>
                      <SelectItem value="UTC+00:00 (GMT/London)">UTC+00:00 (GMT/London)</SelectItem>
                      <SelectItem value="UTC+01:00 (Central European)">UTC+01:00 (Central European)</SelectItem>
                      <SelectItem value="UTC+02:00 (Eastern European)">UTC+02:00 (Eastern European)</SelectItem>
                      <SelectItem value="UTC+03:00 (Moscow)">UTC+03:00 (Moscow)</SelectItem>
                      <SelectItem value="UTC+04:00 (Dubai)">UTC+04:00 (Dubai)</SelectItem>
                      <SelectItem value="UTC+05:00 (Pakistan)">UTC+05:00 (Pakistan)</SelectItem>
                      <SelectItem value="UTC+05:30 (India)">UTC+05:30 (India)</SelectItem>
                      <SelectItem value="UTC+06:00 (Bangladesh)">UTC+06:00 (Bangladesh)</SelectItem>
                      <SelectItem value="UTC+07:00 (Bangkok)">UTC+07:00 (Bangkok)</SelectItem>
                      <SelectItem value="UTC+08:00 (China/Singapore)">UTC+08:00 (China/Singapore)</SelectItem>
                      <SelectItem value="UTC+09:00 (Japan/Korea)">UTC+09:00 (Japan/Korea)</SelectItem>
                      <SelectItem value="UTC+09:30 (Adelaide)">UTC+09:30 (Adelaide)</SelectItem>
                      <SelectItem value="UTC+10:00 (Sydney)">UTC+10:00 (Sydney)</SelectItem>
                      <SelectItem value="UTC+11:00 (Solomon Islands)">UTC+11:00 (Solomon Islands)</SelectItem>
                      <SelectItem value="UTC+12:00 (New Zealand)">UTC+12:00 (New Zealand)</SelectItem>
                      <SelectItem value="UTC+13:00 (Samoa)">UTC+13:00 (Samoa)</SelectItem>
                      <SelectItem value="UTC+14:00 (Line Islands)">UTC+14:00 (Line Islands)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => {
                    const newData = { ...profileData, bio: e.target.value }
                    setProfileData(newData)
                    checkProfileDirty(newData)
                  }}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  className="button-primary"
                  disabled={!profileFormDirty}
                  onClick={handleProfileSave}
                >
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
                    onChange={(e) => {
                      const newData = { ...workspaceData, name: e.target.value }
                      setWorkspaceData(newData)
                      checkWorkspaceDirty(newData)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspaceDescription">Description</Label>
                  <Textarea
                    id="workspaceDescription"
                    value={workspaceData.description}
                    onChange={(e) => {
                      const newData = { ...workspaceData, description: e.target.value }
                      setWorkspaceData(newData)
                      checkWorkspaceDirty(newData)
                    }}
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
                <Button 
                  className="button-primary"
                  disabled={!workspaceFormDirty}
                  onClick={handleWorkspaceSave}
                >
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

        {/* Active AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Active AI Models</CardTitle>
              <CardDescription>
                Manage your AI model API keys and credentials. Only active models will be available for agent creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Model */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                <h4 className="font-medium">Add New AI Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="modelName">Model Name</Label>
                    <Input
                      id="modelName"
                      placeholder="e.g., GPT-4"
                      value={newModel.name}
                      onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelProvider">Provider</Label>
                    <Select value={newModel.provider} onValueChange={(value) => setNewModel(prev => ({ ...prev, provider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modelKey">API Key</Label>
                    <Input
                      id="modelKey"
                      type="password"
                      placeholder="Enter API key"
                      value={newModel.key}
                      onChange={(e) => setNewModel(prev => ({ ...prev, key: e.target.value, isVerified: false }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setTestingKey(true)
                      setTimeout(() => {
                        setNewModel(prev => ({ ...prev, isVerified: true }))
                        setTestingKey(false)
                      }, 2000)
                    }}
                    disabled={!newModel.key || testingKey}
                    variant="outline"
                  >
                    {testingKey ? "Testing..." : "Test"}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (newModel.isVerified && newModel.name && newModel.key) {
                        agentStore.addActiveModel({
                          name: newModel.name,
                          provider: newModel.provider,
                          key: newModel.key,
                          status: "active"
                        })
                        setNewModel({ name: "", provider: "OpenAI", key: "", isVerified: false })
                        toast({
                          title: "AI Model Added",
                          description: `${newModel.name} is now available for agent creation.`,
                        })
                      }
                    }}
                    disabled={!newModel.isVerified}
                    className="button-primary"
                  >
                    Add Model
                  </Button>
                  {newModel.isVerified && (
                    <Badge className="status-pill status-success">
                      Verified ✓
                    </Badge>
                  )}
                </div>
              </div>

              {/* Active Models List */}
              <div className="space-y-4">
                <h4 className="font-medium">Active Models</h4>
                {activeModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{model.name}</div>
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{model.key.slice(0, 10)}...{model.key.slice(-4)}</div>
                      <div className="text-xs text-muted-foreground">
                        Added: {model.created} • Last used: {model.lastUsed}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="status-pill status-success">
                        {model.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Model editing will be available in a future update.",
                          })
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {activeModels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active AI models configured</p>
                    <p className="text-sm">Add your first model to start creating agents</p>
                  </div>
                )}
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
              {/* Add New API Key */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                <h4 className="font-medium">Add New API Key</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="Enter key name"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter API key"
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value, isVerified: false }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTestKey}
                    disabled={!newApiKey.key || testingKey}
                    variant="outline"
                  >
                    {testingKey ? "Testing..." : "Test"}
                  </Button>
                  <Button 
                    onClick={handleSubmitKey}
                    disabled={!newApiKey.isVerified}
                    className="button-primary"
                  >
                    Submit
                  </Button>
                  {newApiKey.isVerified && (
                    <Badge className="status-pill status-success">
                      Verified ✓
                    </Badge>
                  )}
                </div>
              </div>

              {/* Existing API Keys */}
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-sm text-muted-foreground">{apiKey.key}</div>
                      <div className="text-xs text-muted-foreground">
                        Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`status-pill status-success`}>
                        {apiKey.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSecureAction('edit', apiKey.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSecureAction('revoke', apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Website Credentials</CardTitle>
              <CardDescription>
                Manage website login credentials for automated access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={credentials.siteName}
                    onChange={(e) => setCredentials(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="e.g., Company Portal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteAddress">Website Address / Base URL *</Label>
                  <div className="space-y-2">
                    <Input
                      id="websiteAddress"
                      value={credentials.websiteAddress}
                      onChange={(e) => {
                        setCredentials(prev => ({ ...prev, websiteAddress: e.target.value }))
                        if (connectionStatus !== "unknown") {
                          setConnectionStatus("unknown")
                        }
                      }}
                      placeholder="https://example.com"
                      className={!validateWebsiteUrl(credentials.websiteAddress) && credentials.websiteAddress ? "border-destructive" : ""}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Include https:// or http://</p>
                      <div className="flex items-center gap-2">
                        {getConnectionStatusBadge()}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTestConnection}
                          disabled={connectionStatus === "testing"}
                          className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {connectionStatus === "testing" ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Test Connection
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Login Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={credentials.loginType === "form" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCredentials(prev => ({ ...prev, loginType: "form" }))}
                    >
                      Form
                    </Button>
                    <Button
                      variant={credentials.loginType === "oauth" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCredentials(prev => ({ ...prev, loginType: "oauth" }))}
                    >
                      OAuth
                    </Button>
                    <Button
                      variant={credentials.loginType === "cookie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCredentials(prev => ({ ...prev, loginType: "cookie" }))}
                    >
                      Cookie
                    </Button>
                  </div>
                </div>

                {credentials.loginType === "form" && (
                  <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={credentials.username}
                          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={credentials.password}
                            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twoFA">2FA/OTP</Label>
                        <Input
                          id="twoFA"
                          value={credentials.twoFA}
                          onChange={(e) => setCredentials(prev => ({ ...prev, twoFA: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Optional CSS Selectors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usernameSelector">Username Selector</Label>
                          <Input
                            id="usernameSelector"
                            value={credentials.usernameSelector}
                            onChange={(e) => setCredentials(prev => ({ ...prev, usernameSelector: e.target.value }))}
                            placeholder="#username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passwordSelector">Password Selector</Label>
                          <Input
                            id="passwordSelector"
                            value={credentials.passwordSelector}
                            onChange={(e) => setCredentials(prev => ({ ...prev, passwordSelector: e.target.value }))}
                            placeholder="#password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="submitSelector">Submit Selector</Label>
                          <Input
                            id="submitSelector"
                            value={credentials.submitSelector}
                            onChange={(e) => setCredentials(prev => ({ ...prev, submitSelector: e.target.value }))}
                            placeholder="button[type=submit]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {credentials.loginType === "oauth" && (
                  <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="oauthProvider">OAuth Provider</Label>
                      <Select value={credentials.oauthProvider} onValueChange={(value) => setCredentials(prev => ({ ...prev, oauthProvider: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="microsoft">Microsoft</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" disabled>
                      Connect (UI-only)
                    </Button>
                  </div>
                )}

                {credentials.loginType === "cookie" && (
                  <div className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="cookieString">Cookie String</Label>
                      <Textarea
                        id="cookieString"
                        value={credentials.cookieString}
                        onChange={(e) => setCredentials(prev => ({ ...prev, cookieString: e.target.value }))}
                        placeholder="session_id=abc123; auth_token=xyz789"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste your session cookies. Note: Cookies may expire and need updating.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaultGroup">Vault Group</Label>
                <Select value={credentials.vaultGroup} onValueChange={(value) => setCredentials(prev => ({ ...prev, vaultGroup: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website-creds">Website Credentials</SelectItem>
                    <SelectItem value="api-keys">API Keys</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Security Notice</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      All credentials are encrypted at rest. Do not store one-time codes or temporary tokens.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-2xl max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4">Security Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please enter your password to confirm this action.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handlePasswordConfirm("password")}
                  className="button-primary flex-1"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
