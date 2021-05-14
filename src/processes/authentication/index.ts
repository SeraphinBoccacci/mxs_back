import User, { UserMongooseDocument } from "../../models/User";
import {
  getAlreadyListennedTransactions,
  getLastRestart,
  setAlreadyListennedTransactions,
} from "../../redis";
import { getLastTransactions } from "../../services/elrond";
import { jwtSign } from "../../services/jwt";
import logger from "../../services/logger";
import { ElrondTransaction } from "../../types/elrond";
import { UserAccountStatus } from "../../types/user";
import { getHashedPassword, verifyPassword } from "../../utils/auth";
import { generateNewVerificationReference } from "../../utils/nanoid";
import poll from "../../utils/poll";
import {
  getErdAddressFromHerotag,
  normalizeHerotag,
} from "../../utils/transactions";
import { decodeDataFromTx } from "../../utils/transactions";
import { balanceHandler } from "../blockchain-monitoring";

const STREAM_PARTICLES_ERD_ADDRESS =
  "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm";

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

  const erdAddress = await getErdAddressFromHerotag(
    normalizeHerotag(data.herotag as string)
  );

  if (!erdAddress) {
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

  const erdAddress = await getErdAddressFromHerotag(
    normalizeHerotag(data.herotag as string)
  );

  const verificationReference = await generateNewVerificationReference();

  const hashedPassword = await getHashedPassword(data.password as string);

  const user = await User.create({
    herotag: normalizeHerotag(data.herotag as string),
    erdAddress,
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

const transactionsHandler = (lastRestartTimestamp: number) => async () => {
  const transactions = await getLastTransactions(STREAM_PARTICLES_ERD_ADDRESS);

  const last30ListennedTransactions = await getAlreadyListennedTransactions(
    STREAM_PARTICLES_ERD_ADDRESS
  );

  const newTransactions = transactions.filter(
    ({ receiver, timestamp, hash, status }: ElrondTransaction) => {
      return (
        receiver === STREAM_PARTICLES_ERD_ADDRESS &&
        timestamp > lastRestartTimestamp &&
        !last30ListennedTransactions.includes(hash) &&
        status === "success"
      );
    }
  );

  if (!newTransactions.length) return false;

  await setAlreadyListennedTransactions(
    STREAM_PARTICLES_ERD_ADDRESS,
    newTransactions.map(({ hash }) => hash)
  );

  await Promise.all(
    newTransactions.map(async (transaction) => {
      const user = await User.findOne({
        erdAddress: transaction.sender,
      })
        .select({
          herotag: true,
          status: true,
          verificationReference: true,
          passwordEditionVerificationReference: true,
        })
        .lean();

      if (
        user?.status === UserAccountStatus.PENDING_VERIFICATION &&
        decodeDataFromTx(transaction) === user.verificationReference
      ) {
        logger.info(`${user.herotag}'s account creation has been validated`);

        await User.updateOne(
          { _id: user._id },
          { $set: { status: UserAccountStatus.VERIFIED } }
        );
      }

      if (
        user?.status === UserAccountStatus.PENDING_EDIT_PASSWORD_VERIFICATION &&
        decodeDataFromTx(transaction) ===
          user.passwordEditionVerificationReference
      ) {
        logger.info(`${user.herotag}'s password edition has been validated`);

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
    })
  );

  return false;
};

export const validateAuthenticationDataFromTransaction = async (): Promise<void> => {
  const lastRestartTimestamp = await getLastRestart();

  const handleTransactionsOnStreamParticleHerotag = transactionsHandler(
    lastRestartTimestamp
  );
  const handleBalance = balanceHandler(
    STREAM_PARTICLES_ERD_ADDRESS,
    handleTransactionsOnStreamParticleHerotag
  );

  logger.info(
    "Start polling streamParticles balance to verify accounts statuses"
  );
  poll(handleBalance, 15000, () => false);
};
