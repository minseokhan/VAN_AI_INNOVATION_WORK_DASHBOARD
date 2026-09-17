import { describe, expect, it } from "vitest";
import { buildReminderMessages } from "./remind";

const opts = { weekLabel: "9월 2주차 (9/14~9/20)", baseUrl: "https://van.example.com", deadline: "금요일 18시" };

describe("buildReminderMessages", () => {
  it("미제출이 없으면 아무것도 만들지 않는다", () => {
    expect(buildReminderMessages([], opts)).toEqual([]);
  });

  it("미제출 팀원을 @이름으로 부르고 마감을 알린다", () => {
    const [msg] = buildReminderMessages(
      [{ projectId: "p1", projectCode: "1-1", projectTitle: "카드뉴스", memberNames: ["홍길동", "한민석"] }],
      opts,
    );
    expect(msg).toContain("@홍길동 @한민석 님");
    expect(msg).toContain("주간보고가 아직 미제출 상태입니다");
    expect(msg).toContain("9월 2주차 (9/14~9/20)");
    expect(msg).toContain("금요일 18시");
    expect(msg).toContain("[1-1] 카드뉴스");
    expect(msg).toContain("https://van.example.com/projects/p1");
  });

  it("멤버가 없는 프로젝트는 부를 사람이 없으므로 빼고, 남는 게 없으면 메시지도 없다", () => {
    expect(buildReminderMessages([{ projectId: "p1", projectCode: "1-1", projectTitle: "x", memberNames: [] }], opts)).toEqual([]);
  });

  it("2000자를 넘으면 여러 메시지로 나눈다", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      projectId: `p${i}`,
      projectCode: `${i}-1`,
      projectTitle: "긴 제목".repeat(5),
      memberNames: ["홍길동", "한민석", "김철수"],
    }));
    const msgs = buildReminderMessages(many, opts);
    expect(msgs.length).toBeGreaterThan(1);
    expect(msgs.every((m) => m.length <= 2000)).toBe(true);
  });

  it("헤더는 첫 메시지에만 붙는다", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      projectId: `p${i}`,
      projectCode: `${i}-1`,
      projectTitle: "긴 제목".repeat(5),
      memberNames: ["홍길동", "한민석", "김철수"],
    }));
    const msgs = buildReminderMessages(many, opts);
    expect(msgs[0]).toContain("주간보고 미제출");
    expect(msgs.slice(1).some((m) => m.includes("주간보고 미제출"))).toBe(false);
  });
});
