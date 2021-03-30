import User, { UserMongooseDocument } from "../models/User";
import { IftttConfig } from "../types";
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

export const toggleStreamElementsParticle = async (
  herotag: string,
  activate: boolean
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    { $set: { "integrations.streamElements.isActive": activate } }
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

export const getUserData = async (
  herotag: string
): Promise<UserMongooseDocument | undefined> => {
  const user: UserMongooseDocument = await User.findOne({
    herotag: normalizeHerotag(herotag),
  }).lean();

  return user;
};
