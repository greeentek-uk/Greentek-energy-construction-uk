import type { LandingPageContent } from "./pageContent";

const P = "/images/projects";

const shared = {
  ratingText: "Rated Excellent on Trustpilot · 500+ jobs done",
  quoteButtonLabel: "Get my free quote",
  socialProofLine: "Join 500+ homeowners across the UK",
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
  // Based in Birmingham; most work is the West Midlands, Wales and London, and
  // further afield only when the job makes the travel feasible (owner,
  // 2026-10-22). The chips are a list of their own rather than the location
  // pages, so naming a place here doesn't need eleven new combo pages.
  areasHeading: "Based in Birmingham, working across the UK",
  areasBody:
    "Most of our work is in the West Midlands, Wales and London. We also travel to other major towns and cities when the project makes it feasible. Put your postcode in the form and we will tell you straight away.",
  areaNames: [
    "Birmingham",
    "Solihull",
    "Wolverhampton",
    "Coventry",
    "Dudley",
    "Walsall",
    "West Bromwich",
    "Sutton Coldfield",
    "Worcester",
    "Stafford",
    "Telford",
    "Cardiff",
    "Swansea",
    "Newport",
    "London",
  ],
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
  answer:
    "We are based in Birmingham and work across the West Midlands, Wales and London. We also travel to other major towns and cities across the UK when the project makes it feasible. Put your postcode in the form and we will tell you straight away.",
};

// ---- Energy pages (solar, heat pumps) -------------------------------------
// Drafted 2026-10-23 from the live service pages' own claims (MCS certified,
// the brands we fit, SEG, room-by-room heat loss) and the owner's reference
// pages (instagroup, stromltd, greenheatingltd): grant near the top, what's
// included spelled out, heat-pump objections (noise, cold, radiators) answered.
// No prices and no grant amount: the owner hasn't given brackets for these, and
// the service pages deliberately confirm "the current grant at survey" rather
// than print a figure that changes. The pricing section hides while
// pricingTiers is empty; add brackets in the panel once they're agreed.

const energyShared = {
  ...shared,
  tickerItems: [
    "Free home survey",
    "MCS certified installers",
    "Fixed price in writing",
    "Our own engineers, no subcontractors",
    "Pay monthly",
    "TrustMark registered",
  ],
  finalTicks: ["Free home survey", "MCS certified installers", "Fixed price in writing"],
  pricingHeading: "",
  pricingIntro: "",
  pricingTiers: [],
  pricingNote: "",
};

const energyPriceFeature = {
  ...priceFeature,
  body: "We visit your home for free and design the system around it. Then we send you a written price for the whole job. It only changes if you ask for something extra.",
  bullets: ["Free home survey", "One price for the whole job", "Pay monthly if you like (subject to status)"],
};

const mcsFeature = {
  heading: "MCS certified, and checked by the industry's experts",
  body: "Eight industry bodies check our work, including MCS and TrustMark. MCS is the standard for solar and heat pump installs, and you need it for the Smart Export Guarantee and the Boiler Upgrade Scheme.",
  bullets: ["MCS certified installers", "TrustMark registered", "MCS certificate at handover"],
};

const energySteps = (survey: string, install: string) => [
  { title: "Ask for a quote", body: "Fill in the short form or call us. It takes 2 minutes." },
  { title: "We survey your home", body: `${survey} It's free.` },
  { title: "Get your price", body: "We send you a fixed price in writing. There are no hidden costs." },
  { title: "We install it", body: install },
];

const energyFinanceFaq = {
  question: "Can I pay monthly?",
  answer:
    "Yes. We work with two finance brokers, Ideal4Finance and Phoenix Financial Consultants. They can help you spread the cost. Finance is subject to status.",
};

export const LANDING_PAGE_DEFAULTS: Record<
  "lp-kitchen-renovation" | "lp-bathroom-renovation" | "lp-solar-panels" | "lp-air-source-heat-pumps",
  LandingPageContent
