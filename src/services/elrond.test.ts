import { dns, proxy } from "./elrond";

describe("elrond test", () => {
  describe("proxy", () => {
    describe("when address is found on proxy", () => {
      it("should return address data", async () => {
        const addressData = await proxy.getAddress(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );

        expect(addressData).toHaveProperty(
          "address",
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );
        expect(addressData).toHaveProperty(
          "username",
          "streamparticles.elrond"
        );
      });
    });

    describe("when address is not found on proxy", () => {
      it("should not return address data", async () => {
        expect(
          proxy.getAddress(
            "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmc31kv"
          )
        ).rejects.toThrow();
      });
    });
  });

  describe("dns", () => {
    describe("when herotag is found on dns", () => {
      it("should return address data", async () => {
        const address = await dns.resolve("streamparticles.elrond");

        expect(address).toEqual(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );
      });
    });

    describe("when herotag is not found on dns", () => {
      it("throw error", async () => {
        const address = await dns.resolve("streamparticles");

        expect(address).toEqual("");
      });
    });
  });
});
