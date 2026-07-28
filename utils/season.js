// Seasons are calendar quarters, starting 2021-07-01 which is Season 1.
//
// This mirrors the `season_of(date)` function in Postgres. The database is the
// source of truth for which season a win belongs to — these helpers exist so
// the UI can label a season without anyone hardcoding "Season 19" every
// quarter. If the season cadence ever changes, change it in both places.

const FIRST_SEASON_YEAR = 2021;
const FIRST_SEASON_QUARTER = 3; // 2021 Q3 is Season 1

const QUARTER_RANGES = [
  'Jan 1 - Mar 31',
  'Apr 1 - Jun 30',
  'Jul 1 - Sep 30',
  'Oct 1 - Dec 31'
];

// Season number for a date. Returns 0 for anything before Season 1, matching
// the '0S' fallback in the Postgres function.
export function seasonNumber(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 0;

  const quarter = Math.floor(d.getMonth() / 3) + 1;
  const n =
    (d.getFullYear() - FIRST_SEASON_YEAR) * 4 +
    quarter -
    (FIRST_SEASON_QUARTER - 1);

  return n > 0 ? n : 0;
}

// The database's season label, e.g. 21 -> '21S'.
export function seasonTag(n) {
  return `${n}S`;
}

export function currentSeasonTag() {
  return seasonTag(seasonNumber());
}

// Parse a database season label back to a number, e.g. '21S' -> 21.
// Returns 0 for anything unparseable, so callers can `||` a fallback.
export function seasonNumberFromTag(tag) {
  const n = parseInt(tag, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Which calendar quarter a season falls in. Inverse of seasonNumber.
export function seasonQuarter(n) {
  const offset = n + (FIRST_SEASON_QUARTER - 2);
  return {
    year: FIRST_SEASON_YEAR + Math.floor(offset / 4),
    quarter: (offset % 4) + 1
  };
}

// Human date range for a season, e.g. 21 -> 'Jul 1 - Sep 30'.
export function seasonDateRange(n) {
  return QUARTER_RANGES[seasonQuarter(n).quarter - 1];
}

export function seasonLabel(n) {
  return `Season ${n}`;
}