> = {
  "lp-kitchen-renovation": {
    ...shared,
    metaTitle: "New Kitchens from £4,999 | Free Survey | Greentek",
    metaDescription:
      "Get a new kitchen from £4,999, fitted by one team at one fixed price. Free home survey across most of the UK.",
    offerBar: "New kitchens from £4,999. Free home survey and a fixed price in writing.",
    heroHeading: "Get a new kitchen from £4,999, fitted by one team",
    heroHighlight: "from £4,999",
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
    problemImage: "",
    problemImageAlt: "",
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
        image: `${P}/Kitchen/Post Kitchen.jpg`,
        imageAlt: "A finished kitchen fitted by Greentek",
      },
      priceFeature,
      {
        ...accreditedFeature,
        image: `${P}/Extension/post ext1.jpg`,
        imageAlt: "An open-plan kitchen built by Greentek",
      },
    ],
    pricingHeading: "What does a new kitchen cost?",
    pricingIntro:
      "Our kitchen renovations start from £4,999. Most jobs fall into one of these brackets. The price depends on things like the size, the layout and the units you pick. You get an exact quote after a free survey.",
    pricingTiers: [
      {
        name: "Kitchen refresh",
        price: "£4,999–£9,999",
        description: "New units, worktops and sink in the same layout. Good for a smaller kitchen.",
        features: ["New units and worktops", "New sink and tap", "Tiling and flooring"],
      },
      {
        name: "Full new kitchen",
        price: "£10,000–£19,999",
        description: "A new layout with new units, worktops and appliances. We redo the plumbing and electrics too.",
        features: ["New layout if you want one", "New plumbing and electrics", "New appliances fitted"],
      },
      {
        name: "Premium or open plan",
        price: "£20,000+",
        description: "Bigger kitchens, premium worktops, an island, or knocking through to make one open space.",
        features: ["Premium worktops and appliances", "Kitchen islands", "Knock-throughs and open plan"],
      },
    ],
    pricingNote:
      "These are guide prices, not quotes. We visit for free and then send you a fixed price in writing. You don't have to go ahead.",
    steps: steps("kitchen"),
    faqs: [
      {
        question: "How much does a new kitchen cost?",
        answer:
          "Our kitchens start from £4,999. A refresh is usually £4,999 to £9,999. A full new kitchen is usually £10,000 to £19,999. Premium and open-plan kitchens are usually £20,000 or more. The exact price depends on your kitchen, so we visit for free and then send you a fixed price in writing.",
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
      "Get a new bathroom from £2,999, fitted by one team at one fixed price. Free home survey across most of the UK.",
    offerBar: "New bathrooms from £2,999. Free home survey and a fixed price in writing.",
    heroHeading: "Get a new bathroom from £2,999, fitted by one team",
    heroHighlight: "from £2,999",
    heroBody:
      "Our own team does the whole job: the plumbing, electrics, waterproofing and tiling. You get a written price before we start. That is the price you pay.",
    heroTicks: ["Free home survey", "Fixed price in writing", "Pay monthly with finance"],
    heroImage: `${P}/Bathroom/Bathroom 2 Post.jpeg`,
    heroImageAlt: "A new bathroom with a bath, glass screen and vanity unit, fitted by Greentek",
    resultsHeading: "See real bathrooms we rebuilt",
    resultsIntro: "These are our own jobs. No stock photos.",
    results: [
      {
        before: `${P}/Bathroom/Bathroom PRE.jpeg`,
        beforeAlt: "A bathroom stripped back to the pipes before the work",
        after: `${P}/Bathroom/Bathroom Post.jpeg`,
        afterAlt: "The same bathroom after Greentek rebuilt it",
        title: "From bare brick to a modern grey-tiled bathroom",
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
        image: `${P}/Bathroom/Bathroom Post.jpeg`,
        imageAlt: "A finished bathroom with grey tiles and a vanity unit, fitted by Greentek",
      },
      priceFeature,
      {
        ...accreditedFeature,
        image: `${P}/Bathroom/Bathroom 2 Post.jpeg`,
        imageAlt: "A finished bathroom with grey wall panels, a new bath and a vanity unit, fitted by Greentek",
      },
    ],
    pricingHeading: "What does a new bathroom cost?",
    pricingIntro:
      "Our bathroom renovations start from £2,999. Most jobs fall into one of these brackets. The price depends on things like the room size, the layout and the fittings you pick. You get an exact quote after a free survey.",
    pricingTiers: [
      {
        name: "Bathroom refresh",
        price: "£2,999–£5,999",
        description: "A new suite in the same layout, with new tiles or wall panels. Good for a small bathroom or en suite.",
        features: ["New bath or shower, basin and toilet", "New tiles or wall panels", "New flooring"],
      },
      {
        name: "Full new bathroom",
        price: "£6,000–£9,999",
        description: "A new layout, a walk-in shower or a bath swap. We redo the plumbing and electrics too.",
        features: ["New layout if you want one", "New plumbing and lights", "Walk-in shower options"],
      },
      {
        name: "Premium bathroom",
        price: "£10,000+",
        description: "Bigger rooms, premium tiles and fittings, or extras like underfloor heating.",
        features: ["Premium tiles and fittings", "Underfloor heating", "Wet rooms"],
      },
    ],
    pricingNote:
      "These are guide prices, not quotes. We visit for free and then send you a fixed price in writing. You don't have to go ahead.",
    steps: steps("bathroom"),
    faqs: [
      {
        question: "How much does a new bathroom cost?",
        answer:
          "Our bathrooms start from £2,999. A refresh is usually £2,999 to £5,999. A full new bathroom is usually £6,000 to £9,999. Premium bathrooms are usually £10,000 or more. The exact price depends on your bathroom, so we visit for free and then send you a fixed price in writing.",
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
    finalImageAlt: "A new bathroom with grey tiles and a vanity unit, fitted by Greentek",
    formHeading: "Get your free bathroom quote",
  },
  "lp-solar-panels": {
    ...energyShared,
    metaTitle: "Solar Panels Installed by MCS Installers | Free Survey | Greentek",
    metaDescription:
      "Solar panels and battery storage designed around your roof and your bills. MCS certified, fitted by our own team at a fixed price. Free home survey.",
    offerBar: "Solar panels and batteries from MCS certified installers. Free home survey and a fixed price in writing.",
    heroHeading: "Make your own electricity with solar panels sized for your home",
    heroHighlight: "make your own electricity",
    heroBody:
      "We look at your roof and your bills, then design a system that fits how you use power. Our own MCS certified team fits the panels, inverter and battery. You get a written price before we start.",
    heroTicks: ["Free home survey", "MCS certified installers", "Get paid for the power you export"],
    heroImage: `${P}/Solar/after.png`,
    heroImageAlt: "Black solar panels fitted on a slate roof by Greentek",
    resultsHeading: "See a solar roof we fitted",
    resultsIntro: "Our own job, from bare roof to finished system.",
    results: [
      {
        before: `${P}/Solar/before.png`,
        beforeAlt: "A slate roof before the solar panels were fitted",
        after: `${P}/Solar/after.png`,
        afterAlt: "The same roof with black solar panels fitted by Greentek",
        title: "Bare slate roof to a full solar system",
        body: "We surveyed the roof, designed the system and fitted the panels, then handed over the MCS certificate.",
      },
    ],
    problemHeading: "Thinking about solar but not sure it's worth it?",
    problemQuestions: [
      "Will it really cut my bills?",
      "How many panels do I actually need?",
      "Is a battery worth paying for?",
    ],
    problemBody:
      "These are the questions we hear most. Solar only pays back when it is sized to your roof and to how you use electricity. Panel counts picked from a brochure are why some systems never save what they promised.\n\nWe design yours from your bills and a roof survey. Then we tell you honestly what it will do, and whether a battery is worth it for you.",
    problemImage: "",
    problemImageAlt: "",
    features: [
      {
        heading: "Designed for your roof, not picked from a brochure",
        body: "We check which way your roof faces, its pitch and any shading. Then we size the system from your real electricity use.",
        bullets: [
          "Panels from AIKO, JinkoSolar and Trinasolar",
          "Growatt and SolaX inverters",
          "Battery storage if it makes sense for you",
          "Scaffolding, fitting and testing in one price",
        ],
        image: `${P}/Solar/after.png`,
        imageAlt: "Solar panels on a slate roof, fitted by Greentek",
      },
      energyPriceFeature,
      {
        ...mcsFeature,
        image: `${P}/Solar/after.png`,
        imageAlt: "A finished solar panel system on a slate roof",
      },
    ],
    steps: energySteps(
      "We check your roof and look at your electricity bills, then design your system.",
      "Most homes take 1 to 2 days once the scaffolding is up. We hand over your MCS certificate and export paperwork.",
    ),
    faqs: [
      {
        question: "How much do solar panels cost?",
        answer:
          "It depends on how many panels your home needs, your roof, and whether you add a battery. We survey your roof and your electricity use for free, then send you a fixed price in writing for a system sized to your home.",
      },
      {
        question: "Can I get paid for the electricity I don't use?",
        answer:
          "Yes. Under the Smart Export Guarantee, energy suppliers pay you for the power you send to the grid. You need an MCS certified install and an export meter. We sort the paperwork for you.",
      },
      {
        question: "Is a battery worth it?",
        answer:
          "A battery stores the power you make in the day so you can use it in the evening. Whether it pays back depends on how you use electricity and your tariff. We will tell you honestly at the survey.",
      },
      {
        question: "Do I need planning permission?",
        answer:
          "Most homes don't. Roof panels usually fall under permitted development. Listed buildings and conservation areas have tighter rules, and we check this before we quote.",
      },
      {
        question: "How long does it take?",
        answer: "Most homes take 1 to 2 days once the scaffolding is up. Adding a battery can take a day more.",
      },
      fixedFaq,
      energyFinanceFaq,
      areaFaq,
    ],
    finalHeading: "Ready to make your own electricity?",
    finalBody: "Answer 4 quick questions. We will call you back within 1 working day to book your free survey.",
    finalImage: `${P}/Solar/after.png`,
    finalImageAlt: "Solar panels fitted on a slate roof by Greentek",
    formHeading: "Get your free solar quote",
  },
  "lp-air-source-heat-pumps": {
    ...energyShared,
    metaTitle: "Air Source Heat Pumps by MCS Installers | Free Survey | Greentek",
    metaDescription:
      "Air source heat pumps sized from a room-by-room heat loss survey. MCS certified, Boiler Upgrade Scheme grant checked for you. Free home survey.",
    offerBar: "Replacing a gas, oil or LPG boiler? We check your Boiler Upgrade Scheme grant for free.",
    heroHeading: "A heat pump that keeps every room warm, sized for your home",
    heroHighlight: "keeps every room warm",
    heroBody:
      "We measure your home's heat loss room by room, then fit a heat pump that is the right size. Our own MCS certified team does the whole job, and we check if you can get a Boiler Upgrade Scheme grant.",
    heroTicks: ["Free heat loss survey", "MCS certified installers", "Boiler Upgrade Scheme grant checked"],
    heroImage: `${P}/Heating/after.webp`,
    heroImageAlt: "An air source heat pump fitted against a brick wall by Greentek",
    resultsHeading: "See a heat pump we fitted",
    resultsIntro: "Our own job: a neat outdoor unit, with the pipework tidied away.",
    results: [
      {
        before: `${P}/Heating/before.png`,
        beforeAlt: "The back wall of a brick bungalow before the heat pump was fitted",
        after: `${P}/Heating/after.webp`,
        afterAlt: "The same wall with an air source heat pump fitted on a base by Greentek",
        title: "A neat air source heat pump install",
        body: "We worked out the heat loss of every room, then fitted the outdoor unit on a raised base with its pipework run neatly into the house.",
      },
    ],
    problemHeading: "Heard heat pumps don't work in UK homes?",
    problemQuestions: [
      "Will my rooms be warm enough in winter?",
      "Will my bills go up?",
      "Do I need all new radiators?",
    ],
    problemBody:
      "These are the worries we hear most. When a heat pump disappoints, it is usually because it was sized from a guess, or fitted to radiators that are too small.\n\nWe measure your home's heat loss room by room first. Then we fit the right size of heat pump, and only change the radiators that need it.",
    problemImage: "",
    problemImageAlt: "",
    features: [
      {
        heading: "Everything you need, in one job",
        body: "You don't need to find a plumber, an electrician and a heating engineer. Our own team does it all, from the survey to the handover.",
        bullets: [
          "Room-by-room heat loss survey",
          "Vaillant or Ideal Heating heat pump",
          "New hot water cylinder and controls",
          "Radiators upgraded only where needed",
        ],
        image: `${P}/Heating/after.webp`,
        imageAlt: "An air source heat pump fitted by Greentek",
      },
      energyPriceFeature,
      {
        ...mcsFeature,
        image: `${P}/Heating/after.webp`,
        imageAlt: "A finished air source heat pump install",
      },
    ],
    steps: energySteps(
      "We measure your home's heat loss room by room and check if you can get a grant.",
      "Our team fits the heat pump, cylinder and controls, then sets it up to run efficiently. We hand over your MCS certificate.",
    ),
    faqs: [
      {
        question: "Can I get a grant?",
        answer:
          "The government's Boiler Upgrade Scheme helps pay for a heat pump when you replace a gas, oil or LPG boiler in England and Wales. You need an MCS certified installer, like us. We check if you can get it, and how much, at your free survey.",
      },
      {
        question: "Will it keep my home warm in winter?",
        answer:
          "Yes, when it is the right size. We size your heat pump from a room-by-room heat loss survey, so it is made for your home on the coldest days, not just a mild one.",
      },
      {
        question: "Do I need new radiators?",
        answer:
          "Not always. A heat pump runs cooler than a boiler, so some rooms may need a bigger radiator. The survey shows exactly which ones, so we don't replace the rest.",
      },
      {
        question: "Are heat pumps noisy?",
        answer:
          "Modern heat pumps are built to run quietly. We also choose the best place for the outdoor unit, away from bedroom windows and your neighbours, and check it meets the noise rules for permitted development.",
      },
      {
        question: "How much does a heat pump cost?",
        answer:
          "It depends on your home's heat loss, the size of the heat pump, and whether your radiators or cylinder need changing. We survey for free and then send you a fixed price in writing, with any grant taken off.",
      },
      fixedFaq,
      energyFinanceFaq,
      areaFaq,
    ],
    finalHeading: "Ready for warmer rooms and lower bills?",
    finalBody: "Answer 4 quick questions. We will call you back within 1 working day to book your free survey.",
    finalImage: `${P}/Heating/after.webp`,
    finalImageAlt: "An air source heat pump fitted against a brick wall by Greentek",
    formHeading: "Get your free heat pump quote",
  },
};
