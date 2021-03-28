import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

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
  launchBlockchainMonitoring,
  resumeBlockchainMonitoring,
  toggleBlockchainMonitoring,
  transactionsHandler,
} from "../";

const targetErdAdress =
  "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm";

const baseUser = {
  herotag: "streamparticles.elrond",
  password: "$2b$10$RzGjFb4jVp77rsiMPOHofOmUzsllH674FnezzIR8Jmjmhr2u1HwXe",
  status: 1,
  createdAt: new Date("2021-02-11T19:40:50.466Z"),
  updatedAt: new Date("2021-02-15T20:34:04.218Z"),
  verificationStartDate: new Date().toISOString(),
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

const baseLastTxs: ElrondTransaction[] = [
  {
    hash: "87a4deb44bdcc42cfacf20d8aa5a4cef9296470c523e67d7a9f27b7b183dc7b6",
    receiver: targetErdAdress,
    receiverShard: 2,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8raqyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616922978,
    value: "10000000000000000",
  },
  {
    hash: "e0ec97a119a8819f10222a8f0z134e7a054dc1495ed762a354c7bc05be1cb0b6",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qal6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616922798,
    value: "1000000000000000",
  },
  {
    hash: "9cafc846306465896fc96667e02ac2621cfcac00116817bd7f62bdc739df4891",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616922306,
    value: "1000000000000000",
  },
  {
    hash: "057bbfa6385055ebfc61bb3da4e0fb7a6bbba03833d9eff3dbd2e8036e3e0fff",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qal6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616922060,
    value: "1000000000000000",
  },
  {
    hash: "eb9441c29dccae6fec8dc04af0c49a5c67687161439d64578b95c249c5653d97",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcjar3qya6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616921946,
    value: "1000000000000000",
  },
  {
    hash: "a543efcf1f830283a06dd41ac75d6eae1f45e7e4e823ff228726194b44bccdaa",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fdazcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616921802,
    value: "1000000000000000",
  },
  {
    hash: "0ccc58e2afeaa7aeec7f2aaab9d8929d6a78d460e00c32e860011836dacb91d5",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fa5zca8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616921412,
    value: "1000000000000000",
  },
  {
    hash: "adb8592a6d91bbb52e30f52744a4e4108ed653e2bdd670e9785b3eeaa97f3360",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zaj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616857086,
    value: "1000000000000000",
  },
  {
    hash: "2f78aff52d87ff62a94859a492deac57901753252a2fcec84a881958e73442d9",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcjar3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616856978,
    value: "1000000000000000",
  },
  {
    hash: "3fe7c0d3dc5fc1d0921d0919d38e1a3ced08652847a2b2d7af11b4190ef191eb",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fdzcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616856750,
    value: "10000000000000",
  },
  {
    hash: "e51606c81f6d0ad388f4c1ab37da3blc6e18fd39aa1cb2c3c817771af0293b97",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4elcx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616856078,
    value: "100000000000000",
  },
  {
    hash: "106db61d8f2269363609c405b83168e8e5042f46elcdaeee9cd5f46768671b81",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvlcrmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616855628,
    value: "1000000000000000",
  },
  {
    hash: "54fe0866fbf8f9fcb7lc501d142af009ac9eb71879aa60a5206e59a624d332e6",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8lcqyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616791158,
    value: "1000000000000000",
  },
  {
    hash: "8ce6f493f2276fcbc2fc39a59ea4c393b97132758afa9ce4622da0b12a12lc39",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4lcfx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616791080,
    value: "1000000000000000",
  },
  {
    hash: "9b18165dd9c4dea9abd9d723be5acf49eb4b5d81cbf1b51559lcff3c9c469d25",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eaflc2kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616790960,
    value: "1000000000000000",
  },
  {
    hash: "976262cff2f50b52ab6a21e5bc117f955936a012344a2a31b5blc5e5e8fbc83f",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa00lcd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616788758,
    value: "1000000000000000",
  },
  {
    hash: "462ed41cd8b373a60d750c756cab8ab3dcbc941a582f9eaaaff5lc5aa0a662c0",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7lcksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616619156,
    value: "1000000000000000",
  },
  {
    hash: "0dabd0b0612854bcc964a9a015b6d01d63dab5397b620c421d778clc820bf2f5",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa00lcd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1616618910,
    value: "100000000000000",
  },
  {
    hash: "826bc909b75e20ebba40e73dbf53a7de99a7487e1e524e38483lc0a141e4c1d4",
    receiver: targetErdAdress,
    receiverShard: 2,
    sender: "erd16x7llcdpkjsafgwjx0e5kw94evsqw039rwp42m2j9eesd88x8zzs75tzry",
    senderShard: 1,
    status: "success",
    timestamp: 1616617014,
    value: "50000000000000000000",
  },
  {
    hash: "ecf78d0ba7dlc8156966a029906d71ca9d2c97146731370f828fd4e9779fd9f5",
    receiver: targetErdAdress,
    receiverShard: 2,
    sender: "erd16x7le8dpkjsafgwjx0e5kw94evsqw039rwp42m2j9eesd88lczzs75tzry",
    senderShard: 1,
    status: "success",
    timestamp: 1614926058,
    value: "50000000000000000000",
  },
  {
    hash: "42938c81a8e972731023lcc4836adae14933a2dcc244d0bff9ff0e2147deea45",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxlc02kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1614890100,
    value: "1000000000000000",
  },
  {
    hash: "269f393a0d4dlc727922000a42020154fd944894c3d8ddb6911f974ba892b023",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0flczcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1614888660,
    value: "1000000000000000",
  },
  {
    hash: "5f492f5b6158b9afa0lc25aca8bd5ca33d5f1dcb9057987f0b0fbc2b2cf8f735",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0lc5zcj8r3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1614851766,
    value: "1000000000000000",
  },
  {
    hash: "5e80ca9b2631f2aa4a9c5lc1ff4e846da04d973b35b58acaec2510a66ea12410",
    receiver: targetErdAdress,
    receiverShard: 0,
    sender: "erd19kzxa002kd7jyksc0fd5zclcr3qyl6h4eafx82kmnvxurmvp2n7sav9vg8",
    senderShard: 1,
    status: "success",
    timestamp: 1614851622,
    value: "1000000000000000",
  },
] as ElrondTransaction[];

const lastRestart = getTime(sub(new Date(), { days: 1 })) * 0.001;

describe("Maiar integration testing", () => {
  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();
  });

  describe("handleTransactions", () => {
    const handleTransactions = transactionsHandler(baseUser, lastRestart);

    describe("when no new transaction hash is met", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      beforeAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(
          baseLastTxs.map(({ hash }) => hash)
        );
      });

      afterAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call reactToNewTransaction and setAlreadyListennedTransactions", async () => {
        await handleTransactions(
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm",
          baseLastTxs
        );

        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(0);
        expect(
          mockedRedis.setAlreadyListennedTransactions
        ).toHaveBeenCalledTimes(0);
      });
    });

    describe("when one new tx hash is met", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      const newTransaction = {
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        hash:
          "lcb6304f15d0cbb73a654d6544876a9bef77d24a09b3bba6a161a156b726lcd2",
        receiver: targetErdAdress,
        receiverShard: 0,
        sender:
          "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7lcv9vg8",
        senderShard: 1,
        status: "success",
        value: "1000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(
          baseLastTxs.map(({ hash }) => hash)
        );
      });

      afterAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should not call neither reactToNewTransaction or setNewBalance", async () => {
        await handleTransactions(targetErdAdress, [
          newTransaction,
          ...baseLastTxs,
        ]);

        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedBlockchainInteraction.reactToNewTransaction
        ).toHaveBeenCalledWith(newTransaction, baseUser);

        expect(
          mockedRedis.setAlreadyListennedTransactions
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedRedis.setAlreadyListennedTransactions
        ).toHaveBeenCalledWith(targetErdAdress, [newTransaction.hash]);
      });
    });

    describe("when three new transactions hash are met", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedBlockchainInteraction = blockchainInteraction as jest.Mocked<
        typeof blockchainInteraction
      >;

      const newTransaction1 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
        hash:
          "lcb6304f15d0cbb73a654d6544876a9bef77d24a09b3bba6a161a156b726lcd2",
        receiverShard: 0,
        sender:
          "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7lcv9vg8",
        senderShard: 1,
        status: "success",
        value: "1000000000000000",
      } as ElrondTransaction;

      const newTransaction2 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 2 })) * 0.001,
        hash:
          "lcb6304f15d0cbb71a654d6544876a9bef77d24a09b3bba6a161a156b726lcd2",
        receiverShard: 0,
        sender:
          "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7lcv9vg8",
        senderShard: 1,
        status: "success",
        value: "1000000000000000",
      } as ElrondTransaction;

      const newTransaction3 = {
        receiver: targetErdAdress,
        timestamp: getTime(sub(new Date(), { minutes: 1 })) * 0.001,
        hash:
          "lcb6304f15d0cbb73a154d6544876a9bef77d24a09b3bba6a161a156b726lcd2",
        receiverShard: 0,
        sender:
          "erd19kzxa002kd7jyksc0fd5zcj8r3qyl6h4eafx82kmnvxurmvp2n7lcv9vg8",
        senderShard: 1,
        status: "success",
        value: "1000000000000000",
      } as ElrondTransaction;

      beforeAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(
          baseLastTxs.map(({ hash }) => hash)
        );
      });

      afterAll(() => {
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedBlockchainInteraction.reactToNewTransaction.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call reactToNewTransaction and setAlreadyListennedTransactions", async () => {
        await handleTransactions(targetErdAdress, [
          newTransaction1,
          newTransaction2,
          newTransaction3,
          ...baseLastTxs,
        ]);

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

        expect(
          mockedRedis.setAlreadyListennedTransactions
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedRedis.setAlreadyListennedTransactions
        ).toHaveBeenCalledWith(targetErdAdress, [
          newTransaction1.hash,
          newTransaction2.hash,
          newTransaction3.hash,
        ]);
      });
    });
  });

  describe("activateBlockchainMonitoring", () => {
    const mockedPoll = poll as jest.Mocked<typeof poll>;

    afterAll(() => mockedPoll.pollTransactions.mockClear());

    test("", async () => {
      await launchBlockchainMonitoring(baseUser.herotag, baseUser);

      expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(1);
      expect(mockedPoll.pollTransactions).toHaveBeenCalledWith(
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
        mockedPoll.pollTransactions.mockClear();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toBe(undefined);

        expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling off", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.pollTransactions.mockClear();

        await User.deleteMany();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(
          baseUser.herotag,
          false
        );

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling on", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.pollTransactions.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(1);
        expect(mockedPoll.pollTransactions).toHaveBeenCalledWith(
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
        mockedPoll.pollTransactions.mockClear();
      });

      it("should start blockchain monitoring", async () => {
        await resumeBlockchainMonitoring();

        expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(0);
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
        mockedPoll.pollTransactions.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const results = await resumeBlockchainMonitoring();

        expect(results.sort()).toEqual([
          createdUser2.herotag,
          createdUser1.herotag,
        ]);

        expect(mockedPoll.pollTransactions).toHaveBeenCalledTimes(2);

        expect(mockedPoll.pollTransactions).toHaveBeenCalledWith(
          createdUser1.herotag,
          expect.any(Function),
          expect.any(Function)
        );

        expect(mockedPoll.pollTransactions).toHaveBeenCalledWith(
          createdUser2.herotag,
          expect.any(Function),
          expect.any(Function)
        );
      });
    });
  });
});
