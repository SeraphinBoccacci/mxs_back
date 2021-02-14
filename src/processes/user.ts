import { IftttConfig } from "../interfaces";
import User from "../models/User";
import { normalizeHerotag } from "../utils/maiar";

export const toggleIftttIntegration = async (
  herotag: string,
  activate: boolean
) => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    { $set: { "integrations.ifttt.isActive": activate } }
  );
};

export const updateIftttIntegrationData = async (
  herotag: string,
  data: IftttConfig
) => {
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

export const getUserData = async (herotag: string) => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  }).lean();

  return user;
};
