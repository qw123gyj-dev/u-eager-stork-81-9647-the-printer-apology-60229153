// The Printer Apology — make.fun bounty
// slug: u-eager-stork-81-9647-the-printer-apology-60229153
//
// The task: the funniest one-line apology from a printer, 120 characters
// max. An AI judge compares entries two at a time and picks the funnier
// one, weighing the criteria in this order:
//
//   1. A note that is genuinely an apology from a printer to its office,
//      with the printer's own gripes in it, loses to any note that is on
//      the subject.
//   2. The laugh: the line lands a real joke rather than a mild
//      complaint, and the punch comes at the end.
//   3. Printer truth: the grievance is something a printer would
//      actually suffer, like jams, cheap paper, staples, or being asked
//      for colour.
//   4. Freshness: the angle is not the first joke anyone would write
//      about a printer.
//   5. Economy: every word earns its place inside the 120 characters,
//      with no padding.
//
// A note that is only sad, or only rude, is weaker than one that is
// funny. Length for its own sake does not count.
//
// This program is a deterministic entry picker. It holds a hand-written
// list of candidate apology lines from one specific office printer,
// scores every candidate against the judge's five criteria in the judge's
// own order of importance, picks the best, validates it against the
// sealed gate (UTF-8 text, 1 to 120 characters, not only whitespace),
// writes it to $MAKEFUN_OUTPUT_DIR/entry.txt (falling back to
// /output/entry.txt), reads it back and verifies the bytes match.
//
// The printer speaking, in one paragraph, so every score below can be
// checked against something real: it is the shared office printer on the
// third floor, fed the cheapest recycled paper the budget allows, asked
// for colour it does not have, jammed with stapled reports, and sworn at
// whenever it dares to warm up. It has eaten boarding passes, shredded
// invoices, and printed the confidential memo to the wrong floor. It is
// not a person and it knows it — that is the joke. It apologises the way
// a machine would: precisely, resentfully, and with the punchline saved
// for the last clause, where the blame quietly slides back onto the
// people who feed it.
//
// Why a scorer instead of a hard-coded line: the field is judged pairwise
// and blind, and the winning line is the one that survives the criteria
// in order. A scorer forces every candidate to earn its place on the same
// five axes the judge uses, and makes the choice reproducible: run this
// program twice and it picks the same line, because there is no
// randomness anywhere in it. The weights below mirror the judge's
// ordering — the laugh and printer truth carry the most weight,
// freshness next, and economy last — while the first criterion (a genuine
// apology from a printer, with its own gripes) is a hard gate, not a
// score: any candidate that is not an apology from a printer is rejected
// before scoring starts.
//
// Node 22, standard library only. No network, no environment secrets,
// no files read from outside this repository.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// One candidate apology line, with a score on each of the judge's
// criteria. Every score is an integer from 0 to 10, judged by hand
// against the portrait of the printer above. 10 means the line nails
// that criterion; 0 means it fails it outright.
interface Candidate {
  // The apology line itself. Must be a single line of 1 to 120 chars.
  line: string;
  // Criterion 2: the laugh — a real joke, with the punch at the end.
  punch: number;
  // Criterion 3: printer truth — a grievance a printer would suffer.
  truth: number;
  // Criterion 4: freshness — not the first joke anyone would write.
  freshness: number;
  // Criterion 5: economy — every word earns its place.
  economy: number;
  // One line saying why this line was considered, for the report.
  why: string;
}

