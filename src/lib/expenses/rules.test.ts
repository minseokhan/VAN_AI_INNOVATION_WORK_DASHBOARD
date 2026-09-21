import { describe, expect, it } from "vitest";
import {
  MAX_EXPENSE_AMOUNT,
  canDeleteExpense,
  currentMonth,
  formatAmount,
  formatMonth,
  groupByUser,
  nextMonth,
  parseAmount,
  parseExpenseKind,
  parseMonth,
  validateExpense,
} from "./rules";

describe("parseAmount", () => {
  it("숫자와 콤마를 허용한다", () => {
    expect(parseAmount("12000")).toBe(12000);
    expect(parseAmount("12,000")).toBe(12000);
    expect(parseAmount(" 3,500 ")).toBe(3500);
  });

  it("0 이하·소수·문자는 거부한다", () => {
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("-100")).toBeNull();
    expect(parseAmount("1.5")).toBeNull();
    expect(parseAmount("만원")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });

  it("상한을 넘으면 거부한다", () => {
    expect(parseAmount(String(MAX_EXPENSE_AMOUNT))).toBe(MAX_EXPENSE_AMOUNT);
    expect(parseAmount(String(MAX_EXPENSE_AMOUNT + 1))).toBeNull();
  });
});

describe("parseMonth", () => {
  it("YYYY-MM 형식만 통과시킨다", () => {
    expect(parseMonth("2026-09")).toBe("2026-09");
    expect(parseMonth("2026-9")).toBeNull();
    expect(parseMonth("2026-13")).toBeNull();
    expect(parseMonth("2026-00")).toBeNull();
    expect(parseMonth("")).toBeNull();
    expect(parseMonth("2026-09-01")).toBeNull();
  });
});

describe("currentMonth / nextMonth", () => {
  it("KST 기준 월을 낸다", () => {
    // 2026-09-30 15:30 UTC = 2026-10-01 00:30 KST
    expect(currentMonth(new Date("2026-09-30T15:30:00Z"))).toBe("2026-10");
    expect(currentMonth(new Date("2026-09-30T14:00:00Z"))).toBe("2026-09");
  });

  it("12월 다음은 이듬해 1월", () => {
    expect(nextMonth("2026-09")).toBe("2026-10");
    expect(nextMonth("2026-12")).toBe("2027-01");
  });
});

describe("formatMonth / formatAmount", () => {
  it("사람이 읽는 형식으로 바꾼다", () => {
    expect(formatMonth("2026-09")).toBe("2026년 9월");
    expect(formatAmount(12000)).toBe("12,000원");
    expect(formatAmount(0)).toBe("0원");
  });
});

describe("parseExpenseKind", () => {
  it("정의된 값만 통과시킨다", () => {
    expect(parseExpenseKind("SPENT")).toBe("SPENT");
    expect(parseExpenseKind("PLANNED")).toBe("PLANNED");
    expect(parseExpenseKind("OTHER")).toBeNull();
  });
});

describe("validateExpense", () => {
  const ok = { month: "2026-09", kind: "SPENT", title: "OpenAI API 크레딧", amount: "30000", note: "9월 챗봇 실험분" };

  it("정상 입력은 오류가 없다", () => {
    expect(validateExpense(ok)).toEqual({});
  });

  it("항목명·금액·월을 검사한다", () => {
    const e = validateExpense({ ...ok, title: "  ", amount: "0", month: "2026-9" });
    expect(e.title).toBeTruthy();
    expect(e.amount).toBeTruthy();
    expect(e.month).toBeTruthy();
  });

  it("항목명·내용 길이 상한을 검사한다", () => {
    expect(validateExpense({ ...ok, title: "가".repeat(101) }).title).toBeTruthy();
    expect(validateExpense({ ...ok, note: "가".repeat(1001) }).note).toBeTruthy();
  });

  it("내용은 비워도 된다", () => {
    expect(validateExpense({ ...ok, note: "" })).toEqual({});
  });

  it("알 수 없는 구분은 거부한다", () => {
    expect(validateExpense({ ...ok, kind: "X" }).kind).toBeTruthy();
  });
});

describe("canDeleteExpense", () => {
  const item = { userId: "u1" };

  it("작성자 본인은 삭제할 수 있다", () => {
    expect(canDeleteExpense({ id: "u1", role: "MEMBER" }, item)).toBe(true);
  });

  it("다른 부원은 삭제할 수 없다", () => {
    expect(canDeleteExpense({ id: "u2", role: "MEMBER" }, item)).toBe(false);
  });

  it("운영진은 남의 청구도 삭제할 수 있다", () => {
    expect(canDeleteExpense({ id: "u2", role: "ADMIN" }, item)).toBe(true);
  });
});

describe("groupByUser", () => {
  const items = [
    { id: "a", userId: "u1", userName: "김부원", kind: "SPENT" as const, amount: 1000 },
    { id: "b", userId: "u2", userName: "이부원", kind: "SPENT" as const, amount: 5000 },
    { id: "c", userId: "u1", userName: "김부원", kind: "PLANNED" as const, amount: 2000 },
  ];

  it("사람별로 묶고 구분별 합계를 낸다", () => {
    const groups = groupByUser(items);
    expect(groups.map((g) => g.userName)).toEqual(["김부원", "이부원"]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].spent).toBe(1000);
    expect(groups[0].planned).toBe(2000);
    expect(groups[1].spent).toBe(5000);
    expect(groups[1].planned).toBe(0);
  });

  it("빈 목록은 빈 배열", () => {
    expect(groupByUser([])).toEqual([]);
  });
});
