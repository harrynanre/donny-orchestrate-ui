"use client"

import { useState } from "react"
import { User, Building, Bell, Key, Save, Shield, Eye, EyeOff, Plus } from "lucide-react"
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

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'revoke' | 'edit', keyId: string } | null>(null)
  const [newApiKey, setNewApiKey] = useState({ name: "", key: "", isVerified: false })
  const [testingKey, setTestingKey] = useState(false)
  
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
        <TabsList className="grid w-full grid-cols-5">
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
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={credentials.baseUrl}
                    onChange={(e) => setCredentials(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
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
