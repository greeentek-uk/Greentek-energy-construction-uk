/**
 * A first read of whether a heat pump enquiry could get the Boiler Upgrade
 * Scheme, from the form's own answers — for sorting the inbox, not a promise
 * to the customer (nothing here is shown on the site). The survey decides.
 *
 * The scheme's rules it checks (gov.uk, checked 2026-10-29): the applicant
 * owns the property (owner or landlord, not a tenant), the heat pump replaces
 * fossil-fuel heating (gas, oil, LPG or electric — not an existing heat pump),
 * and it's in England or Wales. No EPC check: the scheme stopped needing one
 * on 28 April 2026. Oil and LPG homes are flagged for the off-gas uplift
 * (£1,500 more until March 2027, if there's no mains gas) — the form can't
 * tell whether there's a gas main, so it's "could", for the call.
 *
 * Scotland and Northern Ireland are told apart by postcode area; the scheme
 * doesn't run there, and an ad's targeting can spill over the border.
 */

export type GrantVerdict = "likely" | "check" | "unlikely";

export interface GrantCheck {
  verdict: GrantVerdict;
  /** One line for the email, e.g. "Likely — owner, replacing a gas boiler". */
  summary: string;
}

const VERDICT_LABELS: Record<GrantVerdict, string> = {
  likely: "Likely",
  check: "Check on the call",
  unlikely: "Unlikely",
};

const FOSSIL: Record<string, string> = {
  gas: "replacing a gas boiler",
  oil: "replacing an oil boiler",
  lpg: "replacing an LPG boiler",
  electric: "replacing electric heating",
};

/**
 * Postcode areas wholly outside England and Wales. TD is left out: it
 * crosses the border (Berwick-upon-Tweed is TD15).
 */
const OUTSIDE_SCHEME = /^(AB|DD|DG|EH|FK|G|HS|IV|KA|KW|KY|ML|PA|PH|ZE|BT)\d/i;

export function grantCheck(answers: {
  postcode: string;
  is_homeowner?: string;
  current_heating?: string;
}): GrantCheck {
  const against: string[] = [];
  const unsure: string[] = [];
  const forIt: string[] = [];

  const postcode = answers.postcode.replace(/\s+/g, "");
  if (OUTSIDE_SCHEME.test(postcode)) against.push("postcode is outside England and Wales");

  if (answers.is_homeowner === "yes") forIt.push("owner");
  else if (answers.is_homeowner === "no") against.push("not the owner — the owner or landlord applies");
  else if (answers.is_homeowner === "buying") unsure.push("still buying the property");
  else unsure.push("ownership not given");

  const heating = answers.current_heating ?? "";
  if (FOSSIL[heating]) forIt.push(FOSSIL[heating]);
  else if (heating === "heat_pump") against.push("already has a heat pump");
  else unsure.push(heating === "other" ? "heats the home with something else" : "current heating not given");

  const verdict: GrantVerdict = against.length ? "unlikely" : unsure.length ? "check" : "likely";
  const uplift =
    verdict !== "unlikely" && (heating === "oil" || heating === "lpg")
      ? " · could get £9,000 if there's no mains gas"
      : "";

  return {
    verdict,
    summary: `${VERDICT_LABELS[verdict]} — ${[...against, ...unsure, ...forIt].join(", ")}${uplift}`,
  };
}
