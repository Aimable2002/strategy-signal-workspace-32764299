import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/workspace/TopBar";
import { Sidebar } from "@/components/workspace/Sidebar";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { FilesTab, ResultsTab, RunsTab, SettingsTab, StrategyTab, TerminalTab } from "@/components/workspace/Panels";
import * as api from "@/services/api";
import type { BacktestRun, Message, Strategy, WorkspaceStatus } from "@/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tickforge — AI strategy workspace for MT5" },
      { name: "description", content: "Describe a trading idea; an AI agent writes, compiles and backtests it in MT5." },
      { property: "og:title", content: "Tickforge — AI strategy workspace for MT5" },
      { property: "og:description", content: "Describe a trading idea; an AI agent writes, compiles and backtests it in MT5." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const [status, setStatus] = useState<WorkspaceStatus>("running");
  const [startedAt, setStartedAt] = useState(Date.now());
  const [deleted, setDeleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [strategies, setStrategies] = useState<Strategy[] | null>(null);
  const [activeId, setActiveId] = useState("s1");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [pending, setPending] = useState(false);
  const [runs, setRuns] = useState<BacktestRun[] | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof api.getEngineStatus>> | null>(null);
  const [usage, setUsage] = useState({ used: 0, limit: 40 });
  const [tab, setTab] = useState("results");

  useEffect(() => {
    api.getWorkspaceStatus().then((w) => { setStatus(w.status); setStartedAt(w.startedAt); });
    api.getStrategies().then(setStrategies);
    api.getEngineStatus().then(setEngine);
    api.getUsage().then(setUsage);
  }, []);
  useEffect(() => {
    setMessages(null);
    api.getMessages(activeId).then(setMessages);
    api.getBacktestRuns(activeId).then(setRuns);
  }, [activeId]);

  const stopped = status !== "running";
  const start = () => { setStatus("starting"); setTimeout(() => { setStatus("running"); setStartedAt(Date.now()); }, 2000); };
  const send = async (text: string) => {
    setMessages((m) => [...(m ?? []), { id: crypto.randomUUID(), role: "user", content: text }]);
    setPending(true);
    const reply = await api.sendMessage(activeId, text);
    setMessages((m) => [...(m ?? []), reply]);
    setPending(false);
  };
  const runBacktest = async () => {
    setTab("results");
    const run = await api.runBacktest(activeId, setProgress);
    setRuns((r) => [...(r ?? []), run]);
    setProgress(null);
  };
  const download = (v: string, t: "mq5" | "ex5" | "zip") => api.downloadStrategy(activeId, v, t);
  const latest = runs?.[runs.length - 1] ?? null;

  if (deleted) {
    return (
      <div className="flex h-[calc(100vh-3rem)] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-lg font-semibold">Workspace deleted</h1>
        <p className="text-sm text-muted-foreground">Your workspace and its files were removed.</p>
        <button className="mt-3 text-sm text-primary underline" onClick={() => { setDeleted(false); start(); }}>Create a new workspace</button>
      </div>
    );
  }

  const chat = <ChatPanel messages={messages} pending={pending} onSend={send} onDownload={(t) => download("v3", t)} disabled={stopped} />;
  const panels = {
    results: <ResultsTab run={latest} progress={progress} />,
    runs: <RunsTab runs={runs} />,
    strategy: <StrategyTab strategyId={activeId} runs={runs} onDownload={download} />,
    files: <FilesTab strategyId={activeId} onDownload={(t) => download("v3", t)} />,
    terminal: <TerminalTab />,
    settings: <SettingsTab onRun={runBacktest} progress={progress} disabled={stopped} />,
  };
  const labels: Record<string, string> = { results: "Results", runs: "Runs", strategy: "Strategy", files: "Files", terminal: "Terminal", settings: "Backtest settings" };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <TopBar status={status} startedAt={startedAt} onStart={start} onStop={() => setStatus("stopped")} onDelete={() => setDeleted(true)} usage={usage} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      {stopped && (
        <div className="border-b bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground">
          {status === "starting" ? "Starting your workspace…" : "Workspace is stopped. Start it to continue working with the agent."}
        </div>
      )}
      <div className={cn("flex min-h-0 flex-1 transition-opacity", stopped && "pointer-events-none opacity-50")}>
        <div className={cn("hidden lg:block", !sidebarOpen && "lg:hidden")}>
          <Sidebar strategies={strategies} activeId={activeId} onSelect={setActiveId} onNew={() => setMessages([])} engine={engine} />
        </div>
        <div className="hidden min-w-0 flex-1 lg:flex">{chat}</div>
        <Tabs value={tab} onValueChange={setTab} className="hidden w-[480px] shrink-0 flex-col gap-0 border-l bg-panel lg:flex xl:w-[540px]">
          <TabsList className="scrollbar-thin m-2 h-auto flex-wrap justify-start">
            {Object.keys(panels).map((k) => <TabsTrigger key={k} value={k} className="text-xs">{labels[k]}</TabsTrigger>)}
          </TabsList>
          {Object.entries(panels).map(([k, el]) => (
            <TabsContent key={k} value={k} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 pb-4">{el}</TabsContent>
          ))}
        </Tabs>
        <Tabs defaultValue="chat" className="flex min-w-0 flex-1 flex-col gap-0 lg:hidden">
          <TabsList className="m-2 justify-start overflow-x-auto">
            {["chat", "results", "strategy", "files", "terminal"].map((k) => <TabsTrigger key={k} value={k} className="text-xs">{k === "chat" ? "Chat" : labels[k]}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="chat" className="min-h-0 flex-1">{chat}</TabsContent>
          {(["results", "strategy", "files", "terminal"] as const).map((k) => (
            <TabsContent key={k} value={k} className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">{panels[k]}</TabsContent>
          ))}
        </Tabs>
      </div>
      <footer className="border-t px-4 py-1 text-center text-[11px] text-muted-foreground">Backtests are historical simulations. No real trades are placed.</footer>
    </div>
  );
}
