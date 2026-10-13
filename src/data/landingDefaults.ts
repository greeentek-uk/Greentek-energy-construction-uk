import type { LandingPageContent } from "./pageContent";

const P = "/images/projects";

const shared = {
  ratingText: "Rated Excellent on Trustpilot · 500+ jobs done",
  quoteButtonLabel: "Get my free quote",
  socialProofLine: "Join 500+ homeowners across the West Midlands and Wales",
  reviewsHeading: "What our customers say",
  tickerItems: [
    "Free home survey",
    "Fixed price in writing",
    "Our own plumbers and electricians",
    "Pay monthly",
    "TrustMark registered",
    "Free fix if anything is not right",
  ],
  guaranteeHeading: "Not happy? We come back and fix it for free",
  guaranteeBody:
    "If something is not right after we finish, just tell us. We will come back and fix it at no cost. No arguments and no excuses.",
  stepsHeading: "How it works",
  stats: [
    { value: "500+", label: "jobs completed" },
    { value: "25+", label: "years of experience in our team" },
    { value: "8", label: "industry bodies check our work" },
    { value: "1", label: "team does the whole job" },
  ],
  areasHeading: "We cover the West Midlands and Wales",
  areasBody: "Not sure if we cover your area? Put your postcode in the form and we will tell you straight away.",
  faqHeading: "Your questions, answered",
  finalTicks: ["Fixed price in writing", "Our own plumbers and electricians", "Free fix if anything is not right"],
  formSubheading: "4 quick steps. We reply within 1 working day.",
  stickyCallLabel: "Call us",
  stickyQuoteLabel: "Free quote",
};

const problemBody =
  "These are the worries we hear most. They happen when each trade works for a different firm. Jobs stall, and bills grow.\n\nWith us, one team does everything. You get one price, one plan and one person to call.";

const priceFeature = {
  heading: "You know the price before we start",
  body: "We visit your home for free. Then we send you a written price for the whole job. It only changes if you ask for something extra.",
  bullets: ["Free home survey", "One price for the whole job", "Pay monthly if you like (subject to status)"],
  image: "",
  imageAlt: "",
};

const accreditedFeature = {
  heading: "Checked by the industry's experts",
  body: "Eight industry bodies check our work, including TrustMark and Gas Safe. So you know the job is done right.",
  bullets: ["TrustMark registered", "Gas Safe registered", "Checked by 8 industry bodies"],
};

const steps = (room: string) => [
  { title: "Ask for a quote", body: "Fill in the short form or call us. It takes 2 minutes." },
  { title: "We visit you", body: `We come to your home, measure up and talk about your new ${room}. It's free.` },
  { title: "Get your price", body: "We send you a fixed price in writing. There are no hidden costs." },
  { title: "We build it", body: "Our team does the work on the dates we agreed. Then we check it all with you." },
];

const fixedFaq = {
  question: "Is the price really fixed?",
  answer:
    "Yes. The written price is what you pay. It only changes if you ask for something extra, and we agree that with you first.",
};
const financeFaq = {
  question: "Can I pay monthly?",
  answer:
    "Yes. We work with two finance brokers, Ideal4Finance and Phoenix Financial Consultants. They can help you spread the cost. Finance is subject to status.",
};
const areaFaq = {
  question: "Which areas do you cover?",
  answer: "We work across the West Midlands and Wales. Put your postcode in the form and we will tell you straight away.",
};

export const LANDING_PAGE_DEFAULTS: Record<
  "lp-kitchen-renovation" | "lp-bathroom-renovation",
  LandingPageContent
