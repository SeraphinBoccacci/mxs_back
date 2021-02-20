import { getLastTransactions } from "../../elrond";
import { ElrondTransaction } from "../../interfaces";
import User, {
  UserAccountStatus,
  UserMongooseDocument,
  UserType,
} from "../../models/User";
import logger from "../../services/logger";
import {
  generateJwt,
  getHashedPassword,
  verifyPassword,
} from "../../utils/auth";
import { generateNewVerificationReference } from "../../utils/nanoid";
import poll from "../../utils/poll";
import {
  getErdAddressFromHerotag,
  normalizeHerotag,
} from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";

// eslint-disable-next-line no-unused-vars
// const VERIFY_TRANSACTION_TARGET = "";

interface UserAccountCreationData {
  herotag?: string;
  password?: string;
  confirm?: string;
}

interface UserAuthenticationData {
  herotag?: string;
  password?: string;
}

export const validateAccountCreationData = async (
  data?: UserAccountCreationData
): Promise<void> => {
  if (!data || !data.herotag || !data.password || !data.confirm)
    throw new Error("MISSING_DATA_FOR_ACCOUNT_CREATION");

  if (data.password !== data.confirm)
    throw new Error("PASSWORD_AND_CONFIRM_NOT_MATCHING");

  const address = await getErdAddressFromHerotag(
    normalizeHerotag(data.herotag as string)
  );

  if (!address) {
    throw new Error("COULD_NOT_FIND_HETOTAG_ON_DNS");
  }

  if (
    await User.exists({
      herotag: normalizeHerotag(data.herotag as string),
    })
  )
    throw new Error("ALREADY_REGISTERED_USER");
};

export const createUserAccount = async (
  data: UserAccountCreationData
): Promise<{
  hasBeenSuccessfullyCreated: boolean;
  herotag: string | undefined;
}> => {
  await validateAccountCreationData(data);

  const verificationReference = await generateNewVerificationReference();

  const hashedPassword = await getHashedPassword(data.password as string);

  const user = await User.create({
    herotag: normalizeHerotag(data.herotag as string),
    password: hashedPassword,
    verificationReference,
    verificationStartDate: new Date().toISOString(),
    status: UserAccountStatus.PENDING_VERIFICATION,
  });

  return { hasBeenSuccessfullyCreated: true, herotag: user.herotag };
};

export const validateAuthenticationData = (
  data?: UserAccountCreationData
): void => {
  if (!data || !data.herotag || !data.password)
    throw new Error("FORM_MISSING_DATA_FOR_AUTHENTICATION");
};

export const authenticateUser = async (
  data: UserAuthenticationData
): Promise<{
  user: UserMongooseDocument;
  token: string;
  expiresIn: number;
}> => {
  await validateAuthenticationData(data);

  const user: UserMongooseDocument = await User.findOne({
    herotag: normalizeHerotag(data?.herotag || ""),
  }).lean();

  if (!user) throw new Error("INVALID_FORM_NO_REGISTERED_HEROTAG");

  await verifyPassword(data.password as string, user.password as string);

  if (user.status === UserAccountStatus.PENDING_VERIFICATION)
    throw new Error("ACCOUNT_WITH_VERIFICATION_PENDING");

  const token = generateJwt(user.herotag as string);

  return { user, token: token, expiresIn: 60 * 60 * 4 };
};

export const isProfileVerified = async (herotag: string): Promise<boolean> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ status: true })
    .lean();

  const isStatusVerified = user?.status === UserAccountStatus.VERIFIED;

  return isStatusVerified;
};

export const getVerificationReference = async (
  herotag: string
): Promise<string | null> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ verificationReference: true })
    .lean();

  return user?.verificationReference || null;
};

export const verifyIfTransactionHappened = async (
  user: UserType
): Promise<void> => {
  try {
    if (!user.herotag) return;

    const erdAddress = await getErdAddressFromHerotag(user.herotag);

    const transactions: ElrondTransaction[] = await getLastTransactions(
      erdAddress
    );

    const hasReferenceInTransactions = transactions.some(
      (transaction) =>
        decodeDataFromTx(transaction) === user.verificationReference
      // && transaction.receiver === VERIFY_TRANSACTION_TARGET TO-DO add this condition
    );

    if (hasReferenceInTransactions) {
      await User.updateOne(
        { _id: user._id },
        { $set: { status: UserAccountStatus.VERIFIED } }
      );
    }
  } catch (error) {
    logger.error("An error occured while verifyIfTransactionHappened", {
      error,
      user,
    });
  }
};

export const pollTransactionsToVerifyAccountStatuses = async (): Promise<void> => {
  const verifyStatuses = async () => {
    const users: UserType[] = await User.find({
      status: UserAccountStatus.PENDING_VERIFICATION,
    }).lean();

    await Promise.all(users.map(verifyIfTransactionHappened));
  };

  await poll(verifyStatuses, 10000, () => false);
};
