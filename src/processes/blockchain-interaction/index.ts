import { UserType } from "../../models/User";
import { ElrondTransaction, EventData } from "../../types";
import {
  computeSentAmount,
  getHerotagFromErdAddress,
} from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";
import { triggerIftttEvent } from "./ifttt";
import { triggerStreamElementsEvent } from "./streamElements";

export const reactToNewTransaction = async (
  transaction: ElrondTransaction,
  user: UserType
): Promise<void> => {
  const herotag = await getHerotagFromErdAddress(transaction.sender);

  const eventData: EventData = {
    amount: computeSentAmount(transaction.value),
    herotag,
    data: decodeDataFromTx(transaction),
  };

  if (user?.integrations?.ifttt && user?.integrations?.ifttt.isActive)
    await triggerIftttEvent(eventData, user?.integrations?.ifttt);

  await triggerStreamElementsEvent(eventData, user);
};
