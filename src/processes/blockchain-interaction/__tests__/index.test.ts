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

jest.mock("../streamElements");
import { IftttParticleData, UserType } from "../../../models/User";
import * as streamElements from "../streamElements";

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
    streamElements: {
      variations: [],
      rowsStructure: [],
      isActive: true,
    },
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
    const mockedStreamElements = streamElements as jest.Mocked<
      typeof streamElements
    >;

    beforeAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockResolvedValue(
        "remdem"
      );
    });

    afterAll(() => {
      mockedUtilTransactions.getHerotagFromErdAddress.mockClear();
    });

    beforeEach(() => {
      mockedStreamElements.triggerStreamElementsEvent.mockClear();
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
          streamElements: undefined,
        },
      };

      it("should not call trigger ifttt nor SE", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(0);

        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user has ifttt integration data but not SE", () => {
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
          streamElements: undefined,
        },
      };

      it("should call only trigger ifttt", async () => {
        await reactToNewTransaction(transaction, user);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(1);
        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          user.integrations.ifttt
        );

        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user has SE integration data but not ifttt", () => {
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

        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          user
        );
      });
    });

    describe("when user has ifttt integration data and SE particle data", () => {
      const transaction = {
        hash:
          "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
        status: "success",
        value: "1000000000000000000",
      } as ElrondTransaction;

      it("should call trigger ifttt & SE", async () => {
        await reactToNewTransaction(transaction, baseUser);

        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledTimes(1);
        expect(mockedIfttt.triggerIftttEvent).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          baseUser?.integrations?.ifttt as IftttParticleData
        );

        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedStreamElements.triggerStreamElementsEvent
        ).toHaveBeenCalledWith(
          { amount: "1", data: "", herotag: "remdem" },
          baseUser
        );
      });
    });
  });
});
