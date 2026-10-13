import type { LandingPageContent } from "./pageContent";

/**
 * Starting copy for the two ad landing pages — used by the seed script, after
 * which the panel owns it (Pages → Ad landing pages).
 *
 * Drafted 2026-10-13 for the owner to edit before any ad points here. Claims
 * are limited to what the site already makes (fixed written quotes, one team,
 * "we come back and fix it", TrustMark, two finance brokers, a reply within one
 * business day). The price ranges are typical UK figures, not Greentek's —
 * they must be checked against real quotes before going live.
 */
export const LANDING_PAGE_DEFAULTS: Record<
  "lp-kitchen-renovation" | "lp-bathroom-renovation",
  LandingPageContent
> = {
  "lp-kitchen-renovation": {
    metaTitle: "Kitchen Renovation — Free Fixed-Price Quote | Greentek",
    metaDescription:
      "Kitchen renovations across the West Midlands and Wales. One in-house team for design, plumbing, electrics and fitting, with a fixed written price before work starts.",
    heroEyebrow: "Kitchen renovations · West Midlands & Wales",
    heroHeading: "Your new kitchen, fitted by one team at a fixed price",
    heroHighlight: "fixed price",
    heroBody:
      "Design, strip-out, plumbing, electrics, plastering and fitting, all handled by our own team. You get a written quote before we start, and that's what you pay.",
    heroBullets: [
      "Free survey and fixed written quote",
      "Plumbing and electrics done in-house",
      "Spread the cost with monthly finance",
    ],
    heroImage: "/images/projects/Kitchen/Post Kitchen.jpg",
    heroImageAlt: "A finished kitchen renovation by Greentek",
    formHeading: "Get your free kitchen quote",
    formSubheading: "Four quick steps. We reply within one business day.",
    trustPoints: [
      "Fixed-price written quotes",
      "TrustMark registered",
      "One team, start to finish",
      "Finance available",
    ],
    problemHeading: "Planning a new kitchen shouldn't mean managing five trades",
    problemIntro:
      "Most kitchen projects go wrong in the gaps between trades: the fitter waiting on the electrician, the plasterer booked for the wrong week, and a final bill nobody agreed to.\n\nWe do every part of the job with our own team, so there's one person to call and one price to pay.",
    problemCards: [
      {
        title: "Quotes that keep growing",
        body: "A low starting price followed by 'extras' once the old kitchen is out. Ours is fixed in writing before we start.",
      },
      {
        title: "Trades that don't turn up",
        body: "When one trade slips, the whole job stops. Our plumbers, electricians and fitters work to one schedule.",
      },
      {
        title: "Weeks without a kitchen",
        body: "We plan the order of work before day one, so you know how long you'll be without a kitchen.",
      },
      {
        title: "Nobody owns the problem",
        body: "If something isn't right, we come back and fix it, free. There's no passing the blame between trades.",
      },
    ],
    includedHeading: "Everything your kitchen needs, in one quote",
    includedIntro: "No separate quotes to chase. Every quote covers:",
    includedItems: [
      "Design and layout planning",
      "Strip-out and removal of your old kitchen",
      "Plumbing and electrical work by our own team",
      "Plastering, tiling and flooring",
      "Cabinets, worktops and appliance fitting",
      "Clean-up and final sign-off with you",
    ],
    galleryHeading: "Kitchens we've finished",
    galleryIntro: "Real jobs by our team, from strip-out to the finished room.",
    gallery: [
      { image: "/images/projects/Kitchen/Pre kitchen.jpeg", alt: "Kitchen before renovation", caption: "Before" },
      { image: "/images/projects/Kitchen/Post Kitchen.jpg", alt: "The same kitchen after renovation", caption: "After" },
      {
        image: "/images/projects/Examples/Kitchen installation and granite.jpeg",
        alt: "Kitchen installation with granite worktops",
        caption: "Granite worktop installation",
      },
    ],
    reviewsHeading: "What our customers say",
    pricingHeading: "What does a kitchen renovation cost?",
    pricingIntro:
      "Every kitchen is quoted after a free survey, but these ranges show where most projects land.",
    pricingTiers: [
      {
        name: "Refresh",
        price: "From £8,000",
        description: "New units and worktops in your existing layout.",
        features: ["Same layout", "New cabinets and worktops", "Tiling and splashback"],
      },
      {
        name: "Full renovation",
        price: "£15,000–£25,000",
        description: "A new layout with plumbing and electrics moved to suit.",
        features: ["New layout", "Plumbing and electrics moved", "Flooring and plastering"],
      },
      {
        name: "Open-plan",
        price: "£25,000+",
        description: "Walls removed or opened up to create a kitchen-diner.",
        features: ["Structural work", "Building control sign-off", "Full redecoration"],
      },
    ],
    pricingNote:
      "Your price depends on size, layout changes and the units and appliances you choose. The survey and quote are free and there's no obligation.",
    stepsHeading: "How it works",
    steps: [
      { title: "Tell us about your kitchen", body: "Fill in the form or call us. It takes two minutes." },
      { title: "Free survey", body: "We visit, measure up and talk through what you want." },
      { title: "Fixed written quote", body: "You get one clear price that covers every trade." },
      { title: "We build it", body: "Our team does the work to an agreed schedule, then signs it off with you." },
    ],
    guaranteeHeading: "Why homeowners choose Greentek",
    guaranteeItems: [
      {
        title: "Fixed price, no surprises",
        body: "The written quote is what you pay. No inflated final invoice once the job is underway.",
      },
      {
        title: "One team, start to finish",
        body: "Our own plumbers, electricians and fitters, with a single point of contact throughout.",
      },
      {
        title: "We come back and fix it",
        body: "Something not right? We come back and put it right, free. That's our guarantee.",
      },
    ],
    faqHeading: "Kitchen renovation questions",
    faqs: [
      {
        question: "How long does a kitchen renovation take?",
        answer:
          "Most kitchens take two to four weeks once work starts, depending on layout changes and whether walls are moved. We give you a schedule before we begin, so you know how long you'll be without a kitchen.",
      },
      {
        question: "Is the quote really fixed?",
        answer:
          "Yes. After the survey you get a written quote covering every trade, and that's what you pay. The price only changes if you ask for something different during the job, and we agree that with you first.",
      },
      {
        question: "Can I spread the cost?",
        answer:
          "Yes. We work with two credit brokers, Ideal4Finance and Phoenix Financial Consultants, who can help you spread the cost with monthly payments, subject to status.",
      },
      {
        question: "Do you supply the kitchen units?",
        answer:
          "We can supply units, worktops and appliances, or fit ones you've chosen yourself. Either way, the fitting, plumbing and electrics are in one quote.",
      },
      {
        question: "Which areas do you cover?",
        answer:
          "We work across the West Midlands and Wales. Enter your postcode in the form and we'll confirm straight away.",
      },
    ],
    ctaHeading: "Get your free kitchen quote",
    ctaBody:
      "Tell us about your kitchen and we'll come back within one business day to arrange your free survey.",
    quoteButtonLabel: "Get my free quote",
    stickyCallLabel: "Call us",
    stickyQuoteLabel: "Free quote",
  },
  "lp-bathroom-renovation": {
    metaTitle: "Bathroom Renovation — Free Fixed-Price Quote | Greentek",
    metaDescription:
      "Bathroom renovations across the West Midlands and Wales. One in-house team for plumbing, electrics, tiling and fitting, with a fixed written price before work starts.",
    heroEyebrow: "Bathroom renovations · West Midlands & Wales",
    heroHeading: "A new bathroom, fitted by one team at a fixed price",
    heroHighlight: "fixed price",
    heroBody:
      "Strip-out, plumbing, electrics, tiling and fitting, all handled by our own team. You get a written quote before we start, and that's what you pay.",
    heroBullets: [
      "Free survey and fixed written quote",
      "Plumbing and electrics done in-house",
      "Spread the cost with monthly finance",
    ],
    heroImage: "/images/projects/Bathroom/Bathroom Post.jpeg",
    heroImageAlt: "A finished bathroom renovation by Greentek",
    formHeading: "Get your free bathroom quote",
    formSubheading: "Four quick steps. We reply within one business day.",
    trustPoints: [
      "Fixed-price written quotes",
      "TrustMark registered",
      "One team, start to finish",
      "Finance available",
    ],
    problemHeading: "A bathroom refit shouldn't leave you waiting on trades",
    problemIntro:
      "A bathroom needs a plumber, an electrician, a tiler and a fitter, and when they're booked separately the job stalls between them.\n\nWe do every part with our own team, so there's one person to call and one price to pay.",
    problemCards: [
      {
        title: "Quotes that keep growing",
        body: "Hidden leaks and old pipework become 'extras' once the tiles are off. We survey properly and fix the price in writing.",
      },
      {
        title: "Days without a bathroom",
        body: "We plan the order of work before day one, so you know exactly when you'll have a working bathroom again.",
      },
      {
        title: "Leaks and poor tiling",
        body: "Rushed waterproofing shows up months later. Our team tanks, tiles and seals to a standard we sign off.",
      },
      {
        title: "Nobody owns the problem",
        body: "If something isn't right, we come back and fix it, free. There's no passing the blame between trades.",
      },
    ],
    includedHeading: "Everything your bathroom needs, in one quote",
    includedIntro: "No separate quotes to chase. Every quote covers:",
    includedItems: [
      "Design and layout planning",
      "Strip-out and removal of your old suite",
      "Plumbing and electrical work by our own team",
      "Waterproofing, tiling and flooring",
      "Suite, shower, vanity and fittings installed",
      "Clean-up and final sign-off with you",
    ],
    galleryHeading: "Bathrooms we've finished",
    galleryIntro: "A real job by our team, from strip-out to the finished room.",
    gallery: [
      { image: "/images/projects/Bathroom/Bathroom PRE.jpeg", alt: "Bathroom before renovation", caption: "Before" },
      { image: "/images/projects/Bathroom/Bathroom Mid.jpeg", alt: "Bathroom during renovation", caption: "During" },
      { image: "/images/projects/Bathroom/Bathroom Post.jpeg", alt: "The same bathroom after renovation", caption: "After" },
    ],
    reviewsHeading: "What our customers say",
    pricingHeading: "What does a bathroom renovation cost?",
    pricingIntro:
      "Every bathroom is quoted after a free survey, but these ranges show where most projects land.",
    pricingTiers: [
      {
        name: "Refresh",
        price: "From £5,000",
        description: "A new suite and tiling in your existing layout.",
        features: ["Same layout", "New suite and fittings", "Tiling and flooring"],
      },
      {
        name: "Full renovation",
        price: "£8,000–£12,000",
        description: "A new layout with plumbing and electrics moved to suit.",
        features: ["New layout", "Plumbing and electrics moved", "Walk-in shower options"],
      },
      {
        name: "Premium",
        price: "£12,000+",
        description: "Wet rooms, underfloor heating and high-end finishes.",
        features: ["Wet room or tanked shower", "Underfloor heating", "Premium tiles and fittings"],
      },
    ],
    pricingNote:
      "Your price depends on size, layout changes and the suite and tiles you choose. The survey and quote are free and there's no obligation.",
    stepsHeading: "How it works",
    steps: [
      { title: "Tell us about your bathroom", body: "Fill in the form or call us. It takes two minutes." },
      { title: "Free survey", body: "We visit, measure up and talk through what you want." },
      { title: "Fixed written quote", body: "You get one clear price that covers every trade." },
      { title: "We build it", body: "Our team does the work to an agreed schedule, then signs it off with you." },
    ],
    guaranteeHeading: "Why homeowners choose Greentek",
    guaranteeItems: [
      {
        title: "Fixed price, no surprises",
        body: "The written quote is what you pay. No inflated final invoice once the job is underway.",
      },
      {
        title: "One team, start to finish",
        body: "Our own plumbers, electricians and tilers, with a single point of contact throughout.",
      },
      {
        title: "We come back and fix it",
        body: "Something not right? We come back and put it right, free. That's our guarantee.",
      },
    ],
    faqHeading: "Bathroom renovation questions",
    faqs: [
      {
        question: "How long does a bathroom renovation take?",
        answer:
          "Most bathrooms take one to two weeks once work starts, depending on layout changes. We give you a schedule before we begin, so you know when you'll have a working bathroom again.",
      },
      {
        question: "Is the quote really fixed?",
        answer:
          "Yes. After the survey you get a written quote covering every trade, and that's what you pay. The price only changes if you ask for something different during the job, and we agree that with you first.",
      },
      {
        question: "Can I spread the cost?",
        answer:
          "Yes. We work with two credit brokers, Ideal4Finance and Phoenix Financial Consultants, who can help you spread the cost with monthly payments, subject to status.",
      },
      {
        question: "Can you turn a bath into a walk-in shower?",
        answer:
          "Yes. It's one of the most common jobs we do. We move the plumbing, waterproof the area properly and fit the tray or wet-room floor, all in one quote.",
      },
      {
        question: "Which areas do you cover?",
        answer:
          "We work across the West Midlands and Wales. Enter your postcode in the form and we'll confirm straight away.",
      },
    ],
    ctaHeading: "Get your free bathroom quote",
    ctaBody:
      "Tell us about your bathroom and we'll come back within one business day to arrange your free survey.",
    quoteButtonLabel: "Get my free quote",
    stickyCallLabel: "Call us",
    stickyQuoteLabel: "Free quote",
  },
};
