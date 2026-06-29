import React from "react";
import Editor from "react-simple-code-editor";
import { Terminal } from "lucide-react";

export default function CodeEditorPanel({
  code,
  onChange,
  language,
  highlightCode,
}) {
  return (
    <section className="panel editor-panel" aria-label="Code editor">
      <div className="panel-header">
        <div className="panel-title-with-icon">
          <Terminal size={16} color="#38bdf8" />
          <h3>Source Code</h3>
        </div>
        <span className="panel-subtitle">Write or paste your code snippet below</span>
      </div>
      <div className="code-shell">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={highlightCode}
          padding={20}
          textareaClassName="editor-textarea"
          preClassName="editor-preview"
        />
      </div>
    </section>
  );
}
