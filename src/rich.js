import katex from 'katex';
import 'katex/dist/katex.min.css';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const tex = (t, display = false) => katex.renderToString(t, { throwOnError: false, displayMode: display, strict: 'ignore' });

function inline(s, store) {
  s = esc(s);
  s = s.replace(/\{\{([^}]+?)\}\}/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, '$1<i>$2</i>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => store[+i]);
}

// Mini markdown: paragraphs, bullets, numbered lists, pipe tables, ~~~ code fences, $inline$ and $$display$$ LaTeX.
export function md(src) {
  const store = [];
  const keep = (html) => `\u0000${store.push(html) - 1}\u0000`;
  const codes = [];
  src = src.replace(/~~~\w*\n([\s\S]*?)~~~/g, (_, c) => `\n\u0001${codes.push(c) - 1}\u0001\n`);
  src = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => `\n\u0000D${store.push(tex(t.trim(), true)) - 1}\u0000\n`);
  src = src.replace(/\$([^$\n]+?)\$/g, (_, t) => keep(tex(t)));
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const L = lines[i];
    if (!L.trim()) { i++; continue; }
    let m;
    if ((m = L.match(/^\u0001(\d+)\u0001$/))) { out.push(`<pre><code>${esc(codes[+m[1]])}</code></pre>`); i++; continue; }
    if ((m = L.match(/^\u0000D(\d+)\u0000$/))) { out.push(`<div class="formula">${store[+m[1]]}</div>`); i++; continue; }
    if (L.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim(), store));
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      out.push(`<div style="overflow:auto"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^[-+] /.test(L)) { const it = []; while (i < lines.length && /^[-+] /.test(lines[i])) it.push(inline(lines[i++].slice(2), store)); out.push(`<ul>${it.map((x) => `<li>${x}</li>`).join('')}</ul>`); continue; }
    if (/^\d+\. /.test(L)) { const it = []; while (i < lines.length && /^\d+\. /.test(lines[i])) it.push(inline(lines[i++].replace(/^\d+\. /, ''), store)); out.push(`<ol>${it.map((x) => `<li>${x}</li>`).join('')}</ol>`); continue; }
    const para = []; while (i < lines.length && lines[i].trim() && !/^([-+] |\d+\. |\||\u0001|\u0000D)/.test(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '), store)}</p>`);
  }
  return out.join('\n');
}
