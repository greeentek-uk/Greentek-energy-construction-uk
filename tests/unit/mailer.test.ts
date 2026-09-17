import { describe, expect, it, vi } from "vitest";

const sent = vi.hoisted(() => [] as Record<string, string>[]);
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: async (m: Record<string, string>) => void sent.push(m) }) },
}));

import { sendQuoteRequestEmail } from "@/lib/mailer";

describe("sendQuoteRequestEmail", () => {
  it("labels answers, lists photos and escapes everything the visitor typed", async () => {
    vi.stubEnv("GMAIL_USER", "site@example.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "x");
    vi.stubEnv("CONTACT_TO_EMAIL", "team@example.com");

    await sendQuoteRequestEmail({
      enquiry_number: 12,
      full_name: "Jo <b>Bloggs</b>",
      email: "jo@example.com",
      phone: "07700900123",
      postcode: "WV1 1AA",
      service: "energy_heat_pump",
      property_type: "commercial",
      is_homeowner: "buying",
      timeline: "1_3_months",
      budget: "50k_100k",
      message: "<script>alert(1)</script>\nSecond line",
      source: "Homepage hero",
      photos: ["https://res.cloudinary.com/demo/image/upload/v1/enquiry-photos/00012/a.jpg"],
    });

    const mail = sent[0];
    expect(mail.to).toBe("team@example.com");
    expect(mail.replyTo).toBe("jo@example.com");
    expect(mail.subject).toBe("New quote request #12 — Jo <b>Bloggs</b> (Energy — Air source heat pump)");
    for (const text of ["Enquiry: #12", "Property owner?: Buying the property", "Timeline: Within 1–3 months", "Budget: £50,000–£100,000", "Photos: 1"]) {
      expect(mail.text).toContain(text);
    }
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>Bloggs");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("Second line");
    expect(mail.html).toContain('href="https://res.cloudinary.com/demo/image/upload/v1/enquiry-photos/00012/a.jpg"');
    expect(mail.html).toContain("/image/upload/c_fill,w_240,h_180,f_jpg,q_auto/v1/enquiry-photos/00012/a.jpg");
  });

  it("fails loudly when email isn't configured", async () => {
    vi.stubEnv("GMAIL_USER", "");
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    await expect(
      sendQuoteRequestEmail({ full_name: "a", email: "b", phone: "c", postcode: "d", service: "e", property_type: "", is_homeowner: "", timeline: "", message: "" }),
    ).rejects.toThrow(/not configured/);
  });
});
