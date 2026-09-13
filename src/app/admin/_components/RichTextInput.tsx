"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, Link2Off, Undo2 } from "lucide-react";

/**
 * Inline rich-text field: bold, italic and links only.
 *
 * Built on contenteditable with execCommand. That API is formally deprecated
 * but is implemented everywhere and has no supported replacement for this job;
 * the alternative is a full editor framework, which is a lot of weight for
 * three formatting options. Everything written here is sanitized server-side
 * on save, so the editor's output is never trusted.
 */
export default function RichTextInput({
  value,
  onChange,
  placeholder,
  multiline = true,
  className = "",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const savedRange = useRef<Range | null>(null);

  // Only write into the DOM when the incoming value and the live content have
  // actually diverged — assigning innerHTML on every render would collapse the
  // caret to the start on each keystroke.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  function emit() {
    onChange(ref.current?.innerHTML ?? "");
  }

  function exec(command: string, argument?: string) {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
  }

  function openLink() {
    rememberSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert("Select the words you want to turn into a link first.");
      return;
    }
    setLinkValue("");
    setLinkOpen(true);
  }

  function applyLink() {
    const href = linkValue.trim();
    if (!href) return;
    // A bare domain is almost always meant as an external link.
    const normalized =
      /^(https?:\/\/|\/|mailto:|tel:|#)/i.test(href) ? href : `https://${href}`;
    ref.current?.focus();
    restoreSelection();
    document.execCommand("createLink", false, normalized);
    emit();
    setLinkOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!multiline && event.key === "Enter") event.preventDefault();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openLink();
    }
  }

  // Paste as plain text so copying from Word or a web page can't drag styling,
  // fonts and stray markup into the site's body copy.
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  }

  const buttonClass =
    "h-7 w-7 grid place-items-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors";

  return (
    <div
      className={`rounded-lg border bg-white/5 transition-all ${
        focused ? "border-[#c5eb02] ring-2 ring-[#c5eb02]/20" : "border-white/15"
      } ${className}`}
    >
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} className={buttonClass} title="Bold (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} className={buttonClass} title="Italic (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-white/10 mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={openLink} className={buttonClass} title="Add link (Ctrl+K)">
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("unlink")} className={buttonClass} title="Remove link">
          <Link2Off className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-white/10 mx-1" />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("removeFormat")} className={buttonClass} title="Clear formatting">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 px-2 py-2 border-b border-white/10 bg-black/30">
          <input
            autoFocus
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="/services/solar-pv-installations  or  https://…"
            className="flex-1 rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02]"
          />
          <button type="button" onClick={applyLink} className="text-xs font-semibold text-[#c5eb02] hover:underline px-1">
            Add
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="text-xs text-white/50 hover:text-white px-1">
            Cancel
          </button>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={() => { setFocused(false); emit(); }}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="rt-field px-3 py-2 text-sm text-white outline-none min-h-[2.5rem] leading-relaxed [&_a]:text-[#c5eb02] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
      />

      <style>{`
        .rt-field:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,.3);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
