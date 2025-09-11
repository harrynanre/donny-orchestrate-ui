"use client"

import { useState } from "react"
import { Terminal as TerminalIcon, Play, Settings, Zap, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

export default function Terminal() {
  const [provider, setProvider] = useState("none")
  const [workspace, setWorkspace] = useState("default")
  const [command, setCommand] = useState("")
  const [showClaudeSettings, setShowClaudeSettings] = useState(false)
  
  const [claudeCredentials, setClaudeCredentials] = useState({
    email: "",
    password: "",
    sessionCookie: "",
  })

  const handleSaveClaudeSettings = () => {
    toast({
      title: "Connection Settings Saved",
      description: "Claude browser connection settings have been saved (UI-only).",
    })
    setShowClaudeSettings(false)
  }

  const [consoleOutput] = useState([
    { timestamp: "14:23:45", type: "info", message: "Terminal initialized" },
    { timestamp: "14:23:46", type: "system", message: "Waiting for provider connection..." },
  ])

  const handleProviderChange = (value: string) => {
    setProvider(value)
    if (value === "claude-browser") {
      setShowClaudeSettings(true)
    }
  }

  const getProviderStatus = () => {
    switch (provider) {
      case "openai":
        return <Badge className="status-pill status-warning">API Ready</Badge>
      case "claude-api":
        return <Badge className="status-pill status-warning">API Ready</Badge>
      case "claude-browser":
        return <Badge className="status-pill status-error">Disconnected</Badge>
      default:
        return <Badge variant="secondary">No Provider</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Terminal</h1>
        <p className="text-muted-foreground mt-1">
          Execute commands and interact with AI providers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Connections Panel */}
        <div className="lg:col-span-1">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connections
              </CardTitle>
              <CardDescription>
                Configure AI provider connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="openai">OpenAI API</SelectItem>
                    <SelectItem value="claude-api">Claude API</SelectItem>
                    <SelectItem value="claude-browser">Claude via Browser</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace">Workspace</Label>
                <Select value={workspace} onValueChange={setWorkspace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                {getProviderStatus()}
              </div>

              <Button className="w-full button-primary" disabled>
                <Zap className="h-4 w-4 mr-2" />
                Connect (UI-only)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Console */}
        <div className="lg:col-span-3">
          <Card className="card-enterprise h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TerminalIcon className="h-5 w-5" />
                Console
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Output Log */}
              <div className="flex-1 bg-black dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-y-auto mb-4">
                {consoleOutput.map((line, index) => (
                  <div key={index} className="flex gap-2 mb-1">
                    <span className="text-green-400">[{line.timestamp}]</span>
                    <span className={`${
                      line.type === "error" ? "text-red-400" :
                      line.type === "warning" ? "text-yellow-400" :
                      line.type === "info" ? "text-blue-400" :
                      "text-gray-300"
                    }`}>
                      {line.message}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="text-green-400">$</span>
                  <span className="text-white animate-pulse">_</span>
                </div>
              </div>

              {/* Input Bar */}
              <div className="flex gap-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter command..."
                  className="flex-1 font-mono"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      // Handle command execution (UI-only)
                      setCommand("")
                    }
                  }}
                />
                <Button className="button-primary">
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Claude Browser Settings Sheet */}
      <Sheet open={showClaudeSettings} onOpenChange={setShowClaudeSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Claude Browser Connection</SheetTitle>
            <SheetDescription>
              Configure browser-based Claude connection
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claudeEmail">Email</Label>
                <Input
                  id="claudeEmail"
                  type="email"
                  value={claudeCredentials.email}
                  onChange={(e) => setClaudeCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claudePassword">Password</Label>
                <Input
                  id="claudePassword"
                  type="password"
                  value={claudeCredentials.password}
                  onChange={(e) => setClaudeCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionCookie">Session Cookie</Label>
                <Textarea
                  id="sessionCookie"
                  value={claudeCredentials.sessionCookie}
                  onChange={(e) => setClaudeCredentials(prev => ({ ...prev, sessionCookie: e.target.value }))}
                  placeholder="Paste session cookie string here..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Extract from browser developer tools after logging in
                </p>
              </div>
            </div>

            <Separator />

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Security Notice</p>
                <p className="text-amber-700 dark:text-amber-300">
                  Client-side UI only. Do not store passwords on the server.
                </p>
              </div>
            </div>

            <Button className="w-full" variant="outline" disabled>
              Test Sign-in (UI-only)
            </Button>
            
            <Button 
              className="w-full button-primary focus:ring-2 focus:ring-ring focus:ring-offset-2" 
              onClick={handleSaveClaudeSettings}
            >
              <Save className="h-4 w-4 mr-2" />
              Save / Submit
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}