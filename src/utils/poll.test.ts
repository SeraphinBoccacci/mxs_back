import poll from "./poll";

describe("Poll unit testing", () => {
  describe("poll", () => {
    describe("when poll is called with 2s delay", () => {
      it("should call only once fn", async () => {
        const stub = jest.fn();

        await poll(stub, 2000, () => true);

        expect(stub).toBeCalledTimes(1);
      });

      it("should call many times fn", async () => {
        const stub = jest.fn();
        let shouldStop = false;
        setTimeout(() => {
          shouldStop = true;
        }, 15000);
        await poll(stub, 2000, () => shouldStop);

        expect(stub).toBeCalledTimes(8);
      });
    });

    describe("when poll is called with a delay under 1s", () => {
      it("should have a delay of 1s", async () => {
        const stub = jest.fn();
        let shouldStop = false;
        setTimeout(() => {
          shouldStop = true;
        }, 6500);
        await poll(stub, 500, () => shouldStop);

        expect(stub).toBeCalledTimes(7);
      });
    });
  });
});
