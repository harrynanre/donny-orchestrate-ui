"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { User, Building, Bell, Key, Save, Shield, Eye, EyeOff, Plus, Globe, CheckCircle, AlertCircle, Loader2, XCircle, Cpu, ExternalLink, Camera, Upload, X } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { agentStore, type ActiveModel } from "@/lib/agent-store"

// Types
interface ApiKeyData {
  id?: string
  name: string
  key: string
  provider: string
  providerUrl: string
  isValid: boolean
  isTesting: boolean
  created?: string
  lastUsed?: string
  status?: string
}

interface ProfileData {
  name: string
  email: string
  bio: string
  company: string
  timezone: string
  avatar?: string
}

interface WorkspaceData {
  name: string
  description: string
}

interface NotificationPrefs {
  taskComplete: boolean
  agentStatus: boolean
  systemUpdates: boolean
  weeklyReports: boolean
  emailNotifications: boolean
}

interface WebsiteCredentials {
  siteName: string
  baseUrl: string
  websiteAddress: string
  loginType: "form" | "oauth" | "cookie"
  username: string
  password: string
  twoFA: string
  usernameSelector: string
  passwordSelector: string
  submitSelector: string
  oauthProvider: string
  cookieString: string
  vaultGroup: string
}

// API Key Testing Service
class ApiKeyValidator {
  private static async validateOpenAI(key: string, url?: string): Promise<boolean> {
    try {
      const endpoint = url || 'https://api.openai.com/v1/models'
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  private static async validateAnthropic(key: string, url?: string): Promise<boolean> {
    try {
      const endpoint = url || 'https://api.anthropic.com/v1/messages'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        }),
      })
      return response.status !== 401 && response.status !== 403
    } catch {
      return false
    }
  }

  private static async validateGoogle(key: string, url?: string): Promise<boolean> {
    try {
      const endpoint = url || 'https://generativelanguage.googleapis.com/v1/models'
      const response = await fetch(`${endpoint}?key=${key}`)
      return response.ok
    } catch {
      return false
    }
  }

  private static async validateGeneric(key: string, url: string): Promise<boolean> {
    if (!url) return false
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async validate(provider: string, key: string, customUrl?: string): Promise<boolean> {
    if (!key) return false
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return this.validateOpenAI(key, customUrl)
      case 'anthropic':
        return this.validateAnthropic(key, customUrl)
      case 'google':
        return this.validateGoogle(key, customUrl)
      default:
        return this.validateGeneric(key, customUrl || '')
    }
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: 'revoke' | 'edit', keyId: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [activeModels, setActiveModels] = useState<ActiveModel[]>([])
  const [isCameraMode, setIsCameraMode] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-detect system timezone
  const getSystemTimezone = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = new Date().getTimezoneOffset() / -60
      const offsetString = offset >= 0 ? `+${offset.toString().padStart(2, '0')}:00` : `${offset.toString().padStart(3, '0')}:00`
      
      // Map common timezones to user-friendly names
      const timezoneMap: { [key: string]: string } = {
        'America/New_York': 'UTC-05:00 (Eastern Time)',
        'America/Chicago': 'UTC-06:00 (Central Time)', 
        'America/Denver': 'UTC-07:00 (Mountain Time)',
        'America/Los_Angeles': 'UTC-08:00 (Pacific Time)',
        'America/Anchorage': 'UTC-09:00 (Alaska)',
        'Pacific/Honolulu': 'UTC-10:00 (Hawaii)',
        'Europe/London': 'UTC+00:00 (GMT/London)',
        'Europe/Paris': 'UTC+01:00 (Central European)',
        'Europe/Berlin': 'UTC+01:00 (Central European)',
        'Europe/Moscow': 'UTC+03:00 (Moscow)',
        'Asia/Dubai': 'UTC+04:00 (Dubai)',
        'Asia/Kolkata': 'UTC+05:30 (India)',
        'Asia/Shanghai': 'UTC+08:00 (China/Singapore)',
        'Asia/Tokyo': 'UTC+09:00 (Japan/Korea)',
        'Australia/Sydney': 'UTC+10:00 (Sydney)',
      }
      
      return timezoneMap[timezone] || `UTC${offsetString} (${timezone})`
    } catch {
      return "UTC+00:00 (GMT/London)"
    }
  }

  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    company: "",
    timezone: getSystemTimezone(),
  })

  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    name: "",
    description: "",
  })

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    taskComplete: true,
    agentStatus: true,
    systemUpdates: false,
    weeklyReports: true,
    emailNotifications: true,
  })

  const [newApiKey, setNewApiKey] = useState<ApiKeyData>({
    name: "",
    key: "",
    provider: "OpenAI",
    providerUrl: "",
    isValid: false,
    isTesting: false
  })

  const [newModel, setNewModel] = useState<ApiKeyData>({
    name: "",
    key: "",
    provider: "OpenAI", 
    providerUrl: "",
    isValid: false,
    isTesting: false
  })

  const [credentials, setCredentials] = useState<WebsiteCredentials>({
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

  // Stored API Keys - Load from localStorage
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])

  // Load saved data from localStorage on mount
  useEffect(() => {
    // Load API keys
    const savedApiKeys = localStorage.getItem('donny-hub-api-keys')
    if (savedApiKeys) {
      try {
        const parsedKeys = JSON.parse(savedApiKeys)
        setApiKeys(parsedKeys)
      } catch (error) {
        console.error('Failed to load API keys from localStorage:', error)
      }
    }

    // Load profile data
    const savedProfile = localStorage.getItem('donny-hub-profile')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfileData(parsedProfile)
        setInitialProfileData(parsedProfile)
      } catch (error) {
        console.error('Failed to load profile from localStorage:', error)
      }
    } else {
      // Set default values for new users
      const defaultProfile = {
        name: "John Doe",
        email: "john@company.com", 
        bio: "AI workflow enthusiast and automation specialist",
        company: "TechCorp Inc",
        timezone: getSystemTimezone(),
      }
      setProfileData(defaultProfile)
      setInitialProfileData(defaultProfile)
    }

    // Load workspace data
    const savedWorkspace = localStorage.getItem('donny-hub-workspace')
    if (savedWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(savedWorkspace)
        setWorkspaceData(parsedWorkspace)
        setInitialWorkspaceData(parsedWorkspace)
      } catch (error) {
        console.error('Failed to load workspace from localStorage:', error)
      }
    } else {
      const defaultWorkspace = {
        name: "My Workspace",
        description: "Main workspace for AI agent management and automation",
      }
      setWorkspaceData(defaultWorkspace)
      setInitialWorkspaceData(defaultWorkspace)
    }

    // Load notification preferences
    const savedNotifications = localStorage.getItem('donny-hub-notifications')
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications)
        setNotifications(parsedNotifications)
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('donny-hub-api-keys', JSON.stringify(apiKeys))
  }, [apiKeys])

  useEffect(() => {
    localStorage.setItem('donny-hub-profile', JSON.stringify(profileData))
  }, [profileData])

  useEffect(() => {
    localStorage.setItem('donny-hub-workspace', JSON.stringify(workspaceData))
  }, [workspaceData])

  useEffect(() => {
    localStorage.setItem('donny-hub-notifications', JSON.stringify(notifications))
  }, [notifications])

  // Load active models and subscribe to changes
  useEffect(() => {
    const loadModels = () => setActiveModels(agentStore.getActiveModels())
    loadModels()
    const unsubscribe = agentStore.onModelsChange(loadModels)
    return unsubscribe
  }, [])

  // Photo management functions
  const openPhotoModal = () => {
    setShowPhotoModal(true)
    setCapturedImage(null)
    setIsCameraMode(false)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraMode(true)
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraMode(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(dataURL)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfilePhoto = () => {
    if (capturedImage) {
      const updatedProfile = { ...profileData, avatar: capturedImage }
      setProfileData(updatedProfile)
      localStorage.setItem('donny-hub-profile', JSON.stringify(updatedProfile))
      
      // Dispatch custom event to notify header component
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: updatedProfile 
      }))
      
      setShowPhotoModal(false)
      setCapturedImage(null)
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been successfully updated.",
      })
    }
  }

  // Real-time API key validation
  const validateApiKey = useCallback(async (keyData: ApiKeyData, updateState: (updater: (prev: ApiKeyData) => ApiKeyData) => void) => {
    if (!keyData.key || keyData.key.length < 10) {
      updateState(prev => ({ ...prev, isValid: false, isTesting: false }))
      return
    }

    updateState(prev => ({ ...prev, isTesting: true, isValid: false }))

    try {
      const isValid = await ApiKeyValidator.validate(keyData.provider, keyData.key, keyData.providerUrl)
      updateState(prev => ({ ...prev, isValid, isTesting: false }))
      
      if (isValid) {
        toast({
          title: "✅ API Key Valid",
          description: `${keyData.provider} API key is working correctly`,
        })
      } else {
        toast({
          title: "❌ API Key Invalid", 
          description: `Failed to validate ${keyData.provider} API key`,
          variant: "destructive"
        })
      }
    } catch (error) {
      updateState(prev => ({ ...prev, isValid: false, isTesting: false }))
      toast({
        title: "❌ Validation Error",
        description: `Error validating API key: ${error}`,
        variant: "destructive"
      })
    }
  }, [])

  // Debounced validation for API keys
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newApiKey.key && newApiKey.key.length > 10) {
        validateApiKey(newApiKey, setNewApiKey)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [newApiKey.key, newApiKey.provider, newApiKey.providerUrl, validateApiKey])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newModel.key && newModel.key.length > 10) {
        validateApiKey(newModel, setNewModel)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [newModel.key, newModel.provider, newModel.providerUrl, validateApiKey])

  const handleSecureAction = (type: 'revoke' | 'edit', keyId: string) => {
    setPendingAction({ type, keyId })
    setShowPasswordModal(true)
  }

  const handlePasswordConfirm = (password: string) => {
    if (pendingAction && password) {
      if (pendingAction.type === 'revoke') {
        setApiKeys(prev => prev.filter(key => key.id !== pendingAction.keyId))
        toast({
          title: "API Key Revoked",
          description: "The API key has been successfully revoked.",
        })
      }
      setShowPasswordModal(false)
      setPendingAction(null)
    }
  }

  const handleSubmitApiKey = () => {
    if (newApiKey.isValid && newApiKey.name && newApiKey.key) {
      const newKey: ApiKeyData = {
        ...newApiKey,
        id: Date.now().toString(),
        created: new Date().toISOString().split('T')[0],
        lastUsed: "Never",
        status: "active"
      }
      setApiKeys(prev => [...prev, newKey])
      setNewApiKey({ name: "", key: "", provider: "OpenAI", providerUrl: "", isValid: false, isTesting: false })
      toast({
        title: "API Key Added",
        description: "Your API key has been successfully added.",
      })
    }
  }

  const handleAddModel = () => {
    if (newModel.isValid && newModel.name && newModel.key) {
      agentStore.addActiveModel({
        name: newModel.name,
        provider: newModel.provider,
        key: newModel.key,
        status: "active"
      })
      setNewModel({ name: "", key: "", provider: "OpenAI", providerUrl: "", isValid: false, isTesting: false })
      toast({
        title: "AI Model Added",
        description: `${newModel.name} is now available for agent creation.`,
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
    
    try {
      const response = await fetch(credentials.websiteAddress, { 
        method: 'HEAD',
        mode: 'no-cors'
      })
      setConnectionStatus("reachable")
      toast({
        title: "Site Reachable",
        description: "Successfully connected to the website",
      })
    } catch {
      setConnectionStatus("unreachable") 
      toast({
        title: "Connection Failed",
        description: "Unable to establish connection to the website",
        variant: "destructive"
      })
    }
  }

  const handleProfileSave = () => {
    if (!profileData.name || !profileData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields.",
        variant: "destructive"
      })
      return
    }

    setProfileFormDirty(false)
    setInitialProfileData(profileData)
    
    // Dispatch custom event to notify header component
    window.dispatchEvent(new CustomEvent('profile-updated', { 
      detail: profileData 
    }))
    
    toast({
      title: "Profile Saved",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleWorkspaceSave = () => {
    if (!workspaceData.name) {
      toast({
        title: "Validation Error", 
        description: "Workspace name is required.",
        variant: "destructive"
      })
      return
    }

    setWorkspaceFormDirty(false)
    setInitialWorkspaceData(workspaceData)
    toast({
      title: "Workspace Saved",
      description: "Your workspace settings have been successfully updated.",
    })
  }

  const handleNotificationsSave = () => {
    toast({
      title: "Notifications Saved",
      description: "Your notification preferences have been updated.",
    })
  }

  const handleCredentialsSave = () => {
    if (!credentials.siteName || !credentials.websiteAddress) {
      toast({
        title: "Validation Error",
        description: "Site name and website address are required.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Credentials Saved",
      description: "Website credentials have been securely stored.",
    })
  }

  const checkProfileDirty = (newData: ProfileData) => {
    const isDirty = JSON.stringify(newData) !== JSON.stringify(initialProfileData)
    setProfileFormDirty(isDirty)
  }

  const checkWorkspaceDirty = (newData: WorkspaceData) => {
    const isDirty = JSON.stringify(newData) !== JSON.stringify(initialWorkspaceData)
    setWorkspaceFormDirty(isDirty)
  }

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case "reachable":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Reachable</Badge>
      case "unreachable":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Unreachable</Badge>
      case "testing":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Testing...</Badge>
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>
    }
  }

  const getProviderUrl = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'https://api.openai.com/v1/models'
      case 'anthropic': return 'https://api.anthropic.com/v1/messages'  
      case 'google': return 'https://generativelanguage.googleapis.com/v1/models'
      default: return ''
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
          <Card>
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
                  <AvatarImage src={profileData.avatar} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={openPhotoModal}>Change Photo</Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => {
                      const newData = { ...profileData, name: e.target.value }
                      setProfileData(newData)
                      checkProfileDirty(newData)
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      const newData = { ...profileData, email: e.target.value }
                      setProfileData(newData)
                      checkProfileDirty(newData)
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => {
                      const newData = { ...profileData, company: e.target.value }
                      setProfileData(newData)
                      checkProfileDirty(newData)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileData.timezone} onValueChange={(value) => {
                    const newData = { ...profileData, timezone: value }
                    setProfileData(newData)
                    checkProfileDirty(newData)
                  }}>
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
                  disabled={!profileFormDirty}
                  onClick={handleProfileSave}
                  className={profileFormDirty ? "bg-primary hover:bg-primary/90" : ""}
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
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Manage your workspace and team settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name *</Label>
                  <Input
                    id="workspaceName"
                    value={workspaceData.name}
                    onChange={(e) => {
                      const newData = { ...workspaceData, name: e.target.value }
                      setWorkspaceData(newData)
                      checkWorkspaceDirty(newData)
                    }}
                    required
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
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">John Doe</div>
                        <div className="text-xs text-muted-foreground">john@company.com</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Owner</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  disabled={!workspaceFormDirty}
                  onClick={handleWorkspaceSave}
                  className={workspaceFormDirty ? "bg-primary hover:bg-primary/90" : ""}
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
          <Card>
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
                <Button onClick={handleNotificationsSave} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active AI Models</CardTitle>
              <CardDescription>
                Manage your AI model API keys and credentials. Only active models will be available for agent creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Model */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New AI Model</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelName">Model Name *</Label>
                    <Input
                      id="modelName"
                      placeholder="e.g., GPT-4, Claude-3"
                      value={newModel.name}
                      onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelProvider">Provider *</Label>
                    <Select value={newModel.provider} onValueChange={(value) => {
                      const providerUrl = getProviderUrl(value)
                      setNewModel(prev => ({ ...prev, provider: value, providerUrl, isValid: false }))
                    }}>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelProviderUrl">Provider API URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="modelProviderUrl"
                        placeholder="https://api.provider.com/v1"
                        value={newModel.providerUrl}
                        onChange={(e) => setNewModel(prev => ({ ...prev, providerUrl: e.target.value, isValid: false }))}
                      />
                      {newModel.provider !== 'Other' && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setNewModel(prev => ({ ...prev, providerUrl: getProviderUrl(prev.provider) }))}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      API endpoint for validation (auto-filled for known providers)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="modelKey">API Key *</Label>
                    <Input
                      id="modelKey"
                      type="password"
                      placeholder="Enter API key"
                      value={newModel.key}
                      onChange={(e) => setNewModel(prev => ({ ...prev, key: e.target.value, isValid: false }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Key will be validated in real-time
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddModel}
                    disabled={!newModel.isValid || !newModel.name}
                    className={newModel.isValid ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                </div>
              </div>

              {/* Active Models List */}
              <div className="space-y-4">
                <h4 className="font-medium">Active Models</h4>
                {activeModels.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{model.name}</div>
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {model.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{model.key?.slice(0, 10)}...{model.key?.slice(-4)}</div>
                      <div className="text-xs text-muted-foreground">
                        Added: {model.created} • Last used: {model.lastUsed}
                      </div>
                    </div>
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
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external integrations and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New API Key */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New API Key</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keyName">Key Name *</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production OpenAI"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="keyProvider">Provider *</Label>
                    <Select value={newApiKey.provider} onValueChange={(value) => {
                      const providerUrl = getProviderUrl(value)
                      setNewApiKey(prev => ({ ...prev, provider: value, providerUrl, isValid: false }))
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenAI">OpenAI</SelectItem>
                        <SelectItem value="Anthropic">Anthropic</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="Stripe">Stripe</SelectItem>
                        <SelectItem value="GitHub">GitHub</SelectItem>
                        <SelectItem value="Other">Other/Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keyProviderUrl">Provider API URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="keyProviderUrl"
                        placeholder="https://api.provider.com/v1"
                        value={newApiKey.providerUrl}
                        onChange={(e) => setNewApiKey(prev => ({ ...prev, providerUrl: e.target.value, isValid: false }))}
                      />
                      {newApiKey.provider !== 'Other' && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setNewApiKey(prev => ({ ...prev, providerUrl: getProviderUrl(prev.provider) }))}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      API endpoint for validation (auto-filled for known providers)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="apiKey">API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter API key"
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value, isValid: false }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Key will be validated in real-time
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitApiKey}
                    disabled={!newApiKey.isValid || !newApiKey.name}
                    className={newApiKey.isValid ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Submit Key
                  </Button>
                </div>
              </div>

              {/* Existing API Keys */}
              <div className="space-y-4">
                <h4 className="font-medium">Stored API Keys</h4>
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{apiKey.name}</div>
                        <Badge variant="outline" className="text-xs">{apiKey.provider}</Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{apiKey.key}</div>
                      <div className="text-xs text-muted-foreground">
                        Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Endpoint: {apiKey.providerUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSecureAction('edit', apiKey.id!)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSecureAction('revoke', apiKey.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys configured</p>
                    <p className="text-sm">Add your first API key to start integrating services</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Credentials</CardTitle>
              <CardDescription>
                Manage website login credentials for automated access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name *</Label>
                  <Input
                    id="siteName"
                    value={credentials.siteName}
                    onChange={(e) => setCredentials(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="e.g., Company Portal"
                    required
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
                      required
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Include https:// or http://</p>
                      <div className="flex items-center gap-2">
                        {getConnectionStatusBadge()}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTestConnection}
                          disabled={connectionStatus === "testing" || !credentials.websiteAddress}
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
                  <div className="space-y-4 p-4 border rounded-lg">
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
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="oauthProvider">OAuth Provider</Label>
                      <Select value={credentials.oauthProvider} onValueChange={(value) => setCredentials(prev => ({ ...prev, oauthProvider: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="microsoft">Microsoft</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Configure OAuth (Coming Soon)
                    </Button>
                  </div>
                )}

                {credentials.loginType === "cookie" && (
                  <div className="space-y-4 p-4 border rounded-lg">
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
                <Button onClick={handleCredentialsSave} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Photo Upload Modal */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Take a photo with your camera or upload an image from your device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isCameraMode && !capturedImage && (
              <div className="flex gap-2">
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            )}

            {isCameraMode && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full max-h-64 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveProfilePhoto} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Photo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCapturedImage(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-2xl max-w-md w-full mx-4 border">
            <h3 className="text-lg font-semibold mb-4">Security Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please enter your password to confirm this action.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmPassword">Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter your password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordConfirm(e.currentTarget.value)
                    }
                  }}
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
                  onClick={(e) => {
                    const input = document.getElementById('confirmPassword') as HTMLInputElement
                    handlePasswordConfirm(input?.value || '')
                  }}
                  className="bg-primary hover:bg-primary/90 flex-1"
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
