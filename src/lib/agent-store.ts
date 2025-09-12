// Shared Agent Store with localStorage persistence and live events

export interface Agent {
  id: string
  name: string
  goal: string
  model: string
  tools: string[]
  status: "running" | "idle" | "paused" | "error"
  lastRun: string
  successRate: number
}

export interface ActiveModel {
  id: string
  name: string
  key: string
  provider: string
  status: "active" | "inactive"
  created: string
  lastUsed: string
}

type EventCallback<T> = (data: T) => void

class AgentStore {
  private storageKey = 'donny-hub-agents'
  private modelsKey = 'donny-hub-active-models'
  private agentCallbacks = new Set<EventCallback<Agent[]>>()
  private modelCallbacks = new Set<EventCallback<ActiveModel[]>>()

  // Default agents
  private defaultAgents: Agent[] = [
    {
      id: "1",
      name: "Content Creator",
      goal: "Generate blog posts and social media content",
      model: "GPT-4",
      tools: ["Web Scraper", "Image Generator", "SEO Optimizer"],
      status: "running",
      lastRun: "2 minutes ago",
      successRate: 95,
    },
    {
      id: "2",
      name: "Data Analyzer",
      goal: "Process and analyze customer data for insights",
      model: "Claude-3",
      tools: ["Data Processor", "Chart Generator", "Report Builder"],
      status: "idle",
      lastRun: "1 hour ago",
      successRate: 98,
    },
    {
      id: "3",
      name: "Customer Support",
      goal: "Handle customer inquiries and support tickets",
      model: "GPT-4",
      tools: ["Ticket System", "Knowledge Base", "Email Sender"],
      status: "running",
      lastRun: "30 seconds ago",
      successRate: 87,
    },
    {
      id: "4",
      name: "Social Media Manager",
      goal: "Schedule and manage social media posts",
      model: "Claude-3",
      tools: ["Social API", "Image Editor", "Analytics"],
      status: "paused",
      lastRun: "2 days ago",
      successRate: 92,
    },
  ]

  // Default active models
  private defaultModels: ActiveModel[] = [
    {
      id: "1",
      name: "GPT-4",
      key: "sk-1234...5678",
      provider: "OpenAI",
      status: "active",
      created: "2024-01-15",
      lastUsed: "2 minutes ago"
    },
    {
      id: "2",
      name: "Claude-3",
      key: "sk-9876...3210",
      provider: "Anthropic",
      status: "active",
      created: "2024-02-01",
      lastUsed: "1 hour ago"
    },
    {
      id: "3",
      name: "Gemini-Pro",
      key: "key-abcd...efgh",
      provider: "Google",
      status: "active",
      created: "2024-02-15",
      lastUsed: "1 week ago"
    },
  ]

  getAgents(): Agent[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load agents from localStorage:', error)
    }
    
    // Initialize with defaults
    this.saveAgents(this.defaultAgents)
    return this.defaultAgents
  }

  addAgent(agent: Omit<Agent, 'id' | 'lastRun' | 'successRate' | 'status'>): Agent {
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
      lastRun: "Never",
      successRate: 0,
      status: "idle"
    }
    
    const agents = this.getAgents()
    const updatedAgents = [...agents, newAgent]
    this.saveAgents(updatedAgents)
    
    this.notifyAgentChange(updatedAgents)
    return newAgent
  }

  updateAgent(id: string, updates: Partial<Agent>): boolean {
    const agents = this.getAgents()
    const index = agents.findIndex(a => a.id === id)
    
    if (index === -1) return false
    
    agents[index] = { ...agents[index], ...updates }
    this.saveAgents(agents)
    
    this.notifyAgentChange(agents)
    return true
  }

  deleteAgent(id: string): boolean {
    const agents = this.getAgents()
    const filtered = agents.filter(a => a.id !== id)
    
    if (filtered.length === agents.length) return false
    
    this.saveAgents(filtered)
    this.notifyAgentChange(filtered)
    return true
  }

  getActiveModels(): ActiveModel[] {
    try {
      const stored = localStorage.getItem(this.modelsKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load active models from localStorage:', error)
    }
    
    // Initialize with defaults
    this.saveModels(this.defaultModels)
    return this.defaultModels
  }

  addActiveModel(model: Omit<ActiveModel, 'id' | 'created' | 'lastUsed'>): ActiveModel {
    const newModel: ActiveModel = {
      ...model,
      id: Date.now().toString(),
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    }
    
    const models = this.getActiveModels()
    const updatedModels = [...models, newModel]
    this.saveModels(updatedModels)
    
    this.notifyModelChange(updatedModels)
    return newModel
  }

  getAvailableModelNames(): string[] {
    return this.getActiveModels()
      .filter(m => m.status === 'active')
      .map(m => m.name)
  }

  private saveAgents(agents: Agent[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(agents))
    } catch (error) {
      console.error('Failed to save agents to localStorage:', error)
    }
  }

  private saveModels(models: ActiveModel[]): void {
    try {
      localStorage.setItem(this.modelsKey, JSON.stringify(models))
    } catch (error) {
      console.error('Failed to save models to localStorage:', error)
    }
  }

  private notifyAgentChange(agents: Agent[]): void {
    this.agentCallbacks.forEach(callback => callback(agents))
  }

  private notifyModelChange(models: ActiveModel[]): void {
    this.modelCallbacks.forEach(callback => callback(models))
  }

  // Subscribe to changes
  onAgentsChange(callback: EventCallback<Agent[]>): () => void {
    this.agentCallbacks.add(callback)
    return () => this.agentCallbacks.delete(callback)
  }

  onModelsChange(callback: EventCallback<ActiveModel[]>): () => void {
    this.modelCallbacks.add(callback)
    return () => this.modelCallbacks.delete(callback)
  }
}

export const agentStore = new AgentStore()