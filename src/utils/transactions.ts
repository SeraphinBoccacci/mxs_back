/** @format */

import { Decimal } from "decimal.js";

import { dns, proxy } from "../services/elrond";
import { ElrondTransaction } from "../types";
import { ENV } from "./env";

export const getErdAddressFromHerotag = async (herotag: string): Promise<string> => {
  const address = await dns.resolve(herotag);

  return address;
};

export const getHerotagFromErdAddress = async (erdAddress: string): Promise<string> => {
  const { username } = await proxy.getAddress(erdAddress);

  return username || "NO_HEROTAG";
};

export const normalizeHerotag = (herotag: string): string => {
  return herotag.endsWith(`${ENV.ELROND_HEROTAG_DOMAIN}`) ? herotag.replace("@", "") : `${herotag}.elrond`.replace("@", "");
};

export const computeSentAmount = (amount: string): string => {
  return String(Decimal.set({ precision: amount.length }).mul(amount, Math.pow(10, -18)));
};

export const decodeDataFromTx = (transaction: ElrondTransaction): string => {
  return transaction.data ? Buffer.from(transaction.data, "base64").toString() : "";
};
