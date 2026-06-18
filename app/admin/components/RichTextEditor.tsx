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

  const ToolbarBtn = ({
    onClick,
    title,
    children,
    disabled,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in editor
        onClick();
      }}
      className="p-1.5 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
          <ToolbarBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" strokeWidth={2.5} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("underline")} title="Underline (Ctrl+U)">
            <Underline className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("formatBlock", "h2")} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "h3")} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "p")} title="Paragraph">
            <Pilcrow className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet List">
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => exec("formatBlock", "blockquote")} title="Blockquote">
            <Quote className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn
            onClick={() => { saveSelection(); imageInputRef.current?.click(); }}
            title="Insert Image"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => { saveSelection(); fileInputRef.current?.click(); }}
            title="Attach File"
            disabled={uploading}
          >
            <Paperclip className="h-4 w-4" />
          </ToolbarBtn>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          <ToolbarBtn onClick={() => exec("removeFormat")} title="Clear Formatting">
            <Eraser className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={placeholder}
          className="rich-editor min-h-[300px] p-4 outline-none text-sm text-gray-900"
        />
      </div>
    </>
  );
}
