import { getUpdatedBalance } from "../services/elrond";
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
