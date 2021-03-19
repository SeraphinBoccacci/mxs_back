import { getLastTransactions } from "../../elrond";
import User, { UserMongooseDocument, UserType } from "../../models/User";
import { getLastBalanceSnapShot, setNewBalance } from "../../redis";
import { ElrondTransaction, LastSnapshotBalance } from "../../types";
import { pollBalance } from "../../utils/poll";
import { normalizeHerotag } from "../../utils/transactions";
import { reactToNewTransaction } from "../blockchain-interaction";

export const findNewIncomingTransactions = (
  transactions: ElrondTransaction[],
  erdAddress: string,
  user: UserType,
  lastSnapshotBalance: LastSnapshotBalance | null
): ElrondTransaction[] => {
  if (!lastSnapshotBalance)
    return transactions.filter(
      ({ receiver, timestamp, status }: ElrondTransaction) =>
        receiver === erdAddress &&
        user?.streamingStartDate &&
        timestamp >
          Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001) &&
        status === "success"
    );

  return transactions.filter(
    ({ receiver, timestamp, status }: ElrondTransaction) =>
      receiver === erdAddress &&
      (!lastSnapshotBalance || timestamp > lastSnapshotBalance.timestamp) &&
      user?.streamingStartDate &&
      timestamp >
        Math.ceil(new Date(user?.streamingStartDate).getTime() * 0.001) &&
      status === "success"
  );
};

export const balanceHandler = (user: UserType) => async (
  erdAddress: string,
  newBalance: string
): Promise<void> => {
  const lastSnapshotBalance: LastSnapshotBalance | null = await getLastBalanceSnapShot(
    erdAddress
  );

  if (lastSnapshotBalance?.amount !== newBalance) {
    const transactions: ElrondTransaction[] = await getLastTransactions(
      erdAddress
    );

    const newReceivedTransactions = findNewIncomingTransactions(
      transactions,
      erdAddress,
      user,
      lastSnapshotBalance
    );

    await Promise.all(
      newReceivedTransactions.map(async (transaction: ElrondTransaction) =>
        reactToNewTransaction(transaction, user)
      )
    );

    await setNewBalance(erdAddress, newBalance);
  }
};

export const launchBlockchainMonitoring = async (
  herotag: string,
  user: UserType
): Promise<string> => {
  const handleBalance = balanceHandler(user);

  const shouldStopPolling = async () => {
    const currentUser = await User.findById(user._id)
      .select({
        isStreaming: true,
      })
      .lean();

    return !currentUser?.isStreaming;
  };

  pollBalance(herotag, handleBalance, shouldStopPolling);

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
