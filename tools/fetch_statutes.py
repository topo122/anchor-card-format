#!/usr/bin/env python3
"""条文ファイル（`data/statutes/<法令名>.json`）を e-Gov 法令検索から作る。形と引き当ての規則は anchor-card-format の SPEC.md §14。

Anchor はカード本文の「95条1項」を押すと条文を重ねて出す。その条文の置き場が vault の
`data/statutes/` で、アプリは読むだけ（通信しない・法令名も知らない）。このスクリプトが
e-Gov 法令 API v2 から本則を取り、アプリが読む形に畳む。

    python3 fetch_statutes.py --out <vault>/data/statutes 刑法 民法 憲法

法令に正式な節が無くて長い章（刑訴の「第1章 捜査」189〜246条）は、手で書いた区分（`divisions`）を
目次に差し込む。区分は手編集の欄で、作り直しても残る。直したら通信なしで差し込み直せる:

    python3 fetch_statutes.py --out DIR --reapply 刑事訴訟法

法令名は下の表にあるものだけ名前で引ける。それ以外は `--law-id` で法令 ID を名指しする:

    python3 fetch_statutes.py --out DIR --law-id 417AC0000000086 --name 会社法 --alias 会社

依存は標準ライブラリだけ。
"""
from __future__ import annotations

import argparse
import datetime
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://laws.e-gov.go.jp/api/2/law_data/"

# 名前で引ける法令。aliases は本文での略し方（`民177条`・`刑訴法197条`）。
KNOWN = {
    "憲法": ("321CONSTITUTION", ["日本国憲法", "憲"]),
    "民法": ("129AC0000000089", ["民"]),
    "刑法": ("140AC0000000045", ["刑"]),
    "商法": ("132AC0000000048", ["商"]),
    "会社法": ("417AC0000000086", ["会社"]),
    "民事訴訟法": ("408AC0000000109", ["民訴法", "民訴"]),
    "刑事訴訟法": ("323AC0000000131", ["刑訴法", "刑訴"]),
    "行政手続法": ("405AC0000000088", ["行手法", "行手"]),
    "行政事件訴訟法": ("337AC0000000139", ["行訴法", "行訴"]),
    "行政不服審査法": ("426AC0000000068", ["行審法", "行審"]),
    "国家賠償法": ("322AC0000000125", ["国賠法", "国賠"]),
}

FORMAT = 1


KANJI_DIGITS = {c: i for i, c in enumerate("〇一二三四五六七八九")}
KANJI_UNITS = {"十": 10, "百": 100, "千": 1000}
_NUM = "[〇一二三四五六七八九十百千]+"
# 数として読むのは、後ろに単位が続くときと「第N条・項・号…」だけ。
# 「一部」「第三者」「同一」「唯一」のような語の中の漢数字には触らない。
_UNIT = "年|箇月|月|日|週間|時間|円|万|億|人|歳|倍|回|個|名|親等|通|分の|条|項|号"
NUMERAL_RE = re.compile(
    f"(?<=第)({_NUM})(?=[条項号編章節款目])|(?<=分の)({_NUM})|(?<=条の)({_NUM})|(?<![〇一二三四五六七八九十百千])({_NUM})(?={_UNIT})"
)


def kanji_to_int(s: str) -> int:
    total, cur = 0, 0
    for ch in s:
        if ch in KANJI_DIGITS:
            cur = KANJI_DIGITS[ch]
        else:
            total += (cur or 1) * KANJI_UNITS[ch]
            cur = 0
    return total + cur


def arabic(text: str) -> str:
    """条文の漢数字を算用数字にする（「三年以下」→「3年以下」・「第一項」→「第1項」）。

    カードは算用数字で書かれている（`3年以下の拘禁刑又は50万円以下`）。重ねて出した条文が
    漢数字だと、カードの引用と見比べるたびに頭の中で読み替えることになる。
    `--kanji-numerals keep` で原文のままにもできる。
    """
    return NUMERAL_RE.sub(lambda m: str(kanji_to_int(m.group(0))), text)


