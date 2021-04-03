import axios, { AxiosRequestConfig } from "axios";

import { IftttParticleData } from "../../models/User";
import { EventData } from "../../types";

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
    value2: eventData.amount,
    value3: eventData.data,
  };

  await axios.post(
    `https://maker.ifttt.com/trigger/${iftttParticleData.eventName}/with/key/${iftttParticleData.triggerKey}`,
    data,
    config
  );
};
