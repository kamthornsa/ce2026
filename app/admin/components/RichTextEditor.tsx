"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Eraser,
  Pilcrow,
  ImagePlus,
  Paperclip,
  Loader2,
  Link,
  Link2,
  Code2,
  Check,
  X,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const hasInitialized = useRef(false);
  const [uploading, setUploading] = useState(false);

  // URL dialogs
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkUrl, setShowLinkUrl] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // HTML source mode
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState("");

  // Load existing value once (for edit page initial load)
  useEffect(() => {
    if (editorRef.current && !hasInitialized.current && value) {
      editorRef.current.innerHTML = value;
      hasInitialized.current = true;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val ?? undefined);
      editorRef.current?.focus();
      handleInput();
    },
    [handleInput],
  );

  // Save cursor position before file dialog opens (blur happens on click)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore saved cursor and insert HTML at that position
  const insertHtmlAtCursor = (html: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand("insertHTML", false, html);
    handleInput();
  };

  const uploadToMedia = async (file: File): Promise<{ file_path: string; original_name: string } | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt_text", file.name);
    fd.append("title_text", file.name);
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    if (!res.ok) return null;
    return res.json();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadToMedia(file);
      if (data) {
        insertHtmlAtCursor(
          `<img src="${data.file_path}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:4px;margin:8px 0;" />`
        );
      } else {
        alert("Image upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadToMedia(file);
      if (data) {
        insertHtmlAtCursor(
          `<a href="${data.file_path}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
        );
      } else {
        alert("File upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  // Insert image via URL
  const handleInsertImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    insertHtmlAtCursor(
      `<img src="${url}" alt="image" style="max-width:100%;height:auto;border-radius:4px;margin:8px 0;" />`
    );
    setImageUrl("");
    setShowImageUrl(false);
  };

  // Insert link via URL
  const handleInsertLinkUrl = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const label = linkText.trim() || url;
    insertHtmlAtCursor(
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );
    setLinkUrl("");
    setLinkText("");
    setShowLinkUrl(false);
  };

  // Toggle HTML source mode
  const toggleHtmlMode = () => {
    if (!htmlMode) {
      // Switch TO source mode: snapshot current HTML
      const current = editorRef.current?.innerHTML ?? "";
      setRawHtml(current);
      setHtmlMode(true);
    } else {
      // Switch FROM source mode: apply raw HTML back
      if (editorRef.current) {
        editorRef.current.innerHTML = rawHtml;
      }
      onChange(rawHtml);
      setHtmlMode(false);
    }
  };

  const ToolbarBtn = ({
    onClick,
    title,
    children,
    disabled,
    active,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
    active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? "bg-purple-100 text-purple-700" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        .rich-editor:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rich-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
        .rich-editor p  { margin: 0.5rem 0; }
        .rich-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rich-editor blockquote {
          border-left: 4px solid #a78bfa;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
          margin: 0.5rem 0;
        }
        .rich-editor strong, .rich-editor b { font-weight: 700; }
        .rich-editor em, .rich-editor i    { font-style: italic; }
        .rich-editor u  { text-decoration: underline; }
        .rich-editor s  { text-decoration: line-through; }
        .rich-editor img { max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0; }
        .rich-editor a   { color: #7c3aed; text-decoration: underline; }
      `}</style>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
        className="hidden"
        onChange={handleAttachFile}
      />

      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
          <ToolbarBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)" disabled={htmlMode}>
            <Bold className="h-4 w-4" strokeWidth={2.5} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)" disabled={htmlMode}>
            <Italic className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("underline")} title="Underline (Ctrl+U)" disabled={htmlMode}>
            <Underline className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strikethrough" disabled={htmlMode}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("formatBlock", "h2")} title="Heading 2" disabled={htmlMode}>
            <Heading2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title="Heading 3" disabled={htmlMode}>
            <Heading3 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "p")} title="Paragraph" disabled={htmlMode}>
            <Pilcrow className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet List" disabled={htmlMode}>
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered List" disabled={htmlMode}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "blockquote")} title="Blockquote" disabled={htmlMode}>
            <Quote className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Upload image file */}
          <ToolbarBtn
            onClick={() => { saveSelection(); imageInputRef.current?.click(); }}
            title="Insert Image (upload)"
            disabled={uploading || htmlMode}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </ToolbarBtn>

          {/* Insert image via URL */}
          <ToolbarBtn
            onClick={() => {
              saveSelection();
              setShowLinkUrl(false);
              setShowImageUrl((v) => !v);
            }}
            title="Insert Image via URL"
            active={showImageUrl}
            disabled={htmlMode}
          >
            <Link className="h-4 w-4" />
          </ToolbarBtn>

          {/* Attach file (upload) */}
          <ToolbarBtn
            onClick={() => { saveSelection(); fileInputRef.current?.click(); }}
            title="Attach File (upload)"
            disabled={uploading || htmlMode}
          >
            <Paperclip className="h-4 w-4" />
          </ToolbarBtn>

          {/* Insert link via URL */}
          <ToolbarBtn
            onClick={() => {
              saveSelection();
              setShowImageUrl(false);
              setShowLinkUrl((v) => !v);
            }}
            title="Insert Link via URL"
            active={showLinkUrl}
            disabled={htmlMode}
          >
            <Link2 className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear Formatting" disabled={htmlMode}>
            <Eraser className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Toggle HTML source */}
          <ToolbarBtn
            onClick={toggleHtmlMode}
            title={htmlMode ? "Switch to Visual Editor" : "Edit HTML Source"}
            active={htmlMode}
          >
            <Code2 className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        {/* Insert Image URL panel */}
        {showImageUrl && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border-b border-purple-200">
            <span className="text-xs text-purple-700 font-medium whitespace-nowrap">Image URL:</span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInsertImageUrl(); } }}
              placeholder="https://example.com/image.jpg"
              className="flex-1 text-sm px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleInsertImageUrl}
              className="p-1 rounded bg-purple-600 text-white hover:bg-purple-700"
              title="Insert"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setShowImageUrl(false); setImageUrl(""); }}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Insert Link URL panel */}
        {showLinkUrl && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
            <span className="text-xs text-blue-700 font-medium whitespace-nowrap">Link URL:</span>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInsertLinkUrl(); } }}
              placeholder="https://example.com/file.pdf"
              className="flex-1 text-sm px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInsertLinkUrl(); } }}
              placeholder="Display text (optional)"
              className="w-40 text-sm px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleInsertLinkUrl}
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              title="Insert"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setShowLinkUrl(false); setLinkUrl(""); setLinkText(""); }}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* HTML source textarea */}
        {htmlMode && (
          <textarea
            value={rawHtml}
            onChange={(e) => setRawHtml(e.target.value)}
            className="w-full min-h-[300px] p-4 outline-none text-sm text-gray-900 font-mono bg-gray-900 text-green-400 resize-y"
            spellCheck={false}
          />
        )}

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable={!htmlMode}
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className={`rich-editor min-h-[300px] p-4 outline-none text-sm text-gray-900 ${htmlMode ? "hidden" : ""}`}
        />
      </div>
    </>
  );
}
