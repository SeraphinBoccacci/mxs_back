import mongoose from "mongoose";
import { getLastTransactions } from "../elrond";
import {
  ElrondTransaction,
  EventData,
  LastSnapshotBalance,
} from "../interfaces";
import User, {
  IftttIntegrationData,
  UserMongooseDocument,
  UserType,
} from "../models/User";
import { getLastBalanceSnapShot, setNewBalance } from "../redis";
import { triggerIftttEvent } from "../utils/ifttt";
import { getHerotagFromErdAddress } from "../utils/maiar";
import { pollBalance } from "../utils/poll";
import { decodeDataFromTx } from "../utils/transactions";

const reactToNewTransaction = async (
  transaction: ElrondTransaction,
  user: UserType
) => {
  const herotag = await getHerotagFromErdAddress(transaction.sender);

  const eventData: EventData = {
    amount: "0.001",
    sender: transaction.sender,
    herotag,
    data: decodeDataFromTx(transaction),
  };

  if (user?.integrations?.ifttt && user?.integrations?.ifttt.isActive)
    await triggerIftttEvent(eventData, user?.integrations?.ifttt);
};

export const toggleTransactionsDetection = async (
  herotag: string,
  isStreaming: boolean
) => {
  const user = await User.findOneAndUpdate(
    { herotag },
    {
      $set: {
        isStreaming,
        streamingStartDate: isStreaming ? new Date() : null,
      },
    },
    { new: true }
  )
    .select({ _id: true, integrations: true })
    .lean();

  if (!user) return;

  if (isStreaming && user.integrations)
    await activateTransactionsDetection(herotag, user as UserType);

  return user;
};

export const activateTransactionsDetection = async (
  herotag: string,
  user: UserType
) => {
  const balanceHandler = async (erdAddress: string, newBalance: string) => {
    const lastSnapshotBalance: LastSnapshotBalance | null = await getLastBalanceSnapShot(
      erdAddress
    );

    if (lastSnapshotBalance?.amount !== newBalance) {
      const transactions: ElrondTransaction[] = await getLastTransactions(
        erdAddress
      );

      const newReceivedTransactions = transactions.filter(
        ({ receiver, timestamp, status }: ElrondTransaction) =>
          receiver === erdAddress &&
          (!lastSnapshotBalance || timestamp > lastSnapshotBalance.timestamp) &&
          status === "success"
      );

      await Promise.all(
        newReceivedTransactions.map(async (transaction: ElrondTransaction) =>
          reactToNewTransaction(transaction, user as UserType)
        )
      );

      const balance = {
        amount: newBalance,
        timestamp: Math.ceil(Date.now() * 0.001),
      };

      await setNewBalance(erdAddress, balance);
    }
  };

  const shouldStopPolling = async () => {
    const currentUser = await User.findById(user._id).select({
      isStreaming: true,
    });

    return !currentUser?.isStreaming;
  };

  pollBalance(herotag, balanceHandler, shouldStopPolling);
};
