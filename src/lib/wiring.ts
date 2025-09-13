import { useState, useEffect } from 'react';

export type FeatureStatus = "green" | "orange" | "red" | "grey";

export interface Env {
  name: string;
  ui: string;
  api: string;
}

export interface GlobalDeps {
  [key: string]: any;
}

export interface Check {
  name: string;
  status: FeatureStatus;
  url?: string;
  p95_ms?: number;
  note?: string;
  error?: string;
}

export interface Feature {
  name: string;
  status: FeatureStatus;
  required: Check[];
  checks: { [key: string]: Check };
}

export interface WiringManifest {
  env: Env;
  generated_at: string;
  global: {
    deps: GlobalDeps;
  };
  features: { [key: string]: Feature };
}

class WiringClient {
  private cache: WiringManifest | null = null;
  private lastFetch = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  async fetchManifest(): Promise<WiringManifest> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.cache && (now - this.lastFetch) < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const response = await fetch('/api/wiring/manifest', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Manifest fetch failed: ${response.status}`);
      }

      const manifest = await response.json() as WiringManifest;
      
      // Cache the successful response
      this.cache = manifest;
      this.lastFetch = now;
      
      return manifest;
    } catch (error) {
      console.error('Failed to fetch wiring manifest:', error);
      
      // Return stale cache if available, otherwise throw
      if (this.cache) {
        return this.cache;
      }
      
      throw error;
    }
  }

  getCachedManifest(): WiringManifest | null {
    return this.cache;
  }
}

// Global instance
const wiringClient = new WiringClient();

export function useWiringManifest() {
  const [manifest, setManifest] = useState<WiringManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await wiringClient.fetchManifest();
        
        if (mounted) {
          setManifest(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch manifest');
          // Try to use cached data even on error
          const cached = wiringClient.getCachedManifest();
          if (cached) {
            setManifest(cached);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Set up polling for fresh data
    const interval = setInterval(fetchData, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    try {
      setError(null);
      const data = await wiringClient.fetchManifest();
      setManifest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh manifest');
    }
  };

  return {
    manifest,
    loading,
    error,
    refresh,
  };
}

// Helper functions
export function getFeatureReason(feature: Feature): string {
  // Find first failing check
  const failingCheck = Object.values(feature.checks).find(
    check => check.status === 'red'
  );
  
  if (failingCheck) {
    return failingCheck.error || failingCheck.note || 'Check failed';
  }

  const degradedCheck = Object.values(feature.checks).find(
    check => check.status === 'orange'
  );

  if (degradedCheck) {
    return degradedCheck.note || 'Performance degraded';
  }

  if (feature.status === 'grey') {
    return 'Feature disabled';
  }

  return 'All good';
}

export function sortFeatures(features: { [key: string]: Feature }): [string, Feature][] {
  return Object.entries(features).sort(([a], [b]) => a.localeCompare(b));
}