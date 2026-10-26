// Service layer. Components call ONLY these functions.
// Replace the bodies with real API calls later; signatures stay the same.
import {
  backtestRuns,
  buildRun,
  compileErrors,
  engineStatus,
  fileTree,
  initialMessages,
  parametersSet,
  strategies,
  strategyFiles,
  terminalLogs,
  usage,
  type BacktestRun,
  type Message,
  type WorkspaceStatus,
} from "@/mockData";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

let runs = clone(backtestRuns);

export async function getWorkspaceStatus(): Promise<{ status: WorkspaceStatus; startedAt: number }> {
  await wait(100);
  return { status: "running", startedAt: Date.now() - (2 * 3600 + 17 * 60 + 9) * 1000 };
}

export async function getUsage() {
  return clone(usage);
}

export async function getEngineStatus() {
  return clone(engineStatus);
}

export async function getStrategies() {
  await wait(150);
  return clone(strategies);
}

export async function getMessages(_strategyId: string) {
  await wait(200);
  return clone(initialMessages);
}

export async function sendMessage(_strategyId: string, text: string): Promise<Message> {
  await wait(1500);
  return {
    id: crypto.randomUUID(),
    role: "agent",
    content: `On it. I've updated the strategy based on "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}" and recompiled it. Want me to run a fresh backtest to compare with version 3?`,
    tools: [
      { id: crypto.randomUUID(), tool: "File", label: "edited EMA_Cross.mq5", status: "done", durationMs: 280, output: "+6 −2 lines" },
      { id: crypto.randomUUID(), tool: "MetaEditor", label: "compile EMA_Cross.mq5", status: "done", durationMs: 1720, output: "0 errors, 0 warnings" },
    ],
  };
}

export async function getBacktestRuns(_strategyId: string) {
  await wait(150);
  return clone(runs);
}

export async function runBacktest(
  _strategyId: string,
  onProgress: (p: number) => void,
): Promise<BacktestRun> {
  for (let p = 0; p <= 100; p += 5) {
    onProgress(p);
    await wait(150);
  }
  const run = buildRun(`v${runs.length + 1}`, runs.length);
  runs = [...runs, run];
  return clone(run);
}

export async function getStrategyFiles(_strategyId: string, version: string) {
  await wait(120);
  return clone((strategyFiles[version] ?? strategyFiles["v3"])!);
}

export async function getCompileErrors(_strategyId: string, _version: string) {
  return clone(compileErrors);
}

export async function getFileTree(_strategyId: string) {
  return clone(fileTree);
}

export async function getParametersFile(_strategyId: string) {
  return parametersSet;
}

export async function getTerminalLogs() {
  return [...terminalLogs];
}

export async function downloadStrategy(
  strategyId: string,
  version: string,
  type: "mq5" | "ex5" | "zip",
) {
  const files = (strategyFiles[version] ?? strategyFiles["v3"])!;
  const name = type === "zip" ? `EMA_Cross_${version}.zip` : type === "mq5" ? files.mq5.filename : files.ex5.filename;
  const content = type === "mq5" ? files.mq5.source : `Mock ${type} file for ${strategyId} ${version}`;
  const url = URL.createObjectURL(new Blob([content], { type: "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return name;
}
