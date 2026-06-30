import { describe, it, expect } from "vitest";
import { parseTimeToSeconds, formatTimeFromSeconds } from "@/lib/date-utils";

describe("parseTimeToSeconds", () => {
  it("parses HH:MM:SS correctly", () => {
    expect(parseTimeToSeconds("01:30:00")).toBe(5400);
    expect(parseTimeToSeconds("00:00:00")).toBe(0);
    expect(parseTimeToSeconds("23:59:59")).toBe(86399);
  });

  it("parses 1-digit hours", () => {
    expect(parseTimeToSeconds("1:30:00")).toBe(5400);
    expect(parseTimeToSeconds("9:05:03")).toBe(32703);
  });

  it("parses 2-digit hours", () => {
    expect(parseTimeToSeconds("12:34:56")).toBe(45296);
  });

  it("returns null for invalid format", () => {
    expect(parseTimeToSeconds("1:30")).toBeNull();
    expect(parseTimeToSeconds("abc")).toBeNull();
    expect(parseTimeToSeconds("")).toBeNull();
    expect(parseTimeToSeconds("1:60:00")).toBeNull();
    expect(parseTimeToSeconds("1:30:60")).toBeNull();
  });
});

describe("formatTimeFromSeconds", () => {
  it("formats with zero-padded minutes and seconds", () => {
    expect(formatTimeFromSeconds(5400)).toBe("1:30:00");
    expect(formatTimeFromSeconds(0)).toBe("0:00:00");
    expect(formatTimeFromSeconds(86399)).toBe("23:59:59");
  });

  it("handles minutes and seconds with leading zeros", () => {
    expect(formatTimeFromSeconds(65)).toBe("0:01:05");
    expect(formatTimeFromSeconds(3605)).toBe("1:00:05");
  });

  it("round-trips with parseTimeToSeconds", () => {
    for (const t of ["1:30:00", "0:05:30", "12:00:00", "5:45:09"]) {
      const seconds = parseTimeToSeconds(t);
      expect(seconds).not.toBeNull();
      expect(formatTimeFromSeconds(seconds!)).toBe(t);
    }
  });
});
