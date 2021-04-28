import { sub } from "date-fns";
import mongoose from "mongoose";

import { ElrondTransaction } from "../../../types";
import { reactToNewTransaction } from "../";

jest.mock("../../../utils/transactions", () => {
  const module = jest.requireActual("../../../utils/transactions");

  return {
    ...module,
    getHerotagFromErdAddress: jest.fn(),
  };
});
import * as utilTransactions from "../../../utils/transactions";

jest.mock("../ifttt");
import * as ifttt from "../ifttt";

jest.mock("../overlays");
import { UserType } from "../../../models/User";
import * as overlays from "../overlays";

const baseUser = {
  _id: mongoose.Types.ObjectId("6025884242b45cd7572870b3"),
  herotag: "streamparticles.elrond",
  password: "$2b$10$RzGjFb4jVp77rsiMPOHofOmUzsllH674FnezzIR8Jmjmhr2u1HwXe",
  status: 1,
  createdAt: new Date("2021-02-11T19:40:50.466Z"),
  updatedAt: new Date("2021-02-15T20:34:04.218Z"),
  integrations: {
    ifttt: {
      eventName: "Test",
      triggerKey: "x2qQHAJF89ljX-IwFjNdjZ8raTicSvQpLQcdxggWooJ7",
      isActive: true,
    },
    overlays: [],
  },
  isStreaming: true,
  streamingStartDate: sub(new Date(), { hours: 4 }),
} as UserType;

describe("Blockchain interaction unit testing", () => {
  describe("reactToNewTransaction", () => {
    const mockedUtilTransactions = utilTransactions as jest.Mocked<
      typeof utilTransactions
    >;
    const mockedIfttt = ifttt as jest.Mocked<typeof ifttt>;
    const mockedOverlays = overlays as jest.Mocked<typeof overlays>;

    beforeAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockResolvedValue(
        "remdem"
      );
    });

    afterAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockClear();
    });

    beforeEach(() => {
      mockedOverlays.triggerOverlaysEvent.mockClear();
      mockedIfttt.triggerIftttEvent.mockClear();
    });

    describe("when user has no ifttt particle data and no SE data", () => {
      const transaction = {
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      } as ElrondTransaction;

      const user = {
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          ifttt: undefined,
        },
      };

      it("should not call trigger ifttt nor SE", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user has ifttt activated", () => {
      const transaction = {
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      } as ElrondTransaction;

      it("should call only trigger ifttt", async () => {
        await reactToNewTransaction(transaction, baseUser);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(1);
        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          baseUser.integrations?.ifttt
        );
      });
    });

    describe("when user has not ifttt activated", () => {
      const transaction = {
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      } as ElrondTransaction;

      const user = {
        ...baseUser,
        integrations: {
          ...baseUser.integrations,
          ifttt: undefined,
        },
      };

      it("should call only trigger SE", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(0);

        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledTimes(1);
        expect(mockedOverlays.triggerOverlaysEvent).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          user
        );
      });
    });
  });
});
