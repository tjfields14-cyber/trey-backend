import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Copy, Pin, Sparkles } from "lucide-react";

// KB Result Card
function KBCard({ title, tags, snippet }:{title:string; tags:string[]; snippet:string}) {
  return (
    <Card className="hover:shadow-sm transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground line-clamp-3">{snippet}</div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">{tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Open</Button>
            <Button size="sm" variant="ghost" className="gap-1"><Copy className="h-4 w-4" /> Copy</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chat bubble
function Bubble({ who, text }:{who:"user"|"trey"; text:string}) {
  const isUser = who === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isUser ? "bg-black text-white" : "bg-muted"}`}>
        {text}
      </div>
    </div>
  );
}

export default function TreyAIPage() {
  const results = [
    { title: "Runner Setup (Windows)", tags: ["devops","ci"], snippet: "Install the GitHub Actions runner on Windows and point it to the E:\deployments root…"},
    { title: "Prior Art Search Checklist", tags: ["patent","ip"], snippet: "Document the keywords, time range, markets, and classification codes before search…"},
    { title: "Business Plan — Payroll", tags: ["finance","planning"], snippet: "Baseline payroll for core roles: PM, DevOps, Backend, Frontend, Patent Officer, PA…"},
  ];

  const chat = [
    { who: "user" as const, text: "Trey, create a rollback checklist for the latest deployment." },
    { who: "trey" as const, text: "Checklist drafted: 1) Switch symlink to previous release 2) Restore DB snapshot 3) Verify health endpoints…" },
    { who: "user" as const, text: "Great. Summarize runner install steps for HP Omen on Windows 11." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trey AI & KnowledgeBase</h1>
            <p className="text-sm text-muted-foreground">Search KB, chat with Trey, and pin answers into your projects.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 w-[420px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search KnowledgeBase…" className="pl-9" />
            </div>
            <Button variant="outline" className="gap-1"><Sparkles className="h-4 w-4" /> New Note</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Tabs defaultValue="results">
              <TabsList>
                <TabsTrigger value="results">KB Results</TabsTrigger>
                <TabsTrigger value="notes">My Pinned</TabsTrigger>
              </TabsList>
              <TabsContent value="results" className="space-y-3 mt-3">
                {results.map(r => <KBCard key={r.title} {...r} />)}
              </TabsContent>
              <TabsContent value="notes" className="space-y-3 mt-3">
                <Card><CardContent className="py-6 text-sm text-muted-foreground">No pinned notes yet.</CardContent></Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="xl:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Chat with Trey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-[380px] rounded-md border p-3 bg-white">
                  <div className="space-y-2">
                    {chat.map((m, idx) => <Bubble key={idx} who={m.who} text={m.text} />)}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                  <Input placeholder="Ask Trey…" />
                  <Button className="gap-1"><Send className="h-4 w-4" /> Send</Button>
                  <Button variant="outline" className="gap-1"><Pin className="h-4 w-4" /> Pin</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
