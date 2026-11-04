// Small independent evaluator for the permitted formula subset. LibreOffice remains a separate gate.
export function evaluator(sheet: string) {
  const cells = new Map<string, string | number | null>();
  for (const match of sheet.matchAll(/<c\b([^>]*?)(?:\/>|>(.*?)<\/c>)/g)) {
    const addr = /\br="([A-Z]+\d+)"/.exec(match[1])![1];
    const inner = match[2] ?? '', f = /<f>(.*?)<\/f>/.exec(inner), v = /<v>(.*?)<\/v>/.exec(inner);
    cells.set(addr, f ? f[1].replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>') : v ? Number(v[1]) : null);
  }
  const cache = new Map<string, number | null>(), active = new Set<string>();
  const value = (ref: string): number | null => {
    ref = ref.replaceAll('$', '');
    if (cache.has(ref)) return cache.get(ref)!;
    if (active.has(ref)) throw new Error(`Circular reference ${ref}`);
    const cell = cells.get(ref) ?? null;
    if (typeof cell !== 'string') return cell;
    active.add(ref);
    const tokens = cell.match(/\$?[A-Z]+\$?\d+|SUM|ROUND|\d+(?:\.\d+)?(?:e[+-]?\d+)?|[+*/(),:\-]/gi) ?? [];
    let at = 0;
    const take = (token: string) => { if (tokens[at++] !== token) throw new Error(`Expected ${token} in ${cell}`); };
    const expression = (): number => {
      let v = product();
      while (tokens[at] === '+' || tokens[at] === '-') { const op = tokens[at++]; const b = product(); v = op === '+' ? v + b : v - b; }
      return v;
    };
    const product = (): number => {
      let v = atom();
      while (tokens[at] === '*' || tokens[at] === '/') { const op = tokens[at++]; const b = atom(); v = op === '*' ? v * b : v / b; }
      return v;
    };
    const atom = (): number => {
      if (tokens[at] === '-') { at++; return -atom(); }
      if (tokens[at] === '(') { at++; const v = expression(); take(')'); return v; }
      if (tokens[at] === 'SUM' || tokens[at] === 'ROUND') {
        const name = tokens[at++]; take('('); const args: number[] = [];
        do {
          if (tokens[at] === ',') at++;
          if (/^\$?[A-Z]+\$?\d+$/.test(tokens[at]) && tokens[at + 1] === ':') {
            const from = tokens[at++].replaceAll('$', ''); at++;
            const to = tokens[at++].replaceAll('$', '');
            const a = /^([A-Z]+)(\d+)$/.exec(from)!, b = /^([A-Z]+)(\d+)$/.exec(to)!;
            const col = (v: string) => [...v].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
            const letters = (v: number): string => v <= 26 ? String.fromCharCode(64 + v) : letters(Math.floor((v - 1) / 26)) + String.fromCharCode(65 + (v - 1) % 26);
            for (let r = +a[2]; r <= +b[2]; r++) for (let c = col(a[1]); c <= col(b[1]); c++) args.push(value(`${letters(c)}${r}`) ?? 0);
          } else args.push(expression());
        } while (tokens[at] === ',');
        take(')'); return name === 'SUM' ? args.reduce((a, b) => a + b, 0) : Math.round(args[0] * 10 ** args[1]) / 10 ** args[1];
      }
      const t = tokens[at++];
      return /^\$?[A-Z]+\$?\d+$/.test(t) ? value(t) ?? 0 : Number(t);
    };
    const result = expression(); if (at !== tokens.length || !Number.isFinite(result)) throw new Error(`Invalid formula ${cell}`);
    active.delete(ref); cache.set(ref, result); return result;
  };
  return value;
}
