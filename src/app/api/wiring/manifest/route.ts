import { NextResponse } from 'next/server'
import type { WiringManifest } from '@/lib/wiring'

export async function GET() {
  // Mock manifest data for development
  const manifest: WiringManifest = {
    env: {
      name: "development",
      ui: "http://localhost:5000",
      api: "http://localhost:5055"
    },
    generated_at: new Date().toISOString(),
    global: {
      deps: {
        node_version: "20.x",
        next_version: "15.5.3"
      }
    },
    features: {
      "ui": {
        name: "UI Dashboard",
        status: "green",
        required: [
          {
            name: "Health Check",
            status: "green",
            url: "http://localhost:5000/health",
            p95_ms: 45,
            note: "All good"
          }
        ],
        checks: {
          "health": {
            name: "Health Check",
            status: "green",
            url: "http://localhost:5000/health",
            p95_ms: 45
          },
          "build": {
            name: "Build Status",
            status: "green",
            note: "Compilation successful"
          }
        }
      },
      "api": {
        name: "API Server",
        status: "red",
        required: [
          {
            name: "Service Health",
            status: "red",
            url: "http://localhost:5055/health",
            error: "Connection refused - service not running"
          }
        ],
        checks: {
          "health": {
            name: "Service Health",
            status: "red",
            url: "http://localhost:5055/health",
            error: "Connection refused"
          }
        }
      },
      "doctor": {
        name: "Doctor Service",
        status: "orange",
        required: [
          {
            name: "Doctor Health",
            status: "orange",
            url: "http://localhost:5056/health",
            p95_ms: 1200,
            note: "Service responding but degraded performance"
          }
        ],
        checks: {
          "health": {
            name: "Doctor Health",
            status: "orange",
            url: "http://localhost:5056/health",
            p95_ms: 1200
          }
        }
      },
      "database": {
        name: "Database",
        status: "grey",
        required: [],
        checks: {
          "connection": {
            name: "Database Connection",
            status: "grey",
            note: "Not configured for this environment"
          }
        }
      }
    }
  }

  return NextResponse.json(manifest)
}