import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./app.css"; // your CSS file

const App = () => {
  const [code, setCode] = useState(`// Write your code here\n`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const dividerRef = useRef(null);
  const containerRef = useRef(null);

  // --------------------------
  // 📌 COPY OUTPUT
  // --------------------------
  const copyToClipboard = () => {
    navigator.clipboard.writeText(review);
    alert("Copied!");
  };

  // --------------------------
  // 📌 PASTE INPUT
  // --------------------------
  const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    setCode(text);
  };

  // --------------------------
  // 📌 NORMAL (Non-Streaming) API CALL
  // --------------------------
  const reviewCode = async () => {
    setLoading(true);
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/get-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const text = await response.text();
    setReview(text);
    setLoading(false);
  };

  // --------------------------
  // 📌 RESIZABLE PANELS
  // --------------------------
  const startDragging = (e) => {
    e.preventDefault();

    const containerWidth = containerRef.current.offsetWidth;

    const onMouseMove = (e) => {
      const newLeftWidth = (e.clientX / containerWidth) * 100;

      if (newLeftWidth > 20 && newLeftWidth < 80) {
        containerRef.current.style.gridTemplateColumns = `${newLeftWidth}% 1fr`;
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <main ref={containerRef} className="container">
      {/* LEFT SIDE */}
      <div className="left">
        <div className="topButtons">
          <button onClick={pasteFromClipboard}>📥 Paste</button>

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
            onChange={(val) => setCode(val || "")}
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

      {/* DRAG DIVIDER */}
      <div
        ref={dividerRef}
        className="dragDivider"
        onMouseDown={startDragging}
      ></div>

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="topButtons">
          <button onClick={copyToClipboard}>📋 Copy</button>
        </div>

        <div className="outputBox">
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </div>
    </main>
  );
};

export default App;
