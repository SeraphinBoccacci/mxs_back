import axios, { AxiosRequestConfig } from "axios";

import logger from "../../services/logger";
import { EventData, IftttParticleData } from "../../types/ifttt";

export const triggerIftttEvent = async (
  eventData: EventData,
  iftttParticleData: IftttParticleData
): Promise<void> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const data = {
    value1: eventData.herotag,
    value2: eventData.wordingAmount,
    value3: eventData.data,
  };

  const route = `https://maker.ifttt.com/trigger/${iftttParticleData.eventName}/with/key/${iftttParticleData.triggerKey}`;

  try {
    await axios.post(route, data, config);
  } catch (error) {
    logger.error("INVALID_IFTTT_CONFIGURATION", { calledUrl: route });
  }
};
