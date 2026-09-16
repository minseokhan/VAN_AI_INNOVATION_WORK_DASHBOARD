import { describe, expect, it } from "vitest";
import { buildDigestMessages, type DigestQuestion } from "./digest";

const base = { roleId: "R1", baseUrl: "https://van.example", date: new Date("2026-09-15T03:00:00Z") };
const q = (over: Partial<DigestQuestion>): DigestQuestion => ({
  id: "q1",
  content: "질문",
  createdAt: new Date("2026-09-14T00:00:00Z"),
  authorName: "홍길동",
  projectCode: "2-1",
  projectTitle: "컨퍼런스 사이트 운영 개선",
  projectId: "p1",
  ...over,
});

describe("buildDigestMessages", () => {
  it("빈 배열은 []", () => {
    expect(buildDigestMessages([], base)).toEqual([]);
  });

  it("헤더 + 프로젝트 그룹 + 질문 줄 형식", () => {
    const [m] = buildDigestMessages([q({}), q({ id: "q2", content: "둘째", authorName: "김철수" })], base);
    expect(m).toBe(
      [
        "<@&R1> 📋 **AI혁신부 기획 질문 다이제스트 (9/15)** — 2건",
        "",
        "**[2-1] 컨퍼런스 사이트 운영 개선** · https://van.example/questions?project=p1",
        "• (홍길동) 질문",
        "• (김철수) 둘째",
      ].join("\n"),
    );
  });

  it("roleId 없으면 멘션 생략, 날짜는 KST 기준", () => {
    const [m] = buildDigestMessages([q({})], { ...base, roleId: undefined, date: new Date("2026-09-15T15:30:00Z") });
    expect(m.startsWith("📋 **AI혁신부 기획 질문 다이제스트 (9/16)** — 1건")).toBe(true);
    expect(m).not.toContain("<@&");
  });

  it("프로젝트별로 그룹화하고 내용은 200자에서 잘라 …", () => {
    const long = "가".repeat(250);
    const [m] = buildDigestMessages([q({ content: long }), q({ id: "q2", projectId: "p2", projectCode: "3-1", projectTitle: "B" }), q({ id: "q3" })], base);
    expect(m).toContain(`• (홍길동) ${"가".repeat(200)}…`);
    expect(m.indexOf("**[2-1]")).toBeLessThan(m.indexOf("**[3-1] B**"));
    expect(m.match(/\*\*\[2-1\]/g)).toHaveLength(1);
    expect(m).toContain("— 3건");
  });

  it("줄바꿈은 공백으로 바꿔 한 줄로", () => {
    const [m] = buildDigestMessages([q({ content: "첫 줄\n\n둘째 줄" })], base);
    expect(m).toContain("• (홍길동) 첫 줄 둘째 줄");
  });

  it("2000자를 넘으면 프로젝트 그룹 단위로 분할, 헤더는 첫 메시지에만", () => {
    const qs = Array.from({ length: 30 }, (_, i) =>
      q({ id: `q${i}`, projectId: `p${i}`, projectCode: `${i}-1`, projectTitle: "T", content: "나".repeat(150) }),
    );
    const ms = buildDigestMessages(qs, base);
    expect(ms.length).toBeGreaterThan(1);
    for (const m of ms) expect(m.length).toBeLessThanOrEqual(2000);
    expect(ms[0]).toContain("다이제스트");
    for (const m of ms.slice(1)) expect(m).not.toContain("다이제스트");
    expect(ms.join("\n").match(/^\*\*\[/gm)).toHaveLength(30);
    for (const m of ms) expect(m.startsWith("\n")).toBe(false);
  });

  it("한 프로젝트가 2000자를 넘으면 질문 줄 단위로도 분할", () => {
    const qs = Array.from({ length: 15 }, (_, i) => q({ id: `q${i}`, content: "다".repeat(200) }));
    const ms = buildDigestMessages(qs, base);
    for (const m of ms) expect(m.length).toBeLessThanOrEqual(2000);
    expect(ms.join("\n").match(/^• /gm)).toHaveLength(15);
  });
});
