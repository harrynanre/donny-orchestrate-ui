"use client"

import { useState, useEffect, useRef } from "react"
import { Terminal as TerminalIcon, Play, Settings, Zap, Save, CheckCircle, XCircle, Loader2, Monitor, X, Maximize2, Minimize2, Globe } from "lucide-react"
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

interface ConsoleMessage {
  timestamp: string
  type: "info" | "error" | "warning" | "system" | "user" | "assistant" | "terminal"
  message: string
}

interface FloatingWindow {
  id: string
  type: 'browser' | 'console' | 'terminal'
  title: string
  url?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

export default function Terminal() {
  const [provider, setProvider] = useState("none")
  const [workspace, setWorkspace] = useState("default")
  const [command, setCommand] = useState("")
  const [terminalCommand, setTerminalCommand] = useState("")
  const [currentPath, setCurrentPath] = useState("C:\\Users\\donny-hub")
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "Microsoft Windows [Version 10.0.26100.4946]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\donny-hub>"
  ])
  const [showClaudeSettings, setShowClaudeSettings] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [windows, setWindows] = useState<FloatingWindow[]>([])
  const [highestZIndex, setHighestZIndex] = useState(1000)
  const outputRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  
  const [claudeCredentials, setClaudeCredentials] = useState({
    email: "",
    password: "",
    sessionCookie: "",
  })

  const [consoleOutput, setConsoleOutput] = useState<ConsoleMessage[]>([
    { timestamp: "14:23:45", type: "info", message: "Terminal initialized" },
    { timestamp: "14:23:46", type: "system", message: "Waiting for provider connection..." },
  ])

  // Load API keys on mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('donny-hub-api-keys')
    if (savedApiKeys) {
      try {
        const parsedKeys = JSON.parse(savedApiKeys) as ApiKeyData[]
        setApiKeys(parsedKeys)
      } catch (error) {
        console.error('Failed to load API keys:', error)
      }
    }
  }, [])

  // Auto-scroll console output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [consoleOutput])

  // Auto-scroll terminal output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const addConsoleMessage = (type: ConsoleMessage['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleOutput(prev => [...prev, { timestamp, type, message }])
  }

  const getAvailableApiKeys = () => {
    return apiKeys.filter(key => {
      switch (provider) {
        case "openai":
          return key.provider.toLowerCase() === "openai"
        case "claude-api":
          return key.provider.toLowerCase() === "anthropic"
        default:
          return false
      }
    })
  }

  const getSelectedApiKeyData = () => {
    return apiKeys.find(key => key.id === selectedApiKey)
  }

  // API call functions
  const callOpenAI = async (message: string, apiKey: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || "No response received"
    } catch (error) {
      throw new Error(`OpenAI request failed: ${error}`)
    }
  }

  const callClaude = async (message: string, apiKey: string) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: message }],
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      return data.content[0]?.text || "No response received"
    } catch (error) {
      throw new Error(`Claude request failed: ${error}`)
    }
  }

  const handleConnect = async () => {
    if (provider === "none") {
      toast({
        title: "No Provider Selected",
        description: "Please select an AI provider first",
        variant: "destructive"
      })
      return
    }

    if ((provider === "openai" || provider === "claude-api") && !selectedApiKey) {
      toast({
        title: "No API Key Selected",
        description: "Please select an API key for the chosen provider",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    addConsoleMessage("system", `Connecting to ${provider}...`)

    try {
      if (provider === "openai" || provider === "claude-api") {
        const keyData = getSelectedApiKeyData()
        if (keyData) {
          // Test connection with a simple request
          const testMessage = "Hello, this is a connection test."
          if (provider === "openai") {
            await callOpenAI(testMessage, keyData.key)
          } else {
            await callClaude(testMessage, keyData.key)
          }
          
          setIsConnected(true)
          addConsoleMessage("info", `Successfully connected to ${provider.toUpperCase()}`)
          toast({
            title: "Connected Successfully",
            description: `Connected to ${provider.toUpperCase()} API`,
          })
        }
        } else if (provider === "claude-browser") {
        // Browser connection logic would go here
        setIsConnected(true)
        addConsoleMessage("warning", "Claude browser connection simulated")
      }
    } catch (error) {
      addConsoleMessage("error", `Connection failed: ${error}`)
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${provider}: ${error}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommand = async () => {
    if (!command.trim()) return
    if (!isConnected) {
      addConsoleMessage("error", "Not connected to any provider. Please connect first.")
      return
    }

    const userMessage = command.trim()
    setCommand("")
    setIsLoading(true)

    addConsoleMessage("user", `> ${userMessage}`)

    try {
      let response = ""
      const keyData = getSelectedApiKeyData()
      
      if (provider === "openai" && keyData) {
        response = await callOpenAI(userMessage, keyData.key)
      } else if (provider === "claude-api" && keyData) {
        response = await callClaude(userMessage, keyData.key)
      } else if (provider === "claude-browser") {
        response = "Claude browser mode - simulated response"
      } else {
        response = "Provider not properly configured"
      }

      addConsoleMessage("assistant", response)
    } catch (error) {
      addConsoleMessage("error", `Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }


  const handleSaveClaudeSettings = () => {
    toast({
      title: "Connection Settings Saved",
      description: "Claude browser connection settings have been saved.",
    })
    setShowClaudeSettings(false)
  }

  // Window management functions
  const createWindow = (type: FloatingWindow['type'], title: string, url?: string) => {
    const newWindow: FloatingWindow = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      url,
      position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: highestZIndex + 1
    }
    setWindows(prev => [...prev, newWindow])
    setHighestZIndex(prev => prev + 1)
  }

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ))
  }

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        position: w.isMaximized ? w.position : { x: 0, y: 0 },
        size: w.isMaximized ? w.size : { width: window.innerWidth, height: window.innerHeight }
      } : w
    ))
  }

  const bringToFront = (id: string) => {
    const newZIndex = highestZIndex + 1
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: newZIndex } : w
    ))
    setHighestZIndex(newZIndex)
  }

  // Terminal command handling (Windows CMD style)
  const handleTerminalCommand = () => {
    if (!terminalCommand.trim()) {
      setTerminalOutput(prev => [...prev, currentPath + ">"])
      return
    }

    const cmd = terminalCommand.trim()
    const args = cmd.split(" ")
    const command = args[0].toLowerCase()
    
    // Add user input to output
    setTerminalOutput(prev => [...prev, currentPath + ">" + cmd])
    setTerminalCommand("")

    // Process commands
    switch (command) {
      case "help":
        setTerminalOutput(prev => [...prev, 
          "For more information on a specific command, type HELP command-name",
          "BROWSER     Opens a new browser window",
          "CD          Displays the name of or changes the current directory",
          "CLS         Clears the screen",
          "DIR         Displays a list of files and subdirectories in a directory",
          "DATE        Displays or sets the date",
          "TIME        Displays or sets the system time",
          "VER         Displays the Windows version",
          "WHOAMI      Displays user, group and privileges information",
          ""
        ])
        break
        
      case "cls":
        setTerminalOutput([
          "Microsoft Windows [Version 10.0.26100.4946]",
          "(c) Microsoft Corporation. All rights reserved.",
          ""
        ])
        break
        
      case "dir":
        setTerminalOutput(prev => [...prev,
          " Volume in drive C has no label.",
          " Volume Serial Number is 1234-5678",
          "",
          " Directory of " + currentPath,
          "",
          new Date().toLocaleDateString().padEnd(10) + "  " + new Date().toLocaleTimeString().padEnd(8) + "    <DIR>          .",
          new Date().toLocaleDateString().padEnd(10) + "  " + new Date().toLocaleTimeString().padEnd(8) + "    <DIR>          ..",
          new Date().toLocaleDateString().padEnd(10) + "  " + new Date().toLocaleTimeString().padEnd(8) + "    <DIR>          Documents",
          new Date().toLocaleDateString().padEnd(10) + "  " + new Date().toLocaleTimeString().padEnd(8) + "    <DIR>          Desktop",
          new Date().toLocaleDateString().padEnd(10) + "  " + new Date().toLocaleTimeString().padEnd(8) + "    <DIR>          Downloads",
          "               3 Dir(s)  15,234,567,890 bytes free",
          ""
        ])
        break
        
      case "cd":
        if (args[1]) {
          if (args[1] === "..") {
            const pathParts = currentPath.split("\\")
            if (pathParts.length > 1) {
              pathParts.pop()
              setCurrentPath(pathParts.join("\\"))
            }
          } else {
            setCurrentPath(currentPath + "\\" + args[1])
          }
        } else {
          setTerminalOutput(prev => [...prev, currentPath, ""])
        }
        break
        
      case "date":
        setTerminalOutput(prev => [...prev, 
          "The current date is: " + new Date().toLocaleDateString(),
          ""
        ])
        break
        
      case "time":
        setTerminalOutput(prev => [...prev,
          "The current time is: " + new Date().toLocaleTimeString(),
          ""
        ])
        break
        
      case "ver":
        setTerminalOutput(prev => [...prev,
          "Microsoft Windows [Version 10.0.26100.4946]",
          ""
        ])
        break
        
      case "whoami":
        setTerminalOutput(prev => [...prev,
          "desktop-1234\\donny-hub",
          ""
        ])
        break
        
      case "browser":
        const url = args[1] || "https://google.com"
        createWindow('browser', `Browser - ${url}`, url)
        setTerminalOutput(prev => [...prev,
          "+ Open Browser",
          "Opening browser window: " + url,
          ""
        ])
        break
        
      default:
        setTerminalOutput(prev => [...prev,
          "'" + cmd + "' is not recognized as an internal or external command,",
          "operable program or batch file.",
          ""
        ])
    }
    
    // Add new prompt
    setTerminalOutput(prev => [...prev, currentPath + ">"])
  }

  const handleProviderChange = (value: string) => {
    setProvider(value)
    setIsConnected(false)
    setSelectedApiKey("")
    
    if (value === "claude-browser") {
      setShowClaudeSettings(true)
    }
    
    addConsoleMessage("system", `Provider changed to: ${value}`)
  }

  const getProviderStatus = () => {
    if (isLoading) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />Connecting...
      </Badge>
    }
    
    if (isConnected) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />Connected
      </Badge>
    }

    switch (provider) {
      case "openai":
      case "claude-api":
        return selectedApiKey ? 
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Ready to Connect</Badge> :
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />No API Key
          </Badge>
      case "claude-browser":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Browser Mode</Badge>
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

              {(provider === "openai" || provider === "claude-api") && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select API key" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableApiKeys().map((key) => (
                        <SelectItem key={key.id} value={key.id!}>
                          {key.name} ({key.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getAvailableApiKeys().length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No API keys found. Add one in Settings.
                    </p>
                  )}
                </div>
              )}

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

              <Button 
                className="w-full button-primary" 
                onClick={handleConnect}
                disabled={isLoading || (provider !== "none" && provider !== "claude-browser" && !selectedApiKey)}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? "Connecting..." : isConnected ? "Reconnect" : "Connect"}
              </Button>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 button-secondary"
                  onClick={() => createWindow('browser', 'Browser', 'https://google.com')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Browser
                </Button>
                <Button 
                  className="flex-1 button-secondary"
                  onClick={() => createWindow('console', 'Console')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Console */}
        <div className="lg:col-span-2">
          <Card className="card-enterprise h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TerminalIcon className="h-5 w-5" />
                AI Console
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Output Log */}
              <div 
                ref={outputRef}
                className="flex-1 bg-black dark:bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-y-auto mb-4"
              >
                {consoleOutput.map((line, index) => (
                  <div key={index} className="flex gap-2 mb-1">
                    <span className="text-green-400">[{line.timestamp}]</span>
                    <span className={`${
                      line.type === "error" ? "text-red-400" :
                      line.type === "warning" ? "text-yellow-400" :
                      line.type === "info" ? "text-blue-400" :
                      line.type === "user" ? "text-cyan-400" :
                      line.type === "assistant" ? "text-purple-400" :
                      "text-gray-300"
                    }`}>
                      {line.message}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-yellow-400">Processing...</span>
                    <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                  </div>
                )}
                {!isLoading && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-white animate-pulse">_</span>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="flex gap-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={isConnected ? "Enter message for AI..." : "Connect to a provider first..."}
                  className="flex-1 font-mono"
                  disabled={!isConnected || isLoading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleCommand()
                    }
                  }}
                />
                <Button 
                  className="button-primary"
                  onClick={handleCommand}
                  disabled={!isConnected || !command.trim() || isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? "..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command Prompt */}
        <div className="lg:col-span-1">
          <Card className="card-enterprise h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TerminalIcon className="h-4 w-4" />
                Command Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Terminal Output */}
              <div 
                ref={terminalRef}
                className="flex-1 bg-black rounded-t-lg p-3 font-mono text-sm text-white overflow-y-auto border-b"
                style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
              >
                {terminalOutput.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                <div className="flex items-center">
                  <span>{currentPath}&gt;</span>
                  <span className="ml-1 animate-pulse">_</span>
                </div>
              </div>

              {/* Terminal Input */}
              <div className="p-3 bg-muted">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-muted-foreground">{currentPath}&gt;</span>
                  <Input
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder=""
                    className="flex-1 font-mono text-sm border-0 bg-transparent focus:ring-0 p-0"
                    style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleTerminalCommand()
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Windows */}
      <div className="mt-6 space-y-4">{windows.map((window) => (
        <div
          key={window.id}
          className={`relative bg-background border border-border rounded-lg shadow-xl transition-all duration-200 ${
            window.isMinimized ? 'h-12' : 'h-96'
          }`}
          style={{
            width: window.isMinimized ? '300px' : '800px',
            zIndex: window.zIndex
          }}
          onClick={() => bringToFront(window.id)}
        >
          {/* Window Header */}
          <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
            <div className="flex items-center gap-2">
              {window.type === 'browser' && <Globe className="h-4 w-4" />}
              {window.type === 'console' && <Monitor className="h-4 w-4" />}
              <span className="text-sm font-medium">{window.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  minimizeWindow(window.id)
                }}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  closeWindow(window.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Window Content */}
          {!window.isMinimized && (
            <div className="flex-1 p-4 overflow-hidden h-80">
              {window.type === 'browser' && (
                <div className="h-full">
                  <div className="mb-2">
                    <Input 
                      defaultValue={window.url} 
                      className="text-xs bg-background"
                      readOnly 
                    />
                  </div>
                  <iframe 
                    src={window.url} 
                    className="w-full h-[calc(100%-2rem)] border border-border rounded bg-white"
                    title={window.title}
                  />
                </div>
              )}
              {window.type === 'console' && (
                <div className="h-full bg-black rounded p-3 font-mono text-sm text-green-400 overflow-y-auto">
                  <div>Debug Console Window</div>
                  <div className="text-yellow-400">No errors detected</div>
                  <div className="text-blue-400">Application running normally</div>
                  <div className="text-gray-400 mt-2">Ready for debug output...</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

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
    </div>
  )
}