"use client"

import { useState } from "react"
import { Database, Plus, Edit, Archive, Download, Pin, Trash2, Upload, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function Memory() {
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [showAddMemory, setShowAddMemory] = useState(false)
  
  const [newMemory, setNewMemory] = useState({
    tag: "",
    key: "",
    value: "",
    scope: "user",
  })

  const userMemoryItems = [
    {
      id: "1",
      tag: "preference",
      key: "timezone",
      value: "UTC-8",
      scope: "User",
      lastUpdated: "2024-01-15",
    },
    {
      id: "2",
      tag: "context",
      key: "company_name",
      value: "TechCorp Inc",
      scope: "Workspace",
      lastUpdated: "2024-01-10",
    },
    {
      id: "3",
      tag: "setting",
      key: "notification_style",
      value: "minimal",
      scope: "User",
      lastUpdated: "2024-01-12",
    },
  ]

  const agentMemoryItems = [
    {
      id: "1",
      key: "last_task_context",
      value: "Analyzing customer feedback for Q4 report",
      pinned: true,
      timestamp: "2024-01-15 14:30",
    },
    {
      id: "2",
      key: "user_preferences",
      value: "Prefers detailed explanations, technical depth",
      pinned: false,
      timestamp: "2024-01-14 09:15",
    },
    {
      id: "3",
      key: "session_state",
      value: "Working on dashboard improvements",
      pinned: false,
      timestamp: "2024-01-15 16:45",
    },
  ]

  const documents = [
    {
      id: "1",
      name: "Company Guidelines.pdf",
      size: "2.4 MB",
      uploadedDate: "2024-01-15",
    },
    {
      id: "2",
      name: "API Documentation.md",
      size: "156 KB",
      uploadedDate: "2024-01-14",
    },
    {
      id: "3",
      name: "Meeting Notes Q4.docx",
      size: "89 KB",
      uploadedDate: "2024-01-13",
    },
  ]

  const handleAddMemory = () => {
    // Handle adding memory (UI-only)
    setShowAddMemory(false)
    setNewMemory({ tag: "", key: "", value: "", scope: "user" })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Memory</h1>
        <p className="text-muted-foreground mt-1">
          Manage persistent memory items across sessions
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
          Memory items persist across sessions. Manage carefully.
        </p>
      </div>

      {/* Memory Tabs */}
      <Tabs defaultValue="user" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            User Memory
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Agent Memory
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* User Memory Tab */}
        <TabsContent value="user" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Memory Items</CardTitle>
                  <CardDescription>
                    Persistent key-value pairs for user and workspace context
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button className="button-primary" onClick={() => setShowAddMemory(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMemoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="secondary">{item.tag}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.key}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.value}</TableCell>
                      <TableCell>
                        <Badge className={item.scope === "User" ? "status-pill status-info" : "status-pill status-success"}>
                          {item.scope}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Memory Tab */}
        <TabsContent value="agent" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agent Memory Items</CardTitle>
                  <CardDescription>
                    Context and state information maintained by agents
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="content-agent">Content Agent</SelectItem>
                      <SelectItem value="data-agent">Data Agent</SelectItem>
                      <SelectItem value="analysis-agent">Analysis Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive">
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Agent Memory</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all memory items for the selected agent. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground">
                          Clear Memory
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentMemoryItems.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">{item.key}</span>
                          {item.pinned && <Pin className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title={item.pinned ? "Unpin" : "Pin"}>
                          <Pin className={`h-4 w-4 ${item.pinned ? "text-amber-500" : ""}`} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Memory Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this memory item? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>Document Storage</CardTitle>
              <CardDescription>
                Upload and manage documents for agent reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag-Drop Zone */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <Button variant="outline">
                  Browse Files (UI-only)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: PDF, DOC, DOCX, TXT, MD (Max 10MB)
                </p>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Uploaded Documents</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Clear Scoped Memory
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Scoped Memory</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all documents and their associated memory. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground">
                          Clear All Documents
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Upload className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.size} • Uploaded {doc.uploadedDate}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Memory Dialog */}
      <Dialog open={showAddMemory} onOpenChange={setShowAddMemory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Memory Item</DialogTitle>
            <DialogDescription>
              Create a new persistent memory item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  value={newMemory.tag}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="e.g., preference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={newMemory.scope} onValueChange={(value) => setNewMemory(prev => ({ ...prev, scope: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                value={newMemory.key}
                onChange={(e) => setNewMemory(prev => ({ ...prev, key: e.target.value }))}
                placeholder="e.g., timezone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Textarea
                id="value"
                value={newMemory.value}
                onChange={(e) => setNewMemory(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter the value..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemory(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMemory} className="button-primary">
              Add Memory Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}