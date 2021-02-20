import { getLastTransactions } from "../elrond";
import {
  ElrondTransaction,
  EventData,
  LastSnapshotBalance,
} from "../interfaces";
import User, { UserType } from "../models/User";
import { getLastBalanceSnapShot, setNewBalance } from "../redis";
import { publisher } from "../services/redis";
import { triggerIftttEvent } from "../services/ifttt";
import {
  computeSentAmount,
  getHerotagFromErdAddress,
  normalizeHerotag,
} from "../utils/maiar";
import { pollBalance } from "../utils/poll";
import { decodeDataFromTx } from "../utils/transactions";
import { triggerStreamElementsEvent } from "../services/streamElements";

const reactToNewTransaction = async (
  transaction: ElrondTransaction,
  user: UserType
) => {
  const herotag = await getHerotagFromErdAddress(transaction.sender);

  const eventData: EventData = {
    amount: computeSentAmount(transaction.value),
    herotag,
    data: decodeDataFromTx(transaction),
  };

  console.log(user);

  if (user?.integrations?.ifttt && user?.integrations?.ifttt.isActive)
    await triggerIftttEvent(eventData, user?.integrations?.ifttt);

  await triggerStreamElementsEvent(eventData, user);
};

export const toggleTransactionsDetection = async (
  herotag: string,
  isStreaming: boolean
) => {
  const user = await User.findOneAndUpdate(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        isStreaming,
        streamingStartDate: isStreaming ? new Date() : null,
      },
    },
    { new: true }
  )
    .select({ _id: true, herotag: true, integrations: true })
    .lean();

  if (!user) return;

  if (isStreaming && user.integrations)
    await activateTransactionsDetection(
      user.herotag as string,
      user as UserType
    );

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
      console.log("balance updated !");
      const transactions: ElrondTransaction[] = await getLastTransactions(
        erdAddress
      );

      const newReceivedTransactions = transactions.filter(
        ({ receiver, timestamp, status }: ElrondTransaction) =>
          receiver === erdAddress &&
          (!lastSnapshotBalance || timestamp > lastSnapshotBalance.timestamp) &&
          user?.streamingStartDate &&
          timestamp >
            Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001) &&
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
    const currentUser = await User.findById(user._id)
      .select({
        isStreaming: true,
      })
      .lean();

    return !currentUser?.isStreaming;
  };

  pollBalance(herotag, balanceHandler, shouldStopPolling);
};

export const recoverPollingProcesses = async () => {
  const usersToPoll = await User.find({ isStreaming: true }).lean();

  await Promise.all(
    usersToPoll.map((user) =>
      activateTransactionsDetection(user.herotag as string, user)
    )
  );
};
