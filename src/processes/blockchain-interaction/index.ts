import logger from "../../services/logger";
import {
  ElrondTransaction,
  isMockedElrondTransaction,
  MockedElrondTransaction,
} from "../../types/elrond";
import { EventData } from "../../types/ifttt";
import { UserType } from "../../types/user";
import { temporizeFn } from "../../utils/temporize";
import {
  computeTransactionAmount,
  getHerotagFromErdAddress,
  normalizeHerotag,
} from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";
import * as donationDataProcesses from "../donationData/index";
import { getUserData } from "../user";
import { triggerIftttEvent } from "./ifttt";
import { triggerOverlaysEvent } from "./overlays";

const isTransactionAllowed = (user: UserType, data: EventData) => {
  const loweredData = data.data.toLowerCase();

  const isDataOk = (user.moderation?.bannedWords || []).every(
    (word) => !loweredData.includes(word.toLowerCase())
  );

  if (!isDataOk)
    logger.warn("Transaction not approved - data", {
      eventData: data,
      userId: user._id,
    });

  const isAmountOk =
    !user.integrations?.minimumRequiredAmount ||
    Number(data.amount) >= user.integrations.minimumRequiredAmount;

  if (!isAmountOk)
    logger.warn("Transaction not approved - amount", {
      eventData: data,
      userId: user._id,
    });

  const isHerotagOk = (user?.moderation?.bannedAddresses || []).every(
    (address) => normalizeHerotag(address) !== data.herotag
  );

  if (!isHerotagOk)
    logger.warn("Transaction not approved - herotag banned", {
      eventData: data,
      userId: user._id,
    });

  return isDataOk && isAmountOk && isHerotagOk;
};

const wordingAmount = (amount: string | number, user: UserType): string => {
  if (
    user.integrations?.tinyAmountWording?.ceilAmount &&
    Number(amount) < user.integrations?.tinyAmountWording?.ceilAmount
  )
    return user.integrations?.tinyAmountWording.wording;

  return `${amount} eGLD`;
};

export const reactToNewTransaction = async (
  transaction: ElrondTransaction | MockedElrondTransaction,
  user: UserType
): Promise<void> => {
  const getEventData = async (): Promise<EventData> => {
    if (isMockedElrondTransaction(transaction)) {
      return {
        amount: Number(transaction.amount),
        wordingAmount: wordingAmount(transaction.amount, user),
        herotag: transaction.herotag,
        data: transaction.data,
      };
    } else {
      const herotag = await getHerotagFromErdAddress(transaction.sender);

      const amount = computeTransactionAmount(transaction.value);

      return {
        amount,
        wordingAmount: wordingAmount(amount, user),
        herotag,
        data: decodeDataFromTx(transaction),
      };
    }
  };

  const eventData = await getEventData();

  if (!isTransactionAllowed(user, eventData)) return;

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
    ...(user.integrations?.overlays?.flatMap(
      ({ donationBar }) => donationBar?.donationReaction.duration || 0
    ) || []),
  ];

  const maxDelaySecond = Math.max(...delays);

  return (maxDelaySecond + 5) * 1000;
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

const defaultMockedEventData: MockedElrondTransaction = {
  herotag: "test_herotag",
  amount: "0.001",
  data: "test message",
  isMockedTransaction: true,
};

export const triggerFakeEvent = async (
  herotag: string,
  data: MockedElrondTransaction
): Promise<void> => {
  const user = await getUserData(herotag);

  const mockedTransaction: MockedElrondTransaction = {
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
