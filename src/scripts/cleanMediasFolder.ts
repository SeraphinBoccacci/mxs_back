import fs from "fs";
import path from "path";

import User, { UserType } from "../models/User";
import logger from "../services/logger";
import { connectToDatabase } from "../services/mongoose";
import { AlertVariation } from "../types/alerts";

const cleanMediasFolder = async () => {
  const audios = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/audios"))
    .filter((fileName) => fileName !== ".DS_Store");
  const images = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/images"))
    .filter((fileName) => fileName !== ".DS_Store");
  const files = fs
    .readdirSync(path.join(__dirname, "../../remote/medias/files"))
    .filter((fileName) => fileName !== ".DS_Store");

  const users = await User.find()
    .select({ integrations: true })
    .lean();

  audios.forEach((fileName) => {
    const isUsed = users.some((user: UserType) =>
      user?.integrations?.overlays?.some(({ alerts }) =>
        alerts.variations.some(
          (variation: AlertVariation) => variation.sound?.soundPath === fileName
        )
      )
    );

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/audios", fileName)
      );
  });

  images.forEach((fileName) => {
    const isUsed = users.some((user: UserType) =>
      user?.integrations?.overlays?.some(({ alerts }) =>
        alerts.variations.some(
          (variation: AlertVariation) => variation.image?.imagePath === fileName
        )
      )
    );

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/images", fileName)
      );
  });

  files.forEach((fileName) => {
    const isUsed = users.some((user: UserType) =>
      user?.integrations?.overlays?.some(({ alerts }) =>
        alerts.variations.some(
          (variation: AlertVariation) =>
            variation.filepath && fileName.includes(variation.filepath)
        )
      )
    );

    if (!isUsed)
      fs.unlinkSync(
        path.join(__dirname, "../../remote/medias/files", fileName)
      );
  });
};

connectToDatabase()
  .then(async () => {
    logger.info("Starting cleanMediasFolder");

    await cleanMediasFolder();

    logger.info("Done cleanMediasFolder");
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => process.exit());
