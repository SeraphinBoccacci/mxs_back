import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getHashedPassword = (password: string) => {
  return new Promise((resolve, reject) =>
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) reject(err);

      resolve(hash);
    })
  );
};

export const verifyPassword = (
  password: string,
  hash: string
): Promise<void> => {
  return new Promise((resolve, reject) =>
    bcrypt.compare(password, hash, function(err, result) {
      if (err) reject(err);

      if (!result) throw new Error("INVALID_PASSWORD");

      resolve();
    })
  );
};

export const generateJwt = (herotag: string) => {
  return jwt.sign(
    {
      herotag: herotag,
    },
    "Curtness24Radium89Honestly41Memo's83Casuals35cherishes09Sanctification97restarting42slot's28ephemerides",
    { expiresIn: 60 * 60 * 4 }
  );
};
