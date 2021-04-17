/** @format */

import { dns, getLastTransactions, getTransactionByHash, getUpdatedBalance, proxy } from "./elrond";

describe("elrond test", () => {
  describe("proxy", () => {
    describe("when address is found on proxy", () => {
      it("should return address data", async () => {
        const addressData = await proxy.getAddress("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm");

        expect(addressData).toHaveProperty("address", "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm");
        expect(addressData).toHaveProperty("username", "streamparticles.elrond");
      });
    });

    describe("when address is not found on proxy", () => {
      it("should not return address data", async () => {
        expect(proxy.getAddress("erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmc31kv")).rejects.toThrow();
      });
    });
  });

  describe("dns", () => {
    describe("when herotag is found on dns", () => {
      it("should return address data", async () => {
        const address = await dns.resolve("streamparticles.elrond");

        expect(address).toEqual("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm");
      });
    });

    describe("when herotag is not found on dns", () => {
      it("throw error", async () => {
        const address = await dns.resolve("streamparticles");

        expect(address).toEqual("");
      });
    });
  });

  describe("getUpdatedBalance", () => {
    describe("when erdAddress is wrong", () => {
      it("should return null", async () => {
        const balance = await getUpdatedBalance("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgs-");

        expect(balance).toBeNull();
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return balance", async () => {
        const balance = await getUpdatedBalance("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm");

        expect(typeof balance).toBe("string");
      });
    });
  });

  describe("getLastTransactions", () => {
    describe("when erdAddress is wrong", () => {
      it("should return null", async () => {
        const lastTransactions = await getLastTransactions("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgs-");

        expect(lastTransactions).toBeInstanceOf(Array);
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return a transactions array", async () => {
        const lastTransactions = await getLastTransactions("erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm");

        expect(lastTransactions).toBeInstanceOf(Array);
      });
    });
  });

  describe("getTransactionByHash", () => {
    describe("when erdAddress is wrong", () => {
      it("should return null", async () => {
        const balance = await getTransactionByHash("1d511e0835d8aadca32a3d7e93c2cb2215608cd2810f4b0708aa662ad8f6f67-");

        expect(balance).toBeNull();
      });
    });

    describe("when erdAddress is correct", () => {
      it("should return a single transaction", async () => {
        const balance = await getTransactionByHash("1d511e0835d8aadca32a3d7e93c2cb2215608cd2810f4b0708aa662ad8f6f671");

        expect(balance).toBeInstanceOf(Object);
      });
    });
  });
});
