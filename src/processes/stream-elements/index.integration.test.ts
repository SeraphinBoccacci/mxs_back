import { sub } from "date-fns";
import mongoose from "mongoose";

import User, { UserType } from "../../models/User";
import { connectToDatabase } from "../../services/mongoose";
import {
  EnterAnimationTypes,
  ExitAnimationTypes,
  TextStyles,
  Variation,
  VariationPositions,
} from "../../types/streamElements";
import {
  createVariation,
  deleteVariation,
  getVariation,
  updateVariation,
} from ".";

const baseUser = {
  herotag: "serabocca06.elrond",
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

const baseVariation: Variation = {
  name: "variation test",
  duration: 10,
  chances: 40,
  requiredAmount: 1,
  backgroundColor: "#ffffff",
  width: 300,
  heigth: 200,
  position: VariationPositions.BottomCenter,
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

describe("Stream Elements integration test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    mongoose.disconnect();
  });

  describe("createVariation", () => {
    let user: UserType;
    beforeAll(async () => {
      user = await User.create(baseUser);
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should create a variation", async () => {
      await createVariation(user.herotag as string, baseVariation);

      const updatedUser = await User.findOne({ herotag: user.herotag })
        .select({
          "integrations.streamElements.variations": true,
        })
        .lean();

      expect(
        updatedUser?.integrations?.streamElements?.variations
      ).toMatchObject([baseVariation]);
    });
  });

  describe("getVariation", () => {
    const variationId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      await User.create({
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          streamElements: {
            variations: [
              { _id: variationId, ...baseVariation },
              {
                name: "variation test 2",
                backgroundColor: "#666666",
              },
            ],
          },
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should return the wanted variation", async () => {
      const variation = await getVariation(variationId);

      expect(variation).toMatchObject(baseVariation);
    });
  });

  describe("updateVariation", () => {
    let user: UserType;
    const variationId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await User.create({
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          streamElements: {
            variations: [
              {
                _id: variationId,
                name: "variation test 1",
                backgroundColor: "#123123",
              },
              {
                name: "variation test 2",
                backgroundColor: "#666666",
              },
            ],
          },
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should update the wanted variation", async () => {
      await updateVariation(variationId, baseVariation);

      const updatedUser = await User.findOne({ herotag: user.herotag })
        .select({
          "integrations.streamElements.variations": true,
        })
        .lean();

      expect(
        updatedUser?.integrations?.streamElements?.variations
      ).toMatchObject([
        baseVariation,
        {
          name: "variation test 2",
          backgroundColor: "#666666",
        },
      ]);
    });
  });

  describe("deleteVariation", () => {
    let user: UserType;
    const variationId = mongoose.Types.ObjectId();

    beforeAll(async () => {
      user = await User.create({
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          streamElements: {
            variations: [
              {
                _id: variationId,
                name: "variation test 1",
                backgroundColor: "#123123",
              },
              {
                name: "variation test 2",
                backgroundColor: "#666666",
              },
            ],
          },
        },
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    test("it should delete the wanted variation", async () => {
      await deleteVariation(variationId);

      const updatedUser = await User.findOne({ herotag: user.herotag })
        .select({
          "integrations.streamElements.variations": true,
        })
        .lean();

      expect(
        updatedUser?.integrations?.streamElements?.variations
      ).toMatchObject([
        {
          name: "variation test 2",
          backgroundColor: "#666666",
        },
      ]);
    });
  });
});
