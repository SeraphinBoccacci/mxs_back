import mongoose from "mongoose";

import User from "../../models/User";
import {
  CircleDisplaySettings,
  DonationBar,
  DonationBarDisplays,
  InBarAmountDisplay,
  isCircleDisplay,
  isLineDisplay,
  LineDisplaySettings,
} from "../../types/donationBar";
import { normalizeHerotag } from "../../utils/transactions";

export const getDonationBar = async (
  herotag: string,
  overlayId: string
): Promise<DonationBar | null> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
    "integrations.overlays._id": overlayId,
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlay = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  return overlay?.donationBar || null;
};

const payloadToDonationBar = (payload: Partial<DonationBar>): DonationBar => {
  const resolveDisplaySettings = ():
    | CircleDisplaySettings
    | LineDisplaySettings => {
    if (isCircleDisplay(payload.displaySettings)) {
      return {
        kind: DonationBarDisplays.Circle,
        width: payload?.displaySettings?.width,
        strokeWidth: payload?.displaySettings?.strokeWidth,
      } as CircleDisplaySettings;
    } else if (isLineDisplay(payload.displaySettings)) {
      return {
        kind: payload?.displaySettings?.kind || DonationBarDisplays.Horizontal,
        width: payload?.displaySettings?.width || 500,
        height: payload?.displaySettings?.height || 50,
      } as LineDisplaySettings;
    }

    return {
      kind: DonationBarDisplays.Horizontal,
      width: 500,
      height: 50,
    };
  };

  return {
    _id: payload._id as mongoose.Types.ObjectId,
    offsetTop: payload?.offsetTop || 0,
    offsetLeft: payload?.offsetLeft || 0,
    indicationDisplay: payload?.indicationDisplay || InBarAmountDisplay.EGLD,
    centerCursorPath: payload?.centerCursorPath,
    centerCursorScale: payload?.centerCursorScale,
    displaySettings: resolveDisplaySettings(),
    donationGoalAmount: { value: payload?.donationGoalAmount?.value || 1 },
    donationBarDescription: {
      offsetLeft: payload?.donationBarDescription?.offsetLeft || 0,
      offsetTop: payload?.donationBarDescription?.offsetTop || 0,
      content: payload?.donationBarDescription?.content,
      width: payload?.donationBarDescription?.width,
      height: payload?.donationBarDescription?.height,
      size: payload?.donationBarDescription?.size,
      color: payload?.donationBarDescription?.color,
      lineHeight: payload?.donationBarDescription?.lineHeight,
      letterSpacing: payload?.donationBarDescription?.letterSpacing,
      wordSpacing: payload?.donationBarDescription?.wordSpacing,
      textAlign: payload?.donationBarDescription?.textAlign,
      textStyle: payload?.donationBarDescription?.textStyle,
      fontFamily: payload?.donationBarDescription?.fontFamily,
      stroke: {
        color: payload?.donationBarDescription?.stroke?.color,
        width: payload?.donationBarDescription?.stroke?.width,
      },
    },
    border: {
      color: payload?.border?.color,
      width: payload?.border?.width,
      radius: payload?.border?.radius,
    },
    sentAmountPart: {
      color: payload.sentAmountPart?.color,
      textColor: payload.sentAmountPart?.textColor,
    },
    amountToSendPart: {
      color: payload.amountToSendPart?.color,
      textColor: payload.amountToSendPart?.textColor,
    },
    donationReaction: {
      soundPath: payload.donationReaction?.soundPath,
      duration: payload.donationReaction?.duration,
      fillSentAmountPart: {
        color: payload.donationReaction?.fillSentAmountPart?.color,
      },
      animateLogo: {
        kind: payload.donationReaction?.animateLogo?.kind,
      },
      animateBarDisplay: {
        kind: payload.donationReaction?.animateBarDisplay?.kind,
      },
    },
  };
};

export const updateDonationBar = async (
  herotag: string,
  overlayId: string,
  payload: Partial<DonationBar>
): Promise<void> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ "integrations.overlays": true })
    .orFail(new Error("USER_NOT_FOUND"))
    .lean();

  const overlayToUpdate = user?.integrations?.overlays?.find(
    ({ _id }) => String(_id) === String(overlayId)
  );

  if (!overlayToUpdate) throw new Error("OVERLAY_NOT_FOUND");

  const updatedDonationBar = payloadToDonationBar(payload);

  await User.updateOne(
    { "integrations.overlays._id": overlayId },
    {
      $set: {
        "integrations.overlays.$.donationBar": updatedDonationBar,
      },
    }
  );
};

export const deleteDonationBar = async (
  herotag: string,
  overlayId: string
): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $unset: {
        "integrations.overlays.$.donationBar": true,
      },
    }
  );
};
