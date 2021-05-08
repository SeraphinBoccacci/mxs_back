import User from "../../models/User";
import { VariationGroupKinds, WidgetsKinds } from "../../types/overlays";
import { normalizeHerotag } from "../../utils/transactions";

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
  return User.updateOne(
    {
      herotag: normalizeHerotag(herotag),
      "integrations.overlays._id": overlayId,
    },
    {
      $set: {
        "integrations.overlays.$.donationBar": {
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