> = {
  "lp-kitchen-renovation": {
    ...shared,
    metaTitle: "New Kitchen, One Fixed Price | Free Survey | Greentek",
    metaDescription:
      "Get a new kitchen fitted by one team, at one fixed price. Free home survey across the West Midlands and Wales.",
    offerBar: "Free home survey and a fixed price in writing. Book yours today.",
    heroHeading: "Get a new kitchen for one fixed price, with no surprise costs",
    heroHighlight: "one fixed price",
    heroBody:
      "Our own team does the whole job: the fitting, plumbing, electrics and tiling. You get a written price before we start. That is the price you pay.",
    heroTicks: ["Free home survey", "Fixed price in writing", "Pay monthly with finance"],
    heroImage: `${P}/Kitchen/Post Kitchen.jpg`,
    heroImageAlt: "A new kitchen fitted by Greentek",
    resultsHeading: "See real kitchens we have built",
    resultsIntro: "These are our own jobs. No stock photos.",
    results: [
      {
        before: `${P}/Kitchen/Pre kitchen.jpeg`,
        beforeAlt: "An old kitchen, stripped out before the work",
        after: `${P}/Kitchen/Post Kitchen.jpg`,
        afterAlt: "The same kitchen after Greentek fitted it",
        title: "Old and worn out to bright and new",
        body: "We stripped it out, plastered the walls and fitted new units, worktops and tiles.",
      },
      {
        before: `${P}/Extension/Pre EXT1.jpeg`,
        beforeAlt: "A small, old kitchen in a conservatory",
        after: `${P}/Extension/post ext1.jpg`,
        afterAlt: "The big open-plan kitchen Greentek built in its place",
        title: "Small conservatory kitchen to big open-plan kitchen",
        body: "We took down the old conservatory, built a proper extension and fitted a new kitchen inside.",
      },
    ],
    problemHeading: "Want a new kitchen but worried about the hassle?",
    problemQuestions: [
      "Will the price go up once work starts?",
      "Will I have to chase five different trades?",
      "How long will I be without a kitchen?",
    ],
    problemBody,
    problemImage: `${P}/Kitchen/PRE2 kitchen.jpeg`,
    problemImageAlt: "A kitchen half way through being stripped out",
    features: [
      {
        heading: "One team does the whole job",
        body: "You don't need to find a plumber, an electrician or a tiler. Our own team does it all, from start to finish.",
        bullets: [
          "We plan the layout with you",
          "We take out your old kitchen",
          "We do the plumbing and electrics",
          "We fit the units, worktops and appliances",
        ],
        image: `${P}/Extension/Mid EXT1.jpeg`,
        imageAlt: "Greentek's team part way through building a kitchen extension",
      },
      priceFeature,
      {
        ...accreditedFeature,
        image: `${P}/Extension/post ext1.jpg`,
        imageAlt: "An open-plan kitchen built by Greentek",
      },
    ],
    pricingHeading: "",
    pricingIntro: "",
    pricingTiers: [],
    pricingNote: "",
    steps: steps("kitchen"),
    faqs: [
      {
        question: "How much does a new kitchen cost?",
        answer:
          "Every kitchen is different. The price depends on the size, the layout and the units you pick. We visit for free, then send you a fixed price in writing.",
      },
      {
        question: "How long does it take?",
        answer: "Most kitchens take 2 to 4 weeks once we start. We give you a plan with dates before we begin.",
      },
      fixedFaq,
      financeFaq,
      {
        question: "Can I choose my own units?",
        answer:
          "Yes. We can supply the units, worktops and appliances. Or we can fit ones you have picked. Either way, it is all in one price.",
      },
      areaFaq,
    ],
    finalHeading: "Ready for your new kitchen?",
    finalBody: "Answer 4 quick questions. We will call you back within 1 working day to book your free survey.",
    finalImage: `${P}/Kitchen/Post Kitchen.jpg`,
    finalImageAlt: "A new kitchen fitted by Greentek",
    formHeading: "Get your free kitchen quote",
  },
  "lp-bathroom-renovation": {
    ...shared,
    metaTitle: "New Bathrooms from £2,999 | Free Survey | Greentek",
    metaDescription:
      "Get a new bathroom from £2,999, fitted by one team at one fixed price. Free home survey across the West Midlands and Wales.",
    offerBar: "New bathrooms from £2,999. Free home survey and a fixed price in writing.",
    heroHeading: "Get a new bathroom from £2,999, fitted by one team",
    heroHighlight: "from £2,999",
    heroBody:
      "Our own team does the whole job: the plumbing, electrics, waterproofing and tiling. You get a written price before we start. That is the price you pay.",
    heroTicks: ["Free home survey", "Fixed price in writing", "Pay monthly with finance"],
    heroImage: `${P}/Bathroom/Bathroom Post.jpeg`,
    heroImageAlt: "A new shower room fitted by Greentek",
    resultsHeading: "See real bathrooms we rebuilt",
    resultsIntro: "These are our own jobs. No stock photos.",
    results: [
      {
        before: `${P}/Bathroom/Bathroom PRE.jpeg`,
        beforeAlt: "A bathroom stripped back to the pipes before the work",
        after: `${P}/Bathroom/Bathroom Post.jpeg`,
        afterAlt: "The same bathroom after Greentek rebuilt it",
        title: "From bare pipes to a modern shower room",
        body: "We replaced the pipes, waterproofed the walls, then fitted new tiles, a new suite and new lights.",
      },
      {
        before: `${P}/Bathroom/Bathroom 2 PRE.jpeg`,
        beforeAlt: "A cramped, dated bathroom with old tiles and a shower curtain",
        after: `${P}/Bathroom/Bathroom 2 Post.jpeg`,
        afterAlt: "The same bathroom after Greentek fitted grey wall panels, a new bath and a vanity unit",
        title: "From tired and cluttered to clean and bright",
        body: "We took out the old suite and tiles, fitted wipe-clean wall panels, a new bath with a glass screen, a vanity unit with storage, new flooring and new lights.",
      },
    ],
    problemHeading: "Want a new bathroom but worried about the hassle?",
    problemQuestions: [
      "Will hidden leaks push the price up?",
      "How long will I be without a bathroom?",
      "Will I have to chase different trades?",
    ],
    problemBody,
    problemImage: "",
    problemImageAlt: "",
    features: [
      {
        heading: "One team does the whole job",
        body: "You don't need to find a plumber, an electrician or a tiler. Our own team does it all, from start to finish.",
        bullets: [
          "We plan the layout with you",
          "We take out your old bathroom",
          "We do the plumbing and electrics",
          "We waterproof, tile and fit everything",
        ],
        image: `${P}/Bathroom/Bathroom Mid.jpeg`,
        imageAlt: "A bathroom being rebuilt by Greentek's team",
      },
      priceFeature,
      {
        ...accreditedFeature,
        image: `${P}/Bathroom/Bathroom Post.jpeg`,
        imageAlt: "A new shower room fitted by Greentek",
      },
    ],
    pricingHeading: "What does a new bathroom cost?",
    pricingIntro: "",
    pricingTiers: [
      {
        name: "New bathroom",
        price: "From £2,999",
        description: "The final price depends on the room size, the layout and the suite and tiles you pick.",
        features: ["Free home survey", "Fixed price in writing before we start", "Pay monthly if you like (subject to status)"],
      },
    ],
    pricingNote: "The survey and the quote are free. You don't have to go ahead.",
    steps: steps("bathroom"),
    faqs: [
      {
        question: "How much does a new bathroom cost?",
        answer:
          "Our bathrooms start from £2,999. The final price depends on the room size, the layout and the suite and tiles you pick. We visit for free, then send you a fixed price in writing.",
      },
      {
        question: "How long does it take?",
        answer: "Most bathrooms take 1 to 2 weeks once we start. We give you a plan with dates before we begin.",
      },
      fixedFaq,
      financeFaq,
      {
        question: "Can you swap my bath for a walk-in shower?",
        answer: "Yes. We move the pipes, waterproof the area and fit the new shower. It is all in one price.",
      },
      areaFaq,
    ],
    finalHeading: "Ready for your new bathroom?",
    finalBody: "Answer 4 quick questions. We will call you back within 1 working day to book your free survey.",
    finalImage: `${P}/Bathroom/Bathroom Post.jpeg`,
    finalImageAlt: "A new shower room fitted by Greentek",
    formHeading: "Get your free bathroom quote",
  },
};
