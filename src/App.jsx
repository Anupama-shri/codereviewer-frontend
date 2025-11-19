import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import * as monaco from "monaco-editor";

monaco.editor.defineTheme("myTheme", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editorSuggestWidget.background": "#252526",
    "editorSuggestWidget.foreground": "#d4d4d4",
    "editorSuggestWidget.highlightForeground": "#c586c0",
    "editorSuggestWidget.selectedBackground": "#062f4a",
  },
});

const App = () => {
  const [code, setCode] = useState(`// Write your code here\n`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const isDragging = useRef(false);

  const startDrag = () => {
    isDragging.current = true;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  const onDrag = (e) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  };

  const reviewCode = async () => {
    setLoading(true);
    setReview("");

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/get-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setReview((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
  };

  return (
    <main onMouseMove={onDrag} onMouseUp={stopDrag}>
      {/* LEFT PANEL */}
      <div className="left" style={{ width: `${leftWidth}%` }}>
        <div className="topButtons">
          <button onClick={() => navigator.clipboard.readText().then(setCode)}>
            📥 Paste
          </button>

          <button onClick={reviewCode} disabled={loading}>
            {loading ? "⏳ Reviewing..." : "🚀 Review Code"}
          </button>
        </div>

        <div className="editorContainer">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
            }}
          />
        </div>
      </div>

      {/* DRAG BAR */}
      <div
        className="resizer"
        onMouseDown={startDrag}
        onMouseUp={stopDrag}
      ></div>

      {/* RIGHT PANEL */}
      <div className="right" style={{ width: `${100 - leftWidth}%` }}>
        <div className="topButtons">
          <button onClick={() => navigator.clipboard.writeText(review)}>
            📋 Copy
          </button>
        </div>

        <div className="outputBox">
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </div>
    </main>
  );
};

export default App;
