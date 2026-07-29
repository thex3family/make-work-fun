// Reward maths for a win pulled from a player's Notion Success Plan.
//
// Ported from the n8n "Calculate Gold and EXP Returns" node. Kept as pure
// functions of their inputs so the rules can be tested without Notion or the
// database — this is the business logic that actually matters, and it used to
// live in a textarea.
//
// BEHAVIOUR IS PRESERVED FROM THE n8n VERSION, deliberately, including one
// quirk documented at `resolveDifficulty` below. Changing what a win is worth
// is a product decision, not a porting decision.

const REWARD_TABLE = {
  Goal: { exp: 500, gold: 0 },
  'Key Result': { exp: 250, gold: 0 },
  Project: { exp: 50, gold: 50 },
  Task: { exp: 25, gold: 25 }
};

const DEFAULT_REWARD = { exp: 25, gold: 25 };

const MAX_DIFFICULTY = 10;
const MIN_DIFFICULTY = 1;
const PUNCTUALITY_BONUS_PER_DAY = 0.05;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Whole days between two dates, ignoring clock time and timezone.
//
// Positive when the player closed the win *before* the day they had planned to
// do it — finishing early earns a gold bonus, finishing late a penalty.
export function punctualityInDays(closingDate, doDate) {
  const closing = new Date(closingDate);
  const planned = new Date(doDate);

  if (isNaN(closing.getTime()) || isNaN(planned.getTime())) return 0;

  const closingUtc = Date.UTC(
    closing.getFullYear(),
    closing.getMonth(),
    closing.getDate()
  );
  const plannedUtc = Date.UTC(
    planned.getFullYear(),
    planned.getMonth(),
    planned.getDate()
  );

  return Math.floor((plannedUtc - closingUtc) / MS_PER_DAY);
}

// Difficulty is clamped to 1..10.
//
// NOTE — the n8n original guarded this with
//   `if (difficulty && (type !== "Goal" || type !== "Key Result" || type !== "Project"))`
// which is always true: a single value cannot equal all three at once, so at
// least one `!==` always holds. The evident intent was `&&` (exclude those
// three types from difficulty scaling), but that has never been what ran — for
// four years every type has been difficulty-scaled, and every historical reward
// in the database reflects that.
//
// So this reproduces the *effective* behaviour, not the apparent intent.
// Switching to the intended rule would silently re-price Goals, Key Results and
// Projects, so it needs a deliberate decision. See AGENTS.md.
// The one deliberate divergence from the original: a negative difficulty is
// floored to 1. The n8n version passed negatives straight through, which would
// pay negative EXP. No row in the database has ever had one (the minimum is 0,
// which both versions treat as 1), so this changes nothing historically.
export function resolveDifficulty(rawDifficulty) {
  const parsed = Number(rawDifficulty);

  if (!rawDifficulty || !Number.isFinite(parsed) || parsed <= 0) {
    return MIN_DIFFICULTY;
  }

  return Math.min(parsed, MAX_DIFFICULTY);
}

// Gold scales with both difficulty and punctuality; EXP scales with difficulty
// only.
export function calculateRewards({ type, difficulty, closingDate, doDate }) {
  const today = new Date().toISOString().split('T')[0];
  const closing = closingDate || today;
  const planned = doDate || today;

  const punctuality = punctualityInDays(closing, planned);
  const resolvedDifficulty = resolveDifficulty(difficulty);

  // The original derived the gold modifier from `parseInt(difficulty)` — the
  // truncated integer — while paying EXP on the fractional value. 16% of
  // historical rows (12,448 of 75,891) carry a fractional difficulty, so this
  // asymmetry is load-bearing: dropping it would silently re-price them.
  const difficultyForModifier = Number.parseInt(resolvedDifficulty, 10);

  const modifier = Math.max(
    0,
    difficultyForModifier +
      punctuality * PUNCTUALITY_BONUS_PER_DAY * difficultyForModifier
  );

  const { exp, gold } = REWARD_TABLE[type] || DEFAULT_REWARD;

  const expReward = Math.round(exp * resolvedDifficulty);
  const goldReward = Math.round(gold * modifier);

  // Baseline is what the win would pay with no punctuality effect at all.
  const baselineGold = gold * resolvedDifficulty;

  let trend;
  if (goldReward < baselineGold) trend = 'down';
  else if (goldReward === baselineGold) trend = 'check';
  else trend = 'up';

  return {
    difficulty: resolvedDifficulty,
    punctuality,
    exp_reward: expReward,
    gold_reward: goldReward,
    trend
  };
}
