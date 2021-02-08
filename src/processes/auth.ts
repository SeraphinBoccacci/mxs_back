import { ElrondTransaction, EventData } from "../interfaces";
import User, { UserAccountStatus, UserMongooseDocument } from "../models/User";

import { dns } from "../services/elrond";
import { generateJwt, getHashedPassword, verifyPassword } from "../utils/auth";
import { v4 as uuidv4 } from "uuid";
import poll from "../utils/poll";
import { getErdAddressFromHerotag } from "../utils/maiar";
import { getLastTransactions } from "../elrond";
import { decodeDataFromTx } from "../utils/transactions";

const VERIFY_TRANSACTION_TARGET = "";

interface UserAccountCreationData {
  herotag?: string;
  password?: string;
  confirm?: string;
}

interface UserAuthenticationData {
  herotag?: string;
  password?: string;
}

const validateAccountCreationData = async (data: UserAccountCreationData) => {
  if (!data || !data.herotag || !data.password || !data.confirm)
    throw new Error("MISSING_DATA_FOR_ACCOUNT_CREATION");

  if (data.password !== data.confirm)
    throw new Error("PASSWORD_AND_CONFIRM_NOT_MATCHING");

  const hasAlreadyHerotagRegistered = await User.findOne({
    herotag: data.herotag,
  }).lean();

  if (!!hasAlreadyHerotagRegistered) throw new Error("ALREADY_REGISTERED_USER");
};

export const createUserAccount = async (data: UserAccountCreationData) => {
  await validateAccountCreationData(data);

  const verificationReference = uuidv4();

  const hashedPassword = await getHashedPassword(data.password as string);

  const user = await User.create({
    herotag: data.herotag?.endsWith(".elrond")
      ? data.herotag
      : `${data.herotag}.elrond`,
    password: hashedPassword,
    verificationReference,
    verificationStartDate: new Date(),
    status: UserAccountStatus.PENDING_VERIFICATION,
  });

  return { hasBeenSuccessfullyCreated: true, herotag: user.herotag };
};

const validateAuthenticationData = async (data: UserAccountCreationData) => {
  if (!data || !data.herotag || !data.password)
    throw new Error("FORM_MISSING_DATA_FOR_AUTHENTICATION");
};

export const authenticateUser = async (data: UserAuthenticationData) => {
  await validateAuthenticationData(data);

  const user = await User.findOne({
    herotag: data.herotag,
  }).lean();

  if (!user) throw new Error("INVALID_FORM_NO_REGISTERED_HEROTAG");

  await verifyPassword(data.password as string, user.password as string);

  if (user.status === UserAccountStatus.PENDING_VERIFICATION)
    throw new Error("ACCOUNT_WITH_VERIFICATION_PENDING");

  const token = generateJwt(user.herotag as string);

  return { user, token: token, expiresIn: 60 * 60 * 4 };
};

export const isProfileVerified = async (herotag: string) => {
  const user = await User.findOne({ herotag })
    .select({ status: true })
    .lean();

  const isStatusVerified = user?.status === UserAccountStatus.VERIFIED;

  return isStatusVerified;
};

export const getVerificationReference = async (herotag: string) => {
  const user = await User.findOne({ herotag })
    .select({ verificationReference: true })
    .lean();

  return user?.verificationReference;
};

const verifyIfTransactionHappened = async (user: UserMongooseDocument) => {
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
  } catch (err) {
    console.log(err, user);
  }
};

export const pollTransactionsToVerifyAccountStatuses = async () => {
  const verifyStatuses = async () => {
    const users: UserMongooseDocument[] = await User.find({
      status: UserAccountStatus.PENDING_VERIFICATION,
    }).lean();

    await Promise.all(users.map(verifyIfTransactionHappened));
  };

  await poll(verifyStatuses, 5000, () => false);
};
