jest.mock("fs");
import { sub } from "date-fns";
import { omit } from "lodash";
import mongoose from "mongoose";

import User from "../../models/User";
import { connectToDatabase } from "../../services/mongoose";
import { AlertVariation } from "../../types/alerts";
import { OverlayData, VariationGroupKinds } from "../../types/overlays";
import {
  EnterAnimationTypes,
  ExitAnimationTypes,
  TextStyles,
} from "../../types/style";
import { UserType } from "../../types/user";
import { createVariation, deleteVariation, updateVariation } from "./index";

const baseUser = {
  herotag: "streamparticles.elrond",
  erdAddress: "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm",
  password: "$2b$10$RzGjFb4jVp77rsiMPOHofOmUzsllH674FnezzIR8Jmjmhr2u1HwXe",
  status: 1,
  verificationStartDate: new Date().toISOString(),
  verificationReference: "verificationReference_test",
  integrations: {
    ifttt: {
      eventName: "Test",
      triggerKey: "x2qQHAJF89ljX-IwFjNdjZ8raTicSvQpLQcdxggWooJ7",
      isActive: true,
    },
  },
  isStreaming: true,
  streamingStartDate: sub(new Date(), { hours: 4 }),
};

const baseVariation: AlertVariation = {
  _id: mongoose.Types.ObjectId(),
  name: "variation test",
  duration: 10,
  chances: 40,
  requiredAmount: 1,
  backgroundColor: "#ffffff",
  width: 300,
  heigth: 200,
  sound: {
    soundPath: "/audios_0003.mp3",
    soundDelay: "10",
    soundOffset: "10",
  },
  image: {
    imagePath: "/images_00001.png",
    width: 300,
    height: 300,
    animation: {
      enter: {
        type: EnterAnimationTypes.fadeIn,
        duration: 10,
        delay: 10,
      },
      exit: {
        type: ExitAnimationTypes.fadeOut,
        duration: 10,
        offset: 10,
      },
    },
  },
  text: {
    content: "Text content",
    width: 200,
    height: 100,
    size: "12",
    color: "#000000",
    lineHeight: "10",
    letterSpacing: "10",
    wordSpacing: "10",
    textAlign: "center",
    textStyle: [TextStyles.bold],
    animation: {
      enter: {
        type: EnterAnimationTypes.fadeIn,
        duration: 10,
        delay: 10,
      },
      exit: {
        type: ExitAnimationTypes.fadeOut,
        duration: 10,
        offset: 10,
      },
    },
  },
};

describe("Alert Variations integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("createVariation", () => {
    describe("When overlay has no alert variation yet", () => {
      let user: UserType;
      const overlayId = mongoose.Types.ObjectId();

      beforeAll(async () => {
        user = await User.create({
          ...baseUser,
          integrations: {
            ...baseUser.integrations,
            overlays: [
              {
                _id: overlayId,
                alerts: {
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
            ],
          },
        });
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      test("it should create an alert variation and add it in default group", async () => {
        await createVariation(
          user.herotag as string,
          String(overlayId),
          baseVariation
        );

        const updatedUser = await User.findOne({ herotag: user.herotag })
          .select({
            "integrations.overlays": true,
          })
          .lean();

        expect((updatedUser as UserType).integrations?.overlays).toHaveLength(
          1
        );

        const [overlay] = (updatedUser as UserType).integrations
          ?.overlays as OverlayData[];

        expect(overlay.alerts.variations).toMatchObject([
          omit(baseVariation, "_id"),
        ]);
        expect(overlay.alerts.groups).toMatchObject([
          {
            title: "Unclassed Variations",
            variationsIds: [String(overlay.alerts.variations[0]._id)],
            kind: VariationGroupKinds.DEFAULT,
          },
        ]);
      });
    });
  });

  describe("updateVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const variationId = mongoose.Types.ObjectId();
    const variation2Id = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await User.create({
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          overlays: [
            {
              _id: overlayId,
              alerts: {
                variations: [
                  {
                    _id: variationId,
                    name: "variation test 1",
                    backgroundColor: "#123123",
                  },
                  {
                    _id: variation2Id,
                    name: "variation test 2",
                    backgroundColor: "#666666",
                  },
                ],
                groups: [
                  {
                    kind: VariationGroupKinds.DEFAULT,
                    variationsIds: [String(variationId), String(variation2Id)],
                    title: "Unclassed Variations",
                  },
                ],
              },
            },
          ],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should update the wanted variation", async () => {
      await updateVariation(user.herotag as string, String(overlayId), {
        ...baseVariation,
        _id: variationId,
      });

      const updatedUser = await User.findOne({ herotag: user.herotag })
        .select({
          "integrations.overlays": true,
        })
        .lean();

      expect((updatedUser as UserType).integrations?.overlays).toHaveLength(1);

      const [overlay] = (updatedUser as UserType).integrations
        ?.overlays as OverlayData[];

      expect(overlay.alerts.variations).toMatchObject([
        {
          ...baseVariation,
          _id: variationId,
        },
        {
          _id: variation2Id,
          name: "variation test 2",
          backgroundColor: "#666666",
        },
      ]);

      expect(overlay.alerts.groups).toMatchObject([
        {
          title: "Unclassed Variations",
          variationsIds: [String(variationId), String(variation2Id)],
          kind: VariationGroupKinds.DEFAULT,
        },
      ]);
    });
  });

  describe("deleteVariation", () => {
    let user: UserType;
    const overlayId = mongoose.Types.ObjectId();
    const variationId = mongoose.Types.ObjectId();
    const variation2Id = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await User.create({
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          overlays: [
            {
              _id: overlayId,
              alerts: {
                variations: [
                  {
                    _id: variationId,
                    name: "variation test 1",
                    backgroundColor: "#123123",
                  },
                  {
                    _id: variation2Id,
                    name: "variation test 2",
                    backgroundColor: "#666666",
                  },
                ],
                groups: [
                  {
                    kind: VariationGroupKinds.DEFAULT,
                    variationsIds: [String(variationId), String(variation2Id)],
                    title: "Unclassed Variations",
                  },
                ],
              },
            },
          ],
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should delete the wanted variation", async () => {
      await deleteVariation(
        user.herotag as string,
        String(overlayId),
        String(variationId)
      );

      const updatedUser = await User.findOne({ herotag: user.herotag })
        .select({
          "integrations.overlays": true,
        })
        .lean();

      expect((updatedUser as UserType).integrations?.overlays).toHaveLength(1);

      const [overlay] = (updatedUser as UserType).integrations
        ?.overlays as OverlayData[];

      expect(overlay.alerts.variations).toMatchObject([
        {
          _id: variation2Id,
          name: "variation test 2",
          backgroundColor: "#666666",
        },
      ]);

      expect(overlay.alerts.groups).toMatchObject([
        {
          title: "Unclassed Variations",
          variationsIds: [String(variation2Id)],
          kind: VariationGroupKinds.DEFAULT,
        },
      ]);
    });
  });
});
