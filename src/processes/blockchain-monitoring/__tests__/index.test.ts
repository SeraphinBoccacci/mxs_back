/* eslint-disable @typescript-eslint/no-var-requires */
import { getTime, sub } from "date-fns";
import mongoose from "mongoose";

import { ElrondTransaction } from "../../../interfaces";
import { UserType } from "../../../models/User";
import { findNewIncomingTransactions } from "../";

const baseUser = {
  _id: mongoose.Types.ObjectId("6025884242b45cd7572870b3"),
  herotag: "serabocca06.elrond",
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
  },
  isStreaming: true,
  streamingStartDate: sub(new Date(), { hours: 4 }),
};

describe("Blockchain monitoring unit testing", () => {
  describe("findNewIncomingTransactions", () => {
    const baseTxs: ElrondTransaction[] = [
      {
        hash:
          "bc0544d0d15f9be2fdbab0ee4234a07b72ad2bd4f2e8f2aa484f5d62c3f5971d",
        fee: "93500000000000",
        miniBlockHash:
          "a43aa259f098a9b872fe3343ec31a1134bc879db7016208c1222da6f2d62ee8a",
        nonce: 151866,
        round: 2880837,
        value: "454419163369324620",
        receiver:
          "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
        sender:
          "erd1au4chwnhwl6uhykpuydzagc8qekwwmpar0v0m2xkjjfm52hp6veszyz54d",
        receiverShard: 2,
        senderShard: 1,
        gasPrice: 1000000000,
        gasLimit: 100000,
        gasUsed: 93500,
        data: "cmV3YXJkc0F0Q2hlY2twb2ludDE2MTMzNDcyNDU=",
        signature:
          "30e7c732a0f4c528ad8d3c701db690f0ff450c72d8dd0e0f4d79cce4ca7fb26d793555c65548b9ab4ffe8d5d868aa3ed52a2d37f2905fbbd166d8233a1a39f07",
        timestamp: 1613402646,
        status: "success",
        searchOrder: 7,
      },
      {
        hash:
          "488cc8b73b06c60574564e39217382be63325228ebe7f6133ca571ea8524f53f",
        fee: "87500000000000",
        miniBlockHash:
          "123bcf58ac1849f93e03d3bacf4231b7f14200f207771c059aa95602bf0a2bc6",
        nonce: 28,
        round: 2876481,
        value: "1243000000000000",
        receiver:
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
        sender:
          "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
        receiverShard: 0,
        senderShard: 2,
        gasPrice: 1000000000,
        gasLimit: 87500,
        gasUsed: 87500,
        data: "VGVzdCAhIEl0IHdvcmtlZCB0aG91Z2ggIQ==",
        signature:
          "dfc34291bf93c479674023ace3e40d30b9e0572e8cd91e8fcfca1fa4668a1f039f294f498f1c508accc8c26f3632e7e46df5c322b5d10787dd5a9f78e40ff00b",
        timestamp: 1613376510,
        status: "success",
        searchOrder: 1,
      },
      {
        hash:
          "a950110e448148fa84df1c3ed8fb4b41cb85df56ae0630ddde2fb72deacfc634",
        fee: "74000000000000",
        miniBlockHash:
          "e420aff535fa905caa7ec554d9333cb608a7bc16c010ad8ae990d4ae52ae6f2c",
        nonce: 27,
        round: 2876465,
        value: "134253000000000",
        receiver:
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
        sender:
          "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
        receiverShard: 0,
        senderShard: 2,
        gasPrice: 1000000000,
        gasLimit: 74000,
        gasUsed: 74000,
        data: "SGV5ICEgSXQgd29ya3MgIQ==",
        signature:
          "eb47dc391b4105e35a7d4fd9d39c91d6d3fe21e958a9caa11a7a94ba4c8010f1d0503e175e8ae321a42b305181d86eae96d9e06504746999171ca0ba24b4a105",
        timestamp: 1613376414,
        status: "success",
        searchOrder: 0,
      },
      {
        hash:
          "b812b20e04c57e2ff225a31342fb76b0bdbdf5707157d90f6889bad6aab3472e",
        fee: "86000000000000",
        miniBlockHash:
          "05a08c44ebc9cf87f1cf5dcd6eb6571af3202bc94a4c48c5708157ec5f276e2c",
        nonce: 26,
        round: 2876438,
        value: "142530000000000",
        receiver:
          "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8",
        sender:
          "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
        receiverShard: 0,
        senderShard: 2,
        gasPrice: 1000000000,
        gasLimit: 86000,
        gasUsed: 86000,
        data: "SGVsbG8gISBUZXN0IDE1IGZlYnJ1YXJ5",
        signature:
          "899d96e7cbd117c52e1279177416b29afc3292a489a0a407212bc71596027314f33199cdef4fa2837c5d72de1a7e3dbf383fb53218e2fb350408ac162a26d00c",
        timestamp: 1613376252,
        status: "success",
        searchOrder: 1,
      },
    ];

    describe("when there is no last balance snapshot", () => {
      describe("when at least one filter does not match", () => {
        describe("when receiver address does not match target address", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver:
                "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
              timestamp: getTime(sub(new Date(), { hours: 1 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              null
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when user hasn't streamingStartDate", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 1 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              { ...(baseUser as UserType), streamingStartDate: null },
              null
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when tx timestamp is smaller than user streamingStartDate", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 6 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              null
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when status is not success", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 3 })) * 0.001,
              status: "failed",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              null
            );

            expect(newTxs).toHaveLength(0);
          });
        });
      });

      describe("when receiver address match target address, user has streamingStartDate,  tx timestamp is greater or equal to user streamingStartDate, status is success", () => {
        it("should return tx", () => {
          const targetErdAdress =
            "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
          const timestamp = getTime(sub(new Date(), { hours: 3 })) * 0.001;
          const matchingTx = {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          } as ElrondTransaction;

          const newTxs = findNewIncomingTransactions(
            [...baseTxs, matchingTx],
            targetErdAdress,
            baseUser as UserType,
            null
          );

          expect(newTxs).toHaveLength(1);

          expect(newTxs).toEqual([matchingTx]);
        });
      });

      describe("when many txs match filters", () => {
        it("should return txs", () => {
          const targetErdAdress =
            "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
          const timestamp = getTime(sub(new Date(), { hours: 3 })) * 0.001;
          const timestamp2 = getTime(sub(new Date(), { hours: 2 })) * 0.001;
          const matchingTx1 = {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          } as ElrondTransaction;
          const matchingTx2 = {
            hash:
              "b7334dbf756d24fff81ee49eac98b1be7993345bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp: timestamp2,
            status: "success",
          } as ElrondTransaction;

          const newTxs = findNewIncomingTransactions(
            [...baseTxs, matchingTx1, matchingTx2],
            targetErdAdress,
            baseUser as UserType,
            null
          );

          expect(newTxs).toHaveLength(2);

          expect(newTxs).toEqual([matchingTx1, matchingTx2]);
        });
      });
    });

    describe("when there is last balance snapshot", () => {
      describe("when at least one filter does not match", () => {
        describe("when receiver address does not match target address", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver:
                "erd1tdadwyyk3llcpj5mwsy4qej5vcv3yg95y2gv2pav7a6zv6r4lpfqmce9kv",
              timestamp: getTime(sub(new Date(), { hours: 1 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              {
                amount: "1000000000000000000",
                timestamp: getTime(sub(new Date(), { hours: 2 })) * 0.001,
              }
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when user hasn't streamingStartDate", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 1 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              { ...(baseUser as UserType), streamingStartDate: null },
              {
                amount: "1000000000000000000",
                timestamp: getTime(sub(new Date(), { hours: 2 })) * 0.001,
              }
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when tx timestamp is smaller than user streamingStartDate", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 6 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              {
                amount: "1000000000000000000",
                timestamp: getTime(sub(new Date(), { hours: 7 })) * 0.001,
              }
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when tx timestamp is smaller than last balance snapshot timestamp", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 3 })) * 0.001,
              status: "success",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              {
                amount: "1000000000000000000",
                timestamp: getTime(sub(new Date(), { hours: 2 })) * 0.001,
              }
            );

            expect(newTxs).toHaveLength(0);
          });
        });

        describe("when status is not success", () => {
          it("should not return tx", () => {
            const targetErdAdress =
              "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
            const notMatchingTx = {
              receiver: targetErdAdress,
              timestamp: getTime(sub(new Date(), { hours: 3 })) * 0.001,
              status: "failed",
            } as ElrondTransaction;

            const newTxs = findNewIncomingTransactions(
              [...baseTxs, notMatchingTx],
              targetErdAdress,
              baseUser as UserType,
              {
                amount: "1000000000000000000",
                timestamp: getTime(sub(new Date(), { hours: 2 })) * 0.001,
              }
            );

            expect(newTxs).toHaveLength(0);
          });
        });
      });

      describe("when receiver address match target address, user has streamingStartDate,  tx timestamp is greater or equal to user streamingStartDate, status is success", () => {
        it("should return tx", () => {
          const targetErdAdress =
            "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
          const timestamp = getTime(sub(new Date(), { hours: 1 })) * 0.001;
          const matchingTx = {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          } as ElrondTransaction;

          const newTxs = findNewIncomingTransactions(
            [...baseTxs, matchingTx],
            targetErdAdress,
            baseUser as UserType,
            {
              amount: "1000000000000000000",
              timestamp: getTime(sub(new Date(), { hours: 2 })) * 0.001,
            }
          );

          expect(newTxs).toHaveLength(1);

          expect(newTxs).toEqual([matchingTx]);
        });
      });

      describe("when many txs match filters", () => {
        it("should return txs", () => {
          const targetErdAdress =
            "erd1zr6yyqxq5p7cxk5e08kjm8dwdccla6r9v6hz4qjjkhtefgzf30uqxk06r8";
          const timestamp = getTime(sub(new Date(), { minutes: 3 })) * 0.001;
          const timestamp2 = getTime(sub(new Date(), { minutes: 2 })) * 0.001;
          const matchingTx1 = {
            hash:
              "b7334dbf756d24a381ee49eac98b1be7993ee1bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp,
            status: "success",
          } as ElrondTransaction;
          const matchingTx2 = {
            hash:
              "b7334dbf756d24fff81ee49eac98b1be7993345bc8932c7d6c7b914c123bc56666",
            receiver: targetErdAdress,
            timestamp: timestamp2,
            status: "success",
          } as ElrondTransaction;

          const newTxs = findNewIncomingTransactions(
            [...baseTxs, matchingTx1, matchingTx2],
            targetErdAdress,
            baseUser as UserType,
            {
              amount: "1000000000000000000",
              timestamp: getTime(sub(new Date(), { minutes: 14 })) * 0.001,
            }
          );

          expect(newTxs).toHaveLength(2);

          expect(newTxs).toEqual([matchingTx1, matchingTx2]);
        });
      });
    });
  });
});
