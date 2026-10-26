import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, CheckCircle2, ChevronRight, FileCode2, FileDown, Loader2, XCircle, Cpu } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeBlock } from "./CodeBlock";
import type { Message, ToolCall } from "@/mockData";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Backtest this strategy", "Optimize parameters", "Add a stop loss", "Test on a different pair", "Explain the results"];

function ToolCard({ t }: { t: ToolCall }) {
  return (
    <Collapsible className="rounded-md border bg-card text-xs">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-accent/50">
        <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
        {t.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-profit" />}
        {t.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
        {t.status === "failed" && <XCircle className="h-3.5 w-3.5 text-warning" />}
        <span className="font-medium">{t.tool}</span>
        <span className="text-muted-foreground">·</span>
        <span className="truncate font-mono text-muted-foreground">{t.label}</span>
        <span className="ml-auto font-mono text-muted-foreground">{t.durationMs < 1000 ? `${t.durationMs}ms` : `${(t.durationMs / 1000).toFixed(1)}s`}</span>
      </CollapsibleTrigger>
      {t.output && (
        <CollapsibleContent className="border-t px-3 py-2 font-mono text-muted-foreground">
          {t.output}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function renderText(s: string) {
  return s.split("\n").map((line, i) => (
    <p key={i} className={cn(!line && "h-2")}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => part.startsWith("**") ? <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong> : part)}
    </p>
  ));
}

function AgentMessage({ m, onDownload }: { m: Message; onDownload: (t: "mq5" | "ex5") => void }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-card"><Bot className="h-4 w-4 text-primary" /></div>
      <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed text-foreground/90">
        {m.content && <div className="space-y-1">{renderText(m.content)}</div>}
        {m.tools && <div className="space-y-1.5">{m.tools.map((t) => <ToolCard key={t.id} t={t} />)}</div>}
        {m.code && <CodeBlock code={m.code.code} filename="EMA_Cross.mq5" />}
        {m.working && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs"><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />{m.working.label}<span className="ml-auto font-mono">{m.working.progress}%</span></div>
            <Progress value={m.working.progress} className="h-1.5" />
          </div>
        )}
        {m.downloads && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onDownload("mq5")} className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 font-mono text-xs hover:border-primary/60"><FileCode2 className="h-3.5 w-3.5 text-primary" />{m.downloads.mq5}</button>
            <button onClick={() => onDownload("ex5")} className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 font-mono text-xs hover:border-primary/60"><FileDown className="h-3.5 w-3.5 text-primary" />{m.downloads.ex5}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({ messages, pending, onSend, onDownload, disabled }: {
  messages: Message[] | null; pending: boolean; onSend: (t: string) => void; onDownload: (t: "mq5" | "ex5") => void; disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages?.length, pending]);

  const submit = () => {
    if (!input.trim() || pending || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col">
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {!messages && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          {messages?.length === 0 && (
            <div className="py-20 text-center">
              <Cpu className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h2 className="text-lg font-semibold">Describe a trading idea</h2>
              <p className="mt-1 text-sm text-muted-foreground">The agent will write, compile and backtest it for you.</p>
            </div>
          )}
          {messages?.map((m) => m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-secondary px-3.5 py-2.5 text-sm">{m.content}</div>
            </div>
          ) : <AgentMessage key={m.id} m={m} onDownload={onDownload} />)}
          {pending && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-card"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
              Agent is working...
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="border-t bg-panel p-3">
        <div className="mx-auto max-w-3xl">
          <div className="scrollbar-thin mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="shrink-0 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground">{s}</button>
            ))}
          </div>
          <div className="relative">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} disabled={disabled}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder={disabled ? "Workspace is stopped. Start it to chat with the agent." : "Describe a strategy or ask the agent to change something…"}
              className="min-h-[52px] resize-none bg-card pr-12 text-sm" rows={2} />
            <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8" onClick={submit} disabled={!input.trim() || pending || disabled} aria-label="Send">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
