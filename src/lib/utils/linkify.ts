export type TextSegment = { type: "text" | "link"; value: string };

const URL_RE = /https?:\/\/[^\s<]+/g;
const TRAILING = /[.,;:!?)]+$/;

/** 본문에서 http(s) URL을 링크 세그먼트로 분리. 끝의 문장부호는 텍스트로 돌려보낸다 */
export function linkify(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const url = m[0].replace(TRAILING, "");
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    out.push({ type: "link", value: url });
    last = m.index + url.length;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}
