import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/ui/sidebar";
import { ChevronRight, Save, Upload, FileText, BookOpen, Bot, History } from "lucide-react";

// Editor Top Toolbar
function EditorToolbar() {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-1"><Save className="h-4 w-4" /> Save</Button>
        <Button variant="outline" className="gap-1"><Upload className="h-4 w-4" /> Export EPUB</Button>
        <Button variant="outline" className="gap-1"><History className="h-4 w-4" /> Version History</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Project Title" defaultValue="Untitled Draft" className="w-64" />
      </div>
    </div>
  );
}

// Sidebar with Outline / Notes / Research / KB
function EditorSidebar() {
  return (
    <Tabs defaultValue="outline" className="h-full w-64 border-r">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="outline">Outline</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="research">Research</TabsTrigger>
        <TabsTrigger value="kb">KB</TabsTrigger>
      </TabsList>
      <TabsContent value="outline" className="p-3 text-sm space-y-2">
        <div>Chapter 1: Opening Scene</div>
        <div>Chapter 2: Rising Action</div>
        <div>Chapter 3: Conflict</div>
      </TabsContent>
      <TabsContent value="notes" className="p-3">
        <Textarea placeholder="Author notes…" />
      </TabsContent>
      <TabsContent value="research" className="p-3">
        <div className="space-y-2 text-sm">
          <div>📑 Research link #1</div>
          <div>📑 Research link #2</div>
        </div>
      </TabsContent>
      <TabsContent value="kb" className="p-3">
        <div className="text-sm">Trey KnowledgeBase_AI snippets here</div>
      </TabsContent>
    </Tabs>
  );
}

// Trey AI panel (dockable)
function TreyPanel() {
  const [open, setOpen] = useState(true);
  if (!open) return (
    <Button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 gap-1"><Bot className="h-4 w-4" /> Trey</Button>
  );
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
      className="fixed bottom-4 right-4 w-80 h-96 bg-card shadow-lg border rounded-lg flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="font-medium flex items-center gap-2"><Bot className="h-4 w-4" /> Trey AI</div>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>✕</Button>
      </div>
      <div className="flex-1 p-2 overflow-auto text-sm space-y-2">
        <div className="bg-muted p-2 rounded">Hello, what do you need help with?</div>
      </div>
      <div className="p-2 border-t flex gap-2">
        <Input placeholder="Ask Trey…" />
        <Button size="sm">Send</Button>
      </div>
    </motion.div>
  );
}

export default function EditorPage() {
  return (
    <div className="flex flex-col h-screen">
      <EditorToolbar />
      <div className="flex flex-1">
        <EditorSidebar />
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 m-3">
            <CardHeader><CardTitle>Draft Editor</CardTitle></CardHeader>
            <CardContent>
              <Textarea className="h-[70vh]" placeholder="Start writing your chapter…" />
            </CardContent>
          </Card>
        </div>
      </div>
      <TreyPanel />
    </div>
  );
}