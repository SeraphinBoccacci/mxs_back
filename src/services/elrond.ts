import axios from "axios";
import { Dns, ProxyProvider } from "elrondjs";

import { ElrondTransaction } from "../types";
import logger from "./logger";

export const proxy = new ProxyProvider("https://gateway.elrond.com");
export const dns = new Dns({ provider: proxy });

export const getUpdatedBalance = async (
  erdAddress: string
): Promise<string | null> => {
  interface Response {
    data: {
      data: {
        balance: string;
      };
    };
  }

  try {
    const { data }: Response = await axios.get(
      `https://api.elrond.com/address/${erdAddress}/balance`
    );

    return data?.data?.balance || "";
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const getLastTransactions = async (
  erdAddress: string
): Promise<ElrondTransaction[]> => {
  interface Response {
    data: { data: { transactions: ElrondTransaction[] } };
  }

  try {
    const { data }: Response = await axios.get(
      `https://api.elrond.com/address/${erdAddress}/transactions`
    );

    return data?.data?.transactions || [];
  } catch (error) {
    logger.error(error);
    return [];
  }
};

export const getTransactionByHash = async (
  hash: string
): Promise<ElrondTransaction | null> => {
  interface Response {
    data: { data: { transaction: ElrondTransaction } };
  }

  try {
    const { data }: Response = await axios.get(
      `https://api.elrond.com/transaction/${hash}`
    );

    return data?.data?.transaction;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export default { getLastTransactions };