CONVERT = True


def text_of(node) -> str:
    """ノード配下の文字をつなぐ。ルビの読み（Rt）は落とす。"""
    if isinstance(node, str):
        return node
    if node.get("tag") == "Rt":
        return ""
    return "".join(text_of(c) for c in node.get("children", []))


def children(node, tag: str) -> list:
    return [c for c in node.get("children", []) if isinstance(c, dict) and c.get("tag") == tag]


def sentence_text(node) -> str:
    """`ParagraphSentence` / `ItemSentence`。Column（号の「用語　定義」）は全角空白でつなぐ。"""
    cols = children(node, "Column")
    if cols:
        out = "　".join(text_of(c).strip() for c in cols)
    else:
        out = "".join(text_of(c) for c in node.get("children", [])).strip()
    return arabic(out) if CONVERT else out


def items_of(node, depth: int = 0) -> list:
    """号（Item）とその下（Subitem1〜）。入れ子は `sub` に持つ。"""
    tag = "Item" if depth == 0 else f"Subitem{depth}"
    out = []
    for item in children(node, tag):
        title = "".join(text_of(t) for t in children(item, f"{tag}Title")).strip()
        body = "".join(sentence_text(s) for s in children(item, f"{tag}Sentence"))
        entry = {"title": title, "text": body}
        if depth == 0:
            entry["num"] = item.get("attr", {}).get("Num", "")
        sub = items_of(item, depth + 1)
        if sub:
            entry["sub"] = sub
        out.append(entry)
    return out


def articles_of(node, out: dict) -> None:
    if not isinstance(node, dict):
        return
    if node.get("tag") == "Article":
        num = node.get("attr", {}).get("Num", "")
        # `38:40`（第38条から第40条まで 削除）のような範囲は引けないので載せない。
        if num and ":" not in num:
            caption = "".join(text_of(c) for c in children(node, "ArticleCaption")).strip()
            caption = caption.removeprefix("（").removesuffix("）")
            paragraphs = []
            for p in children(node, "Paragraph"):
                entry = {
                    "num": p.get("attr", {}).get("Num", ""),
                    "text": "".join(sentence_text(s) for s in children(p, "ParagraphSentence")),
                }
                items = items_of(p)
                if items:
                    entry["items"] = items
                paragraphs.append(entry)
            out[num] = {"caption": caption, "paragraphs": paragraphs}
        return
    for c in node.get("children", []):
        articles_of(c, out)


# 編・章・節・款・目。目次（`toc`）の段。
DIVISIONS = ("Part", "Chapter", "Section", "Subsection", "Division")


def toc_of(node) -> list:
    """編・章・節…の木。各段は見出しと、その中の最初と最後の条（`from`/`to`）を持つ。

    重ねた条文の上に「第2編 罪 › 第17章 文書偽造の罪」と出し、章立てを開いて
    その章が編のどのあたりかを見せるため。条文が無い段（`第1章 削除`）は `from`/`to` を持たない。
    """
    out = []
    for c in node.get("children", []):
        if not isinstance(c, dict):
            continue
        tag = c.get("tag")
        if tag not in DIVISIONS:
            out += toc_of(c) if tag == "MainProvision" else []
            continue
        title = "".join(text_of(t) for t in children(c, tag + "Title")).strip()
        entry = {"title": arabic(title) if CONVERT else title}
        nums: dict = {}
        articles_of(c, nums)
        if nums:
            keys = list(nums)
            entry["from"], entry["to"] = keys[0], keys[-1]
        sub = toc_of(c)
        if sub:
            entry["children"] = sub
        out.append(entry)
    return out


