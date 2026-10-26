import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set(["input", "if", "else", "return", "for", "while", "void", "bool", "true", "false", "const", "static", "break", "continue"]);
const TYPES = new Set(["int", "double", "string", "datetime", "CTrade", "long", "ulong"]);
const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(#\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/gm;

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(code.slice(last, idx));
    const [t, comment, str, pre, num, word] = m;
    let cls = "";
    if (comment) cls = "text-code-comment italic";
    else if (str) cls = "text-code-string";
    else if (pre) cls = "text-code-preproc";
    else if (num) cls = "text-code-number";
    else if (word && KEYWORDS.has(word)) cls = "text-code-keyword";
    else if (word && (TYPES.has(word) || /^[A-Z][A-Z_]+$/.test(word))) cls = "text-code-type";
    out.push(cls ? <span key={k++} className={cls}>{t}</span> : t);
    last = idx + t.length;
  }
  out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code, filename, className, lineNumbers }: { code: string; filename?: string; className?: string; lineNumbers?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const lines = code.split("\n");
  return (
    <div className={cn("overflow-hidden rounded-md border bg-terminal", className)}>
      <div className="flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono">{filename ?? "mq5"}</span>
        <button onClick={copy} className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent hover:text-foreground" aria-label="Copy code">
          {copied ? <Check className="h-3.5 w-3.5 text-profit" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scrollbar-thin overflow-auto p-3 font-mono text-xs leading-relaxed">
        {lineNumbers ? (
          <code className="grid grid-cols-[auto_1fr] gap-x-4">
            {lines.map((l, i) => (
              <div key={i} className="contents">
                <span className="select-none text-right text-code-comment">{i + 1}</span>
                <span className="whitespace-pre">{highlight(l)}</span>
              </div>
            ))}
          </code>
        ) : (
          <code>{highlight(code)}</code>
        )}
      </pre>
    </div>
  );
}
