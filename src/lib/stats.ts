export interface ParsedStat {
  target: number;
  decimals: number;
  /** The source used thousands separators ("1,200"), so the count does too. */
  grouped: boolean;
  prefix: string;
  suffix: string;
}

/**
 * Splits an admin-typed stat like "£2.5m", "1,200+" or "98%" into the number
 * and the text either side of it, so the number can count up while the rest
 * stays put. Null when there's no number to animate.
 */
export function parseStat(value: string): ParsedStat | null {
  const match = value.match(/\d[\d,]*(\.\d+)?/);
  if (!match || match.index === undefined) return null;
  const raw = match[0];
  return {
    target: parseFloat(raw.replace(/,/g, "")),
    decimals: match[1] ? match[1].length - 1 : 0,
    grouped: raw.includes(","),
    prefix: value.slice(0, match.index),
    suffix: value.slice(match.index + raw.length),
  };
}

