# Plan tab fields

What the board's Plan tab and subagents strip read, and where each field lives. Every field is optional: the page leaves a block out when its data is missing. The page only reads these; the Router writes them.

The code that reads them is `drawPlan`, `drawAgents` and `questionControls` in `board.html`.

## Text marking

Most text fields accept three light marks. Anything else is shown as plain text.

| Write | Shows as |
|---|---|
| `{words}` | stressed, in green |
| `~words~` | struck through |
| `` `words` `` | code |

## On the card row (`cards/<n>`)

| Field | Shape | Used for |
|---|---|---|
| `agents` | `{ critic: "passed", tester: "failed", ... }` | The subagents strip. `passed`, `fixed` and `reproduced` show a tick; any other result shows a warning. |
| `question` | one question object, or a list of them | The Decisions block on the Plan tab, the band above the other tabs, the "Question for you" chip on the card face, and the Needs me filter. |

A question object:

| Field | Shape | Notes |
|---|---|---|
| `text` | string, required | The question. A question with no `text` is ignored. |
| `options` | `[ { key, label, detail? } ]` | One button per option. |
| `askedAt` | ISO time | Shown as "asked …". |
| `kind` | string | A short tag such as "Scope". Also used in the answer message. |
| `points` | `[ { text, no? } ]` or `[ string ]` | Bullet points under the question. `no: true` shows a cross, otherwise a tick. |
| `recommended` | an option's `key` | That option is outlined and marked "Recommended". |

What a click sends (through the comment sent to Claude):

- One question: `Card #<n>: answer to the question: <key> (<label>)`, plus any typed text.
- Several: `Card #<n>: answer to question <i> of <k> (<kind, or the question's first six words>): <key> (<label>)`, plus any typed text.
- "Send answer" sends the typed text alone, with the same lead.

The page never clears `question`. Remove the field (or the entry) when you have acted, and the block goes on the next snapshot.

## On the detail row (`cards/<n>/detail/full`)

| Field | Shape | Used for |
|---|---|---|
| `agentNotes` | `{ critic: "Passed, 8 notes", tester: "After the build" }` | One short line per subagent on the strip. A name here that is not in the card's `agents` shows as not run yet. |
| `plan` | object, below | The Plan tab. |

Existing detail fields the Plan tab also uses: `summary` (last fold, and the fallback headline), `doneWhen` (the fallback headline, or the Done when sentence), `checks` / `results` (the Done when list and meter), `next` (the Next step callout, unless it starts "HOW TO TEST").

### `plan`

| Field | Shape | Block |
|---|---|---|
| `goal` | string | The headline. Without it the page uses `doneWhen` when it says something of its own, else the first sentence of `summary`. |
| `picture` | `{ title, lanes: [lane] }` | The Today/After picture. Drawn only when this exists. |
| `parts` | `[ { n, title, size?, text?, waits?, stage? } ]` | Part cards on the timeline, and the coloured `#n` chips everywhere. |
| `ships` | `[ { label?, title, text?, parts: [n] } ]` | Stops on the timeline, in ship order. |
| `start` | `{ label?, title, text? }` | First stop. `label` defaults to "Now". |
| `end` | `{ label?, title, text? }` | Last stop. `label` defaults to "Done". |
| `risks` | `[ { risk, cover } ]` | "What could go wrong → what covers it". |
| `undo` | `[ { parts?: [n], text } ]` | The Undo box. |
| `undoNote` | string | Footer of the Undo box. |
| `outOfScope` | `[ { name, note? } ]` or `[ string ]` | "Not in this card". |
| `folds` | `[ { title, note?, items? \| pairs? \| text? } ]` | Folded detail. `items` is a numbered list of strings, `pairs` is `[ [label, value] ]`, `text` is plain text. |

A lane: `{ when, note?, tone, steps: [step], arrows: [string] }`.

- `tone` is `"bad"` (red, the Today lane) or `"good"` (green, the After lane).
- `arrows[i]` is the label between `steps[i]` and `steps[i + 1]`.
- A step: `{ who, title, text?, part?, hot?, gates? }`. `hot: true` outlines the step in the lane's colour. `part` shows that part's chip.
- A gate: `{ text, tone, part? }`. `tone` is `"no"` (refused, red) or `"lock"` (a guard, blue).

A part's `stage` is the last stage finished, one of `Plan`, `Critic`, `Build`, `Test`, `Ship`. The next stage is shown as up next. Leave it out and no progress bar is drawn.

Counters beside the headline are worked out by the page: number of parts, number of ships, checks met, and questions waiting.

Parts not named in any ship appear in a last stop, "Not in a ship yet" (or "Parts" when there are no ships at all).

## A small example

`card` holds the card-row fields and `detail` the detail-row fields.

```json
{
  "card": {
    "agents": { "planner": "passed", "critic": "passed" },
    "question": [
      {
        "kind": "Scope",
        "text": "Export totals only, in two parts?",
        "points": [{ "text": "CSV and PDF exports" }, { "text": "No schema change", "no": true }],
        "options": [{ "key": "yes", "label": "Yes" }, { "key": "no", "label": "No" }],
        "recommended": "yes",
        "askedAt": "2026-01-01T10:00:00Z"
      }
    ]
  },
  "detail": {
    "agentNotes": { "planner": "Plan written", "critic": "Passed, 2 notes", "tester": "After the build" },
    "plan": {
      "goal": "Export totals {match the screen}. Totals ~rounded twice~ are gone.",
      "parts": [
        { "n": 1, "title": "One rounding helper", "size": "S", "stage": "Plan" },
        { "n": 2, "title": "Exports use it", "size": "M", "waits": "Waits on #1", "stage": "Plan" }
      ],
      "start": { "title": "Your answer", "text": "Then you move it to In progress" },
      "ships": [{ "label": "Ship 1", "title": "Both parts together", "parts": [1, 2] }],
      "end": { "title": "4 checks pass" },
      "risks": [{ "risk": "Old exports change", "cover": "A test pins last month's totals" }],
      "undo": [{ "parts": [1, 2], "text": "Revert the one PR." }],
      "outOfScope": ["Currency formatting"]
    }
  }
}
```
