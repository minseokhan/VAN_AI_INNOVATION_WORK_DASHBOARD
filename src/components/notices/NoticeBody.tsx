import { linkify } from "@/lib/utils/linkify";

/** 공지 본문. 줄바꿈을 살리고 http(s) 주소는 링크로 만든다 */
export function NoticeBody({ content }: { content: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
      {linkify(content).map((s, i) =>
        s.type === "link" ? (
          <a key={i} href={s.value} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:underline">
            {s.value}
          </a>
        ) : (
          <span key={i}>{s.value}</span>
        ),
      )}
    </p>
  );
}
