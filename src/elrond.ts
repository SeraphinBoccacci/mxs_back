import axios from "axios";

import { ElrondTransaction } from "./types";

export const getUpdatedBalance = async (
  erdAddress: string
): Promise<string> => {
  const {
    data,
  }: {
    data: {
      data: {
        balance: string;
      };
    };
  } = await axios.get(`https://api.elrond.com/address/${erdAddress}/balance`);

  return data?.data?.balance || "";
};

export const getLastTransactions = async (
  erdAddress: string
): Promise<ElrondTransaction[]> => {
  const {
    data,
  }: {
    data: { data: { transactions: ElrondTransaction[] } };
  } = await axios.get(
    `https://api.elrond.com/address/${erdAddress}/transactions`
  );

  return data?.data?.transactions || [];
};

export default { getLastTransactions };
