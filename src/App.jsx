import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const App = () => {
  const [code, setCode] = useState(`// Write your code here\n`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const reviewRef = useRef(null);

  // COPY
  const copyToClipboard = () => {
    navigator.clipboard.writeText(review);
    alert("Copied!");
  };

  // PASTE
  const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    setCode(text);
  };

  // STREAMING AI RESPONSE
  const reviewCode = async () => {
    setLoading(true);
    setReview("");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/ai/get-review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      setReview((prev) => prev + chunk);
    }

    setLoading(false);
  };

  return (
    <main>
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
            theme="vs-dark"
            language="javascript"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="topButtons">
          <button onClick={copyToClipboard}>📋 Copy</button>
        </div>

        <div ref={reviewRef} className="outputBox">
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </div>
    </main>
  );
};

export default App;
