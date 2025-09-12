// Shared Project Store with localStorage persistence and live events

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed" | "archived"
  assignedAgents: string[] // Agent IDs
  createdDate: string
  lastUpdated: string
  progress: number
  category: string
}

type EventCallback<T> = (data: T) => void

class ProjectStore {
  private storageKey = 'donny-hub-projects'
  private projectCallbacks = new Set<EventCallback<Project[]>>()

  // Default projects
  private defaultProjects: Project[] = [
    {
      id: "1",
      name: "E-commerce Automation",
      description: "Automated customer service and inventory management system",
      status: "active",
      assignedAgents: ["1", "2"],
      createdDate: "2024-01-15",
      lastUpdated: "2 hours ago",
      progress: 85,
      category: "E-commerce"
    },
    {
      id: "2", 
      name: "Content Marketing Hub",
      description: "AI-powered content creation and social media management",
      status: "active",
      assignedAgents: ["1", "4"],
      createdDate: "2024-02-01", 
      lastUpdated: "1 day ago",
      progress: 60,
      category: "Marketing"
    },
    {
      id: "3",
      name: "Data Analytics Pipeline",
      description: "Automated data processing and reporting workflows",
      status: "paused",
      assignedAgents: ["2"],
      createdDate: "2024-01-20",
      lastUpdated: "3 days ago", 
      progress: 40,
      category: "Analytics"
    },
    {
      id: "4",
      name: "Customer Support Bot",
      description: "24/7 intelligent customer support and ticket management",
      status: "active",
      assignedAgents: ["1", "3"],
      createdDate: "2024-02-10",
      lastUpdated: "5 hours ago",
      progress: 95,
      category: "Support"
    },
  ]

  getProjects(): Project[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load projects from localStorage:', error)
    }
    
    // Initialize with defaults
    this.saveProjects(this.defaultProjects)
    return this.defaultProjects
  }

  addProject(project: Omit<Project, 'id' | 'createdDate' | 'lastUpdated'>): Project {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: "Just now"
    }
    
    const projects = this.getProjects()
    const updatedProjects = [...projects, newProject]
    this.saveProjects(updatedProjects)
    
    this.notifyProjectChange(updatedProjects)
    return newProject
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const projects = this.getProjects()
    const index = projects.findIndex(p => p.id === id)
    
    if (index === -1) return false
    
    projects[index] = { 
      ...projects[index], 
      ...updates,
      lastUpdated: "Just now"
    }
    this.saveProjects(projects)
    
    this.notifyProjectChange(projects)
    return true
  }

  duplicateProject(id: string): Project | null {
    const projects = this.getProjects()
    const project = projects.find(p => p.id === id)
    
    if (!project) return null
    
    const duplicatedProject: Project = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: "Just now",
      progress: 0,
      status: "active"
    }
    
    const updatedProjects = [...projects, duplicatedProject]
    this.saveProjects(updatedProjects)
    
    this.notifyProjectChange(updatedProjects)
    return duplicatedProject
  }

  archiveProject(id: string): boolean {
    return this.updateProject(id, { status: "archived" })
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects()
    const filtered = projects.filter(p => p.id !== id)
    
    if (filtered.length === projects.length) return false
    
    this.saveProjects(filtered)
    this.notifyProjectChange(filtered)
    return true
  }

  getProjectById(id: string): Project | null {
    const projects = this.getProjects()
    return projects.find(p => p.id === id) || null
  }

  getAvailableCategories(): string[] {
    const projects = this.getProjects()
    const categories = new Set(projects.map(p => p.category))
    return Array.from(categories)
  }

  getAvailableStatuses(): string[] {
    return ["active", "paused", "completed", "archived"]
  }

  private saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects))
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error)
    }
  }

  private notifyProjectChange(projects: Project[]): void {
    this.projectCallbacks.forEach(callback => callback(projects))
  }

  // Subscribe to changes
  onProjectsChange(callback: EventCallback<Project[]>): () => void {
    this.projectCallbacks.add(callback)
    return () => this.projectCallbacks.delete(callback)
  }
}

export const projectStore = new ProjectStore()