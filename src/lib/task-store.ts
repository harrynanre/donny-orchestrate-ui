// Shared Task Store with localStorage persistence and live events

export interface Task {
  id: string
  title: string
  description: string
  assignedAgent: string // Agent ID
  status: "queued" | "running" | "done" | "failed"
  priority: "low" | "medium" | "high"
  lastEvent: string
  timestamp: string
  createdDate: string
  duration?: string
  category: string
}

type EventCallback<T> = (data: T) => void

class TaskStore {
  private storageKey = 'donny-hub-tasks'
  private taskCallbacks = new Set<EventCallback<Task[]>>()

  // Default tasks
  private defaultTasks: Task[] = [
    {
      id: "1",
      title: "Generate blog post about AI trends",
      description: "Create comprehensive blog post covering latest AI industry trends and developments",
      assignedAgent: "1",
      status: "running",
      priority: "high",
      lastEvent: "Researching AI trends...",
      timestamp: "5 minutes ago",
      createdDate: "2024-02-12",
      category: "Content"
    },
    {
      id: "2", 
      title: "Analyze customer feedback data",
      description: "Process and analyze customer feedback from last quarter",
      assignedAgent: "2",
      status: "done",
      priority: "medium",
      lastEvent: "Report generated successfully",
      timestamp: "1 hour ago",
      createdDate: "2024-02-11",
      duration: "45 minutes",
      category: "Analytics"
    },
    {
      id: "3",
      title: "Schedule social media posts",
      description: "Create and schedule social media content for next week",
      assignedAgent: "4",
      status: "queued",
      priority: "low",
      lastEvent: "Waiting for approval",
      timestamp: "2 hours ago",
      createdDate: "2024-02-10",
      category: "Marketing"
    },
    {
      id: "4",
      title: "Process support tickets",
      description: "Handle and respond to customer support inquiries",
      assignedAgent: "3",
      status: "running",
      priority: "high",
      lastEvent: "Responding to ticket #1234",
      timestamp: "10 minutes ago",
      createdDate: "2024-02-12",
      category: "Support"
    },
    {
      id: "5",
      title: "Update product descriptions",
      description: "Refresh product descriptions with new features and benefits",
      assignedAgent: "1",
      status: "failed",
      priority: "medium",
      lastEvent: "API connection timeout",
      timestamp: "3 hours ago",
      createdDate: "2024-02-09",
      category: "Content"
    },
    {
      id: "6",
      title: "Generate marketing report",
      description: "Create comprehensive marketing performance report",
      assignedAgent: "2",
      status: "done",
      priority: "high",
      lastEvent: "Report sent to team",
      timestamp: "1 day ago",
      createdDate: "2024-02-08",
      duration: "2 hours",
      category: "Analytics"
    },
  ]

  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error)
    }
    
    // Initialize with defaults
    this.saveTasks(this.defaultTasks)
    return this.defaultTasks
  }

  addTask(task: Omit<Task, 'id' | 'createdDate' | 'timestamp' | 'lastEvent'>): Task {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      timestamp: "Just now",
      lastEvent: "Task created"
    }
    
    const tasks = this.getTasks()
    const updatedTasks = [...tasks, newTask]
    this.saveTasks(updatedTasks)
    
    this.notifyTaskChange(updatedTasks)
    return newTask
  }

  updateTask(id: string, updates: Partial<Task>): boolean {
    const tasks = this.getTasks()
    const index = tasks.findIndex(t => t.id === id)
    
    if (index === -1) return false
    
    tasks[index] = { 
      ...tasks[index], 
      ...updates,
      timestamp: "Just now"
    }
    this.saveTasks(tasks)
    
    this.notifyTaskChange(tasks)
    return true
  }

  duplicateTask(id: string): Task | null {
    const tasks = this.getTasks()
    const task = tasks.find(t => t.id === id)
    
    if (!task) return null
    
    const duplicatedTask: Task = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      timestamp: "Just now",
      lastEvent: "Task created",
      status: "queued",
      duration: undefined
    }
    
    const updatedTasks = [...tasks, duplicatedTask]
    this.saveTasks(updatedTasks)
    
    this.notifyTaskChange(updatedTasks)
    return duplicatedTask
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks()
    const filtered = tasks.filter(t => t.id !== id)
    
    if (filtered.length === tasks.length) return false
    
    this.saveTasks(filtered)
    this.notifyTaskChange(filtered)
    return true
  }

  getTaskById(id: string): Task | null {
    const tasks = this.getTasks()
    return tasks.find(t => t.id === id) || null
  }

  getAvailableCategories(): string[] {
    const tasks = this.getTasks()
    const categories = new Set(tasks.map(t => t.category))
    return Array.from(categories)
  }

  getAvailableStatuses(): string[] {
    return ["queued", "running", "done", "failed"]
  }

  getAvailablePriorities(): string[] {
    return ["low", "medium", "high"]
  }

  private saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks))
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error)
    }
  }

  private notifyTaskChange(tasks: Task[]): void {
    this.taskCallbacks.forEach(callback => callback(tasks))
  }

  // Subscribe to changes
  onTasksChange(callback: EventCallback<Task[]>): () => void {
    this.taskCallbacks.add(callback)
    return () => this.taskCallbacks.delete(callback)
  }
}

export const taskStore = new TaskStore()