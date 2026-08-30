# medicine/ — example cards for a high-volume deck

**These are formatting samples, not medical advice.** They carry only settled textbook physiology, pathology and examination findings. There are no doses, no drug choices and no management decisions anywhere in this directory — deliberately: a demonstration of a file format is not the place to encode clinical judgement, and that kind of content dates while the format does not.

## How to read this directory

Treat `examples/` as the vault root and the deck of every card here is `medicine`, derived from the directory path — and there is no `deck:` key to override it (SPEC §7). Filenames are the ids (ULIDs), so vault scan order, and therefore the order in which new cards enter the queue, is creation order (SPEC §5, §21).

Nine files produce nine study items, and the fact that those two numbers match is a coincidence: one file is a reference card and produces no item at all, one is reversed and produces two. Items, not files, are what the scheduler sees.

| File | Topic | Items | Format feature shown |
|---|---|---|---|
| `01M1AJMAQGC86CAF8HW8QVQ5QY.md` | Orthopnea | 2 | `reverse: true`, front absent — the title alone is the question |
| `01M1AJRGGRG9RMPMA6BWECDS49.md` | Virchow's triad | 1 | plain card, `note` for provenance |
| `01M1AK0W38F36MZ7N23MH5F9DJ.md` | AV nodal delay | 1 | `hint` and `note` on the same card |
| `01M1AK51WG5RKMG140VSEXCRPP.md` | UMN versus LMN lesions | 1 | a table in the back |
| `01M1AK97NRXAK21KGWY990H69M.md` | Serum anion gap | 1 | display math, `$$ ... $$` |
| `01M1AK97NZEATR0HY68PXG0VC7.md` | The ventricular action potential | 0 | `ask: false` reference card: shared framing, never scheduled |
| `01M1AK97P6HPXZQFEWMJDNBT4F.md` | Phase 0, the upstroke | 1 | one question per phase, `![[id]]` to the framing |
| `01M1AK97PDYE72VCBTY061Y94D.md` | Phase 2, the plateau | 1 | the same, with a `hint` |
| `01M1AK97PM7KTT2HNM0JP396JQ.md` | Phase 4, the resting potential | 1 | the same |

## How a list is written here, and why no cloze is needed

The format has no cloze deletions and will never grow them (SPEC §22). Everything a cloze card gets used for is written one of two ways, and this directory shows both.

**When the answer is the set, it is one card.** Virchow's triad asks for all three categories at once, so all three live in one back. Split it into three cards and you could recall two, be graded correct twice, and never find the gap.

**When each entry is recallable on its own, it is one card per entry plus one `ask: false` card holding the framing they share** (SPEC §21). The ventricular action potential is that case. Knowing which current carries the phase 0 upstroke is a separate piece of knowledge from knowing what holds phase 4 at rest; drilled together, the easy one carries the hard one and hides it. So each phase is its own file, and the framing all of them need — the numbering, the resting potential, how long the plateau lasts — sits in `01M1AK97NZEATR0HY68PXG0VC7.md` with `ask: false`, so it is never scheduled and exists only as a reference target. Each question card pulls it in with a line that is exactly `![[01M1AK97NZEATR0HY68PXG0VC7]]`, and the renderer replaces that line with the target's title and back (SPEC §11).

Three consequences, and together they are why this beats one card with six deletions in it:

1. **Correcting the shared text is one edit.** Change the reference card and all three questions change with it. Paste the same paragraph into three files instead and the two you forget go on teaching the old version.
2. **Adding phase 1 and phase 3 later is two new files and no edit to anything that exists.** Nothing is renumbered and no card's review history is touched. Adding a seventh deletion to a cloze card rewrites the file every other deletion lives in.
3. **Each phase carries its own schedule.** The one you keep failing comes back sooner without dragging the two you already know along with it.

Reverse (`reverse: true`) is the third way to get more than one item out of one file, and it fits vocabulary: term-to-definition and definition-to-term are separately worth knowing, and the format hides the title on the reversed front so the answer cannot leak (SPEC §8, §13).

## What this deck deliberately does not do

1. **No doses, drug choices or management steps** — as above; every card stops at the mechanism or the finding.
2. **No images.** Relative-path images are supported (SPEC §15), but image occlusion — the thing an anatomy deck actually wants — is a frozen non-goal (SPEC §22), and a converter that meets one must stop and ask a human rather than flatten it into prose.
3. **No second reference card.** Only the action-potential group shares text. The other five asked cards do not, and SPEC §21 is explicit that two cards sharing three lines do not earn the indirection.
