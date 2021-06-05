import User, { UserMongooseDocument } from "../models/User";
import { IftttConfig } from "../types/ifttt";
import { normalizeHerotag } from "../utils/transactions";

export const toggleIftttParticle = async (
  herotag: string,
  activate: boolean
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    { $set: { "integrations.ifttt.isActive": activate } }
  );
};

export const updateIftttParticleData = async (
  herotag: string,
  data: IftttConfig
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        ...(data.triggerKey && {
          "integrations.ifttt.triggerKey": data.triggerKey,
        }),
        ...(data.eventName && {
          "integrations.ifttt.eventName": data.eventName,
        }),
      },
    }
  );
};

export const updateMinimumRequiredAmount = async (
  herotag: string,
  minimumRequiredAmount: number
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        "integrations.minimumRequiredAmount": minimumRequiredAmount,
      },
    }
  );
};

export const updateTinyAmountsWording = async (
  herotag: string,
  ceilAmount: number,
  wording: string
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        "integrations.tinyAmountWording": {
          ceilAmount: Number(ceilAmount),
          wording,
        },
      },
    }
  );
};

export const updateViewerOnboardingData = async (
  herotag: string,
  referralLink: string,
  herotagQrCodePath?: string
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        referralLink: referralLink,
        herotagQrCodePath: herotagQrCodePath,
      },
    }
  );
};

export const getViewerOnboardingData = async (
  herotag: string
): Promise<UserMongooseDocument | null> => {
  return User.findOne({ herotag: normalizeHerotag(herotag) }).select({
    referralLink: true,
    herotagQrCodePath: true,
  });
};

export const getUserData = async (
  herotag: string
): Promise<UserMongooseDocument | undefined> => {
  const user: UserMongooseDocument = await User.findOne({
    herotag: normalizeHerotag(herotag),
  }).lean();

  return user;
};
