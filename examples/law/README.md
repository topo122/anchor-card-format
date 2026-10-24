# law/ — 例（日本民法・代理）

書式の実例であり、法的助言ではない。

The rules are in [`SPEC.md`](../../SPEC.md); this page only lists what each card shows.

| File | Title | Uses |
|---|---|---|
| `01M1AHV800R78RMTG5WXJS2HHP.md` | 無権代理 | `ask: false` |
| `01M1AHZDS8FQD17CJAXA8FT5MZ.md` | 無権代理行為の追認（民法116条） | `[[id]]`, hint, note |
| `01M1AJ3KJG12MM3S9DCPAGFQWQ.md` | 無権代理人の責任（民法117条） | `[[id]]`, note |
| `01M1AJ7SBR4Y6QACJCBERM85M4.md` | 代理権授与表示による表見代理（民法109条1項） | `[[id]]`, hint |
| `01M1AJBZ5001T93N1PEB5VNCYB.md` | 権限外の行為の表見代理（民法110条）における「正当な理由」 | `[[id]]`, note |
| `01M1AJG4Y8X9DJE1R0DWHXPJEJ.md` | 代理権消滅後の表見代理（民法112条1項）の要件 | `[[id]]` |
| `01M5P25Y1KE94YZCM46JQF3WTX.md` | 代理の効果が本人に帰属するための要件（民法99条1項） | 📍📜 の条文引用, hint, note |
| `01M5P25Y1PQABS1X5MN5KCJ5E3.md` | 抵当権設定の代理人が土地を売った場合 | 事例＋`**規範** [[id]]`, 📍📜, note |

## 条文（SPEC §14）

`../data/statutes/民法.json` は `tools/fetch_statutes.py` で e-Gov から作った民法の本則。
このディレクトリ（`law/`）のカードは `paths: ["^law/"]` で民法を既定にしているので、
本文の `110条` `99条1項` は法令名が無くても民法の条文として重なって出る。
`商法504条` は vault に商法のファイルが無いので押せる形にならない（民法504条に取り違えない）。
