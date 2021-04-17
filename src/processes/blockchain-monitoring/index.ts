/** @format */

import mongoose from "mongoose";

import User, { UserMongooseDocument, UserType } from "../../models/User";
import {
  getAlreadyListennedTransactions,
  getLastBalanceSnapShot,
  getLastRestart,
  setAlreadyListennedTransactions,
  setNewBalance,
} from "../../redis";
import { getLastTransactions, getUpdatedBalance } from "../../services/elrond";
import { ElrondTransaction, LastSnapshotBalance } from "../../types";
import poll from "../../utils/poll";
import { computeSentAmount, getErdAddressFromHerotag, normalizeHerotag } from "../../utils/transactions";
import { reactToManyTransactions } from "../blockchain-interaction";

export const findNewIncomingTransactions = (
  transactions: ElrondTransaction[],
  erdAddress: string,
  user: UserType,
  last30ListennedTransactions: string[],
  lastRestartTimestamp: number,
): ElrondTransaction[] => {
  const isTimestampOk = (timestamp: number) =>
    timestamp > lastRestartTimestamp &&
    user?.streamingStartDate &&
    timestamp > Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001);

  const isAmountValid = (value: string) =>
    !user.integrations?.minimumRequiredAmount || Number(computeSentAmount(value)) >= user.integrations.minimumRequiredAmount;

  return transactions.filter(({ receiver, timestamp, hash, status, value }: ElrondTransaction) => {
    return (
      isAmountValid(value) &&
      receiver === erdAddress &&
      isTimestampOk(timestamp) &&
      !last30ListennedTransactions.includes(hash) &&
      status === "success"
    );
  });
};

export interface HandleTransactionFn {
  (): Promise<boolean>;
}

export const transactionsHandler = (userId: mongoose.Types.ObjectId, lastRestartTimestamp: number): HandleTransactionFn => {
  return async (): Promise<boolean> => {
    const user = await User.findById(userId).lean();

    if (!user || !user.herotag) return true;

    const erdAddress = await getErdAddressFromHerotag(user.herotag);
    const transactions = await getLastTransactions(erdAddress);

    const last30ListennedTransactions = await getAlreadyListennedTransactions(erdAddress);

    const newTransactions = findNewIncomingTransactions(transactions, erdAddress, user, last30ListennedTransactions, lastRestartTimestamp);

    if (!newTransactions.length) return false;

    await setAlreadyListennedTransactions(
      erdAddress,
      newTransactions.map(({ hash }) => hash),
    );

    reactToManyTransactions(newTransactions, user);

    return false;
  };
};

interface HandleBalanceFn {
  (): Promise<void>;
}

export const balanceHandler = (erdAddress: string, handleTransactions: HandleTransactionFn): HandleBalanceFn => async () => {
  const newBalance = await getUpdatedBalance(erdAddress);

  if (!newBalance) return;

  const lastSnapshotBalance: LastSnapshotBalance | null = await getLastBalanceSnapShot(erdAddress);

  if (!lastSnapshotBalance?.amount) {
    await setNewBalance(erdAddress, newBalance);

    return;
  }

  if (newBalance !== lastSnapshotBalance?.amount) await setNewBalance(erdAddress, String(newBalance));

  if (newBalance > lastSnapshotBalance?.amount) await poll(null, 10000, handleTransactions, 60000);
};

export const launchBlockchainMonitoring = async (herotag: string, user: UserType): Promise<string> => {
  const lastRestartTimestamp = await getLastRestart();

  const erdAddress = await getErdAddressFromHerotag(herotag);

  const handleTransactions = transactionsHandler(user._id as mongoose.Types.ObjectId, lastRestartTimestamp);

  const handleBalance = balanceHandler(erdAddress, handleTransactions);

  const shouldStopPolling = async () => {
    const currentUser = await User.findById(user._id)
      .select({
        isStreaming: true,
      })
      .lean();

    return !currentUser?.isStreaming;
  };

  poll(handleBalance, 2000, shouldStopPolling);

  return user.herotag as string;
};

export const toggleBlockchainMonitoring = async (herotag: string, isStreaming: boolean): Promise<UserMongooseDocument | void> => {
  const user: UserMongooseDocument | null = await User.findOneAndUpdate(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        isStreaming,
        streamingStartDate: isStreaming ? new Date() : null,
      },
    },
    { new: true },
  ).lean();

  if (!user) return;

  if (isStreaming && user.integrations) {
    const erdAddress = await getErdAddressFromHerotag(herotag);
    const newBalance = await getUpdatedBalance(erdAddress);

    if (newBalance) {
      await setNewBalance(erdAddress, newBalance);

      await launchBlockchainMonitoring(user.herotag as string, user);
    } else throw new Error("UNABLE_TO_LAUCH_BC_MONITORING");
  }

  return user;
};

export const resumeBlockchainMonitoring = async (): Promise<string[]> => {
  const usersToPoll = await User.find({ isStreaming: true }).lean();

  const launchedUsers = await Promise.all(
    usersToPoll.map(async user => {
      if (!user.herotag) throw new Error("UNABLE_TO_LAUCH_BC_MONITORING");

      const erdAddress = await getErdAddressFromHerotag(user.herotag);

      const newBalance = await getUpdatedBalance(erdAddress);

      if (newBalance) {
        await setNewBalance(erdAddress, newBalance);

        return launchBlockchainMonitoring(user.herotag as string, user);
      } else throw new Error("UNABLE_TO_LAUCH_BC_MONITORING");
    }),
  );

  return launchedUsers;
};
