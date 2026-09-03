import json, collections, pathlib
# 🔴 必须真 json.loads 取顶层 type。上一版用正则抓每行第一个 "type"，
# 与真顶层对照仅 36.6% 一致 —— 嵌套的 content[].type / attachment 内层 type 会被误抓。
cnt = collections.Counter(); files = lines = bad = notype = 0
# 🔴 分母必须覆盖 reducer 实际读取的**全部源**。
# 只扫 claude 源时得 23 种，而 reducer 读 claude+codex+cursor 后见到 turn_ended，
# 于是门报「不在普查全集里」—— 不是普查过期，是候选集比被测集合窄。
ROOTS = [
    pathlib.Path.home() / '.claude/projects',
    pathlib.Path.home() / '.codex/sessions',
    pathlib.Path.home() / '.cursor/projects/Users-wanglei-mywebsite/agent-transcripts',
    pathlib.Path.home() / '.cursor/projects/Users-wanglei-Projects-co-agent/agent-transcripts',
]
ALL = [f for r in ROOTS if r.exists() for f in r.rglob('*.jsonl')]
for f in ALL:
    files += 1
    try:
        with f.open('r', encoding='utf-8', errors='replace') as fh:
            for line in fh:
                if not line.strip(): continue
                lines += 1
                try: d = json.loads(line)
                except Exception: bad += 1; continue
                t = d.get('type') if isinstance(d, dict) else None
                if t is None: notype += 1
                else: cnt[str(t)] += 1
    except Exception: pass
out = {'files': files, 'lines': lines, 'parse_error': bad, 'no_top_level_type': notype,
       'covered': sum(cnt.values()), 'types': dict(cnt.most_common())}
# 闭合账：解析成功的行必须全部被归类
assert out['covered'] + notype + 0 == lines - bad, 'ledger mismatch'
pathlib.Path('evidence/nexus-hall/w2/type-census.json').write_text(json.dumps(out, ensure_ascii=False, indent=2))
print(f"文件 {files} · 行 {lines} · 解析失败 {bad} · 无顶层 type {notype}")
print(f"真·顶层 type 全集 {len(cnt)} 种（闭合账：{out['covered']}+{notype}+{bad}={lines}）")
for k, v in cnt.most_common(): print(f"  {k:28s} {v}")
