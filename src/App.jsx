import React, { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import { use } from "react";

const App = () => {
  const [code, setCode] = useState(`// Write your code here`);

  useEffect(() => {
    prism.highlightAll();
  });

  const [review, setReview] = useState(``);

  async function reviewCode() {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/ai/get-review`,
      { code }
    );

    setReview(response.data);
  }
  return (
    <>
      <main>
        <div className="left overflow-hidden p-0">
          <div className="code h-full w-full bg-black">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%",
              }}
            />
          </div>
          <div onClick={reviewCode} className="submit">
            Submit
          </div>
        </div>
        <div className="right">
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </main>
    </>
  );
};

export default App;
