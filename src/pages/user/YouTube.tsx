"use client"

import { useState } from "react"
import { Youtube, Play, FileText, Download, Save, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function YouTube() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [processedVideo, setProcessedVideo] = useState<{
    title: string
    thumbnail: string
    duration: string
    channelName: string
    audioExtracted: boolean
    transcriptGenerated: boolean
    transcript: string
  } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl) return

    // Simulate processing (UI-only)
    setProcessedVideo({
      title: "How AI Agents Are Revolutionizing Business Automation",
      thumbnail: "/placeholder-video-thumbnail.jpg",
      duration: "12:45",
      channelName: "TechFuture Channel",
      audioExtracted: false,
      transcriptGenerated: false,
      transcript: ""
    })
  }

  const handleExtractAudio = () => {
    if (processedVideo) {
      setProcessedVideo(prev => prev ? { ...prev, audioExtracted: true } : null)
    }
  }

  const handleGenerateTranscript = () => {
    if (processedVideo) {
      const sampleTranscript = `Welcome to today's video about AI agents and business automation. In this comprehensive guide, we'll explore how artificial intelligence is transforming the way businesses operate.

[00:30] First, let's understand what AI agents are. An AI agent is an autonomous system that can perceive its environment, make decisions, and take actions to achieve specific goals.

[02:15] The key benefits of AI agents in business include:
- Automated task execution
- 24/7 operational capability  
- Reduced human error
- Scalable operations

[05:30] Let's look at some real-world examples of AI agents in action...

[08:45] Implementation strategies for businesses looking to adopt AI agents:
1. Start with simple, repetitive tasks
2. Gradually increase complexity
3. Monitor and optimize performance
4. Train your team on AI collaboration

[11:20] In conclusion, AI agents represent a significant opportunity for businesses to improve efficiency and reduce costs while maintaining high-quality output.

Thank you for watching! Don't forget to subscribe for more AI and automation content.`

      setProcessedVideo(prev => prev ? { 
        ...prev, 
        transcriptGenerated: true,
        transcript: sampleTranscript
      } : null)
    }
  }

  const handleSaveToRawData = () => {
    // Handle saving transcript to Raw Data (UI-only)
    console.log("Saving transcript to Raw Data...")
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
                />
                <Button type="submit" className="button-primary">
                  <Link className="h-4 w-4 mr-2" />
                  Process
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Processed Video Results */}
      {processedVideo && (
        <div className="space-y-6">
          {/* Video Info Card */}
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-48 h-28 rounded-lg bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                  {/* Video thumbnail would go here */}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{processedVideo.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Channel: {processedVideo.channelName}</span>
                    <span>Duration: {processedVideo.duration}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleExtractAudio}
                      disabled={processedVideo.audioExtracted}
                      variant={processedVideo.audioExtracted ? "secondary" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {processedVideo.audioExtracted ? "Audio Extracted" : "Extract Audio"}
                    </Button>
                    <Button 
                      onClick={handleGenerateTranscript}
                      disabled={!processedVideo.audioExtracted || processedVideo.transcriptGenerated}
                      variant={processedVideo.transcriptGenerated ? "secondary" : "default"}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {processedVideo.transcriptGenerated ? "Transcript Generated" : "Generate Transcript"}
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
                {processedVideo.audioExtracted ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border-2 border-dashed border-border text-center">
                      <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Audio player would appear here</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge className="status-pill status-success">
                        Audio Ready
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Extract audio to begin</p>
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
                {processedVideo.transcriptGenerated ? (
                  <div className="space-y-4">
                    <ScrollArea className="h-64 w-full rounded-lg border p-4">
                      <div className="whitespace-pre-wrap text-sm">
                        {processedVideo.transcript}
                      </div>
                    </ScrollArea>
                    <div className="flex justify-between items-center">
                      <Badge className="status-pill status-success">
                        Transcript Ready
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button onClick={handleSaveToRawData} size="sm" className="button-primary">
                          <Save className="h-4 w-4 mr-2" />
                          Save to Raw Data
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Generate transcript to view content</p>
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
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
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
                  Saved transcripts appear in Raw Data for review before moving to permanent Memory
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}