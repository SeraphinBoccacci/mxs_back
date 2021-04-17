/** @format */

import { UserType } from "../../models/User";
import { publisher } from "../../services/redis";
import { EventData } from "../../types";

export const triggerStreamElementsEvent = async (eventData: EventData, user: UserType): Promise<void> => {
  await publisher.publish(
    "NEW_DONATION",
    JSON.stringify({
      room: user.herotag,
      herotag: eventData.herotag,
      amount: eventData.amount,
      message: eventData.data,
    }),
  );
};
