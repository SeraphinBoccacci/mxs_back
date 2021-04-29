import User from "../models/User";
import logger from "../services/logger";
import { connectToDatabase } from "../services/mongoose";
import { UserType } from "../types/user";
import { getHashedPassword } from "../utils/auth";

const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const a = new Array(length).fill("");

  const string = a.reduce((prevString) => {
    return prevString + chars.charAt(Math.floor(Math.random() * chars.length));
  }, "");

  return string;
};

const anonymateCriticalData = async () => {
  const users = await User.find().lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      const userTriggerKey = user?.integrations?.ifttt?.triggerKey;
      const userEventName = user?.integrations?.ifttt?.eventName;

      const password = await getHashedPassword("test" as string);

      return User.updateOne(
        { _id: user._id },
        {
          $set: {
            password,
            verificationReference: generateRandomString(),
            ...(user.passwordEditionVerificationReference && {
              passwordEditionVerificationReference: generateRandomString(),
            }),
            ...((userTriggerKey || userEventName) && {
              "integrations.ifttt": {
                ...user?.integrations?.ifttt,
                ...(userEventName && {
                  eventName: "testEvent",
                }),
                ...(userTriggerKey && {
                  triggerKey: generateRandomString(userTriggerKey.length),
                }),
              },
            }),
          },
        }
      );
    })
  );
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting anonymateCriticalData");

    await anonymateCriticalData();

    logger.info("Done anonymateCriticalData");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());