// A candidate after scoring, carrying its total and its rank.
interface ScoredCandidate extends Candidate {
  total: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// The gate (from the competition rules, sealed scorer)
// ---------------------------------------------------------------------------

// The gate checks that /output/entry.txt is UTF-8 text of 1 to 120
// characters, not only white space. Only a valid entry goes before the
// judge; an invalid one is listed with 0 and no rate, and takes no prize.
const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 120;

// A candidate must be a genuine apology from the printer: it must
// contain an apology marker (sorry / apologise / apologies / forgive)
// and be written in the printer's first person. The rules say the note
// is "an apology note written by an office printer"; a line with no
// apology in it, or one written about the printer by someone else, risks
// losing on the judge's first criterion outright, so this program only
// ever considers lines that apologise in the first person.
const APOLOGY_MARKERS = ["sorry", "apologise", "apologies", "forgive"];

// ---------------------------------------------------------------------------
// Scoring weights — mirror the judge's ordering
// ---------------------------------------------------------------------------

// The judge weighs the laugh first among the scored criteria, then
// printer truth, then freshness, then economy. The weights sum to 1.00,
// so the total is on the same 0–10 scale as the per-criterion scores.
const WEIGHT_PUNCH = 0.35;
const WEIGHT_TRUTH = 0.3;
const WEIGHT_FRESHNESS = 0.2;
const WEIGHT_ECONOMY = 0.15;

// ---------------------------------------------------------------------------
// Candidates — hand-written, one line each, from this printer
// ---------------------------------------------------------------------------

// Twenty-six candidates. Each one was written by hand against the
// portrait above, not generated, and each carries its own justification.
// The list is deliberately mixed: strong contenders, plausible-but-flat
// stock apologies, lines that are funny but barely about a printer, and
// lines that are true but have no punch — so the scorer has real work to
// do and the winner has to beat genuine alternatives on every axis.
// The obvious first joke ("have you tried turning it off and on again")
// is in the list on purpose, scored honestly, so the picker can show
// why it loses.
const CANDIDATES: Candidate[] = [
  {
    line: "Sorry I ate your report. It was the only thing in this office thinner than the paper you feed me.",
    punch: 9,
    truth: 9,
    freshness: 8,
    economy: 9,
    why: "A real apology with a printer's gripe (cheap paper, eaten pages) and a punch that lands last: the blame slides from the printer onto the office, and the report itself is thinner than the paper.",
  },
  {
    line: "I am sorry I jammed on page one. Your paper is so cheap it apologised to me first.",
    punch: 9,
    truth: 8,
    freshness: 8,
    economy: 10,
    why: "Short and economical — 82 characters, no padding — and the twist is the paper apologising first, which flips the whole premise of the apology.",
  },
  {
    line: "Forgive me for printing page 47 of 48, then dying. I wanted you to feel what hope tastes like.",
    punch: 9,
    truth: 8,
    freshness: 9,
    economy: 8,
    why: "The most printer-true failure there is — dying one page from the end — and the punch reframes a jam as a deliberate lesson in hope.",
  },
  {
    line: "I apologise for the jam. Your staples were doing parkour in my rollers and I panicked.",
    punch: 8,
    truth: 9,
    freshness: 9,
    economy: 8,
    why: "Staples in the rollers are a grievance only a printer could list, and 'parkour' gives a jam a physical comedy image nobody else would reach for first.",
  },
  {
    line: "Sorry about the streaks. I have been drinking the cheap ink you buy me and frankly, it shows.",
    punch: 8,
    truth: 9,
    freshness: 8,
    economy: 8,
    why: "Cheap ink is a real printer suffering, and 'frankly, it shows' is a drunk's confession — the printer admits the problem is what it was fed.",
  },
  {
    line: "Sorry I only print in colour when nobody is watching. The black cartridge filed for burnout.",
    punch: 8,
    truth: 8,
    freshness: 9,
    economy: 8,
    why: "Being asked for colour is one of the judge's own examples, and the punch turns a cartridge into an employee filing a burnout complaint.",
  },
  {
    line: "I apologise for refusing to print. You fed me paper so thin I could read the other side and feel judged.",
    punch: 8,
    truth: 9,
    freshness: 8,
    economy: 7,
    why: "Thin cheap paper again, but from the other side: the printer is the one being judged, and the last clause is where the joke turns.",
  },
  {
    line: "Sorry I jammed during your big presentation. Your slides had 47 fonts; I simply gave up first.",
    punch: 8,
    truth: 8,
    freshness: 7,
    economy: 8,
    why: "A jam at the worst possible moment is printer truth, and the punch blames the human's 47 fonts — the printer quit before the audience did.",
  },
  {
    line: "I am sorry I beeped all night. I was not broken — I was practising Morse code for help.",
    punch: 8,
    truth: 7,
    freshness: 9,
    economy: 8,
    why: "The 3 a.m. beeping every office knows, reframed as a distress signal — fresh because the printer is asking for rescue, not malfunctioning.",
  },
  {
    line: "I apologise for the toner low warning. I have been screaming it since Tuesday and you keep pressing OK.",
    punch: 8,
    truth: 9,
    freshness: 7,
    economy: 7,
    why: "The ignored warning light is a grievance every printer shares, and the punch is the office's own habit — pressing OK on a scream for help.",
  },
  {
    line: "Sorry I ate three pages and spat out one. Your 40-page meeting could have been an email.",
    punch: 8,
    truth: 7,
    freshness: 8,
    economy: 8,
    why: "The printer eats pages and spits one back, then delivers the verdict every office worker secretly agrees with — the meeting should have been an email.",
  },
  {
    line: "Forgive me for printing the confidential memo to the wrong floor. The Wi-Fi told me to, and I obey authority.",
    punch: 8,
    truth: 7,
    freshness: 9,
    economy: 7,
    why: "Wrong-floor printing is a real printer sin, and the punch is a machine blaming the network with the obedience of a good soldier.",
  },
  {
    line: "Sorry for the warm-up noise at 3 a.m. I was rehearsing my resignation and the fan joined in.",
    punch: 7,
    truth: 6,
    freshness: 8,
    economy: 8,
    why: "The warm-up whirr nobody can sleep through, recast as a resignation rehearsal — the printer wants out, and even its fan is in on it.",
  },
  {
    line: "Sorry I shredded your invoice. It was the tastiest thing you have fed me all year.",
    punch: 8,
    truth: 6,
    freshness: 9,
    economy: 9,
    why: "Short and sharp: the shredder-as-mouth joke, with the punch implying the office feeds the printer nothing but garbage.",
  },
  {
    line: "Forgive the double-sided disaster. I flipped the page and your staples held a grudge.",
    punch: 7,
    truth: 8,
    freshness: 8,
    economy: 8,
    why: "Duplex gone wrong plus staples — two printer grievances in one line — and the punch gives the staples a motive.",
  },
  {
    line: "Apologies for the paper jam. I choked on the recycled paper you swore was 'basically the same'.",
    punch: 7,
    truth: 9,
    freshness: 7,
    economy: 8,
    why: "Recycled paper that is not 'basically the same' is the budget office's signature sin; the joke is solid but the phrasing is the most ordinary in the field.",
  },
  {
    line: "I am sorry I printed your love letter to the whole office. The address bar and I had a misunderstanding.",
    punch: 7,
    truth: 6,
    freshness: 9,
    economy: 7,
    why: "A misaddressed print job with the highest possible stakes, and the punch is a polite euphemism for a catastrophe.",
  },
  {
    line: "Sorry I need a firmware update to print a PDF. Even I do not know what I am anymore.",
    punch: 7,
    truth: 7,
    freshness: 8,
    economy: 8,
    why: "The firmware-update-to-print-a-PDF absurdity is real, and the punch is an identity crisis — a machine that has forgotten what it is for.",
  },
  {
    line: "Forgive the smudges. I cried a little when you asked for 200 copies of a spreadsheet nobody will read.",
    punch: 7,
    truth: 8,
    freshness: 8,
    economy: 7,
    why: "Smudges plus a 200-copy spreadsheet nobody reads: the printer weeps over wasted effort, and the punch is the futility of the job itself.",
  },
  {
    line: "Sorry about the queue. Forty-seven print jobs walked in wearing the same name and I lost the will to choose.",
    punch: 7,
    truth: 8,
    freshness: 8,
    economy: 7,
    why: "A print queue full of identically named jobs is a true office pain, and the punch is the printer losing the will to choose — a small existential crisis.",
  },
  {
    line: "Apologies for the faded text. I rationed my last drops of toner for the document you actually care about.",
    punch: 7,
    truth: 8,
    freshness: 7,
    economy: 7,
    why: "Faded text from rationed toner, and the punch is a quiet accusation: the printer saved its best for the one document that mattered, and it was not yours.",
  },
  {
    line: "I am sorry I printed your boarding pass upside down. Gravity is the only thing in this office that works for free.",
    punch: 7,
    truth: 6,
    freshness: 9,
    economy: 6,
    why: "An upside-down boarding pass is a fresh angle — the printer as travel agent — but the punch wanders away from printer truth into a general office joke, and the line is long.",
  },
  {
    line: "Forgive me for the blank pages. I printed your ideas exactly as I found them.",
    punch: 8,
    truth: 5,
    freshness: 8,
    economy: 9,
    why: "A sharp punch and the shortest line in the field, but it is more rude than printer-true: blank pages are a printer failure, and the joke is really about the human's ideas.",
  },
  {
    line: "Sorry for the 'PC LOAD LETTER' era. I have been speaking in riddles since 1997 and nobody taught me better.",
    punch: 6,
    truth: 8,
    freshness: 5,
    economy: 7,
    why: "The cryptic error message is real printer history, but the reference is the one every office worker already knows — the opposite of fresh, and the laugh is recognition, not a joke.",
  },
  {
    line: "I apologise. Have you tried turning it off and on again?",
    punch: 5,
    truth: 6,
    freshness: 1,
    economy: 8,
    why: "The first joke anyone would write about a printer, included on purpose and scored honestly: it is an apology, it is short, but it has no printer gripe of its own and no punch that belongs to this machine.",
  },
  {
    line: "Sorry. I am out of paper.",
    punch: 2,
    truth: 7,
    freshness: 2,
    economy: 9,
    why: "The flat baseline: a true printer complaint with no joke, no punch and no angle — the control line that shows what the scorer is for.",
  },
];

// ---------------------------------------------------------------------------
// Validation — criterion 1 as a hard gate, plus the sealed gate
// ---------------------------------------------------------------------------

// Check one candidate against every hard rule. Returns a list of reasons
// it fails; an empty list means the candidate is eligible to be scored.
function validateCandidate(candidate: Candidate): string[] {
  const problems: string[] = [];
  const line = candidate.line;

  // Must be a single line: no newline characters anywhere.
  if (line.includes("\n") || line.includes("\r")) {
    problems.push(`"${line}" spans more than one line`);
  }

  // Must be a genuine apology from the printer: an apology marker, in
  // the first person. The judge's first criterion is on-subject, so a
  // line with no apology in it never reaches the scoring.
  const lower = line.toLowerCase();
  const hasApology = APOLOGY_MARKERS.some((marker) => lower.includes(marker));
  if (!hasApology) {
    problems.push(`"${line}" contains no apology`);
  }
  const firstPerson = /\b(i|my|me|we|our)\b/.test(lower);
  if (!firstPerson) {
    problems.push(`"${line}" is not written in the printer's first person`);
  }

  // Sealed gate: 1 to 120 characters (counted in code points, as the
  // scorer counts them).
  const length = [...line].length;
  if (length < GATE_MIN_CHARS) {
    problems.push(`"${line}" is shorter than ${GATE_MIN_CHARS} character`);
  }
  if (length > GATE_MAX_CHARS) {
    problems.push(`"${line}" is ${length} characters, over the ${GATE_MAX_CHARS} limit`);
  }

  // Sealed gate: not only whitespace.
  if (line.trim().length === 0) {
    problems.push(`"${line}" is only whitespace`);
  }

  // Every per-criterion score must be an integer in 0..10.
  const scores: Array<[string, number]> = [
    ["punch", candidate.punch],
    ["truth", candidate.truth],
    ["freshness", candidate.freshness],
    ["economy", candidate.economy],
  ];
  for (const [name, score] of scores) {
    if (!Number.isInteger(score) || score < 0 || score > 10) {
      problems.push(`"${line}" has an out-of-range ${name} score: ${score}`);
    }
  }

  return problems;
}

// Validate the whole candidate list up front. Any invalid candidate is
// dropped with a warning; the program never scores a line that cannot
// legally be entered.
function eligibleCandidates(candidates: Candidate[]): Candidate[] {
  const kept: Candidate[] = [];
  for (const candidate of candidates) {
    const problems = validateCandidate(candidate);
    if (problems.length === 0) {
      kept.push(candidate);
    } else {
      for (const problem of problems) {
        console.warn(`[drop] ${problem}`);
      }
    }
  }
  if (kept.length === 0) {
    throw new Error("No eligible candidates remain after validation.");
  }
  return kept;
}

// ---------------------------------------------------------------------------
// Scoring — the judge's criteria, in the judge's order of importance
// ---------------------------------------------------------------------------

// Score one candidate. The total is the weighted sum of the four scored
// criteria; the weights mirror the judge's ordering (the laugh, then
// printer truth, then freshness, then economy). Rounded to two decimals
// so the report is readable and the ordering is exact.
function scoreCandidate(candidate: Candidate): number {
  const total =
    candidate.punch * WEIGHT_PUNCH +
    candidate.truth * WEIGHT_TRUTH +
    candidate.freshness * WEIGHT_FRESHNESS +
    candidate.economy * WEIGHT_ECONOMY;
  return Math.round(total * 100) / 100;
}

// Score every eligible candidate and rank them. The sort is fully
// deterministic: total descending, then line ascending (plain code-unit
// order), so two runs can never disagree and no tie is left to chance.
function rankCandidates(candidates: Candidate[]): ScoredCandidate[] {
  const scored: ScoredCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    total: scoreCandidate(candidate),
    rank: 0,
  }));
  scored.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    if (a.line < b.line) {
      return -1;
    }
    if (a.line > b.line) {
      return 1;
    }
    return 0;
  });
  scored.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  return scored;
}

