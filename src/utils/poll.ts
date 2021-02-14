import { getUpdatedBalance } from "../elrond";
import { getErdAddressFromHerotag } from "./maiar";

type ShouldStopPollingFn = (() => boolean) | (() => Promise<boolean>);

export const pollBalance = async (
  herotag: string,
  balanceHandler: (erdAddress: string, newBalance: string) => Promise<void>,
  shouldStopPolling: ShouldStopPollingFn
) => {
  const fetchBalanceAndHandle = async () => {
    console.log("polling for ", herotag);
    const erdAddress = await getErdAddressFromHerotag(herotag);

    const newBalance: string = await getUpdatedBalance(erdAddress);

    await balanceHandler(erdAddress, newBalance);
  };

  poll(fetchBalanceAndHandle, 1000, shouldStopPolling);
};

const poll = async (
  fn: () => any,
  delay: number,
  shouldStopPolling: ShouldStopPollingFn
): Promise<void> => {
  delay = Math.max(0, delay);
  do {
    await fn();
    // if (await shouldStopPolling()) { double check may be usefull later
    //   break;
    // }
    await new Promise((resolve) => setTimeout(resolve, delay));
  } while (!(await shouldStopPolling()));
};
export default poll;
