import {
  ElrondTransaction,
  isMockedElrondTransaction,
  MockedElrondTransaction,
} from "../../types/elrond";
import { EventData } from "../../types/ifttt";
import { UserType } from "../../types/user";
import { temporizeFn } from "../../utils/temporize";
import {
  computeSentAmount,
  getHerotagFromErdAddress,
} from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";
import * as donationDataProcesses from "../donationData/index";
import { getUserData } from "../user";
import { triggerIftttEvent } from "./ifttt";
import { triggerOverlaysEvent } from "./overlays";

export const reactToNewTransaction = async (
  transaction: ElrondTransaction | MockedElrondTransaction,
  user: UserType
): Promise<void> => {
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

  await donationDataProcesses.incrementDonationGoalSentAmount(
    user._id,
    Number(eventData.amount)
  );

  if (user?.integrations?.ifttt && user?.integrations?.ifttt.isActive)
    await triggerIftttEvent(eventData, user?.integrations?.ifttt);

  await triggerOverlaysEvent(eventData, user);
};

export const temporisedReactToNewTransaction = temporizeFn(
  reactToNewTransaction
);

const resolveDelay = (user: UserType) => {
  const delays = [
    10,
    ...(user.integrations?.overlays?.flatMap(({ alerts }) =>
      alerts?.variations?.flatMap(({ duration }) => duration || 0)
    ) || []),
  ];

  const maxDelaySecond = Math.max(...delays);
  const delayMs = maxDelaySecond * 1000;

  return delayMs + 5000;
};

export const reactToManyTransactions = async (
  transactions: ElrondTransaction[],
  user: UserType
): Promise<void> => {
  const delay = resolveDelay(user);

  for (const transaction of transactions) {
    await temporisedReactToNewTransaction(
      user.herotag as string,
      delay,
      transaction,
      user
    );
  }
};

const defaultMockedEventData: EventData = {
  herotag: "test_herotag",
  amount: "0.001",
  data: "test message",
};

export const triggerFakeEvent = async (
  herotag: string,
  data: EventData
): Promise<void> => {
  const user = await getUserData(herotag);

  const mockedTransaction: MockedElrondTransaction = {
    isMockedTransaction: true,
    ...defaultMockedEventData,
    ...data,
  };

  if (user) {
    const delay = resolveDelay(user);

    temporisedReactToNewTransaction(
      user.herotag as string,
      delay,
      mockedTransaction,
      user
    );
  }
};
