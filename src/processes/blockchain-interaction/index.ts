/** @format */

import { UserType } from "../../models/User";
import { ElrondTransaction, EventData, isMockedElrondTransaction, MockedElrondTransaction } from "../../types";
import { computeSentAmount, getHerotagFromErdAddress } from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";
import { triggerIftttEvent } from "./ifttt";
import { triggerStreamElementsEvent } from "./streamElements";

export const reactToManyTransactions = async (transactions: ElrondTransaction[], user: UserType, delay = 20000): Promise<void> => {
  transactions.reduce(
    (prevPromise, transaction) =>
      prevPromise.then(async () => {
        await reactToNewTransaction(transaction, user);
        await new Promise(resolve => setTimeout(resolve, delay));
      }),
    Promise.resolve(),
  );
};

export const reactToNewTransaction = async (transaction: ElrondTransaction | MockedElrondTransaction, user: UserType): Promise<void> => {
  const getEventData = async (): Promise<EventData> => {
    if (isMockedElrondTransaction(transaction)) {
      return {
        amount: transaction.amount,
        herotag: transaction.herotag,
        data: transaction.data,
      };
    } else {
      const herotag = await getHerotagFromErdAddress(transaction.sender);

      return {
        amount: computeSentAmount(transaction.value),
        herotag,
        data: decodeDataFromTx(transaction),
      };
    }
  };

  const eventData = await getEventData();

  if (user?.integrations?.ifttt && user?.integrations?.ifttt.isActive) await triggerIftttEvent(eventData, user?.integrations?.ifttt);

  if (user?.integrations?.streamElements && user?.integrations?.streamElements.isActive) await triggerStreamElementsEvent(eventData, user);
};
