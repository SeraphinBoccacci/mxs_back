import jwt from "jsonwebtoken";

import { ENV } from "../utils/env";

/**
 * Interface for JWT Payload.
 */
export interface JwtDecoded {
    herotag: string;
}

/**
 * Sign a payload with JWT and env passphrase.
 *
 * @param herotag {string} - The herotag to encode.
 * @returns {string} - The signed payload.
 */
export const jwtSign = (herotag: string): string => {
    if (!ENV.JWT_PASSPHRASE) {
        throw new Error("JWT: No passphrase has been set for 'JWT_PASSPHRASE");
    }
    return jwt.sign({ herotag: herotag }, `${ENV.JWT_PASSPHRASE}`, { expiresIn: 60 * 60 * 4 });
};

/**
 * Decode JWT payload.
 *
 * @param token {string} - The token to decode.
 * @returns {string} - The decoded payload.
 */
export const jwtPayload = (token: string): JwtDecoded => {
    if (!ENV.JWT_PASSPHRASE) {
        throw new Error("JWT: No passphrase has been set for 'JWT_PASSPHRASE");
    }
    return <JwtDecoded>jwt.verify(token, `${ENV.JWT_PASSPHRASE}`);
};
