import { describe, expect, it } from "vitest";
import { demoChart } from "@/data/seed";
import { chartForStorage, privateChartSchema } from "@/data/chart-privacy";
describe("saved chart privacy", () => {
  it("omits birthplace coordinates and timezone while preserving positions", () => {
    const stored = chartForStorage(demoChart);
    expect(stored).not.toHaveProperty("lat");
    expect(stored).not.toHaveProperty("lon");
    expect(stored).not.toHaveProperty("timezone");
    expect(stored.details.sun.longitude).toBe(demoChart.details.sun.longitude);
  });
  it("rejects birth inputs in a Cloud chart request", () => {
    expect(
      privateChartSchema.safeParse({ ...chartForStorage(demoChart), birthDate: "1992-02-14" })
        .success,
    ).toBe(false);
  });
  it("never includes editable browser-only birth inputs in a saved chart", () => {
    const stored = chartForStorage(demoChart);
    expect(privateChartSchema.safeParse({ ...stored, birthProfile: { hour: 12, city: "Hanoi" } }).success).toBe(false);
  });
});
