import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// EventTarget polyfill for browser compatibility  
export const EventTarget = globalThis.EventTarget || class EventTarget {
  private listeners = new Map<string, Set<EventListener>>()

  addEventListener(type: string, callback: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)
  }

  removeEventListener(type: string, callback: EventListener) {
    this.listeners.get(type)?.delete(callback)
  }

  dispatchEvent(event: Event) {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach(callback => callback(event))
    }
    return true
  }
}
