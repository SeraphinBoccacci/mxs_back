import axios, { AxiosRequestConfig } from "axios";
import { RedisClient } from "redis";
import { EventData, IftttConfig } from "../interfaces";
import { IftttIntegrationData } from "../models/User";
import { getStreamerIFTTTConfig } from "../redis";

export const triggerIftttEvent = async (
  eventData: EventData,
  iftttIntegrationData: IftttIntegrationData
) => {
  //   const iftttConfig = await getStreamerIFTTTConfig(erdAddress);

  const iftttConfig: IftttConfig = {
    triggerKey: iftttIntegrationData.triggerKey,
    eventName: iftttIntegrationData.eventName,
  };

  if (!iftttConfig) return;

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
    `https://maker.ifttt.com/trigger/${iftttConfig.eventName}/with/key/${iftttConfig.triggerKey}`,
    data,
    config
  );
};
