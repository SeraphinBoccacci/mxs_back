import mongoose from "mongoose";
import { nanoid } from "nanoid";

import { colors } from "../../constants/colors";
import User from "../../models/User";
import {
  DonationBar,
  DonationBarDisplays,
  InBarAmountDisplay,
} from "../../types/donationBar";
import {
  OverlayData,
  VariationGroupKinds,
  WidgetsKinds,
} from "../../types/overlays";
import { normalizeHerotag } from "../../utils/transactions";

const randomColor = (): string => {
  const colorsCount = colors.length;

  const randomIndex = Math.floor(Math.random() * colorsCount);

  const color = colors[randomIndex];

  return color.value;
};

export const getUserOverlay = async (
  herotag: string,
  overlayId: string
): Promise<OverlayData | null> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  const overlay = user?.integrations?.overlays?.find(({ generatedLink }) => {
    return overlayId === generatedLink;
  });

  return overlay || null;
};

export const getManyUserOverlays = async (
  herotag: string
): Promise<OverlayData[]> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  return user?.integrations?.overlays || [];
};

export const createOverlay = async (herotag: string): Promise<void> => {
  const user = await User.findOne({
    herotag: normalizeHerotag(herotag),
  })
    .select({ "integrations.overlays": true })
    .lean();

  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
    },
    {
      $push: {
        "integrations.overlays": {
          generatedLink: nanoid(50),
          color: randomColor(),
          name: `Overlay ${(user?.integrations?.overlays?.length || 0) + 1}`,
        },
      },
    }
  );
};

export const deleteOverlay = async (
  herotag: string,
  overlayId: string
): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    { $pull: { "integrations.overlays": { _id: overlayId } } }
  );
};

const addAlerts = (herotag: string, overlayId: string) => {
  return User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.alerts": {
          variations: [],
          groups: [
            {
              kind: VariationGroupKinds.DEFAULT,
              variationsIds: [],
              title: "Unclassed Variations",
            },
          ],
        },
      },
    }
  );
};

const addDonationBar = (herotag: string, overlayId: string) => {
  const defaultDonationBar: DonationBar = {
    indicationDisplay: InBarAmountDisplay.EGLD,
    donationGoalAmount: { value: 1 },
    _id: mongoose.Types.ObjectId(),
    displaySettings: {
      kind: DonationBarDisplays.Horizontal,
      height: 50,
      width: 500,
    },
    donationReaction: {
      duration: 1,
    },
    donationBarDescription: {
      content: "This is a donation description",
    },
  };
  return User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.donationBar": defaultDonationBar,
      },
    }
  );
};

export const addWidgetToOverlay = async (
  herotag: string,
  overlayId: string,
  widget: WidgetsKinds
): Promise<void> => {
  if (widget === WidgetsKinds.ALERTS) {
    await addAlerts(herotag, overlayId);

    return;
  }

  if (widget === WidgetsKinds.DONATION_BAR) {
    await addDonationBar(herotag, overlayId);

    return;
  }
};

export const updateOverlayName = async (
  herotag: string,
  overlayId: string,
  overlayName: string
): Promise<void> => {
  await User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.name": overlayName,
      },
    }
  );
};
