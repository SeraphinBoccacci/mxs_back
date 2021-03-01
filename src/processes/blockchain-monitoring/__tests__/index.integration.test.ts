import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

jest.mock("../../../elrond");
import * as elrond from "../../../elrond";
import User, { UserType } from "../../../models/User";
import { ElrondTransaction } from "../../../types";

jest.mock("../../../redis");
import * as redis from "../../../redis";

jest.mock("../../../utils/poll");
import * as poll from "../../../utils/poll";

jest.mock("../../blockchain-interaction");
import { connectToDatabase } from "../../../services/mongoose";
import * as blockchainInteraction from "../../blockchain-interaction";
import {
  balanceHandler,
  launchBlockchainMonitoring,
  resumeBlockchainMonitoring,
  toggleBlockchainMonitoring,
} from "../";

const baseUser = {
  herotag: "serabocca06.elrond",
  password: "$2b$10$RzGjFb4jVp77rsiMPOHofOmUzsllH674FnezzIR8Jmjmhr2u1HwXe",
  status: 1,
  createdAt: new Date("2021-02-11T19:40:50.466Z"),
  updatedAt: new Date("2021-02-15T20:34:04.218Z"),
  verificationStartDate: new Date(),
  verificationReference: "test",
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

describe("Maiar integration testing", () => {
  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();
  });

  describe("handleBalance", () => {
    const handleBalance = balanceHandler(baseUser);

    describe("when balance is not updated", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
      });

      afterAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedElrond.getLastTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setNewBalance.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
          "1000000000000000000"
        );

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(0);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(0);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when balance is updated and there is one new transaction", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      const targetErdAdress =
        "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";

      const updatedAmount = "10000000000000000000";

      const newTransaction = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        status: "success",
        value: "9000000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });

        mockedElrond.getLastTransactions.mockResolvedValue([newTransaction]);
      });

      afterAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedElrond.getLastTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setNewBalance.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance(targetErdAdress, updatedAmount);

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledWith(newTransaction, baseUser);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });

    describe("when balance is updated and there is three new transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      const targetErdAdress =
        "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";

      const updatedAmount = "6100000000000000000";

      const newTransaction1 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
        status: "success",
        value: "900000000000000000",
      } as ElrondTransaction;

      const newTransaction2 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 2 })) * 0.001,
        status: "success",
        value: "1700000000000000000",
      } as ElrondTransaction;

      const newTransaction3 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        status: "success",
        value: "2300000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });

        mockedElrond.getLastTransactions.mockResolvedValue([
          newTransaction1,
          newTransaction2,
          newTransaction3,
        ]);
      });

      afterAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedElrond.getLastTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setNewBalance.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance(targetErdAdress, updatedAmount);

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(3);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenNthCalledWith(1, newTransaction1, baseUser);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenNthCalledWith(2, newTransaction2, baseUser);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenNthCalledWith(3, newTransaction3, baseUser);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });

    describe("when balance is updated, there is one new transaction and three old transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      const targetErdAdress =
        "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";

      const updatedAmount = "6100000000000000000";

      const oldTransactions = [
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 15 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 17 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
        {
          receiver: targetErdAdress,
          timestamp: getTime(sub(new Date(), { minutes: 20 })) * 0.001,
          status: "success",
          value: "1700000000000000000",
        },
      ] as ElrondTransaction[];

      const newTransaction = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
        status: "success",
        value: "900000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });

        mockedElrond.getLastTransactions.mockResolvedValue([
          ...oldTransactions,
          newTransaction,
        ]);
      });

      afterAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedElrond.getLastTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setNewBalance.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance(targetErdAdress, updatedAmount);

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenCalledWith(
          targetErdAdress
        );

        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenNthCalledWith(1, newTransaction, baseUser);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(
          targetErdAdress,
          updatedAmount
        );
      });
    });
  });

  describe("activateBlockchainMonitoring", () => {
    const mockedPoll = poll as jest.Mocked<typeof poll>;

    afterAll(() => mockedPoll.pollBalance.mockClear());

    test("", async () => {
      await launchBlockchainMonitoring(baseUser.herotag, baseUser);

      expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(1);
      expect(mockedPoll.pollBalance).toHaveBeenCalledWith(
        baseUser.herotag,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("toggleBlockchainMonitoring", () => {
    describe("when no user is found", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(() => {
        mockedPoll.pollBalance.mockClear();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toBe(undefined);

        expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling off", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.pollBalance.mockClear();

        await User.deleteMany();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(
          baseUser.herotag,
          false
        );

        expect(result).toEqual({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling on", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.pollBalance.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toEqual({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(1);
        expect(mockedPoll.pollBalance).toHaveBeenCalledWith(
          baseUser.herotag,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });
  });

  describe("resumeBlockchainMonitoring", () => {
    describe("when no user is found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(async () => {
        mockedPoll.pollBalance.mockClear();
      });

      it("should start blockchain monitoring", async () => {
        await resumeBlockchainMonitoring();

        expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when two users are found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser1: UserType;
      let createdUser2: UserType;

      beforeAll(async () => {
        createdUser1 = await User.create(baseUser);
        createdUser2 = await User.create({
          ...baseUser,
          herotag: "remdem.elrond",
        });
      });

      afterAll(async () => {
        mockedPoll.pollBalance.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const results = await resumeBlockchainMonitoring();

        expect(results.sort()).toEqual([
          createdUser2.herotag,
          createdUser1.herotag,
        ]);

        expect(mockedPoll.pollBalance).toHaveBeenCalledTimes(2);

        expect(mockedPoll.pollBalance).toHaveBeenCalledWith(
          createdUser1.herotag,
          expect.any(Function),
          expect.any(Function)
        );

        expect(mockedPoll.pollBalance).toHaveBeenCalledWith(
          createdUser2.herotag,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });
  });
});
