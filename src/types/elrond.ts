export interface MockedElrondTransaction {
  isMockedTransaction: true;
  herotag: string;
  amount: string;
  data: string;
}

export const isMockedElrondTransaction = (
  transaction: ElrondTransaction | MockedElrondTransaction
): transaction is MockedElrondTransaction =>
  !!(transaction as MockedElrondTransaction).isMockedTransaction;

export interface ElrondTransaction {
  hash: string;
  fee: string;
  miniBlockHash: string;
  nonce: number;
  round: number;
  value: string;
  receiver: string;
  sender: string;
  receiverShard: number;
  senderShard: number;
  gasPrice: number;
  gasLimit: number;
  gasUsed: number;
  signature: string;
  timestamp: number;
  status: string;
  searchOrder: number;
  data?: string;
}

export interface LastSnapshotBalance {
  amount: string;
  timestamp: number;
}
