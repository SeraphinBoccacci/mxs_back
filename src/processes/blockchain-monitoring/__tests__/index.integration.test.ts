/** @format */

import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

import User, { UserType } from "../../../models/User";

jest.mock("../../../services/elrond");
import * as elrond from "../../../services/elrond";
import { ElrondTransaction } from "../../../types";

jest.mock("../../../redis");
import * as redis from "../../../redis";

jest.mock("../../../utils/poll");
import * as poll from "../../../utils/poll";

jest.mock("../../blockchain-interaction");
import { connectToDatabase } from "../../../services/mongoose";
import { balanceHandler, launchBlockchainMonitoring, resumeBlockchainMonitoring, toggleBlockchainMonitoring } from "../";

const baseUser = {
  _id: mongoose.Types.ObjectId(),
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

const targetErdAdress = "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm";

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

// const lastRestart = getTime(sub(new Date(), { days: 1 })) * 0.001;

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
    const handleTransaction = jest.fn();
    const handleBalance = balanceHandler(targetErdAdress, handleTransaction);

    describe("when balance there is no balance returned by elrond", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should not call neither getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(0);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when balance there is no balance in redis yet", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedElrond.getUpdatedBalance.mockResolvedValue("1000000000000000000");
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue(null);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
      });
    });

    describe("when balance is not updated", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      beforeAll(() => {
        mockedRedis.getLastBalanceSnapShot.mockResolvedValue({
          amount: "1000000000000000000",
          timestamp: getTime(sub(new Date(), { minutes: 10 })) * 0.001,
        });
        mockedElrond.getUpdatedBalance.mockResolvedValue("1000000000000000000");
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call neither getUpdatedBalance and getLastBalanceSnapShot, but not setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(0);
      });
    });

    describe("when balance is updated", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

      const updatedAmount = "11000000000000000000";

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
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(baseLastTxs.map(({ hash }) => hash));

        mockedElrond.getLastTransactions.mockResolvedValue([newTransaction]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot, setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(targetErdAdress, updatedAmount);
      });
    });

    describe("when balance is updated and there is three new transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

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
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedRedis.getAlreadyListennedTransactions.mockResolvedValue(baseLastTxs.map(({ hash }) => hash));

        mockedElrond.getLastTransactions.mockResolvedValue([newTransaction1, newTransaction2, newTransaction3]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should call getUpdatedBalance, getLastBalanceSnapShot and setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(targetErdAdress, updatedAmount);
      });
    });

    describe("when balance is updated, there is one new transaction and three old transactions", () => {
      const mockedRedis = redis as jest.Mocked<typeof redis>;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;

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
        mockedElrond.getUpdatedBalance.mockResolvedValue(updatedAmount);

        mockedElrond.getLastTransactions.mockResolvedValue([...oldTransactions, newTransaction]);
      });

      afterAll(() => {
        mockedElrond.getUpdatedBalance.mockClear();

        mockedRedis.setNewBalance.mockClear();
        mockedRedis.getLastBalanceSnapShot.mockClear();
        mockedRedis.getAlreadyListennedTransactions.mockClear();
        mockedRedis.setAlreadyListennedTransactions.mockClear();
      });

      it("should not call neither getLastTransactions, reactToNewTransaction or setNewBalance", async () => {
        await handleBalance();

        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getUpdatedBalance).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledTimes(1);
        expect(mockedRedis.getLastBalanceSnapShot).toHaveBeenCalledWith(targetErdAdress);

        expect(mockedRedis.setNewBalance).toHaveBeenCalledTimes(1);
        expect(mockedRedis.setNewBalance).toHaveBeenCalledWith(targetErdAdress, updatedAmount);
      });
    });
  });

  describe("activateBlockchainMonitoring", () => {
    const mockedPoll = poll as jest.Mocked<typeof poll>;

    afterAll(() => mockedPoll.poll.mockClear());
    beforeAll(() => mockedPoll.poll.mockClear());

    test("", async () => {
      await launchBlockchainMonitoring(baseUser.herotag, baseUser);

      expect(mockedPoll.poll).toHaveBeenCalledTimes(1);
      expect(mockedPoll.poll).toHaveBeenCalledWith(expect.any(Function), 2000, expect.any(Function));
    });
  });

  describe("toggleBlockchainMonitoring", () => {
    describe("when no user is found", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(() => {
        mockedPoll.poll.mockClear();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toBe(undefined);

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling off", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should not start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, false);

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when user is toggling on", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser: UserType;

      beforeAll(async () => {
        createdUser = (await User.create(baseUser)).toObject();
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const result = await toggleBlockchainMonitoring(baseUser.herotag, true);

        expect(result).toMatchObject({
          _id: createdUser._id,
          herotag: createdUser.herotag,
          integrations: createdUser.integrations,
        });

        expect(mockedPoll.poll).toHaveBeenCalledTimes(1);
        expect(mockedPoll.poll).toHaveBeenCalledWith(expect.any(Function), 2000, expect.any(Function));
      });
    });
  });

  describe("resumeBlockchainMonitoring", () => {
    describe("when no user is found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;

      afterAll(async () => {
        mockedPoll.poll.mockClear();
      });

      it("should start blockchain monitoring", async () => {
        await resumeBlockchainMonitoring();

        expect(mockedPoll.poll).toHaveBeenCalledTimes(0);
      });
    });

    describe("when two users are found with isStreaming = true", () => {
      const mockedPoll = poll as jest.Mocked<typeof poll>;
      let createdUser1: UserType;
      let createdUser2: UserType;

      beforeAll(async () => {
        createdUser1 = await User.create({
          ...baseUser,
          _id: mongoose.Types.ObjectId(),
        });
        createdUser2 = await User.create({
          ...baseUser,
          _id: mongoose.Types.ObjectId(),
          herotag: "remdem.elrond",
        });
      });

      afterAll(async () => {
        mockedPoll.poll.mockClear();

        await User.deleteMany();
      });

      it("should start blockchain monitoring", async () => {
        const results = await resumeBlockchainMonitoring();

        expect(results.sort()).toEqual([createdUser2.herotag, createdUser1.herotag]);

        expect(mockedPoll.poll).toHaveBeenCalledTimes(2);

        expect(mockedPoll.poll).toHaveBeenCalledWith(expect.any(Function), 2000, expect.any(Function));

        expect(mockedPoll.poll).toHaveBeenCalledWith(expect.any(Function), 2000, expect.any(Function));
      });
    });
  });
});
