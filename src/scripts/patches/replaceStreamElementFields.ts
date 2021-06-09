/**
 * THIS PATCHES AIMS TO REPLACE user.integrations.streamElements by user.integration.overlays, which will be more generic
 */

import { ObjectId } from "bson";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

import { colors } from "../../constants/colors";
import User from "../../models/User";
import logger from "../../services/logger";
import { connectToDatabase } from "../../services/mongoose";
import { AlertVariation } from "../../types/alerts";
import { VariationGroupKinds } from "../../types/overlays";
import { UserType } from "../../types/user";

const randomColor = (): string => {
  const colorsCount = colors.length;

  const randomIndex = Math.floor(Math.random() * colorsCount);

  const color = colors[randomIndex];

  return color.value;
};

const replaceStreamElementFields = async () => {
  const users = await User.find()
    .select({ integrations: true })
    .lean();

  await Promise.all(
    users.map(async (user: UserType) => {
      const alertsVariations: AlertVariation[] =
        (user as any).integrations?.streamElements?.variations?.map(
          (variation: AlertVariation) => ({
            ...variation,
            _id: mongoose.Types.ObjectId(),
            offsetTop: 0,
            offsetLeft: 0,
          })
        ) || [];

      const variationsIds: ObjectId[] = alertsVariations.map(
        ({ _id }: AlertVariation) => _id
      );

      await User.updateOne(
        { _id: user._id },
        {
          ...(alertsVariations && {
            $set: {
              "integrations.overlays": [
                {
                  alerts: {
                    name: "Overlay 1",
                    color: randomColor(),
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
          }),
          $unset: { "integrations.streamElements": "" },
        },
        { strict: false }
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
