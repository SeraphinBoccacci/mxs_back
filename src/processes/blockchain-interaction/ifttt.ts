import axios, { AxiosRequestConfig } from "axios";

import { IftttIntegrationData } from "../../models/User";
import logger from "../../services/logger";
import { EventData } from "../../types";

export const triggerIftttEvent = async (
  eventData: EventData,
  iftttIntegrationData: IftttIntegrationData
): Promise<void> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const data = {
    value1: eventData.herotag,
    value2: eventData.amount,
    value3: eventData.data,
  };

  try {
    await axios.post(
      `https://maker.ifttt.com/trigger/${iftttIntegrationData.eventName}/with/key/${iftttIntegrationData.triggerKey}`,
      data,
      config
    );
  } catch (error) {
    logger.error(error);

    throw error;
  }
};
