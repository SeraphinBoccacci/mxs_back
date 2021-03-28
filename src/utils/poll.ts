import { getLastTransactions, getUpdatedBalance } from "../services/elrond";
import { ElrondTransaction } from "../types";
import { getErdAddressFromHerotag } from "./transactions";

type ShouldStopPollingFn = (() => boolean) | (() => Promise<boolean>);

interface pollBalanceFn {
  (
    herotag: string,
    balanceHandler: (erdAddress: string, newBalance: string) => Promise<void>,
    shouldStopPolling: ShouldStopPollingFn
  ): Promise<void>;
}

export const pollBalance: pollBalanceFn = async (
  herotag,
  balanceHandler,
  shouldStopPolling
) => {
  const erdAddress = await getErdAddressFromHerotag(herotag);

  const fetchBalanceAndHandle = async () => {
    const newBalance = await getUpdatedBalance(erdAddress);

    if (newBalance) await balanceHandler(erdAddress, newBalance);
  };

  poll(fetchBalanceAndHandle, 1000, shouldStopPolling);
};

interface pollTransactionsFn {
  (
    herotag: string,
    handleTransactions: (
      erdAddress: string,
      transactions: ElrondTransaction[]
    ) => Promise<void>,
    shouldStopPolling: ShouldStopPollingFn
  ): Promise<void>;
}

export const pollTransactions: pollTransactionsFn = async (
  herotag,
  handleTransactions,
  shouldStopPolling
) => {
  const erdAddress = await getErdAddressFromHerotag(herotag);

  const fetchBalanceAndHandle = async () => {
    const transactions = await getLastTransactions(erdAddress);

    if (transactions) await handleTransactions(erdAddress, transactions);
  };

  poll(fetchBalanceAndHandle, 5000, shouldStopPolling);
};

const poll = async (
  fn: (() => void) | null,
  delay: number,
  shouldStopPolling: ShouldStopPollingFn
): Promise<void> => {
  delay = Math.max(1000, delay);
  do {
    if (fn) await fn();

    await new Promise((resolve) => setTimeout(resolve, delay));
  } while (!(await shouldStopPolling()));
};
export default poll;
