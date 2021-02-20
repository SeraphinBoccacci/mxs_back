import axios, { AxiosRequestConfig } from "axios";

import { EventData } from "../../interfaces";
import { IftttIntegrationData } from "../../models/User";

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

  console.log(data, config);

  await axios.post(
    `https://maker.ifttt.com/trigger/${iftttIntegrationData.eventName}/with/key/${iftttIntegrationData.triggerKey}`,
    data,
    config
  );
};
