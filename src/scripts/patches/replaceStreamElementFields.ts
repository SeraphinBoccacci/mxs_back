/**
 * THIS PATCHES AIMS TO REPLACE user.integrations.streamElements by user.integration.overlays, which will be more generic
 */

import mongoose from "mongoose";
import { nanoid } from "nanoid";

import { VariationGroupKinds } from "../../models/schemas/VariationGroup";
import User, { UserType } from "../../models/User";
import logger from "../../services/logger";
import { connectToDatabase } from "../../services/mongoose";
import { AlertVariation } from "../../types/alerts";

const replaceStreamElementFields = async () => {
  const users = await User.find()
    .select({ integrations: true })
    .lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      const alertsVariations = (user as any).integrations?.streamElements?.variations.map(
        (variation: AlertVariation) => ({
          ...variation,
          _id: mongoose.Types.ObjectId(),
        })
      );
      const variationsIds: AlertVariation[] = alertsVariations.map(
        ({ _id }: AlertVariation) => _id
      );

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            "integrations.overlays": [
              {
                alerts: {
                  variations: alertsVariations,
                  groups: [
                    {
                      kind: VariationGroupKinds.DEFAULT,
                      variationsIds: variationsIds,
                      title: "Unclassed Variations",
                    },
                  ],
                },

                generatedLink: nanoid(50),
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
