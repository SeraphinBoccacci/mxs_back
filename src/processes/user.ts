import { IftttConfig } from "../interfaces";
import User, { UserMongooseDocument } from "../models/User";
import { normalizeHerotag } from "../utils/transactions";

export const toggleIftttIntegration = async (
  herotag: string,
  activate: boolean
): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    { $set: { "integrations.ifttt.isActive": activate } }
  );
};

export const updateIftttIntegrationData = async (
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

export const getUserData = async (
  herotag: string
): Promise<UserMongooseDocument | undefined> => {
  const user: UserMongooseDocument = await User.findOne({
    herotag: normalizeHerotag(herotag),
  }).lean();

  return user;
};
