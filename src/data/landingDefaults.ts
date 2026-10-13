import type { LandingPageContent } from "./pageContent";

const P = "/images/projects";

const shared = {
  ratingText: "Excellent on Trustpilot · 500+ projects completed",
  quoteButtonLabel: "Get my free quote",
  socialProofLine: "Join 500+ homeowners across the West Midlands & Wales",
  stats: [
    { value: "500+", label: "projects completed" },
    { value: "25+", label: "years' combined experience" },
    { value: "8", label: "industry accreditations" },
    { value: "1", label: "team, from survey to sign-off" },
  ],
  guaranteeBody:
    "Something not right after we finish? We come back and put it right at no cost. No arguments, and no passing the blame to another trade. That's our guarantee.",
  stepsHeading: "Your new room in four simple steps",
  formSubheading: "Four quick steps. We reply within one business day.",
  stickyCallLabel: "Call us",
  stickyQuoteLabel: "Free quote",
};

const financeFaq = {
  question: "Can I spread the cost?",
  answer:
    "Yes. We work with two credit brokers, Ideal4Finance and Phoenix Financial Consultants, who can help you spread the cost with monthly payments, subject to status.",
};
const areaFaq = {
  question: "Which areas do you cover?",
  answer:
    "We work across the West Midlands and Wales. Enter your postcode in the quote form and we'll confirm straight away.",
};
const fixedFaq = {
  question: "Is the quote really fixed?",
  answer:
    "Yes. After the survey you get a written quote covering every trade, and that's what you pay. The price only changes if you ask for something different during the job, and we agree that with you first.",
};

export const LANDING_PAGE_DEFAULTS: Record<
  "lp-kitchen-renovation" | "lp-bathroom-renovation",
  LandingPageContent
