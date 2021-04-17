/** @format */

import bcrypt from "bcrypt";

export const getHashedPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) reject(err);

      resolve(hash);
    }),
  );
};

export const verifyPassword = (password: string, hash: string): Promise<void> => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(password, hash, function (err, result) {
      if (err) reject(err);

      if (!result) reject(new Error("INVALID_PASSWORD"));

      resolve();
    }),
  );
};
