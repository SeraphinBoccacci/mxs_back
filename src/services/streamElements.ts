import { EventData } from "../interfaces";
import { UserType } from "../models/User";
import { publisher } from "./redis";

export const triggerStreamElementsEvent = async (
  eventData: EventData,
  user: UserType
): Promise<void> => {
  await publisher.publish(
    "NEW_DONATION",
    JSON.stringify({
      room: user.herotag,
      herotag: eventData.herotag,
      amount: eventData.amount,
      message: eventData.data,
    })
  );
};
