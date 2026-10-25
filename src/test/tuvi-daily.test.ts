import { describe, it, expect } from "vitest";
import { askTopic, dayGanZhi } from "@/lib/tuvi/daily";

describe("tử vi daily", () => {
  it("2000-01-01 is a Mậu Ngọ day", () => expect(dayGanZhi("2000-01-01").label).toBe("Mậu Ngọ"));
  it("2000-01-07 is a Giáp Tý day", () => expect(dayGanZhi("2000-01-07").label).toBe("Giáp Tý"));
  it("love questions go to Phu Thê", () => {
    expect(askTopic("Will my relationship last?")).toBe("love");
    expect(askTopic("Người yêu mình có thật lòng không?")).toBe("love");
  });
  it("work questions go to Quan Lộc", () => expect(askTopic("Có nên đổi công việc không?")).toBe("career"));
  it("money questions go to Tài Bạch", () => expect(askTopic("Why is my money always gone?")).toBe("wealth"));
});
