# programming — worked examples

Five cards showing a code fence, a one-level `![[id]]` reference, an `ask: false`
reference card and a hint. No frontmatter, so this file is not a card: it is one
of the skipped `.md` files a client must let you inspect.

## What this deck deliberately does not do

1. It never splits a card or copies a paragraph to keep a back short — the one
   rule two cards share lives in `01M1AHZDS80R75970R3E2RQSYX` (`ask: false`) and
   is pulled in by a reference, because splitting mints a new id and throws the
   review history away.
2. It uses no `reverse: true` — reversing an explanation card would put the
   answer on the front side, and "given this explanation, name the concept" is
   not a question worth drilling.
3. It writes no `$` math and no images, and it could not write a `deck:` key if
   it wanted to — there is no such key, the folder name is the deck. Every
   snippet stays inside a fence, where the parser reads neither markers nor
   references.

## Files

| File | Asks |
|---|---|
| `01M1AHV800ZZ8ZVD2M0BCV87H3.md` | Rust: why a move invalidates the source variable (code fence) |
| `01M1AHZDS80R75970R3E2RQSYX.md` | Rust: the borrowing rules — `ask: false`, reference target only |
| `01M1AJ3KJGSRARYCGNTB1ZMEWV.md` | Rust: a live borrow across `Vec::push` (code fence + reference) |
| `01M1AJ7SBRANT19WMPBCED32KH.md` | HTTP: 302 versus 307 after a POST (has a hint) |
| `01M1AJBZ50NT4RZTVB2WRMH46P.md` | HTTP: 401 versus 403 |

Filenames are ULIDs, so byte order is authoring order, and that is the order new
cards enter the queue.
