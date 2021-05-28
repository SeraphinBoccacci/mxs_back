import User from "../../models/User";
import logger from "../../services/logger";
import { connectToDatabase } from "../../services/mongoose";
import { getErdAddressFromHerotag } from "../../utils/transactions";

const populateErdAddressFromHerotag = async () => {
  const users = await User.find({ erdAddress: { $exists: false } })
    .select({ herotag: true })
    .lean();

  let updatedUsers = 0;

  for (const user of users) {
    try {
      const erdAddress = await getErdAddressFromHerotag(user.herotag as string);

      if (erdAddress) {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              erdAddress: erdAddress,
            },
          },
          { strict: false }
        );

        updatedUsers++;
      }
    } catch (error) {
      logger.error("users updated", { ...error, herotag: user.herotag });
    }
  }

  logger.info("users updated", { updatedUsers });
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting populateErdAddressFromHerotag");

    await populateErdAddressFromHerotag();

    logger.info("Done populateErdAddressFromHerotag");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());
