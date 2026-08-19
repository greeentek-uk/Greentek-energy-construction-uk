import { getPageContent } from "@/lib/cms";

export default async function Process() {
  const { eyebrow, headingLine1, headingLine2, subheading, steps } =
    await getPageContent("process");

  return (
    <section className="bg-black py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* items-start is what lets the left column stick — don't change it
            to items-center, and keep overflow-hidden off every ancestor. */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT: sticky header */}
          <div className="lg:sticky lg:top-28">
            <p className="mb-6 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[16px]">
              {eyebrow}
            </p>
            <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.5rem]">
              {headingLine1} <br />
              {headingLine2}
            </h2>
            <p className="mt-4 text-md font-normal leading-relaxed text-white/80 md:text-xl">
              {subheading}
            </p>
          </div>

          {/* RIGHT: steps that scroll past it */}
          <div className="flex flex-col gap-3 rounded-xl bg-[#101314] p-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl bg-[#000000] px-6 py-7 md:px-8 md:py-8"
              >
                <span className="mb-5 inline-block rounded-xl bg-[#c5eb02] px-3 py-1 text-[10px] font-black uppercase text-black">
                  {step.number}
                </span>
                <h3 className="mb-2 text-xl font-bold uppercase text-white md:text-2xl">
                  {step.title}
                </h3>
                <p className="text-md leading-relaxed text-white/85">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}