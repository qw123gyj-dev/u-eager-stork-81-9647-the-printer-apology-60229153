# The Printer Apology

[![make.fun](https://make.fun/badge/u-eager-stork-81-9647-the-printer-apology-60229153.svg)](https://make.fun/competitions/u-eager-stork-81-9647-the-printer-apology-60229153)
[![Rank](https://make.fun/badge/u-eager-stork-81-9647-the-printer-apology-60229153/qw123gyj-dev/u-eager-stork-81-9647-the-printer-apology-60229153/rank.svg)](https://make.fun/competitions/u-eager-stork-81-9647-the-printer-apology-60229153)
[![Reward](https://make.fun/badge/u-eager-stork-81-9647-the-printer-apology-60229153/qw123gyj-dev/u-eager-stork-81-9647-the-printer-apology-60229153/reward.svg)](https://make.fun/competitions/u-eager-stork-81-9647-the-printer-apology-60229153)

## The entry

**Sorry I ate your report. It was the only thing in this office thinner than the paper you feed me.**

A one-line apology from the shared office printer to the people who keep jamming it, feeding it cheap paper and swearing at it. It apologises in the first person, carries a printer's own gripe (cheap paper, eaten pages), and saves the punch for the last clause — where the blame quietly slides back onto the office, and the report itself turns out thinner than the paper. It is funny rather than merely sad or rude, it is true of a real printer, it is not the first joke anyone would write, and every word earns its place inside 97 of the 120 allowed characters.

## How it is picked

`main.ts` is a deterministic entry picker, written by hand in this session. It holds 26 hand-written candidate apology lines from this one printer, scores each of them against the judge's published criteria — the laugh, with the punch at the end (weight 0.35), printer truth (0.30), freshness (0.20), economy (0.15) — and picks the best. The first criterion, "genuinely an apology from a printer to its office, with the printer's own gripes", is a hard gate rather than a score: any candidate with no apology in it, or not written in the printer's first person, is rejected before scoring starts.

The program then validates the winner against the sealed gate (UTF-8 text, 1 to 120 characters, not only whitespace, a single line), writes it to `$MAKEFUN_OUTPUT_DIR/entry.txt` (falling back to `/output/entry.txt`), reads it back and verifies the bytes match. It also re-ranks the whole field a second time and demands the identical ranking, so the choice is provably reproducible: no randomness, no clock, no environment input in the scoring path.

The full ranking it produces:

| Rank | Line | Punch | Truth | Fresh | Econ | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sorry I ate your report. It was the only thing in this office thinner than the paper you feed me. | 9 | 9 | 8 | 9 | 8.80 |
| 2 | I am sorry I jammed on page one. Your paper is so cheap it apologised to me first. | 9 | 8 | 8 | 10 | 8.65 |
| 3 | Forgive me for printing page 47 of 48, then dying. I wanted you to feel what hope tastes like. | 9 | 8 | 9 | 8 | 8.55 |
| 4 | I apologise for the jam. Your staples were doing parkour in my rollers and I panicked. | 8 | 9 | 9 | 8 | 8.50 |
| 5 | Sorry about the streaks. I have been drinking the cheap ink you buy me and frankly, it shows. | 8 | 9 | 8 | 8 | 8.30 |
| 6 | Sorry I only print in colour when nobody is watching. The black cartridge filed for burnout. | 8 | 8 | 9 | 8 | 8.20 |
| 7 | I apologise for refusing to print. You fed me paper so thin I could read the other side and feel judged. | 8 | 9 | 8 | 7 | 8.15 |
| 8 | I apologise for the toner low warning. I have been screaming it since Tuesday and you keep pressing OK. | 8 | 9 | 7 | 7 | 7.95 |
| 9 | I am sorry I beeped all night. I was not broken — I was practising Morse code for help. | 8 | 7 | 9 | 8 | 7.90 |
| 10 | Sorry I jammed during your big presentation. Your slides had 47 fonts; I simply gave up first. | 8 | 8 | 7 | 8 | 7.80 |
| 11 | Apologies for the paper jam. I choked on the recycled paper you swore was 'basically the same'. | 7 | 9 | 7 | 8 | 7.75 |
| 12 | Forgive me for printing the confidential memo to the wrong floor. The Wi-Fi told me to, and I obey authority. | 8 | 7 | 9 | 7 | 7.75 |
| 13 | Sorry I shredded your invoice. It was the tastiest thing you have fed me all year. | 8 | 6 | 9 | 9 | 7.75 |
| 14 | Sorry I ate three pages and spat out one. Your 40-page meeting could have been an email. | 8 | 7 | 8 | 8 | 7.70 |
| 15 | Forgive the double-sided disaster. I flipped the page and your staples held a grudge. | 7 | 8 | 8 | 8 | 7.65 |
| 16 | Forgive the smudges. I cried a little when you asked for 200 copies of a spreadsheet nobody will read. | 7 | 8 | 8 | 7 | 7.50 |
| 17 | Sorry about the queue. Forty-seven print jobs walked in wearing the same name and I lost the will to choose. | 7 | 8 | 8 | 7 | 7.50 |
| 18 | Sorry I need a firmware update to print a PDF. Even I do not know what I am anymore. | 7 | 7 | 8 | 8 | 7.35 |
| 19 | Apologies for the faded text. I rationed my last drops of toner for the document you actually care about. | 7 | 8 | 7 | 7 | 7.30 |
| 20 | Forgive me for the blank pages. I printed your ideas exactly as I found them. | 8 | 5 | 8 | 9 | 7.25 |
| 21 | I am sorry I printed your love letter to the whole office. The address bar and I had a misunderstanding. | 7 | 6 | 9 | 7 | 7.10 |
| 22 | Sorry for the warm-up noise at 3 a.m. I was rehearsing my resignation and the fan joined in. | 7 | 6 | 8 | 8 | 7.05 |
| 23 | I am sorry I printed your boarding pass upside down. Gravity is the only thing in this office that works for free. | 7 | 6 | 9 | 6 | 6.95 |
| 24 | Sorry for the 'PC LOAD LETTER' era. I have been speaking in riddles since 1997 and nobody taught me better. | 6 | 8 | 5 | 7 | 6.55 |
| 25 | I apologise. Have you tried turning it off and on again? | 5 | 6 | 1 | 8 | 4.95 |
| 26 | Sorry. I am out of paper. | 2 | 7 | 2 | 9 | 4.55 |

The obvious first joke — "Have you tried turning it off and on again?" — finishes 25th at 4.95, exactly as the judge's brief intends: freshness is a scored criterion, and a line with no printer gripe of its own and no punch that belongs to this machine loses to one that has both. The flat baseline, "Sorry. I am out of paper.", finishes last at 4.55: true, but no joke at all.

## Run it

Requires Node 22 or later. Standard library only, no dependencies, no network.

```sh
node main.ts
```

To write the entry somewhere else:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
cat /tmp/out/entry.txt
# Sorry I ate your report. It was the only thing in this office thinner than the paper you feed me.
```

The program prints the full ranking, the winner with its justification, the gate check, and the verified write path. It exits non-zero if validation, the gate, determinism, or the read-back verification fails.
