import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

import User from "../../../models/User";
import { connectToDatabase } from "../../../services/mongoose";

jest.mock("../../../services/elrond");
import * as elrond from "../../../services/elrond";
import { ElrondTransaction } from "../../../types/elrond";

jest.mock("../../../utils/transactions", () => {
  const module = jest.requireActual("../../../utils/transactions");

  return {
    ...module,
    getErdAddressFromHerotag: jest.fn(),
    normalizeHerotag: jest.fn(),
  };
});
import { UserAccountStatus, UserType } from "../../../types/user";
import * as transactions from "../../../utils/transactions";
import {
  activateAccountIfTransactionHappened,
  authenticateUser,
  createUserAccount,
  getVerificationReference,
  isProfileVerified,
} from "..";

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

describe("Auth integration testing", () => {
  beforeAll(async () => {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();

    mongoose.disconnect();
  });

  describe("createUserAccount", () => {
    describe("when data is not ok", () => {
      it("should throw", async () => {
        expect(createUserAccount({})).rejects.toThrow(
          "MISSING_DATA_FOR_ACCOUNT_CREATION"
        );
      });
    });

    describe("when data is ok", () => {
      const mockedTransactions = transactions as jest.Mocked<
        typeof transactions
      >;

      beforeAll(() => {
        mockedTransactions.getErdAddressFromHerotag.mockResolvedValue(
          "streamparticles.elrond"
        );

        mockedTransactions.normalizeHerotag.mockReturnValue(
          "streamparticles.elrond"
        );
      });

      afterAll(async () => {
        mockedTransactions.getErdAddressFromHerotag.mockClear();

        await User.deleteMany();
      });

      it("should create a user with status pending", async () => {
        await createUserAccount({
          herotag: "streamparticles.elrond",
          password: "test",
          confirm: "test",
        });

        const user = await User.findOne().lean();

        expect(user).not.toBe(null);

        expect((user as UserType).herotag).toEqual("streamparticles.elrond");
        expect((user as UserType).status).toEqual(0);

        expect(user).toHaveProperty("password");
        expect(user).toHaveProperty("verificationReference");
        expect(user).toHaveProperty("verificationStartDate");
      });
    });
  });

  describe("authenticateUser", () => {
    describe("when data is not ok", () => {
      it("should throw", async () => {
        expect(authenticateUser({})).rejects.toThrow(
          "FORM_MISSING_DATA_FOR_AUTHENTICATION"
        );
      });
    });

    describe("when data is ok but herotag is not registered in db", () => {
      it("should throw", async () => {
        expect(
          authenticateUser({
            herotag: "streamparticles.elrond",
            password: "test",
          })
        ).rejects.toThrow("INVALID_FORM_NO_REGISTERED_HEROTAG");
      });
    });

    describe("when data is ok, herotag is registered in db but password does not match with hash in db", () => {
      beforeAll(async () => {
        await User.create(baseUser);
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should throw", async () => {
        expect(
          authenticateUser({
            herotag: "streamparticles.elrond",
            password: "test___",
          })
        ).rejects.toThrow("INVALID_PASSWORD");
      });
    });

    describe("when data is ok, herotag is registered in db, password does match with hash in db but account status is pending", () => {
      beforeAll(async () => {
        await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
        });
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should throw", async () => {
        expect(
          authenticateUser({
            herotag: "streamparticles.elrond",
            password: "test",
          })
        ).rejects.toThrow("ACCOUNT_WITH_VERIFICATION_PENDING");
      });
    });

    describe("when data is ok", () => {
      beforeAll(async () => {
        await User.create(baseUser);
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should resolve user and token data", async () => {
        const result = await authenticateUser({
          herotag: "streamparticles.elrond",
          password: "test",
        });

        expect(result.user).toMatchObject(baseUser);
        expect(result).toHaveProperty("token");
        expect(result.expiresIn).toEqual(14400);
      });
    });
  });

  describe("isProfileVerified", () => {
    describe("when no user is found", () => {
      it("should return false", async () => {
        const result = await isProfileVerified("streamparticles.elrond");

        expect(result).toEqual({ isStatusVerified: false });
      });
    });

    describe("when account status is PENDING", () => {
      beforeAll(async () => {
        await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
        });
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should return false", async () => {
        const result = await isProfileVerified("streamparticles.elrond");

        expect(result).toEqual({ isStatusVerified: false });
      });
    });

    describe("when account status is VERIFIED", () => {
      beforeAll(async () => {
        await User.create(baseUser);
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should return true", async () => {
        const result = await isProfileVerified("streamparticles.elrond");

        expect(result).toEqual({ isStatusVerified: true });
      });
    });
  });

  describe("getVerificationReference", () => {
    describe("when no user is found with this herotag", () => {
      it("should return true", async () => {
        const result = await getVerificationReference("streamparticles.elrond");

        expect(result).toEqual({
          accountStatus: null,
          verificationReference: null,
        });
      });
    });

    describe("when user is found with this herotag", () => {
      beforeAll(async () => {
        await User.create(baseUser);
      });

      afterAll(async () => {
        await User.deleteMany();
      });

      it("should return true", async () => {
        const result = await getVerificationReference("streamparticles.elrond");

        expect(result).toEqual({
          accountStatus: 1,
          verificationReference: "verificationReference_test",
        });
      });
    });
  });

  describe("activateAccountIfTransactionHappened", () => {
    describe("when no transactions contains verificationReference", () => {
      let user: UserType;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      beforeAll(async () => {
        user = await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
        });

        mockedElrond.getLastTransactions.mockResolvedValue([
          {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c12atfc56666",
            receiver:
              "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm",
            timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
            status: "success",
          } as ElrondTransaction,
        ]);
      });

      afterAll(async () => {
        await User.deleteMany();

        mockedElrond.getLastTransactions.mockClear();
      });

      it("should not set status to", async () => {
        await activateAccountIfTransactionHappened(user);

        const updatedUser = await User.findOne({
          herotag: baseUser.herotag,
        }).lean();

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenNthCalledWith(
          1,
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );

        expect((updatedUser as UserType).status).toEqual(
          UserAccountStatus.PENDING_VERIFICATION
        );
      });
    });

    describe("when one transaction contains verificationReference", () => {
      let user: UserType;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      beforeAll(async () => {
        user = await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
          verificationReference: "MyeTg9HJrW",
        });

        mockedElrond.getLastTransactions.mockResolvedValue([
          {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver:
              "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm",
            timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
            data: "TXllVGc5SEpyVw==",
            status: "success",
          } as ElrondTransaction,
        ]);
      });

      afterAll(async () => {
        await User.deleteMany();

        mockedElrond.getLastTransactions.mockClear();
      });

      it("should return true", async () => {
        await activateAccountIfTransactionHappened(user);

        const updatedUser = await User.findOne({
          herotag: baseUser.herotag,
        }).lean();

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenNthCalledWith(
          1,
          "erd17s4tupfaju64mw3z472j7l0wau08zyzcqlz0ew5f5qh0luhm43zspvhgsm"
        );

        expect((updatedUser as UserType).status).toEqual(
          UserAccountStatus.VERIFIED
        );
      });
    });
  });
});
