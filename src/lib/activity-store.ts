// Shared Activity Store with localStorage persistence, subscriptions and cross-tab sync

export type ActivityType = "agent" | "task" | "system"
export type ActivityStatus = "success" | "warning" | "error"

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  // ISO timestamp
  timestamp: string
  status?: ActivityStatus
  agent?: string
  link?: string
}

type EventCallback<T> = (data: T) => void

function minutesAgoISO(min: number) {
  const d = new Date(Date.now() - min * 60_000)
  return d.toISOString()
}

function hoursAgoISO(hr: number) {
  const d = new Date(Date.now() - hr * 60 * 60_000)
  return d.toISOString()
}

function daysAgoISO(dy: number) {
  const d = new Date(Date.now() - dy * 24 * 60 * 60_000)
  return d.toISOString()
}

class ActivityStore {
  private storageKey = 'donny-hub-activities'
  private callbacks = new Set<EventCallback<ActivityItem[]>>()
  private bc: BroadcastChannel | null = null

  private defaults: ActivityItem[] = [
    {
      id: '1',
      type: 'agent',
      title: 'Agent "Content Creator" completed task',
      description: 'Successfully generated blog post about AI trends in marketing',
      timestamp: minutesAgoISO(2),
      status: 'success',
      agent: 'Content Creator',
      link: '/user/tasks/1',
    },
    {
      id: '2',
      type: 'task',
      title: 'New task assigned by Donny',
      description: 'Analyze customer feedback data for Q4 insights',
      timestamp: minutesAgoISO(15),
      agent: 'Data Analyzer',
      link: '/user/tasks/2',
    },
    {
      id: '3',
      type: 'system',
      title: 'Marketplace update available',
      description: '3 new pre-built agents added to the marketplace',
      timestamp: hoursAgoISO(1),
      status: 'success',
      link: '/user/marketplace',
    },
    {
      id: '4',
      type: 'agent',
      title: 'Agent "Customer Support" paused',
      description: 'Manual pause triggered by user action',
      timestamp: hoursAgoISO(2),
      status: 'warning',
      agent: 'Customer Support',
    },
    {
      id: '5',
      type: 'task',
      title: 'Task "Social Media Posting" failed',
      description: 'API rate limit exceeded, retrying in 30 minutes',
      timestamp: daysAgoISO(1),
      status: 'error',
      agent: 'Social Media Manager',
      link: '/user/tasks/5',
    },
    {
      id: '6',
      type: 'system',
      title: 'Weekly usage report generated',
      description: 'Your agents processed 47 tasks this week with 94% success rate',
      timestamp: daysAgoISO(1),
      status: 'success',
      link: '/user/analytics',
    },
  ]

  constructor() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.bc = new BroadcastChannel('donny-hub-activity')
        this.bc.onmessage = (e) => {
          if (e?.data === 'activities:update') {
            // Re-emit with latest data
            this.notify(this.getActivities())
          }
        }
      }
    } catch { /* no-op */ }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (ev) => {
        if (ev.key === this.storageKey) {
          this.notify(this.getActivities())
        }
      })
    }
  }

  getActivities(): ActivityItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.warn('Failed to load activities:', e)
    }
    // seed defaults
    this.save(this.defaults)
    return this.defaults
  }

  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'> & { timestamp?: string }): ActivityItem {
    const item: ActivityItem = {
      id: Date.now().toString(),
      timestamp: activity.timestamp ?? new Date().toISOString(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      status: activity.status,
      agent: activity.agent,
      link: activity.link,
    }
    const list = this.getActivities()
    const updated = [item, ...list]
    this.save(updated)
    this.notify(updated)
    return item
  }

  clearAll(): void {
    this.save([])
    this.notify([])
  }

  onActivitiesChange(cb: EventCallback<ActivityItem[]>): () => void {
    this.callbacks.add(cb)
    return () => this.callbacks.delete(cb)
  }

  private notify(items: ActivityItem[]) {
    this.callbacks.forEach((cb) => cb(items))
  }

  private save(items: ActivityItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
      this.bc?.postMessage('activities:update')
    } catch (e) {
      console.error('Failed to save activities:', e)
    }
  }
}

export const activityStore = new ActivityStore()
