import User, { UserMongooseDocument, UserType } from "../../models/User";
import {
  getAlreadyListennedTransactions,
  getLastRestart,
  setAlreadyListennedTransactions,
} from "../../redis";
import { getTransactionByHash } from "../../services/elrond";
import { ElrondTransaction } from "../../types";
import poll, { pollTransactions } from "../../utils/poll";
import { normalizeHerotag } from "../../utils/transactions";
import { reactToNewTransaction } from "../blockchain-interaction";

export const pollPendingTransactions = (
  transaction: ElrondTransaction,
  user: UserType
): void => {
  const isTransactionNotPendingAnymore = async () => {
    const elrondTransaction = await getTransactionByHash(transaction.hash);

    if (elrondTransaction) {
      if (elrondTransaction.status === "success") {
        await reactToNewTransaction(transaction, user);
      }

      return elrondTransaction.status !== "pending";
    }

    return false;
  };

  poll(null, 2000, isTransactionNotPendingAnymore);
};

export const findNewIncomingTransactions = (
  transactions: ElrondTransaction[],
  erdAddress: string,
  user: UserType,
  last30ListennedTransactions: string[],
  lastRestartTimestamp: number
): ElrondTransaction[] => {
  const isTimestampOk = (timestamp: number) =>
    timestamp > lastRestartTimestamp &&
    user?.streamingStartDate &&
    timestamp > Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001);

  return transactions.filter(
    ({ receiver, timestamp, hash, status }: ElrondTransaction) =>
      receiver === erdAddress &&
      isTimestampOk(timestamp) &&
      !last30ListennedTransactions.includes(hash) &&
      status === "success"
  );
};

export const transactionsHandler = (
  user: UserType,
  lastRestartTimestamp: number
) => async (
  erdAddress: string,
  transactions: ElrondTransaction[]
): Promise<void> => {
  const last30ListennedTransactions = await getAlreadyListennedTransactions(
    erdAddress
  );

  const newTransactions = findNewIncomingTransactions(
    transactions,
    erdAddress,
    user,
    last30ListennedTransactions,
    lastRestartTimestamp
  );

  if (!newTransactions.length) return;

  await setAlreadyListennedTransactions(
    erdAddress,
    newTransactions.map(({ hash }) => hash)
  );

  await Promise.all(
    newTransactions.map(async (transaction: ElrondTransaction) => {
      reactToNewTransaction(transaction, user);
    })
  );
};

export const launchBlockchainMonitoring = async (
  herotag: string,
  user: UserType
): Promise<string> => {
  const lastRestartTimestamp = await getLastRestart();

  const handleTransactions = transactionsHandler(user, lastRestartTimestamp);

  const shouldStopPolling = async () => {
    const currentUser = await User.findById(user._id)
      .select({
        isStreaming: true,
      })
      .lean();

    return !currentUser?.isStreaming;
  };

  pollTransactions(herotag, handleTransactions, shouldStopPolling);

  return user.herotag as string;
};

export const toggleBlockchainMonitoring = async (
  herotag: string,
  isStreaming: boolean
): Promise<UserMongooseDocument | void> => {
  const user: UserMongooseDocument = await User.findOneAndUpdate(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        isStreaming,
        streamingStartDate: isStreaming ? new Date() : null,
      },
    },
    { new: true }
  ).lean();

  if (!user) return;

  if (isStreaming && user.integrations)
    await launchBlockchainMonitoring(user.herotag as string, user);

  return user;
};

export const resumeBlockchainMonitoring = async (): Promise<string[]> => {
  const usersToPoll = await User.find({ isStreaming: true }).lean();

  const launchedUsers = await Promise.all(
    usersToPoll.map((user) =>
      launchBlockchainMonitoring(user.herotag as string, user)
    )
  );

  return launchedUsers;
};
