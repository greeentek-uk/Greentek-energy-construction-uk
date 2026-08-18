/**
 * One-time seed: transcribes the current hardcoded JSX copy for all 18 page
 * content blocks into Mongo, so editing can start from exactly what's live
 * today. Safe to re-run indefinitely (uses seedBlockIfMissing, never
 * overwrites an existing doc's draft/published state). Run via
 * `npm run seed:page-content`.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { seedBlockIfMissing } from "../src/lib/db/pageContent";
import type { PageContentMap } from "../src/data/pageContent";

config({ path: ".env.local" });

const seedData: PageContentMap = {
  "home-hero": {
    trustBadgeSuffix: "by 500+ Homeowners",
    headingLine1: "Bridging Construction",
    headingLine2: "with Renewable Energy.",
    body: "One team for solar, heat pumps, insulation, and full property renovation, residential and commercial, across the West Midlands and Wales.",
    ctaLabel: "Consult an Expert",
  },
  "why-us": {
    eyebrow: "Why Greentek",
    headingLine1: "Three Reasons",
    headingLine2: "Home Owners Trust Us.",
    subheading: "Accreditation, experience, and accountability built into every project we take on.",
    items: [
      {
        heading: "BRAND AGNOSTIC",
        body: "We select the best in class technology or hardware, based on client requirements.",
      },
      {
        heading: "FULL LIFECYCLE SUPPORT",
        body: "From initial consultancy and design to installation and long-term maintenance, we stay by your side.",
      },
      {
        heading: "OUR STANDARD. YOUR GUARANTEE.",
        body: "Something not right? We come back and fix it. Free. No questions asked, that's a guarantee.",
      },
    ],
  },
  "home-why-choose-us": {
    eyebrow: "Why Choose Us",
    heading: "Why Homeowners Choose Greentek.",
    subheading: "Certified installers, fixed prices and one accountable team, from the first survey through to the final sign-off.",
    items: [
      {
        id: "certified",
        title: "Certified & Accredited Installers",
        description: "Every installer is MCS and TrustMark certified, so the work is signed off to the standard your warranty and any grant funding requires.",
        image: "/images/projects/Examples/Solar Panel Installation.png",
      },
      {
        id: "one-team",
        title: "One Team, Start To Finish",
        description: "The same team handles the energy work and the building work, so there's a single point of contact and no trades passing the blame between each other.",
        image: "/images/projects/RIR/Mid RiR.jpeg",
      },
      {
        id: "fixed-price",
        title: "Fixed-Price, No Surprises",
        description: "You get a clear written quote before work starts, and that's what you pay, not an inflated final invoice once the job is already underway.",
        image: "/images/projects/heating-system.jpg",
      },
      {
        id: "funding",
        title: "We Handle The Funding Paperwork",
        description: "From grant schemes to reduced VAT, we check what your property is eligible for and manage the application so you're not left chasing forms yourself.",
        image: "/images/projects/Shop Chimney/Post shop.jpeg",
      },
      {
        id: "guarantee",
        title: "Workmanship You Can Rely On",
        description: "Every installation is backed by a workmanship guarantee, so if something isn't right after we've left, we come back and put it right.",
        image: "/images/projects/External Wall Insulation/after.jpg",
      },
      {
        id: "local",
        title: "Local Team, On Site When You Need Us",
        description: "Based in the areas we work in, so if a question comes up during or after the job, you're speaking to someone who can actually visit.",
        image: "/images/projects/Examples/solar.png",
      },
    ],
  },
  testimonials: {
    eyebrow: "Client Stories",
    heading: "Trusted By Homeowners And Businesses Alike",
    subheading: "See how our renewable energy solutions are helping customers reduce costs, increase efficiency, and gain greater energy independence.",
    items: [
      {
        name: "Amjid H.",
        quote: "I got my insulation done by greentek they were fantastic from the start. On the way we had one two problems from the contractors but greentek took care of it! Kept me informed and solved the issues. They communicated consistently and kept me in the loop.",
        role: "Home Owner",
        rating: 5,
        image: "/images/reviews/amjid.png",
      },
      {
        name: "Luki",
        quote: "We required an urgent new boiler installation due to the old one breaking down and being unrepairable. Greentek Energy supplied and fitted a new one at very short notice so our tenants could have heating and hot water again. We are very grateful to Greentek Energy and would recommend them highly.",
        role: "Business Owner",
        rating: 5,
        image: "/images/reviews/luki.png",
      },
      {
        name: "Ian B.",
        quote: "Part of the Ecobility company. the people at Greentek know their stuff. Got a quote in just under 20 minutes where others insisted on coming around the house. They were cheaper too!",
        role: "Home Owner",
        rating: 5,
        image: "/images/reviews/ian.png",
      },
      {
        name: "Omer M.",
        quote: "Quick and efficient service.",
        role: "Home Owner",
        rating: 5,
        image: "/images/reviews/omer.png",
      },
    ],
  },
  faq: {
    eyebrow: "Common Inquiries",
    heading: "Frequently Asked Questions",
    items: [
      {
        question: "What services does Greentek provide?",
        answer: "We provide comprehensive services including solar PV installation, air source heat pumps, boiler upgrades, new central heating systems, loft insulation, external wall insulation, property refurbishment, kitchen refurbishment, bathroom refurbishment, and building extensions.",
      },
      {
        question: "Do you offer air source heat pump conversions and ASHP installation?",
        answer: "Yes. Greentek specializes in air source heat pump installation and conversions, helping homeowners transition to efficient, low-carbon heating solutions across West Midlands, Wolverhampton, and Wales.",
      },
      {
        question: "What insulation solutions do you offer?",
        answer: "We provide loft insulation and external wall insulation services to improve energy efficiency, reduce utility costs, and meet building regulations for property refurbishment projects.",
      },
      {
        question: "Are you accredited and compliant?",
        answer: "Yes, we maintain full compliance with industry standards. We are accredited by leading bodies such as TrustMark, HIES, and Gas Safe, ensuring quality and peace of mind for every solar installation, heat pump setup, and construction project.",
      },
      {
        question: "How can I contact Greentek for solar, heat pump, or refurbishment projects?",
        answer: "You can reach us directly via phone at 0333 533 4567 or email info@greentekenergy.co.uk. Our team is ready to discuss your solar PV installation, boiler upgrade, property refurbishment, or building extension project and provide a formal quote.",
      },
    ],
  },
  areas: {
    eyebrow: "Service Areas",
    heading: "Local to Your Area.",
    subheading: "Greentek is in-house, not a subcontracted franchise. Our team lives and works in the towns we serve.",
    largeArea: {
      name: "Solihull, Birmingham",
      stat: "Our Home Base Since 2020",
      note: "Same-week surveys across the wider Birmingham metro area.",
      image: "/images/areas/solihull.jpg",
      path: "/locations/solihull-birmingham",
    },
    smallAreas: [
      { name: "Wolverhampton", image: "/images/areas/wolverhampton.jpg", path: "/locations/wolverhampton" },
      { name: "Cardiff", image: "/images/areas/cardiff.jpg", path: "/locations/cardiff" },
      { name: "Coventry", image: "/images/areas/coventry.jpg", path: "/locations/coventry" },
      { name: "Swansea", image: "/images/areas/swansea.jpg", path: "/locations/swansea" },
      { name: "Dudley", image: "/images/areas/dudley.jpg", path: "/locations/dudley" },
    ],
    tickerItems: [
      "West Bromwich", "Sandwell", "Sutton Coldfield", "Telford", "Kidderminster",
      "Bromsgrove", "Redditch", "Stourbridge", "Halesowen", "Smethwick",
      "Newport", "Bridgend", "Neath", "Wrexham", "Merthyr Tydfil", "Port Talbot",
    ],
    tickerLabel: "More Areas",
    ctaLabel: "View All Areas",
  },
  "core-pillars": {
    heading: "Our Core Pillars",
    intro: "Delivering sustainable excellence through integrated renewable energy solutions and professional construction services including solar PV installation and heat pump technology.",
    pillars: [
      {
        label: "Division 01",
        title: "Energy & Carbon",
        description: "Turnkey multi-measure energy upgrades, from Solar PV to high-efficiency thermal systems.",
        items: ["Solar PV & Storage", "Heat Pump Installations", "Fabric Insulation"],
      },
      {
        label: "Division 02",
        title: "Construction",
        description: "Primary contractor for large-scale renovations, building services, and planned maintenance.",
        items: ["Commercial Refurbishment", "Domestic Extensions", "Planned Maintenance"],
      },
    ],
  },
  verticals: {
    eyebrow: "Our Services",
    heading: "Energy. Built. Maintained.",
    subheading: "Eleven services across two sides of the business, delivered by one accredited team instead of three different contractors.",
    groups: [
      {
        name: "Energy Solutions",
        intro: "Turnkey multi-measure upgrades that cut what your property costs to run.",
        href: "/energy-solutions",
        services: [
          { title: "Solar PV Installations", body: "Generate your own electricity, with battery storage to use it after dark.", href: "/services/solar-pv-installations" },
          { title: "Air Source Heat Pump Installations", body: "Swap fossil fuel heating for a system that runs at a fraction of the cost.", href: "/services/air-source-heat-pump-installations" },
          { title: "Complete Heating System Upgrades", body: "New boiler, radiators and controls, sized properly so every room actually gets warm.", href: "/services/complete-heating-system-upgrades" },
          { title: "Loft Insulation", body: "Stop paying to heat the sky. The cheapest measure on this page, and the fastest.", href: "/services/loft-insulation" },
          { title: "External Wall Insulation & Rendering", body: "Warmer, cheaper to run, and a completely new finish to the outside of the property.", href: "/services/external-wall-insulation-rendering" },
        ],
      },
      {
        name: "Home Solutions",
        intro: "Principal contractor for renovation, extension and maintenance work, residential and commercial.",
        href: "/home-solutions",
        services: [
          { title: "Full Home Renovation", body: "Whole-property refurbishment run end to end, on one programme and one point of contact.", href: "/services/full-home-renovation" },
          { title: "Single Storey Extension", body: "More usable space, handled from drawings and building control through to handover.", href: "/services/single-storey-extension" },
          { title: "Loft Conversions", body: "Turn dead roof space into a bedroom or office without extending the footprint.", href: "/services/loft-conversions" },
          { title: "Kitchen Renovations", body: "Full strip-out and fit, with the electrics, plumbing and plastering under the same team.", href: "/services/kitchen-renovations" },
          { title: "Living Room Improvements", body: "Reconfigure, replaster and finish the room the household actually spends its evenings in.", href: "/services/living-room-improvements" },
          { title: "Commercial Planned Maintenance", body: "Scheduled upkeep across commercial sites, so repairs stop arriving as emergencies.", href: "/services/commercial-planned-maintenance" },
        ],
      },
    ],
  },
  accreditations: {
    heading: "Fully Accredited & Certified.",
    logos: [
      { name: "Gas Safe Register", image: "/images/accreditations/gas-safe.png" },
      { name: "HIES", image: "/images/accreditations/hies.png" },
      { name: "Quality Mark", image: "/images/accreditations/qualitymark.png" },
      { name: "SWIGA", image: "/images/accreditations/swiga.png" },
    ],
  },
  process: {
    eyebrow: "Our Process",
    headingLine1: "Four Steps.",
    headingLine2: "Zero Surprises.",
    subheading: "From the first call to the final handover, a clear, transparent process designed to deliver solar, home improvement, and renovation work with zero hassle.",
    steps: [
      { number: "STEP 1", title: "Free Survey", body: "Book online or call. A Greentek specialist visits your property to assess your solar, heating, insulation, or renovation needs." },
      { number: "STEP 2", title: "Custom Quote", body: "Get a clear, fixed-price quote with material and brand options, and an honest timeline, no hidden fees." },
      { number: "STEP 3", title: "Expert Installation", body: "Our in-house accredited team carries out the work, solar, heat pump, insulation, or renovation, no subcontractors passing the job around." },
      { number: "STEP 4", title: "Handover & Warranty", body: "We walk you through everything on completion, clean up after ourselves, and hand over your written warranty." },
    ],
  },
  brands: {
    eyebrow: "Our Network",
    heading: "Trusted by Industry Leaders.",
    subheading: "Strategic partnerships with leading global manufacturers to deliver high-performance hardware.",
    logos: [
      { name: "AIKO", image: "/images/brands/aiko.png" },
      { name: "Growatt", image: "/images/brands/growatt.png" },
      { name: "Ideal Heating", image: "/images/brands/ideal-heating.png" },
      { name: "InstaGen", image: "/images/brands/instagen.png" },
      { name: "JinkoSolar", image: "/images/brands/jinko-solar.png" },
      { name: "SolaX", image: "/images/brands/solax.png" },
      { name: "Trinasolar", image: "/images/brands/trina-solar.png" },
      { name: "Vaillant", image: "/images/brands/vaillant.png" },
      { name: "Worcester Bosch", image: "/images/brands/worcester.png" },
      { name: "SWIP", image: "/images/brands/swip.png" },
    ],
  },
  stats: {
    items: [
      { value: "500+", label: "Projects Completed", description: "Solar, heat pump and storage installs delivered across residential and commercial properties." },
      { value: "25+", label: "Years Combined Experience", description: "An accredited team with decades of hands-on energy and construction work behind it." },
      { value: "98%", label: "Satisfaction Rate", description: "One team handling the whole job, so it gets done properly and signed off first time." },
    ],
  },
  "about-us-slide": {
    eyebrow: "About Us",
    heading: "A Home That Works Harder, For Less.",
    body: "We believe you shouldn't need three different companies to power your property, fix your heating, and renovate your space. That's why Greentek brings solar, heat pumps, and energy storage together with expert construction and renovation both residential and commercial, so everything gets handled by one accredited team, properly, from day one.",
  },
  "projects-preview": {
    eyebrow: "Our Work",
    heading: "See the Difference.",
    subheading: "Drag the slider to see the before and after, hover a project to read what was done, solar, home improvement, and renovation work, side by side.",
    beforeBadgeLabel: "Before",
    ctaLabel: "View All Projects",
  },
  "services-page-header": {
    headingPrefix: "Our",
    headingHighlight: "Services",
    subheading: "From air source heat pump installation and solar PV systems to property refurbishment, loft insulation, and building extensions, Greentek delivers comprehensive construction and renewable energy solutions tailored to your needs.",
  },
  "locations-page-header": {
    headingPrefix: "Areas We",
    headingHighlight: "Cover",
    subheading: "Greentek is in-house, not a subcontracted franchise. Our teams live and work across the West Midlands and Wales, delivering solar, heating, insulation and renovation projects locally.",
  },
  "projects-page-header": {
    headingPrefix: "Our",
    headingHighlight: "Project Gallery",
    subheading: "Explore our track record of excellence across the UK, featuring high-impact renewable energy installations and premium construction projects.",
  },
  "about-page": {
    heroHeadingLine1: "Leading the Way in",
    heroHeadingHighlight: "Construction & Energy",
    heroSubheading: "Greentek is an Agile, Multi-disciplinary construction and Energy Firm, dedicated to delivering high-performance solutions for a sustainable future.",
    journeyHeading: "Our Journey Since 2020",
    journeyParagraphs: [
      "Established in 2020, Greentek has rapidly grown into a powerhouse in the UK construction and energy sector. We have successfully delivered over 500 projects under major schemes including ECO3, ECO4, and LA Flex.",
      "Our approach is built on two core pillars: Energy & Decarbonization and Commercial & Domestic Construction. By bridging the gap between traditional building practices and modern energy efficiency, we provide a unique, holistic service to our clients.",
    ],
  },
};

async function run() {
  await getDb();
  for (const key of Object.keys(seedData) as (keyof PageContentMap)[]) {
    await seedBlockIfMissing(key, seedData[key]);
    console.log(`  seeded (if missing): ${key}`);
  }
}

run()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
