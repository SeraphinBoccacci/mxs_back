import { computeSentAmount, normalizeHerotag } from "./transactions";

describe("Maiar utils unit testing", () => {
  describe("normalizeHerotag", () => {
    describe("when herotag does not end with .elrond", () => {
      it("should return herotag with .elrond at end", () => {
        const herotag = "serabocca06";

        const normalizedHerotag = normalizeHerotag(herotag);

        expect(normalizedHerotag).toEqual("serabocca06.elrond");
      });
    });

    describe("when herotag does end with .elrond", () => {
      it("should return same herotag", () => {
        const herotag = "serabocca06.elrond";

        const normalizedHerotag = normalizeHerotag(herotag);

        expect(normalizedHerotag).toEqual("serabocca06.elrond");
      });
    });

    describe("when herotag starts with @", () => {
      it("should return herotag without @ and with .elrond at end", () => {
        const herotag = "@serabocca06";

        const normalizedHerotag = normalizeHerotag(herotag);

        expect(normalizedHerotag).toEqual("serabocca06.elrond");
      });
    });
  });

  describe("computeSentAmount", () => {
    describe("when amount is integer", () => {
      it("should set decimal right", () => {
        const txAmount = "1000000000000000000";

        const readableAmount = computeSentAmount(txAmount);

        expect(readableAmount).toEqual("1");
      });
    });

    describe("when amount is decimal", () => {
      it("should set decimal right", () => {
        const txAmount = "1234560000000000";

        const readableAmount = computeSentAmount(txAmount);

        expect(readableAmount).toEqual("0.00123456");
      });
    });

    describe("when amount is thousands", () => {
      it("should set decimal right", () => {
        const txAmount = "1000000000000000000000";

        const readableAmount = computeSentAmount(txAmount);

        expect(readableAmount).toEqual("1000");
      });
    });

    describe("when amount is very large", () => {
      it("should set decimal right", () => {
        const txAmount = "2489393914906039622412991";

        const readableAmount = computeSentAmount(txAmount);

        expect(readableAmount).toEqual("2489393.914906039622412991");
      });
    });
  });
});
