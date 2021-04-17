/** @format */

import axios from "axios";
import { Dns, ProxyProvider } from "elrondjs";

import { ElrondTransaction } from "../types";
import { ENV } from "../utils/env";
import logger from "./logger";

export const proxy = new ProxyProvider(`${ENV.ELROND_GATEWAY_URL}`);
export const dns = new Dns({ provider: proxy });

export const getUpdatedBalance = async (erdAddress: string): Promise<string | null> => {
  interface Response {
    data: {
      data: {
        balance: string;
      };
    };
  }

  try {
    const { data }: Response = await axios.get(`${ENV.ELROND_API_URL}/address/${erdAddress}/balance`);

    return data?.data?.balance || "";
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const getLastTransactions = async (erdAddress: string): Promise<ElrondTransaction[]> => {
  interface Response {
    data: { data: { transactions: ElrondTransaction[] } };
  }

  try {
    const { data }: Response = await axios.get(`${ENV.ELROND_API_URL}/address/${erdAddress}/transactions`);

    return data?.data?.transactions || [];
  } catch (error) {
    logger.error(error);
    return [];
  }
};

export const getTransactionByHash = async (hash: string): Promise<ElrondTransaction | null> => {
  interface Response {
    data: { data: { transaction: ElrondTransaction } };
  }

  try {
    const { data }: Response = await axios.get(`${ENV.ELROND_API_URL}/transaction/${hash}`);

    return data?.data?.transaction;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export default { getLastTransactions };