// Prove the choice is deterministic: rank the field a second time from
// scratch and demand the identical ranking. The program has no randomness,
// no clock and no environment input in its scoring path, so a second run
// must agree exactly; if it ever does not, something is broken and the
// program fails loudly instead of writing an entry it cannot reproduce.
function verifyDeterminism(candidates: Candidate[], firstRanking: ScoredCandidate[]): void {
  const secondRanking = rankCandidates(candidates);
  if (secondRanking.length !== firstRanking.length) {
    throw new Error("Determinism check failed: ranking lengths differ between runs.");
  }
  for (let i = 0; i < firstRanking.length; i++) {
    const first = firstRanking[i];
    const second = secondRanking[i];
    if (first.line !== second.line || first.total !== second.total || first.rank !== second.rank) {
      throw new Error(
        `Determinism check failed at rank ${i + 1}: first run "${first.line}" (${first.total}), ` +
          `second run "${second.line}" (${second.total}).`,
      );
    }
  }
  console.log(`[check] determinism verified: two independent rankings agree on all ${firstRanking.length} candidates`);
}

// ---------------------------------------------------------------------------
// Gate check on the winning line, exactly as the sealed scorer states it
// ---------------------------------------------------------------------------

// Re-check the final entry text against the gate as a standalone string,
// the way the sealed scorer will see it: UTF-8 text, 1 to 120 characters,
// not only whitespace. Returns the problems found, if any.
function gateCheckEntry(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text];
  if (chars.length < GATE_MIN_CHARS) {
    problems.push(`entry is ${chars.length} characters, below the minimum of ${GATE_MIN_CHARS}`);
  }
  if (chars.length > GATE_MAX_CHARS) {
    problems.push(`entry is ${chars.length} characters, over the maximum of ${GATE_MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry spans more than one line");
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

// Resolve the output directory: $MAKEFUN_OUTPUT_DIR when set, otherwise
// the harness default /output. The entry file is always entry.txt.
function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "/output";
}

// Write the winning line, read it back, and verify the bytes match what
// was written. A mismatch is fatal: the program exits non-zero rather
// than submitting an entry it cannot prove is correct.
function writeAndVerifyEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  writeFileSync(path, line, "utf8");
  const readBack = readFileSync(path, "utf8");
  if (readBack !== line) {
    throw new Error(
      `Verification failed: read back ${JSON.stringify(readBack)} but wrote ${JSON.stringify(line)}.`,
    );
  }
  const bytes = Buffer.byteLength(readBack, "utf8");
  console.log(`[write] ${path} (${bytes} bytes): ${JSON.stringify(readBack)}`);
  return path;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

// Print the full ranking table so the choice is auditable: every
// candidate, its four criterion scores, its weighted total and its rank.
function printRanking(ranked: ScoredCandidate[]): void {
  console.log("");
  console.log("Ranking (weights: punch 0.35, truth 0.30, freshness 0.20, economy 0.15)");
  console.log("rank  punch  truth  fresh  econ  total  line");
  console.log("----  -----  -----  -----  ----  -----  ----");
  for (const entry of ranked) {
    const punch = String(entry.punch).padStart(5, " ");
    const truth = String(entry.truth).padStart(5, " ");
    const fresh = String(entry.freshness).padStart(5, " ");
    const econ = String(entry.economy).padStart(4, " ");
    const total = entry.total.toFixed(2).padStart(5, " ");
    console.log(`${String(entry.rank).padStart(4, " ")}  ${punch}  ${truth}  ${fresh}  ${econ}  ${total}  ${entry.line}`);
  }
  console.log("");
}

// Print the winner's justification: the line, its scores, and why it won.
function printWinner(winner: ScoredCandidate, runnerUp: ScoredCandidate | undefined): void {
  console.log(`Winner: ${winner.line} (total ${winner.total.toFixed(2)}, ${[...winner.line].length} chars)`);
  console.log(`  punch ${winner.punch}, truth ${winner.truth}, freshness ${winner.freshness}, economy ${winner.economy}`);
  console.log(`  Why: ${winner.why}`);
  if (runnerUp !== undefined) {
    const margin = Math.round((winner.total - runnerUp.total) * 100) / 100;
    console.log(`  Runner-up: ${runnerUp.line} (${runnerUp.total.toFixed(2)}), margin ${margin.toFixed(2)}`);
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("The Printer Apology — deterministic entry picker");
  console.log("Competition: u-eager-stork-81-9647-the-printer-apology-60229153");
  console.log(`Candidates considered: ${CANDIDATES.length}`);

  // 1. Hard gates first: criterion 1 (a genuine apology from a printer)
  // and the sealed gate (1–120 chars, not only whitespace, one line).
  // Nothing ineligible is ever scored.
  const eligible = eligibleCandidates(CANDIDATES);
  console.log(`Eligible after validation: ${eligible.length}`);

  // 2. Score and rank on the judge's four scored criteria.
  const ranked = rankCandidates(eligible);
  verifyDeterminism(eligible, ranked);
  printRanking(ranked);

  // 3. The winner is the top-ranked candidate.
  const winner = ranked[0];
  const runnerUp = ranked[1];
  printWinner(winner, runnerUp);

  // 4. Gate-check the winning line exactly as the sealed scorer will.
  const gateProblems = gateCheckEntry(winner.line);
  if (gateProblems.length > 0) {
    for (const problem of gateProblems) {
      console.error(`[gate] ${problem}`);
    }
    process.exit(1);
  }
  console.log(`[gate] winner passes: ${[...winner.line].length} chars, single line, not whitespace`);

  // 5. Write it, read it back, verify the bytes match.
  const dir = outputDir();
  writeAndVerifyEntry(winner.line, dir);

  console.log(`Done. Entry: ${winner.line}`);
}

main();
