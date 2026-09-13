"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import RichTextInput from "./RichTextInput";
import type { FaqItem } from "@/data/pages";

/**
 * Per-page FAQ editor. Submits parallel `faq_question` / `faq_answer` fields
 * read back by `parseFaqs()`.
 *
 * Answers are rich text so they can carry links, and the counter nudges toward
 * 40–60 words — long enough to stand alone as an answer an AI assistant can
 * quote, short enough that it doesn't get truncated.
 */
export default function FaqEditor({ initial }: { initial?: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initial?.length ? initial : []);

  function update(index: number, patch: Partial<FaqItem>) {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function move(index: number, direction: -1 | 1) {
    setFaqs((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const words = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">FAQs</h3>
          <p className="text-xs text-white/40">
            Answers questions real customers ask. Output as FAQPage schema automatically.
          </p>
        </div>
        <span className="text-xs text-white/40">{faqs.length} question{faqs.length === 1 ? "" : "s"}</span>
      </div>

      {faqs.length === 0 && (
        <p className="text-xs text-white/40 border border-dashed border-white/10 rounded-lg px-4 py-6 text-center">
          No FAQs yet. Five to eight per page is the target.
        </p>
      )}

      {faqs.map((faq, index) => {
        const count = words(faq.answer ?? "");
        const tone = count === 0 ? "text-white/30" : count < 25 ? "text-amber-300" : count <= 80 ? "text-green-400" : "text-amber-300";
        return (
          <div key={index} className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5">
            <input type="hidden" name="faq_question" value={faq.question ?? ""} />
            <input type="hidden" name="faq_answer" value={faq.answer ?? ""} />

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/50">Q{index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                  className="h-7 w-7 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === faqs.length - 1}
                  className="h-7 w-7 grid place-items-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-25">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== index))}
                  className="h-7 w-7 grid place-items-center rounded text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <input
              value={faq.question ?? ""}
              onChange={(e) => update(index, { question: e.target.value })}
              placeholder="How much does a heat pump cost in the West Midlands?"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />

            <div>
              <RichTextInput
                value={faq.answer ?? ""}
                onChange={(answer) => update(index, { answer })}
                placeholder="Answer it directly in the first sentence, then add detail…"
              />
              <p className={`text-xs mt-1 ${tone}`}>
                {count} words · aim for 40–60
              </p>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])}
        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:border-[#c5eb02]/50 transition-colors"
      >
        + Add question
      </button>
    </div>
  );
}
