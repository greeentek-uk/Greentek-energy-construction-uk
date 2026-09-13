import { sanitizeRichText } from "@/lib/richText";
import type { FaqItem } from "@/data/pages";

/** Reads a `<FaqEditor>` submission back into FaqItem[], dropping incomplete rows. */
export function parseFaqs(formData: FormData): FaqItem[] {
  const questions = formData.getAll("faq_question") as string[];
  const answers = formData.getAll("faq_answer") as string[];

  return questions
    .map((question, i) => ({
      question: String(question ?? "").trim(),
      answer: sanitizeRichText(answers[i] ?? ""),
    }))
    // A question with no answer produces invalid FAQPage markup, which Google
    // reports as an error against the whole page — so both are required.
    .filter((faq) => faq.question && faq.answer);
}
