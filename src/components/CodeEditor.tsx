"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
      Loading editor...
    </div>
  ),
});

interface CodeEditorProps {
  language: string;
  onSubmit: (code: string) => void;
  hints?: string[];
}

export function CodeEditor({ language, onSubmit, hints }: CodeEditorProps) {
  const [code, setCode] = useState(getStarterCode(language));
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  function handleSubmit() {
    if (code.trim()) {
      onSubmit(code);
    }
  }

  function handleNextHint() {
    if (hints && currentHint < hints.length - 1) {
      setCurrentHint((prev) => prev + 1);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-[var(--card-border)] bg-[var(--card)]">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {hints && hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-xs text-[var(--warning)] hover:text-yellow-300 transition-colors"
            >
              {showHints ? "Hide hints" : "Need a hint?"}
            </button>
          )}
          <button
            onClick={() => setCode(getStarterCode(language))}
            className="text-xs text-[var(--muted)] hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hints */}
      {showHints && hints && (
        <div className="flex-shrink-0 px-4 py-3 bg-yellow-900/20 border-b border-yellow-800/30">
          <p className="text-xs text-yellow-200 mb-1">
            Hint {currentHint + 1} of {hints.length}:
          </p>
          <p className="text-sm text-yellow-100">{hints[currentHint]}</p>
          {currentHint < hints.length - 1 && (
            <button
              onClick={handleNextHint}
              className="text-xs text-yellow-400 mt-2 hover:text-yellow-300"
            >
              Show next hint
            </button>
          )}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 4,
            padding: { top: 16 },
            automaticLayout: true,
          }}
        />
      </div>

      {/* Submit bar */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[var(--card-border)] bg-[var(--card)]">
        <button
          onClick={handleSubmit}
          disabled={!code.trim()}
          className="w-full px-4 py-2.5 rounded-lg bg-[var(--success)] text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Code for Review
        </button>
      </div>
    </div>
  );
}

function getStarterCode(language: string): string {
  switch (language) {
    case "python":
      return "# Write your code here\n\n";
    case "javascript":
      return "// Write your code here\n\n";
    case "sql":
      return "-- Write your query here\n\n";
    default:
      return "";
  }
}
