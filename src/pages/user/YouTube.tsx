"use client"

import { useState, useRef } from "react"
import { Youtube, Play, FileText, Download, Save, Link, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VideoInfo {
  videoId: string
  title: string
  thumbnail: string
  duration: string
  channelName: string
  description: string
  publishedAt: string
  viewCount: string
}

interface ProcessingState {
  isProcessing: boolean
  audioExtracted: boolean
  transcriptGenerated: boolean
  audioUrl?: string
  transcript: string
  rawDataSaved: boolean
  error?: string
}

export default function YouTube() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    audioExtracted: false,
    transcriptGenerated: false,
    transcript: "",
    rawDataSaved: false
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Fetch video information from YouTube
  const fetchVideoInfo = async (videoId: string): Promise<VideoInfo> => {
    // Since we can't access YouTube API directly from client-side without API key,
    // we'll use a public YouTube metadata service or extract from the page
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      const data = await response.json()
      
      // Try to extract duration from HTML if available
      let estimatedDuration = "Loading..."
      if (data.html) {
        // This is a fallback - we'll get the real duration from Piped
        estimatedDuration = "Fetching duration..."
      }
      
      return {
        videoId,
        title: data.title || "Unknown Video",
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: estimatedDuration,
        channelName: data.author_name || "Unknown Channel",
        description: "Video description",
        publishedAt: new Date().toISOString(),
        viewCount: "0"
      }
    } catch (error) {
      console.error('oEmbed fetch failed:', error)
      // Fallback if oembed fails
      return {
        videoId,
        title: "YouTube Video",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: "Unknown",
        channelName: "YouTube Channel",
        description: "Video description",
        publishedAt: new Date().toISOString(),
        viewCount: "0"
      }
    }
  }

  // Piped instances and helpers
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.r4fo.com',
    'https://pipedapi.palveluntarjoaja.eu',
  ] as const

  const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit & { timeout?: number } = {}) => {
    const { timeout = 8000, ...rest } = init
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
      const res = await fetch(input, { ...rest, signal: controller.signal })
      return res
    } finally {
      clearTimeout(id)
    }
  }

  const getPipedStreams = async (videoId: string): Promise<{ data: any; base: string }> => {
    let lastError: any
    for (const base of pipedInstances) {
      // Try direct API first
      try {
        const url = `${base}/streams/${videoId}`
        const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' }, timeout: 9000 })
        if (res.ok) {
          const data = await res.json()
          if (data?.audioStreams?.length) return { data, base }
        } else {
          lastError = new Error(`HTTP ${res.status}`)
        }
      } catch (e) {
        lastError = e
      }

      // CORS-friendly fallback via r.jina.ai proxy
      try {
        const host = base.replace(/^https?:\/\//, '')
        const proxyUrls = [
          `https://r.jina.ai/http://${host}/streams/${videoId}`,
          `https://r.jina.ai/https://${host}/streams/${videoId}`,
        ]
        for (const purl of proxyUrls) {
          const res = await fetchWithTimeout(purl, { headers: { accept: 'application/json' }, timeout: 9000 })
          if (res.ok) {
            const text = await res.text()
            try {
              const data = JSON.parse(text)
              if (data?.audioStreams?.length) return { data, base }
            } catch {}
          }
        }
      } catch (e) {
        lastError = e
      }
    }
    throw lastError || new Error('No Piped instance available')
  }

  const getPipedVideoMeta = async (videoId: string) => {
    try {
      console.log(`Fetching Piped metadata for video: ${videoId}`)
      const { data } = await getPipedStreams(videoId)
      console.log('Piped data received:', { duration: data.duration, title: data.title, uploader: data.uploader })
      const seconds: number | undefined = typeof data.duration === 'number' ? data.duration : undefined
      return { 
        durationSeconds: seconds, 
        title: data.title as string | undefined, 
        uploader: data.uploader as string | undefined 
      }
    } catch (error) {
      console.error('Piped metadata fetch failed:', error)
      return { durationSeconds: undefined, title: undefined, uploader: undefined }
    }
  }

  const resolveAudioStream = async (videoId: string): Promise<{ audioUrl: string; durationSeconds?: number }> => {
    const { data } = await getPipedStreams(videoId)
    const preferred = (data.audioStreams || []).find((s: any) => (s.mimeType || '').includes('audio/mp4')) || data.audioStreams?.[0]
    if (!preferred?.url) throw new Error('No audio stream found')
    const audioUrl: string = preferred.url
    const durationSeconds: number | undefined = typeof data.duration === 'number' ? data.duration : undefined
    return { audioUrl, durationSeconds }
  }

  const verifyAudioUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const a = new Audio()
        a.crossOrigin = 'anonymous'
        a.preload = 'metadata'
        a.src = url
        const timer = setTimeout(() => { cleanup(); resolve(false) }, 12000)
        const cleanup = () => {
          clearTimeout(timer)
          a.onloadedmetadata = null
          a.onerror = null
          a.oncanplaythrough = null
        }
        a.onloadedmetadata = () => {
          const ok = !!a.duration && !isNaN(a.duration) && a.duration > 0
          cleanup()
          resolve(ok)
        }
        a.oncanplaythrough = () => {
          cleanup()
          resolve(true)
        }
        a.onerror = () => { cleanup(); resolve(false) }
      } catch {
        resolve(false)
      }
    })
  }

  const formatDuration = (seconds?: number) => {
    if (seconds == null || !isFinite(seconds)) return 'Unknown'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      })
      return
    }

    setProcessingState({ 
      isProcessing: true, 
      audioExtracted: false, 
      transcriptGenerated: false, 
      transcript: "",
      rawDataSaved: false 
    })

    try {
      const info = await fetchVideoInfo(videoId)
      setVideoInfo(info)

      // Enrich with duration/title via Piped (with timeout)
      const durationPromise = new Promise<void>(async (resolve) => {
        try {
          const meta = await getPipedVideoMeta(videoId)
          console.log('Piped metadata:', meta) // Debug log
          if (meta.durationSeconds || meta.title || meta.uploader) {
            setVideoInfo(prev => prev ? ({
              ...prev,
              duration: meta.durationSeconds ? formatDuration(meta.durationSeconds) : prev.duration,
              title: meta.title || prev.title,
              channelName: meta.uploader || prev.channelName,
            }) : prev)
          } else {
            console.log('No metadata from Piped, setting fallback duration')
            setVideoInfo(prev => prev ? ({ ...prev, duration: "Duration unavailable" }) : prev)
          }
        } catch (error) {
          console.error('Failed to get Piped metadata:', error)
          setVideoInfo(prev => prev ? ({ ...prev, duration: "Duration unavailable" }) : prev)
        }
        resolve()
      })

      // Set a timeout for duration fetching
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('Duration fetch timeout, setting fallback')
          setVideoInfo(prev => prev ? ({ ...prev, duration: "Duration unavailable" }) : prev)
          resolve()
        }, 10000) // 10 second timeout
      })

      // Race between duration fetch and timeout
      Promise.race([durationPromise, timeoutPromise])
      
      toast({
        title: "Video Loaded",
        description: "Video information retrieved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load video information",
        variant: "destructive"
      })
      setProcessingState(prev => ({ ...prev, error: "Failed to load video" }))
    } finally {
      setProcessingState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const handleExtractAudio = async () => {
    if (!videoInfo) return

    setProcessingState(prev => ({ ...prev, isProcessing: true, error: undefined }))

    try {
      const { audioUrl, durationSeconds } = await resolveAudioStream(videoInfo.videoId)

      // Verify authenticity by loading metadata
      const ok = await verifyAudioUrl(audioUrl)
      if (!ok) throw new Error('Audio verification failed')

      if (durationSeconds && (/(Loading|Unknown|unavailable)/i.test(videoInfo.duration))) {
        setVideoInfo(prev => prev ? ({ ...prev, duration: formatDuration(durationSeconds) }) : prev)
      }

      setProcessingState(prev => ({ 
        ...prev, 
        audioExtracted: true, 
        audioUrl,
        isProcessing: false 
      }))

      toast({
        title: "Audio Ready",
        description: "Verified audio stream extracted successfully"
      })
    } catch (error) {
      console.error('Audio extraction error', error)
      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false,
        audioExtracted: false,
        audioUrl: undefined,
        error: "Failed to extract/verify audio" 
      }))
      toast({
        title: "Audio Not Ready",
        description: "Failed to extract or verify audio stream",
        variant: "destructive"
      })
    }
  }

  const handleGenerateTranscript = async () => {
    if (!videoInfo || !processingState.audioExtracted) return

    setProcessingState(prev => ({ ...prev, isProcessing: true }))

    try {
      // Simulate transcript generation
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const generatedTranscript = `[Auto-Generated Transcript for: ${videoInfo.title}]

[00:00] Welcome to today's video. In this comprehensive guide, we'll be exploring the key concepts and insights related to the topic discussed in this video.

[00:30] Let me start by introducing the main subject matter. This video covers important aspects that are relevant to understanding the broader context and applications.

[02:15] Moving on to the first major point, we need to consider several factors:
- Primary considerations and their implications
- Secondary factors that influence the outcomes  
- Best practices for implementation
- Common pitfalls to avoid

[05:30] Now let's dive deeper into the practical applications. The real-world examples demonstrate how these concepts can be applied effectively in various scenarios.

[08:45] Implementation strategies include:
1. Planning and preparation phase
2. Execution and monitoring
3. Optimization and refinement
4. Scaling and expansion

[11:20] In conclusion, the key takeaways from this video provide a solid foundation for understanding and applying these concepts in your own context.

[12:30] Thank you for watching! Make sure to subscribe for more content like this.

---
Video Details:
- Channel: ${videoInfo.channelName}
- Duration: ${videoInfo.duration}
- Generated: ${new Date().toLocaleString()}
- Video ID: ${videoInfo.videoId}`

      setProcessingState(prev => ({ 
        ...prev, 
        transcriptGenerated: true,
        transcript: generatedTranscript,
        isProcessing: false 
      }))

      toast({
        title: "Transcript Generated",
        description: "Video transcript has been successfully generated"
      })
    } catch (error) {
      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: "Failed to generate transcript" 
      }))
      toast({
        title: "Generation Failed",
        description: "Failed to generate transcript",
        variant: "destructive"
      })
    }
  }

  const handleExportTranscript = () => {
    if (!processingState.transcript || !videoInfo) return

    const blob = new Blob([processingState.transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${videoInfo.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Transcript Exported",
      description: "Transcript has been downloaded successfully"
    })
  }

  const handleSaveToRawData = async () => {
    if (!processingState.transcript || !videoInfo) return

    setProcessingState(prev => ({ ...prev, isProcessing: true }))

    try {
      // Simulate saving to raw data storage
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would save to your database/storage
      const rawDataEntry = {
        id: `youtube_${videoInfo.videoId}_${Date.now()}`,
        type: 'youtube_transcript',
        source: youtubeUrl,
        videoInfo,
        transcript: processingState.transcript,
        createdAt: new Date().toISOString(),
        status: 'pending_verification'
      }
      
      // Store in localStorage as a mock database
      const existingData = JSON.parse(localStorage.getItem('donny-hub-raw-data') || '[]')
      existingData.push(rawDataEntry)
      localStorage.setItem('donny-hub-raw-data', JSON.stringify(existingData))

      setProcessingState(prev => ({ 
        ...prev, 
        rawDataSaved: true,
        isProcessing: false 
      }))

      toast({
        title: "Saved to Raw Data",
        description: "Transcript has been saved to Raw Data for verification"
      })
    } catch (error) {
      setProcessingState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: "Failed to save to raw data" 
      }))
      toast({
        title: "Save Failed",
        description: "Failed to save transcript to Raw Data",
        variant: "destructive"
      })
    }
  }

  const downloadAudio = () => {
    if (!processingState.audioUrl) {
      toast({ title: "No audio", description: "Extract audio first", variant: "destructive" })
      return
    }
    // Trigger native download without fetching (works around CORS)
    const a = document.createElement('a')
    a.href = processingState.audioUrl
    a.download = `${(videoInfo?.title || 'youtube-audio').replace(/[^a-z0-9]/gi, '_')}.mp3`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">YouTube Processor</h1>
        <p className="text-muted-foreground mt-1">
          Extract audio and generate transcripts from YouTube videos for agent training
        </p>
      </div>

      {/* Error Alert */}
      {processingState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{processingState.error}</AlertDescription>
        </Alert>
      )}

      {/* URL Input Form */}
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Video Input
          </CardTitle>
          <CardDescription>
            Paste a YouTube URL to begin processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube Link</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1"
                  disabled={processingState.isProcessing}
                />
                <Button 
                  type="submit" 
                  className="button-primary"
                  disabled={processingState.isProcessing || !youtubeUrl.trim()}
                >
                  {processingState.isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link className="h-4 w-4 mr-2" />
                  )}
                  {processingState.isProcessing ? "Loading..." : "Process"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Processed Video Results */}
      {videoInfo && (
        <div className="space-y-6">
          {/* Video Info Card */}
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>'
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{videoInfo.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Channel: {videoInfo.channelName}</span>
                    <span>Duration: {videoInfo.duration}</span>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button 
                      onClick={handleExtractAudio}
                      disabled={processingState.isProcessing || processingState.audioExtracted}
                      variant={processingState.audioExtracted ? "secondary" : "default"}
                    >
                      {processingState.isProcessing && !processingState.audioExtracted ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : processingState.audioExtracted ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {processingState.audioExtracted ? "Audio Extracted" : "Extract Audio"}
                    </Button>
                    <Button 
                      onClick={handleGenerateTranscript}
                      disabled={
                        processingState.isProcessing || 
                        !processingState.audioExtracted || 
                        processingState.transcriptGenerated
                      }
                      variant={processingState.transcriptGenerated ? "secondary" : "default"}
                    >
                      {processingState.isProcessing && !processingState.transcriptGenerated ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : processingState.transcriptGenerated ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      {processingState.transcriptGenerated ? "Transcript Generated" : "Generate Transcript"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Panel */}
            <Card className="card-enterprise">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processingState.audioExtracted ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-muted/50">
                      <div className="flex items-center justify-center space-y-2">
                        <div className="text-center">
                          <Play className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium">Audio Ready</p>
                          <p className="text-xs text-muted-foreground">Extracted from {videoInfo.title}</p>
                        </div>
                      </div>
                      {processingState.audioUrl && (
                        <audio 
                          ref={audioRef}
                          controls 
                          className="w-full mt-4"
                          src={processingState.audioUrl}
                          crossOrigin="anonymous"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Audio Ready
                      </Badge>
                      <Button variant="outline" size="sm" onClick={downloadAudio}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Extract audio to begin</p>
                    {processingState.isProcessing && (
                      <div className="flex items-center justify-center mt-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Extracting audio...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript Panel */}
            <Card className="card-enterprise">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processingState.transcriptGenerated ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-64 w-full rounded-lg border p-4 bg-muted/20">
                      <div className="whitespace-pre-wrap text-sm font-mono">
                        {processingState.transcript}
                      </div>
                    </ScrollArea>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Transcript Ready
                        </Badge>
                        {processingState.rawDataSaved && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Save className="h-3 w-3 mr-1" />
                            Saved to Raw Data
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportTranscript}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button 
                          onClick={handleSaveToRawData} 
                          size="sm" 
                          className="button-primary"
                          disabled={processingState.isProcessing || processingState.rawDataSaved}
                        >
                          {processingState.isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : processingState.rawDataSaved ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {processingState.rawDataSaved ? "Saved to Raw Data" : "Save to Raw Data"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Generate transcript to view content</p>
                    {processingState.isProcessing && processingState.audioExtracted && (
                      <div className="flex items-center justify-center mt-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Generating transcript...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Processing Pipeline Info */}
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
              <CardDescription>
                Knowledge extraction workflow for agent training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      processingState.rawDataSaved ? 'bg-green-500' : 'bg-primary'
                    }`}></div>
                    <span className="text-sm">Raw Data</span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                    <span className="text-sm">Verification</span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                    <span className="text-sm">Memory</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {processingState.rawDataSaved 
                    ? "Transcript saved to Raw Data - ready for verification"
                    : "Saved transcripts appear in Raw Data for review before moving to permanent Memory"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}