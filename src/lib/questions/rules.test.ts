import { describe, expect, it } from "vitest";
import { canAskFor, canDeleteQuestion, filterQuestions, validateAnswer, validateQuestion } from "./rules";

const member = { id: "u1", role: "MEMBER" };
const admin = { id: "a1", role: "ADMIN" };

describe("validateQuestion", () => {
  it("빈 값·공백만은 에러", () => {
    expect(validateQuestion("")).toBeTruthy();
    expect(validateQuestion("   \n ")).toBeTruthy();
  });
  it("2000자 초과는 에러, 2000자는 통과", () => {
    expect(validateQuestion("a".repeat(2001))).toBeTruthy();
    expect(validateQuestion("a".repeat(2000))).toBeNull();
  });
  it("정상 입력은 null", () => {
    expect(validateQuestion("  질문입니다 ")).toBeNull();
  });
});

describe("validateAnswer", () => {
  it("빈 값은 에러, 4000자 경계", () => {
    expect(validateAnswer(" ")).toBeTruthy();
    expect(validateAnswer("a".repeat(4001))).toBeTruthy();
    expect(validateAnswer("a".repeat(4000))).toBeNull();
  });
});

describe("canAskFor", () => {
  it("팀원이면 가능", () => {
    expect(canAskFor(member, ["u1", "u2"])).toBe(true);
  });
  it("팀원이 아니면 불가", () => {
    expect(canAskFor(member, ["u2"])).toBe(false);
  });
  it("ADMIN은 팀원이 아니어도 가능", () => {
    expect(canAskFor(admin, [])).toBe(true);
  });
});

describe("canDeleteQuestion", () => {
  it("작성자 본인 + 미답변이면 가능", () => {
    expect(canDeleteQuestion(member, { authorId: "u1", answer: null })).toBe(true);
  });
  it("작성자 본인이라도 답변된 질문은 불가", () => {
    expect(canDeleteQuestion(member, { authorId: "u1", answer: "답변" })).toBe(false);
  });
  it("다른 사람 질문은 불가", () => {
    expect(canDeleteQuestion(member, { authorId: "u2", answer: null })).toBe(false);
  });
  it("ADMIN은 답변 여부와 무관하게 가능", () => {
    expect(canDeleteQuestion(admin, { authorId: "u2", answer: "답변" })).toBe(true);
  });
});

describe("filterQuestions", () => {
  const qs = [
    { id: "q1", projectId: "p1", answer: null, project: { memberIds: ["u1"] } },
    { id: "q2", projectId: "p2", answer: "a", project: { memberIds: ["u2"] } },
    { id: "q3", projectId: "p2", answer: null, project: { memberIds: ["u2"] } },
  ];
  const ids = (r: { id: string }[]) => r.map((q) => q.id);

  it("ALL은 전부", () => {
    expect(ids(filterQuestions(qs, { scope: "ALL" }, "u1"))).toEqual(["q1", "q2", "q3"]);
  });
  it("MINE은 내가 팀원인 프로젝트의 질문만", () => {
    expect(ids(filterQuestions(qs, { scope: "MINE" }, "u1"))).toEqual(["q1"]);
    expect(ids(filterQuestions(qs, { scope: "MINE" }, "u2"))).toEqual(["q2", "q3"]);
  });
  it("UNANSWERED는 answer null만", () => {
    expect(ids(filterQuestions(qs, { scope: "UNANSWERED" }, "u1"))).toEqual(["q1", "q3"]);
  });
  it("project가 있으면 해당 프로젝트로 추가 제한", () => {
    expect(ids(filterQuestions(qs, { scope: "ALL", project: "p2" }, "u1"))).toEqual(["q2", "q3"]);
    expect(ids(filterQuestions(qs, { scope: "UNANSWERED", project: "p2" }, "u1"))).toEqual(["q3"]);
  });
});
