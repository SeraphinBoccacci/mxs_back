import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

import { connectToDatabase } from "../../../services/mongoose";

jest.mock("../../../elrond");
import * as elrond from "../../../elrond";
import { ElrondTransaction } from "../../../interfaces";
import User, { UserAccountStatus, UserType } from "../../../models/User";

jest.mock("../../../utils/transactions", () => {
  const module = jest.requireActual("../../../utils/transactions");

  return {
    ...module,
    getErdAddressFromHerotag: jest.fn(),
    normalizeHerotag: jest.fn(),
  };
});
import * as transactions from "../../../utils/transactions";
import {
  authenticateUser,
  createUserAccount,
  getVerificationReference,
  isProfileVerified,
  verifyIfTransactionHappened,
} from "..";

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
          "serabocca06.elrond"
        );

        mockedTransactions.normalizeHerotag.mockReturnValue(
          "serabocca06.elrond"
        );
      });

      afterAll(async () => {
        mockedTransactions.getErdAddressFromHerotag.mockClear();

        await User.deleteMany();
      });

      it("should create a user with status pending", async () => {
        await createUserAccount({
          herotag: "serabocca06.elrond",
          password: "test",
          confirm: "test",
        });

        const user = await User.findOne().lean();

        expect(user).not.toBe(null);

        expect((user as UserType).herotag).toEqual("serabocca06.elrond");
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
          authenticateUser({ herotag: "serabocca06.elrond", password: "test" })
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
            herotag: "serabocca06.elrond",
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
            herotag: "serabocca06.elrond",
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
          herotag: "serabocca06.elrond",
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
        const result = await isProfileVerified("serabocca06.elrond");

        expect(result).toBe(false);
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
        const result = await isProfileVerified("serabocca06.elrond");

        expect(result).toBe(false);
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
        const result = await isProfileVerified("serabocca06.elrond");

        expect(result).toBe(true);
      });
    });
  });

  describe("getVerificationReference", () => {
    describe("when no user is found with this herotag", () => {
      it("should return true", async () => {
        const result = await getVerificationReference("serabocca06.elrond");

        expect(result).toBe(null);
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
        const result = await getVerificationReference("serabocca06.elrond");

        expect(result).toBe("verificationReference_test");
      });
    });
  });

  describe("verifyIfTransactionHappened", () => {
    describe("when no transactions contains verificationReference", () => {
      const mockedTransactions = transactions as jest.Mocked<
        typeof transactions
      >;
      let user: UserType;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      beforeAll(async () => {
        user = await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
        });

        mockedTransactions.getErdAddressFromHerotag.mockResolvedValue(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        mockedElrond.getLastTransactions.mockResolvedValue([
          {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c12atfc56666",
            receiver:
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
            timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
            status: "success",
          } as ElrondTransaction,
        ]);
      });

      afterAll(async () => {
        await User.deleteMany();

        mockedTransactions.getErdAddressFromHerotag.mockClear();
        mockedElrond.getLastTransactions.mockClear();
      });

      it("should not set status to", async () => {
        await verifyIfTransactionHappened(user);

        const updatedUser = await User.findOne({
          herotag: baseUser.herotag,
        }).lean();

        expect(
          mockedTransactions.getErdAddressFromHerotag
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedTransactions.getErdAddressFromHerotag
        ).toHaveBeenNthCalledWith(1, "serabocca06.elrond");

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenNthCalledWith(
          1,
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        expect((updatedUser as UserType).status).toEqual(
          UserAccountStatus.PENDING_VERIFICATION
        );
      });
    });

    describe("when one transaction contains verificationReference", () => {
      const mockedTransactions = transactions as jest.Mocked<
        typeof transactions
      >;
      let user: UserType;
      const mockedElrond = elrond as jest.Mocked<typeof elrond>;
      beforeAll(async () => {
        user = await User.create({
          ...baseUser,
          status: UserAccountStatus.PENDING_VERIFICATION,
          verificationReference: "MyeTg9HJrW",
        });

        mockedTransactions.getErdAddressFromHerotag.mockResolvedValue(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        mockedElrond.getLastTransactions.mockResolvedValue([
          {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver:
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
            timestamp: getTime(sub(new Date(), { minutes: 3 })) * 0.001,
            data: "TXllVGc5SEpyVw==",
            status: "success",
          } as ElrondTransaction,
        ]);
      });

      afterAll(async () => {
        await User.deleteMany();

        mockedTransactions.getErdAddressFromHerotag.mockClear();
        mockedElrond.getLastTransactions.mockClear();
      });

      it("should return true", async () => {
        await verifyIfTransactionHappened(user);

        const updatedUser = await User.findOne({
          herotag: baseUser.herotag,
        }).lean();

        expect(
          mockedTransactions.getErdAddressFromHerotag
        ).toHaveBeenCalledTimes(1);
        expect(
          mockedTransactions.getErdAddressFromHerotag
        ).toHaveBeenNthCalledWith(1, "serabocca06.elrond");

        expect(mockedElrond.getLastTransactions).toHaveBeenCalledTimes(1);
        expect(mockedElrond.getLastTransactions).toHaveBeenNthCalledWith(
          1,
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        expect((updatedUser as UserType).status).toEqual(
          UserAccountStatus.VERIFIED
        );
      });
    });
  });
});
