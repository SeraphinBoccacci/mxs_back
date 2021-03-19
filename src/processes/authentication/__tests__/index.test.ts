import mongoose from "mongoose";

import User from "../../../models/User";
import { connectToDatabase } from "../../../services/mongoose";
import * as utilTransactions from "../../../utils/transactions";
import {
  validateAccountCreationData,
  validateAuthenticationData,
} from "../index";

jest.mock("../../../utils/transactions", () => {
  const module = jest.requireActual("../../../utils/transactions");
  return { ...module, getErdAddressFromHerotag: jest.fn() };
});

const mockedUtilTransactions = utilTransactions as jest.Mocked<
  typeof utilTransactions
>;

describe("auth unit testing", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe("validateAccountCreationData", () => {
    test("when data is missing, it should throw", () => {
      expect(validateAccountCreationData(undefined)).rejects.toThrow(
        "MISSING_DATA_FOR_ACCOUNT_CREATION"
      );
    });

    test("when herotag is missing, it should throw", () => {
      expect(
        validateAccountCreationData({
          password: "helloWorld06",
          confirm: "helloWorld06",
        })
      ).rejects.toThrow("MISSING_DATA_FOR_ACCOUNT_CREATION");
    });

    test("when password is missing, it should throw", () => {
      expect(
        validateAccountCreationData({
          herotag: "serabocca06",
          confirm: "helloWorld06",
        })
      ).rejects.toThrow("MISSING_DATA_FOR_ACCOUNT_CREATION");
    });

    test("when confirm is missing, it should throw", () => {
      expect(
        validateAccountCreationData({
          herotag: "serabocca06",
          password: "helloWorld06",
        })
      ).rejects.toThrow("MISSING_DATA_FOR_ACCOUNT_CREATION");
    });

    test("when confirm and password does not match", () => {
      expect(
        validateAccountCreationData({
          herotag: "serabocca06",
          password: "helloWorld06",
          confirm: "helloWorld07",
        })
      ).rejects.toThrow("PASSWORD_AND_CONFIRM_NOT_MATCHING");
    });

    describe("when elrond dns does not find any address for herotag", () => {
      beforeAll(() => {
        mockedUtilTransactions.getErdAddressFromHerotag.mockResolvedValue("");
      });

      afterAll(() => {
        mockedUtilTransactions.getErdAddressFromHerotag.mockRestore();
      });

      it("should throw", () => {
        expect(
          validateAccountCreationData({
            herotag: "serabocca06",
            password: "helloWorld06",
            confirm: "helloWorld06",
          })
        ).rejects.toThrow("COULD_NOT_FIND_HETOTAG_ON_DNS");
      });
    });

    describe("when the herotag is already registered", () => {
      beforeAll(async () => {
        mockedUtilTransactions.getErdAddressFromHerotag.mockResolvedValue(
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8"
        );

        await User.create({
          herotag: "serabocca06.elrond",
          verificationStartDate: new Date(),
          verificationReference: "test",
          password: "test",
          status: 1,
        });
      });

      afterAll(async () => {
        mockedUtilTransactions.getErdAddressFromHerotag.mockRestore();

        await User.deleteMany();
      });

      it("should throw", async () => {
        expect(
          validateAccountCreationData({
            herotag: "serabocca06.elrond",
            password: "helloWorld06",
            confirm: "helloWorld06",
          })
        ).rejects.toThrow("ALREADY_REGISTERED_USER");
      });
    });
  });

  describe("validateAuthenticationData", () => {
    test("when data is missing, it should throw", () => {
      expect(() => validateAuthenticationData(undefined)).toThrow(
        "FORM_MISSING_DATA_FOR_AUTHENTICATION"
      );
    });

    test("when herotag is missing, it should throw", () => {
      expect(() =>
        validateAuthenticationData({
          password: "helloWorld06",
        })
      ).toThrow("FORM_MISSING_DATA_FOR_AUTHENTICATION");
    });

    test("when password is missing, it should throw", () => {
      expect(() =>
        validateAuthenticationData({
          herotag: "serabocca06",
        })
      ).toThrow("FORM_MISSING_DATA_FOR_AUTHENTICATION");
    });
  });
});
