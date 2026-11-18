# Plan tab fields

What the board's Plan tab and subagents strip read, and where each field lives. Every field is optional: the page leaves a block out when its data is missing. The page only reads these; the Router writes them.

Agreed with the Router on 18 Nov 2026 (card #1006). The code that reads them is `drawPlan`, `drawAgents` and `questionControls` in `board.html`.

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

## Widgets (`plan.widgets`, card #1017)

Since #1017 the Plan tab is built from widgets. `plan.widgets` is an ordered list; the page draws them top to bottom and skips any type it does not know (or one whose data is empty). A card with no `plan.widgets` still works: the older fields above are mapped onto the same widgets in the old order (goal, next, picture, decisions, ships, risks, doneWhen, outOfScope, folds).

Every widget is `{ type, title?, width?, ... }`. `title` replaces the block's heading (the new kinds have no heading without one). `width: "half"` puts it beside the next half widget on a wide screen; on a phone everything is full width. Text fields take the light marks above unless the row says markdown.

Two safety nets: if the card has a question and the list has no `decisions` widget, one is added after the goal; if the detail row has a `summary` and the list has no `folds` widget, a folds widget is added at the end (the "Full plan text" fold).

### Today's widgets

| type | Fields | Notes |
|---|---|---|
| `goal` | `text?`, `counters?` | Headline plus counters. No `text`: falls back as `plan.goal` did. `counters: false` hides them. |
| `next` | `text?` | Next step callout; defaults to the detail row's `next`. |
| `picture` | `lanes` | Today/After picture, same lane shape as `plan.picture`. |
| `decisions` | none | The card's `question`(s), with answer buttons. |
| `ships` | `parts`, `ships?`, `start?`, `end?` | Ship order and part cards. Its `parts` also colour the `#n` chips in every other widget. |
| `risks` | `risks?`, `undo?`, `undoNote?` | Risk and undo. Either half alone is fine. |
| `doneWhen` | none | From the detail row's `doneWhen` and `checks`/`results`. |
| `outOfScope` | `items` | Same shape as `plan.outOfScope`. |
| `folds` | `folds?` | Same as `plan.folds`; a fold may also carry `markdown`. The card's summary is always the last fold. |

```json
{ "type": "goal", "text": "Production {refuses to start} unless tenant identity is enforced." }
{ "type": "next" }
{ "type": "picture", "title": "Where the filter SQL comes from", "lanes": [ { "when": "Today", "tone": "bad", "steps": [ { "who": "Browser", "title": "Sends SQL" } ], "arrows": [] } ] }
{ "type": "decisions" }
{ "type": "ships", "parts": [ { "n": 1, "title": "Boot guard", "size": "S", "stage": "Plan" } ], "ships": [ { "title": "Boot guard, alone", "parts": [1] } ] }
{ "type": "risks", "risks": [ { "risk": "The guard stops production", "cover": "One override, no deploy" } ], "undo": [ { "parts": [1], "text": "Set the override." } ] }
{ "type": "doneWhen" }
{ "type": "outOfScope", "items": [ "Sending any email", { "name": "BUG-15", "note": "its own card" } ] }
{ "type": "folds", "folds": [ { "title": "Critic's notes", "items": [ "..." ] } ] }
```

### New kinds

| type | Fields | Notes |
|---|---|---|
| `markdown` | `text` | Safe subset: `#`–`####` headings, paragraphs, `-` and `1.` lists, `>` quotes, `**bold**`, `*italic*`, `` `code` ``, `[text](https://...)`. Built as text nodes; raw HTML shows as text; only https links. |
| `callout` | `tone`, `title?`, `text?` | `tone`: `info` (blue), `warn` (amber) or `decision` (purple). `text` is markdown. |
| `metrics` | `items: [ { value, label, note?, tone? } ]` | Number tiles. `tone`: `good`, `bad` or `warn` colours the number. |
| `table` | `columns`, `rows`, `caption?` | `columns`: strings, or `{ key, label?, align? }` (`align: "right"` for numbers). `rows`: objects keyed by column key, or arrays in column order. Cells take light marks. |
| `chart` | `kind`, `x`, `series`, `rows`, `stacked?`, `height?` | `kind`: `bar`, `line` or `pie`. `x` is the row key for the labels; `series` are row keys (or `{ key, label }`). Chart.js 4.4.1 from cdnjs, coloured from the board's tokens. |
| `diagram` | `svg` or `mermaid`, `caption?` | `svg`: inline SVG, cleaned by an allowlist (no script, foreignObject, `on*`, links out, `<image>`, animation; `href` only to `#id`; `<style>` and `style` dropped if they hold `url()` to anything but `#id`, `image-set`, `src()`, `@font-face`, `@import` or escapes; the drawing sits in its own closed shadow root so its styles reach nothing else). `mermaid`: source drawn by Mermaid 10.9.1 from cdnjs (strict mode, no HTML labels), then cleaned the same way. |
| `image` | `url`, `caption?`, `alt?` | An artifact asset url (https, or a path inside the artifact). Anything else is dropped. |
| `embed` | `url`, `height?`, `caption?` | An HTML asset in an iframe with `sandbox="allow-scripts"`, labelled with the host it comes from (no same-origin: it cannot reach the board, its data or its sign-in). Height fixed, 120–900, default 360. Same url rule as `image`. |

```json
{ "type": "markdown", "title": "Why", "text": "a teammate asked on **17 Nov**.\n\n- 260 joiners\n- 332 win-back" }
{ "type": "callout", "tone": "decision", "title": "In Human test: PR 1957", "text": "**Your call:** review, then say ship." }
{ "type": "metrics", "title": "Today's counts", "items": [ { "value": 260, "label": "new joiners" }, { "value": 333, "label": "a teammate's figure", "tone": "warn" } ] }
{ "type": "table", "width": "half", "columns": [ { "key": "d", "label": "Definition" }, { "key": "n", "label": "People", "align": "right" } ], "rows": [ { "d": "Lapsed alone", "n": 247 } ] }
{ "type": "chart", "width": "half", "kind": "bar", "x": "year", "stacked": true, "series": [ { "key": "lapsed", "label": "Lapsed" } ], "rows": [ { "year": "2025", "lapsed": 65 } ] }
{ "type": "diagram", "title": "Boot check", "mermaid": "flowchart TD\n  A[Boot] --> B{Enforced?}\n  B -- no --> X[Exit 1]" }
{ "type": "diagram", "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'><rect width='40' height='20' fill='currentColor'/></svg>" }
{ "type": "image", "url": "https://...asset url...", "caption": "The dashboard today" }
{ "type": "embed", "url": "mini/forecast.html", "height": 320, "caption": "Try the forecast" }
```

### Which widgets suit which card

- **Feature or build card** (several parts): goal, decisions, picture (Today/After), ships, risks, doneWhen, outOfScope, folds.
- **Data or analysis card** (counts, lists, cohorts): goal, metrics, table, chart, a data-flow diagram, then ships and risks. Leave out the picture.
- **Security or guard card** (one rule, small change): goal, a callout with where it stands, a diagram of the check, risks with undo, doneWhen.
- **Bug fix**: goal, a markdown "what happens / why" block, risks with undo, doneWhen. Usually no ships.
- **Research or question card**: goal, decisions, markdown findings, a table of options, folds for the sources.
- **UI card**: goal, image (before/after screenshots as assets) or an embed of a mock-up, decisions, doneWhen.

Keep it short: four to eight widgets. Put what the owner must act on (decisions, a decision callout) near the top.

## A complete example

SEC-12, as drawn in `mockups/plan-tab-v2.html`. The same content is in `mockups/plan-fields-example.json`. `card` holds the card-row fields and `detail` the detail-row fields.

```json
{
  "card": {
    "agents": {
      "router": "passed",
      "planner": "passed",
      "critic": "passed"
    },
    "question": [
      {
        "kind": "Scope",
        "text": "Filter SQL only, in these three parts?",
        "points": [
          {
            "text": "Every dashboard filter, sent or saved"
          },
          {
            "text": "No parameter binding, no new wire shape, no migration",
            "no": true
          },
          {
            "text": "Typed SQL stays out (SEC-09)",
            "no": true
          }
        ],
        "options": [
          {
            "key": "yes",
            "label": "Yes"
          },
          {
            "key": "no",
            "label": "No"
          }
        ],
        "recommended": "yes",
        "askedAt": "2026-11-12T10:00:00Z"
      },
      {
        "kind": "The rule",
        "text": "The server's definition always wins?",
        "points": [
          {
            "text": "Matches a definition → the definition's SQL"
          },
          {
            "text": "A real column, no definition → plain `column = value`"
          },
          {
            "text": "Anything else → refused",
            "no": true
          }
        ],
        "options": [
          {
            "key": "yes",
            "label": "Yes"
          },
          {
            "key": "no",
            "label": "No"
          }
        ],
        "recommended": "yes",
        "askedAt": "2026-11-12T10:00:00Z"
      },
      {
        "kind": "Ship order",
        "text": "Ship the boot guard first, on its own?",
        "points": [
          {
            "text": "#206 leaves the stack and ships in about a day"
          },
          {
            "text": "#207 and #208 follow, together"
          },
          {
            "text": "Its undo is one named override, no deploy"
          }
        ],
        "options": [
          {
            "key": "yes",
            "label": "Yes",
            "detail": "Two ships"
          },
          {
            "key": "no",
            "label": "No",
            "detail": "One ship, all three parts"
          }
        ],
        "recommended": "yes",
        "askedAt": "2026-11-12T10:00:00Z"
      }
    ]
  },
  "detail": {
    "agentNotes": {
      "router": "Split into 3 parts",
      "planner": "Plan written, 12 Nov",
      "critic": "Passed, 8 notes",
      "tester": "After the build",
      "reviewer": "After the build"
    },
    "plan": {
      "goal": "The server {writes every filter's SQL itself}. SQL ~from the browser~ or ~from a saved filter~ is never run.",
      "picture": {
        "title": "Where the filter SQL comes from",
        "lanes": [
          {
            "when": "Today",
            "note": "can be forged",
            "tone": "bad",
            "steps": [
              {
                "who": "Browser",
                "title": "Sends values and SQL",
                "text": "A member can put anything in `filter.sql`",
                "hot": true
              },
              {
                "who": "Server",
                "title": "Pastes that SQL into the query",
                "text": "Safe only while one setting is on. In code it defaults to off.",
                "hot": true
              },
              {
                "who": "BigQuery",
                "title": "Runs it",
                "text": "Inside the member's own organisation's data"
              }
            ],
            "arrows": [
              "values + SQL",
              "forged SQL goes through"
            ]
          },
          {
            "when": "After",
            "note": "server-built",
            "tone": "good",
            "steps": [
              {
                "who": "Browser",
                "part": 208,
                "title": "Sends values only",
                "text": "Never receives or sends SQL. Old tabs keep working."
              },
              {
                "who": "Server",
                "part": 207,
                "title": "Builds the SQL from its own filter definitions",
                "hot": true,
                "gates": [
                  {
                    "text": "Forged or unknown filter: refused",
                    "tone": "no"
                  },
                  {
                    "text": "Production won't boot with the setting off",
                    "tone": "lock",
                    "part": 206
                  }
                ]
              },
              {
                "who": "BigQuery",
                "title": "Runs it",
                "text": "Honest filters give the same numbers"
              }
            ],
            "arrows": [
              "values only",
              "server-built SQL only"
            ]
          }
        ]
      },
      "parts": [
        {
          "n": 206,
          "title": "Boot guard",
          "size": "S",
          "text": "Production refuses to start unless the tenant reader is enforced.",
          "waits": "Waits on nothing · issue #1909",
          "stage": "Plan"
        },
        {
          "n": 207,
          "title": "Server builds the SQL",
          "size": "M",
          "text": "Every filter is rebuilt from the server's definitions, on every route. Saves strip SQL.",
          "waits": "Waits on nothing · issue #826",
          "stage": "Plan"
        },
        {
          "n": 208,
          "title": "No SQL in the browser",
          "size": "M",
          "text": "The browser gets and sends values only. One strict request shape.",
          "waits": "Waits on #207 · issue #826",
          "stage": "Plan"
        }
      ],
      "start": {
        "label": "Now",
        "title": "Your 3 answers",
        "text": "Then you move it to In progress"
      },
      "ships": [
        {
          "label": "Ship 1 · about a day",
          "title": "Boot guard, alone",
          "parts": [
            206
          ]
        },
        {
          "label": "Ship 2 · together",
          "title": "One PR, one Human test, one ship",
          "parts": [
            207,
            208
          ]
        }
      ],
      "end": {
        "label": "Done",
        "title": "7 checks pass",
        "text": "Closes #826, #1909, #1163"
      },
      "risks": [
        {
          "risk": "An honest filter is refused",
          "cover": "Parity proof on test must show zero differences"
        },
        {
          "risk": "A renamed option is refused",
          "cover": "Clear the filter caches and run the refresh job after deploy"
        },
        {
          "risk": "Two options share a name",
          "cover": "New test: names are unique per table, column and join"
        },
        {
          "risk": "Old tabs still send SQL",
          "cover": "Old keys are stripped, not refused"
        },
        {
          "risk": "The guard stops production booting",
          "cover": "One override, no deploy (see undo)"
        }
      ],
      "undo": [
        {
          "parts": [
            206
          ],
          "text": "Set `ALLOW_TENANT_IDENTITY_NOT_ENFORCED=\"<reason>\"` in one gcloud command. No deploy."
        },
        {
          "parts": [
            207,
            208
          ],
          "text": "Revert the one PR. Nothing to migrate back."
        }
      ],
      "undoNote": "No saved filter holds SQL (census, 10 Nov), so no data changes.",
      "outOfScope": [
        {
          "name": "Typed SQL",
          "note": "SEC-09"
        },
        {
          "name": "Parameter binding"
        },
        {
          "name": "A new wire shape"
        },
        {
          "name": "Any migration"
        },
        {
          "name": "BUG-15",
          "note": "its own card"
        },
        {
          "name": "Filter permissions",
          "note": "stay display-only"
        }
      ],
      "folds": [
        {
          "title": "Critic's notes",
          "note": "8, all for the build",
          "items": [
            "#207's own summary still gives the old rule. Update it to the definition rule before it builds.",
            "`valueOk` refuses values with a backslash (`filterTrust.ts:39`). Watch for it in the parity proof."
          ]
        },
        {
          "title": "Code references",
          "note": "checked on main 9315990d9, 12 Nov",
          "pairs": [
            [
              "Where SQL is pasted",
              "`filterSql.ts:565-570`, `:608-611` (`rawPredicate`)"
            ],
            [
              "Branch",
              "`card-194-sec12-server-built-filters`"
            ]
          ]
        },
        {
          "title": "What's already closed",
          "note": "before this card",
          "text": "Production runs every chart and export query as the organisation's own read-only reader.\nThe statement must be one SELECT."
        }
      ]
    }
  }
}
```
