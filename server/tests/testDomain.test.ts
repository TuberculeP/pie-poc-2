import { describe } from "node:test";
import { sum } from "../src/domains/testDomain/testDomain.service";

describe("testDomain", () => {
  describe("sum", () => {
    it("should return the sum of two numbers", () => {
      expect(sum(1, 2)).toBe(3);
    });
  });
});