def build(law_id: str, name: str, aliases: list[str], subjects: list[str] | None) -> dict:
    url = API + urllib.parse.quote(law_id) + "?response_format=json&law_full_text_format=json"
    with urllib.request.urlopen(url, timeout=120) as res:
        data = json.load(res)
    # 🔴 本則だけ。附則にも「第1条」があり、混ぜると本則の条文を上書きする。
    main = [c for c in data["law_full_text"].get("children", []) if isinstance(c, dict) and c.get("tag") == "LawBody"]
    articles: dict = {}
    toc: list = []
    for body in main:
        for provision in children(body, "MainProvision"):
            articles_of(provision, articles)
            toc += toc_of(provision)
    if not articles:
        raise SystemExit(f"{name}: 条文が1つも取れませんでした（law_id={law_id}）")
    rev = data.get("revision_info", {})
    doc = {
        "format": FORMAT,
        "law": name,
        "aliases": aliases,
        "source": {
            "name": "e-Gov法令検索",
            "law_id": law_id,
            "title": rev.get("law_title", name),
            "revision": rev.get("law_revision_id", ""),
            "enforced": rev.get("amendment_enforcement_date", ""),
            "fetched": datetime.date.today().isoformat(),
            "numerals": "arabic" if CONVERT else "original",
        },
        # 条の並び。JSON のオブジェクトは読む側で順が崩れる（JS は数字の鍵を先に並べ替える・
        # Swift の Dictionary は順を持たない）ので、前条・次条はこの配列で引く。
        "order": list(articles),
        "articles": articles,
    }
    if toc:
        doc["toc"] = toc
    if subjects:
        doc["subjects"] = subjects
    return doc


def keep_hand_edits(doc: dict, path: Path) -> None:
    """作り直しても、手で直した引き当ての欄（略称・既定にする科目・パスの型）は残す。"""
    if not path.exists():
        return
    try:
        old = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return
    for key in ("aliases", "subjects", "paths", "divisions"):
        if key in old and not (key == "subjects" and "subjects" in doc):
            doc[key] = old[key]


def apply_divisions(doc: dict) -> None:
    """手で書いた区分（`divisions`）を目次（`toc`）の該当する段の子として差し込む。

    鍵は親の段の見出しを ` › ` でつないだ道（`第2編　第一審 › 第1章　捜査`）。区分は親の
    from〜to を条の順に**隙間なく・重ならず**覆うこと（でないと「今どこか」が抜ける・二重になる）。
    差し込んだ段には `"custom": true` を付ける＝法令の正式な区分ではないことが分かる・差し込み直せる。
    """
    divisions = doc.get("divisions") or {}
    order = doc["order"]
    for key, items in divisions.items():
        level, node = doc.get("toc", []), None
        for title in key.split(" › "):
            node = next((n for n in level if n.get("title") == title), None)
            if node is None:
                raise SystemExit(f"{doc['law']}: 区分の親が目次にありません: {key}")
            level = node.get("children", [])
        if any(not c.get("custom") for c in node.get("children", [])):
            raise SystemExit(f"{doc['law']}: 正式な下位区分がある段には差し込めません: {key}")
        if "from" not in node:
            raise SystemExit(f"{doc['law']}: 条文の無い段です: {key}")
        expect = order.index(node["from"])
        for item in items:
            for k in ("from", "to"):
                if item.get(k) not in doc["articles"]:
                    raise SystemExit(f"{doc['law']}: {key} › {item.get('title')}: {k}={item.get(k)} は無い条です")
            if order.index(item["from"]) != expect or order.index(item["to"]) < expect:
                raise SystemExit(f"{doc['law']}: {key} › {item['title']}: {order[expect]} から始まるはずが {item['from']} です（隙間か重なり）")
            expect = order.index(item["to"]) + 1
        if expect != order.index(node["to"]) + 1:
            raise SystemExit(f"{doc['law']}: {key}: 区分が {node['to']} まで覆っていません")
        node["children"] = [{"title": i["title"], "from": i["from"], "to": i["to"], "custom": True} for i in items]


