import { describe, expect, it } from "vitest";
import { POSITIONS, POSITION_LABEL, PRIORITY_LABEL, PRIORITY_ORDER, PRIORITY_TONE, STATUS_LABEL, STATUS_TONE, priorityRank } from "./labels";

describe("labels", () => {
  it("상태 라벨/톤", () => {
    expect(STATUS_LABEL).toEqual({ UNASSIGNED: "미배정", IN_PROGRESS: "진행중", DONE: "완료" });
    expect(STATUS_TONE).toEqual({ UNASSIGNED: "amber", IN_PROGRESS: "navy", DONE: "green" });
  });
  it("포지션 라벨", () => {
    expect(POSITION_LABEL).toEqual({ FE: "프론트", BE: "백엔드", AI: "AI", PM: "기획", ETC: "기타" });
  });
  it("우선순위 순서", () => {
    expect(PRIORITY_ORDER).toEqual(["上", "中上", "中", "中下", "下", "중장기"]);
  });
  it("우선순위 한글 라벨/톤 — 저장값(한자)마다 하나씩, 톤은 서로 다르게", () => {
    expect(PRIORITY_LABEL).toEqual({ 上: "상", 中上: "중상", 中: "중", 中下: "중하", 下: "하", 중장기: "중장기" });
    expect(Object.keys(PRIORITY_TONE)).toEqual(PRIORITY_ORDER);
    expect(new Set(Object.values(PRIORITY_TONE)).size).toBe(PRIORITY_ORDER.length);
  });
  it("priorityRank는 목록 인덱스, 없으면 마지막", () => {
    expect(priorityRank("上")).toBe(0);
    expect(priorityRank("중장기")).toBe(5);
    expect(priorityRank("???")).toBe(6);
    expect(priorityRank("")).toBe(6);
  });
});

// POSITIONS 는 배열이라 Position 에 값이 추가돼도 컴파일 에러가 나지 않는다 — 누락되면 설정 드롭다운에서 조용히 사라진다
describe("POSITIONS", () => {
  it("모든 포지션을 빠짐없이 담는다", () => {
    expect([...POSITIONS].sort()).toEqual(Object.keys(POSITION_LABEL).sort());
  });
});
