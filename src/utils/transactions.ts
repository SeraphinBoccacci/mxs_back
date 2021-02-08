import { ElrondTransaction } from "../interfaces";

export const decodeDataFromTx = (transaction: ElrondTransaction) => {
  return transaction.data
    ? Buffer.from(transaction.data, "base64").toString()
    : "";
};
