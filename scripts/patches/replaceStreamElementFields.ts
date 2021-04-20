/**
 * THIS PATCHES AIMS TO REPLACE user.integrations.streamElements by user.integration.overlays, which will be more generic
 */

import { nanoid } from "nanoid";

import User, { UserType } from "../../src/models/User";
import logger from "../../src/services/logger";
import { connectToDatabase } from "../../src/services/mongoose";

const replaceStreamElementFields = async () => {
  const users = await User.find()
    .select({ integrations: true })
    .lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            "integrations.overlays": [
              {
                alerts: {
                  variations: (user as any).integrations?.streamElements
                    ?.variations,
                },
                generatedLink: nanoid(50),
                // structure: user.integrations?.streamElements?.rowsStructure,
              },
            ],
          },
        }
      );
    })
  );
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting replaceStreamElementFields");

    await replaceStreamElementFields();

    logger.info("Done replaceStreamElementFields");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());
