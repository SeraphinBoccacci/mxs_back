import { dns, proxy } from "./elrond";

describe.only("elrond test", () => {
  describe("proxy", () => {
    describe("when address is found on proxy", () => {
      it("should return address data", async () => {
        const addressData = await proxy.getAddress(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        expect(addressData).toHaveProperty(
          "address",
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );
        expect(addressData).toHaveProperty("nonce", 88);
        expect(addressData).toHaveProperty("username", "serabocca06.elrond");
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
        const address = await dns.resolve("serabocca06.elrond");

        expect(address).toEqual(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );
      });
    });

    describe("when herotag is not found on dns", () => {
      it("throw error", async () => {
        const address = await dns.resolve("serabocca06");

        expect(address).toEqual("");
      });
    });
  });
});
