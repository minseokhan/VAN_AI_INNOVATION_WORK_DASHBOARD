import { describe, expect, it } from "vitest";
import {
  INQUIRY_KINDS,
  INQUIRY_KIND_LABEL,
  canDeleteInquiry,
  filterInquiries,
  parseInquiryKind,
  validateInquiryContent,
} from "./rules";

const admin = { id: "a1", role: "ADMIN" };
const member = { id: "m1", role: "MEMBER" };
const other = { id: "m2", role: "MEMBER" };

describe("validateInquiryContent", () => {
  it("빈 내용은 거부", () => {
    expect(validateInquiryContent("   ")).toBeTruthy();
  });

  it("2000자까지 허용, 넘으면 거부", () => {
    expect(validateInquiryContent("a".repeat(2000))).toBeNull();
    expect(validateInquiryContent("a".repeat(2001))).toBeTruthy();
  });
});

describe("parseInquiryKind", () => {
  it("정의된 종류만 통과", () => {
    for (const k of INQUIRY_KINDS) {
      expect(parseInquiryKind(k)).toBe(k);
      expect(INQUIRY_KIND_LABEL[k]).toBeTruthy();
    }
  });

  it("모르는 값·빈 값은 null", () => {
    expect(parseInquiryKind("COMPLAINT")).toBeNull();
    expect(parseInquiryKind("")).toBeNull();
  });
});

describe("canDeleteInquiry", () => {
  it("운영진은 답변 여부와 무관하게 삭제할 수 있다", () => {
    expect(canDeleteInquiry(admin, { authorId: "m1", answer: "답" })).toBe(true);
  });

  it("작성자 본인은 미답변일 때만 삭제할 수 있다", () => {
    expect(canDeleteInquiry(member, { authorId: "m1", answer: null })).toBe(true);
    expect(canDeleteInquiry(member, { authorId: "m1", answer: "답" })).toBe(false);
  });

  it("남의 문의는 삭제할 수 없다", () => {
    expect(canDeleteInquiry(other, { authorId: "m1", answer: null })).toBe(false);
  });
});

describe("filterInquiries", () => {
  const items = [
    { authorId: "m1", answer: null },
    { authorId: "m2", answer: "답" },
    { authorId: "m2", answer: null },
  ];

  it("ALL은 전부", () => {
    expect(filterInquiries(items, "ALL", "m1")).toHaveLength(3);
  });

  it("MINE은 내가 쓴 것만", () => {
    expect(filterInquiries(items, "MINE", "m1")).toEqual([items[0]]);
  });

  it("UNANSWERED는 미답변만", () => {
    expect(filterInquiries(items, "UNANSWERED", "m1")).toEqual([items[0], items[2]]);
  });
});
