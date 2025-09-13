"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, RefreshCw, ExternalLink, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { useWiringManifest, sortFeatures, Feature, Check, FeatureStatus } from "@/lib/wiring"
import { StatusTile } from "@/components/wiring/StatusTile"
import { Legend } from "@/components/wiring/Legend"

export default function WiringPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedFeature = searchParams?.get('feature')
  
  const { manifest, loading: manifestLoading, error: manifestError, refresh } = useWiringManifest()
  const [drawerOpen, setDrawerOpen] = useState(!!selectedFeature)

  // Calculate filtered features
  const allFeatures = manifest ? sortFeatures(manifest.features) : []

  // Get feature for detail drawer
  const selectedFeatureData = selectedFeature && manifest?.features[selectedFeature]

  // Update drawer state when URL changes
  useEffect(() => {
    setDrawerOpen(!!selectedFeature)
  }, [selectedFeature])

  const handleFeatureClick = (key: string) => {
    router.push(`/user/wiring?feature=${encodeURIComponent(key)}`)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    router.push('/user/wiring')
  }

  const getCheckIcon = (check: Check) => {
    switch (check.status) {
      case 'green': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'orange': return <Clock className="h-4 w-4 text-amber-600" />
      case 'red': return <XCircle className="h-4 w-4 text-rose-600" />
      case 'grey': return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/user')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">System Wiring</h1>
            <p className="text-muted-foreground">Detailed system health monitoring and diagnostics</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={manifestLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${manifestLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Environment Info */}
      {manifest && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Environment:</span>
                <div className="text-lg font-semibold">{manifest.env.name}</div>
              </div>
              <div>
                <span className="font-medium">UI:</span>
                <div className="text-muted-foreground">{manifest.env.ui}</div>
              </div>
              <div>
                <span className="font-medium">API:</span>
                <div className="text-muted-foreground">{manifest.env.api}</div>
              </div>
              <div>
                <span className="font-medium">Generated:</span>
                <div className="text-muted-foreground">
                  {new Date(manifest.generated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Legend Sidebar */}
        <div className="lg:col-span-1">
          <Legend />
        </div>

        {/* Features Grid */}
        <div className="lg:col-span-3">
          {manifestError ? (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardContent className="p-6 text-center">
                <div className="text-rose-600 mb-2">Failed to load manifest</div>
                <div className="text-sm text-rose-500">{manifestError}</div>
              </CardContent>
            </Card>
          ) : manifestLoading && !manifest ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-pulse">Loading manifest...</div>
              </CardContent>
            </Card>
          ) : !manifest || allFeatures.length === 0 ? (
            <Card className="border-slate-200 bg-slate-50/20">
              <CardContent className="p-6 text-center">
                <div className="text-slate-600 mb-2">No features available</div>
                <div className="text-sm text-slate-500">
                  Check your manifest configuration
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allFeatures.map(([key, feature]) => (
                <StatusTile
                  key={key}
                  feature={feature}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleFeatureClick(key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          {selectedFeatureData && (
            <>
              <DrawerHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle className="text-xl">{selectedFeatureData.name}</DrawerTitle>
                    <DrawerDescription>Feature diagnostics and check details</DrawerDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={
                        selectedFeatureData.status === "green" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        selectedFeatureData.status === "orange" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        selectedFeatureData.status === "red" ? "bg-rose-100 text-rose-800 border-rose-300" :
                        "bg-slate-100 text-slate-600 border-slate-300"
                      }
                    >
                      {selectedFeatureData.status.toUpperCase()}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={closeDrawer}>
                      ×
                    </Button>
                  </div>
                </div>
              </DrawerHeader>
              
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Global Dependencies */}
                {manifest?.global.deps && Object.keys(manifest.global.deps).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Global Dependencies
                    </h3>
                    <Card className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(manifest.global.deps).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>
                              <div className="text-muted-foreground">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Separator />

                {/* All Checks */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    All Checks ({Object.keys(selectedFeatureData.checks).length})
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(selectedFeatureData.checks).map(([key, check]) => (
                      <Card key={key} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getCheckIcon(check)}
                              <div>
                                <div className="font-medium">{check.name}</div>
                                <div className="text-xs text-muted-foreground">Key: {key}</div>
                                {check.url && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <ExternalLink className="h-3 w-3" />
                                    <a href={check.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {check.url}
                                    </a>
                                  </div>
                                )}
                                {(check.note || check.error) && (
                                  <div className={`text-sm mt-2 ${
                                    check.error ? 'text-rose-600' : 'text-muted-foreground'
                                  }`}>
                                    {check.error || check.note}
                                  </div>
                                )}
                              </div>
                            </div>
                            {check.p95_ms && (
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">P95 Latency</div>
                                <div className="text-sm font-mono">{check.p95_ms}ms</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}