def write_doc(doc: dict, path: Path) -> None:
    # 差分で読めるように1条1行。キーの順は取得順（＝条文順）のまま。
    lines = ["{"]
    head = {k: v for k, v in doc.items() if k not in ("articles", "toc", "divisions")}
    for k, v in head.items():
        lines.append(f"  {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)},")
    if doc.get("divisions"):
        # 手で書く欄なので、親ごとに区分を1行ずつ（読んで直せるように）。
        lines.append('  "divisions": {')
        parents = list(doc["divisions"].items())
        for i, (key, items) in enumerate(parents):
            lines.append(f"    {json.dumps(key, ensure_ascii=False)}: [")
            for j, item in enumerate(items):
                comma = "," if j < len(items) - 1 else ""
                lines.append(f"      {json.dumps(item, ensure_ascii=False)}{comma}")
            lines.append("    ]," if i < len(parents) - 1 else "    ]")
        lines.append("  },")
    lines.append('  "articles": {')
    arts = list(doc["articles"].items())
    for i, (num, art) in enumerate(arts):
        comma = "," if i < len(arts) - 1 else ""
        lines.append(f"    {json.dumps(num)}: {json.dumps(art, ensure_ascii=False)}{comma}")
    lines.append("  }," if "toc" in doc else "  }")
    if "toc" in doc:
        # 目次は編・章ごとに1行（差分で読めるように）。
        lines.append('  "toc": [')
        for i, part in enumerate(doc["toc"]):
            comma = "," if i < len(doc["toc"]) - 1 else ""
            lines.append(f"    {json.dumps(part, ensure_ascii=False)}{comma}")
        lines.append("  ]")
    lines.append("}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("laws", nargs="*", help="法令名（" + "・".join(KNOWN) + "）")
    ap.add_argument("--out", required=True, type=Path, help="出力先（vault の data/statutes）")
    ap.add_argument("--law-id", help="表に無い法令の e-Gov 法令 ID")
    ap.add_argument("--name", help="--law-id のときのファイル名・表示名")
    ap.add_argument("--alias", action="append", default=[], help="--law-id のときの略称（複数可）")
    ap.add_argument("--subject", action="append", default=[], help="この法令を既定にする科目ディレクトリ（既定は法令名と同じ）")
    ap.add_argument("--reapply", action="store_true", help="通信せず、既存のファイルの divisions を目次に差し込み直す")
    ap.add_argument("--kanji-numerals", choices=["arabic", "keep"], default="arabic", help="条文の漢数字（既定は算用数字に直す）")
    args = ap.parse_args()
    global CONVERT
    CONVERT = args.kanji_numerals == "arabic"

    if args.reapply:
        if not args.laws:
            ap.error("--reapply には法令名が要ります")
        for name in args.laws:
            path = args.out / f"{name}.json"
            doc = json.loads(path.read_text(encoding="utf-8"))
            apply_divisions(doc)
            write_doc(doc, path)
            print(f"{path}  区分 {sum(len(v) for v in (doc.get('divisions') or {}).values())} 件を差し込み直した", file=sys.stderr)
        return

    jobs = []
    for law in args.laws:
        if law not in KNOWN:
            raise SystemExit(f"{law}: 表に無い法令です。--law-id と --name で指定してください")
        jobs.append((KNOWN[law][0], law, KNOWN[law][1]))
    if args.law_id:
        if not args.name:
            raise SystemExit("--law-id には --name が要ります")
        jobs.append((args.law_id, args.name, args.alias))
    if not jobs:
        ap.error("法令を1つ以上指定してください")

    args.out.mkdir(parents=True, exist_ok=True)
    for law_id, name, aliases in jobs:
        doc = build(law_id, name, aliases, args.subject or None)
        path = args.out / f"{name}.json"
        keep_hand_edits(doc, path)
        apply_divisions(doc)
        write_doc(doc, path)
        print(f"{path}  {len(doc['articles'])}条  {doc['source']['enforced']} 施行分", file=sys.stderr)


if __name__ == "__main__":
    main()
