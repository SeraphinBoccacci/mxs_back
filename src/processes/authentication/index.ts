import User, { UserMongooseDocument } from "../../models/User";
import { getLastTransactions } from "../../services/elrond";
import { jwtSign } from "../../services/jwt";
import logger from "../../services/logger";
import { ElrondTransaction } from "../../types/elrond";
import { UserAccountStatus, UserType } from "../../types/user";
import { getHashedPassword, verifyPassword } from "../../utils/auth";
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

  const user: UserMongooseDocument | null = await User.findOne({
    herotag: normalizeHerotag(data?.herotag || ""),
  }).lean();

  if (!user) throw new Error("INVALID_FORM_NO_REGISTERED_HEROTAG");

  await verifyPassword(data.password as string, user.password as string);

  if (user.status !== UserAccountStatus.VERIFIED)
    throw new Error("ACCOUNT_WITH_VERIFICATION_PENDING");

  const token = jwtSign(user.herotag as string);

  return { user, token: token, expiresIn: 60 * 60 * 4 };
};

export const isProfileVerified = async (
  herotag: string
): Promise<{ isStatusVerified: boolean }> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ status: true })
    .lean();

  const isStatusVerified = user?.status === UserAccountStatus.VERIFIED;

  return { isStatusVerified };
};

export const getVerificationReference = async (
  herotag: string
): Promise<{
  verificationReference: string | null;
  accountStatus: UserAccountStatus | null;
}> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({
      verificationReference: true,
      passwordEditionVerificationReference: true,
      status: true,
    })
    .lean();

  if (user?.status === UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION)
    return {
      verificationReference: user?.passwordEditionVerificationReference || null,
      accountStatus: user?.status || null,
    };

  return {
    verificationReference: user?.verificationReference || null,
    accountStatus: user?.status || null,
  };
};

export const activateAccountIfTransactionHappened = async (
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
        decodeDataFromTx(transaction) === user.verificationReference &&
        transaction.receiver ===
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
    );

    if (hasReferenceInTransactions) {
      await User.updateOne(
        { _id: user._id },
        { $set: { status: UserAccountStatus.VERIFIED } }
      );
    }
  } catch (error) {
    logger.error({
      ...error,
      user,
      error: "An error occured while activateAccountIfTransactionHappened ",
    });
  }
};

export const savePasswordChangeIfTransactionHappened = async (
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
        decodeDataFromTx(transaction) ===
          user.passwordEditionVerificationReference &&
        transaction.receiver ===
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
    );

    if (hasReferenceInTransactions) {
      await User.updateOne({ _id: user._id }, [
        {
          $set: {
            status: UserAccountStatus.VERIFIED,
            password: "$pendingPassword",
          },
        },
        {
          $unset: [
            "pendingPassword",
            "passwordEditionVerificationReference",
            "passwordEditionVerificationStartDate",
          ],
        },
      ]);
    }
  } catch (error) {
    logger.error({
      ...error,
      user,
      error: `An error occured while savePasswordChangeIfTransactionHappened ${error}`,
    });
  }
};

export const pollTransactionsToVerifyAccountStatuses = async (): Promise<void> => {
  const verifyStatuses = async () => {
    const pendingVerificationUsers: UserType[] = await User.find({
      status: UserAccountStatus.PENDING_VERIFICATION,
    }).lean();

    const pendingEditPasswordVerificationUsers: UserType[] = await User.find({
      status: UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION,
    }).lean();

    for (const user of pendingVerificationUsers) {
      await setTimeout(async () => {
        await activateAccountIfTransactionHappened(user);
      }, 500);
    }

    for (const user of pendingEditPasswordVerificationUsers) {
      await setTimeout(async () => {
        await savePasswordChangeIfTransactionHappened(user);
      }, 500);
    }
  };

  await poll(verifyStatuses, 20000, () => false);
};

export const isHerotagValid = async (
  herotag: string
): Promise<{ herotag: string }> => {
  const doesAccountExist = await User.exists({
    herotag: normalizeHerotag(herotag),
  });

  if (!doesAccountExist) throw new Error("NO_REGISTERED_HEROTAG");

  return { herotag };
};

export const validatePasswordEditionData = async (
  data?: UserAccountCreationData
): Promise<void> => {
  if (!data || !data.herotag || !data.password || !data.confirm)
    throw new Error("MISSING_DATA_FOR_ACCOUNT_CREATION");

  if (data.password !== data.confirm)
    throw new Error("PASSWORD_AND_CONFIRM_NOT_MATCHING");

  const doesAccountExist = await User.exists({
    herotag: normalizeHerotag(data.herotag as string),
  });

  if (!doesAccountExist) throw new Error("NO_REGISTERED_HEROTAG");
};

export const editPassword = async (
  data: UserAccountCreationData
): Promise<void> => {
  await validatePasswordEditionData(data);

  const passwordEditionVerificationReference = await generateNewVerificationReference();

  const hashedPassword = await getHashedPassword(data.password as string);

  await User.updateOne(
    { herotag: normalizeHerotag(data.herotag as string) },
    {
      pendingPassword: hashedPassword,
      passwordEditionVerificationReference,
      passwordEditionVerificationStartDate: new Date().toISOString(),
      status: UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION,
    }
  );
};
