import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js/lib/common";

marked.setOptions({
  gfm: true,
  breaks: true
});

export default function MarkdownRenderer({ content }) {
  const sanitized = useMemo(() => {
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
      let highlighted = "";
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(code, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
      return `
        <div class="code-block">
          <div class="code-header">
            <div class="dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <button class="code-copy" type="button">复制</button>
          </div>
          <pre><code class="hljs ${language ? `language-${language}` : ""}">${highlighted}</code></pre>
        </div>
      `;
    };
    const html = marked.parse(content || "", { renderer });
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }, [content]);

  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: sanitized }}
      onClick={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.classList.contains("code-copy")) return;
        const block = target.closest(".code-block");
        if (!block) return;
        const code = block.querySelector("code");
        if (!code) return;
        const text = code.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          target.textContent = "已复制";
          window.setTimeout(() => {
            target.textContent = "复制";
          }, 1500);
        });
      }}
    />
  );
}