> = {
  "lp-kitchen-renovation": {
    ...shared,
    metaTitle: "Kitchen Renovation — Free Survey & Fixed Price | Greentek",
    metaDescription:
      "Kitchen renovations across the West Midlands and Wales. One in-house team for design, plumbing, electrics and fitting, with a fixed written price before work starts.",
    offerBar: "Free home survey and a fixed written quote — book yours this month",
    heroHeading: "Get the kitchen you've been putting off, built by one team at one fixed price",
    heroHighlight: "one fixed price",
    heroBody:
      "From strip-out to the last plug socket, our own fitters, plumbers and electricians do the lot. You get a written quote before we start, and that's what you pay.",
    heroTicks: ["Free survey", "Fixed written price", "Finance available"],
    heroImage: `${P}/Kitchen/Post Kitchen.jpg`,
    heroImageAlt: "A finished kitchen fitted by Greentek",
    resultsHeading: "Real kitchens. Real before and afters.",
    resultsIntro: "Every photo here is a job our own team did. No stock images.",
    results: [
      {
        before: `${P}/Kitchen/Pre kitchen.jpeg`,
        beforeAlt: "Old kitchen stripped out before the renovation",
        after: `${P}/Kitchen/Post Kitchen.jpg`,
        afterAlt: "The same kitchen after Greentek's renovation",
        title: "Tired and gutted to bright and brand new",
        body: "Strip-out, replastering, new units, worktops, tiling and appliances, all by one team.",
      },
      {
        before: `${P}/Extension/Pre EXT1.jpeg`,
        beforeAlt: "A dated kitchen in an old conservatory",
        after: `${P}/Extension/post ext1.jpg`,
        afterAlt: "The open-plan kitchen-diner Greentek built in its place",
        title: "Cramped conservatory kitchen to open-plan kitchen-diner",
        body: "The old conservatory came down and a solid extension went up, with a new kitchen inside.",
      },
    ],
    problemHeading: "Been putting off your new kitchen? You're not alone.",
    problemQuestions: [
      "Worried the price will creep up once the old kitchen is out?",
      "Dreading weeks of chasing a fitter, a plumber and an electrician?",
      "Not sure what it will really cost?",
    ],
    problemBody:
      "Most kitchen jobs go wrong in the gaps between trades: the fitter waiting on the electrician, the plasterer booked for the wrong week, and a final bill nobody agreed to.\n\nWe do every part of the job with our own team, to one schedule and one written price. There's one person to call, from the survey to the final sign-off.",
    problemImage: `${P}/Kitchen/PRE2 kitchen.jpeg`,
    problemImageAlt: "A kitchen before renovation, mid strip-out",
    reviewsHeading: "Homeowners across the West Midlands & Wales trust Greentek",
    tickerItems: [
      "Free survey",
      "Fixed written price",
      "Own plumbers & electricians",
      "Finance available",
      "TrustMark registered",
      "We come back and fix it",
    ],
    features: [
      {
        heading: "One team does the whole job",
        body: "No juggling trades. Our own team handles design, strip-out, plumbing, electrics, plastering, tiling and fitting, all to one schedule.",
        bullets: [
          "Design and layout planning",
          "Plumbing and electrics done in-house",
          "Plastering, tiling and flooring",
          "Units, worktops and appliances fitted",
        ],
        image: `${P}/Extension/Mid EXT1.jpeg`,
        imageAlt: "Greentek's team part-way through a kitchen extension",
      },
      {
        heading: "One price, in writing, before we start",
        body: "After a free survey you get a written quote covering every trade. That's what you pay. The price only changes if you ask for something different, and we agree it with you first.",
        bullets: [
          "Free, no-obligation survey",
          "Every trade in one quote",
          "Spread the cost with monthly finance, subject to status",
        ],
        image: "",
        imageAlt: "",
      },
    ],
    pricingHeading: "What does a kitchen renovation cost?",
    pricingIntro: "Every kitchen is quoted after a free survey, but these ranges show where most projects land.",
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
    guaranteeHeading: "If it's not right, we come back and fix it, free",
    steps: [
      { title: "Get your free quote", body: "Answer four quick questions or call us. It takes two minutes." },
      { title: "Free home survey", body: "We visit, measure up and talk through the kitchen you want." },
      { title: "Your fixed price", body: "One written quote that covers every trade. No surprises." },
      { title: "We build it", body: "Our team does the work to an agreed schedule, then signs it off with you." },
    ],
    faqHeading: "Kitchen renovation questions",
    faqs: [
      {
        question: "How long does a kitchen renovation take?",
        answer:
          "Most kitchens take two to four weeks once work starts, depending on layout changes and whether walls are moved. We give you a schedule before we begin, so you know how long you'll be without a kitchen.",
      },
      fixedFaq,
      financeFaq,
      {
        question: "Do you supply the kitchen units?",
        answer:
          "We can supply units, worktops and appliances, or fit ones you've chosen yourself. Either way, the fitting, plumbing and electrics are in one quote.",
      },
      areaFaq,
    ],
    finalHeading: "Ready for your new kitchen? Get your free quote today.",
    finalBody:
      "Tell us about your kitchen in four quick steps. We'll call you back within one business day to book your free survey.",
    finalTicks: ["Fixed written price", "Own plumbers and electricians", "We come back and fix it, free"],
    finalImage: `${P}/Extension/post ext1.jpg`,
    finalImageAlt: "An open-plan kitchen-diner built by Greentek",
    formHeading: "Get your free kitchen quote",
  },
  "lp-bathroom-renovation": {
    ...shared,
    metaTitle: "Bathroom Renovation — Free Survey & Fixed Price | Greentek",
    metaDescription:
      "Bathroom renovations across the West Midlands and Wales. One in-house team for plumbing, electrics, tiling and fitting, with a fixed written price before work starts.",
    offerBar: "Free home survey and a fixed written quote — book yours this month",
    heroHeading: "A bathroom you'll love using, fitted by one team at one fixed price",
    heroHighlight: "one fixed price",
    heroBody:
      "Strip-out, plumbing, electrics, waterproofing, tiling and fitting, all by our own team. You get a written quote before we start, and that's what you pay.",
    heroTicks: ["Free survey", "Fixed written price", "Finance available"],
    heroImage: `${P}/Bathroom/Bathroom Post.jpeg`,
    heroImageAlt: "A finished shower room fitted by Greentek",
    resultsHeading: "A real bathroom, from stripped-out to finished",
    resultsIntro: "Every photo here is a job our own team did. No stock images.",
    results: [
      {
        before: `${P}/Bathroom/Bathroom PRE.jpeg`,
        beforeAlt: "Bathroom stripped back to the pipework before the renovation",
        after: `${P}/Bathroom/Bathroom Post.jpeg`,
        afterAlt: "The same bathroom after Greentek's renovation",
        title: "Stripped back to the pipes, rebuilt as a modern shower room",
        body: "New pipework, boarding, waterproofing, tiling, suite and lighting, all by one team.",
      },
    ],
    problemHeading: "Been putting off your new bathroom? You're not alone.",
    problemQuestions: [
      "Worried hidden leaks will turn into 'extras' once the tiles are off?",
      "Dreading days without a working bathroom?",
      "Not sure what it will really cost?",
    ],
    problemBody:
      "A bathroom needs a plumber, an electrician, a tiler and a fitter, and when they're booked separately the job stalls between them.\n\nWe do every part with our own team, to one schedule and one written price. There's one person to call, from the survey to the final sign-off.",
    problemImage: `${P}/Bathroom/Bathroom Mid.jpeg`,
    problemImageAlt: "A bathroom mid-renovation, boarded and ready for tiling",
    reviewsHeading: "Homeowners across the West Midlands & Wales trust Greentek",
    tickerItems: [
      "Free survey",
      "Fixed written price",
      "Own plumbers & electricians",
      "Finance available",
      "TrustMark registered",
      "We come back and fix it",
    ],
    features: [
      {
        heading: "One team does the whole job",
        body: "No juggling trades. Our own team handles strip-out, plumbing, electrics, waterproofing, tiling and fitting, all to one schedule.",
        bullets: [
          "Design and layout planning",
          "Plumbing and electrics done in-house",
          "Proper waterproofing before tiling",
          "Suite, shower, vanity and fittings installed",
        ],
        image: `${P}/Bathroom/Bathroom Mid.jpeg`,
        imageAlt: "A bathroom being rebuilt by Greentek's team",
      },
      {
        heading: "One price, in writing, before we start",
        body: "After a free survey you get a written quote covering every trade. That's what you pay. The price only changes if you ask for something different, and we agree it with you first.",
        bullets: [
          "Free, no-obligation survey",
          "Every trade in one quote",
          "Spread the cost with monthly finance, subject to status",
        ],
        image: "",
        imageAlt: "",
      },
    ],
    pricingHeading: "What does a bathroom renovation cost?",
    pricingIntro: "Every bathroom is quoted after a free survey, but these ranges show where most projects land.",
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
    guaranteeHeading: "If it's not right, we come back and fix it, free",
    steps: [
      { title: "Get your free quote", body: "Answer four quick questions or call us. It takes two minutes." },
      { title: "Free home survey", body: "We visit, measure up and talk through the bathroom you want." },
      { title: "Your fixed price", body: "One written quote that covers every trade. No surprises." },
      { title: "We build it", body: "Our team does the work to an agreed schedule, then signs it off with you." },
    ],
    faqHeading: "Bathroom renovation questions",
    faqs: [
      {
        question: "How long does a bathroom renovation take?",
        answer:
          "Most bathrooms take one to two weeks once work starts, depending on layout changes. We give you a schedule before we begin, so you know when you'll have a working bathroom again.",
      },
      fixedFaq,
      financeFaq,
      {
        question: "Can you turn a bath into a walk-in shower?",
        answer:
          "Yes. We move the plumbing, waterproof the area properly and fit the tray or wet-room floor, all in one quote.",
      },
      areaFaq,
    ],
    finalHeading: "Ready for your new bathroom? Get your free quote today.",
    finalBody:
      "Tell us about your bathroom in four quick steps. We'll call you back within one business day to book your free survey.",
    finalTicks: ["Fixed written price", "Own plumbers and electricians", "We come back and fix it, free"],
    finalImage: `${P}/Bathroom/Bathroom Post.jpeg`,
    finalImageAlt: "A finished shower room fitted by Greentek",
    formHeading: "Get your free bathroom quote",
  },
};
