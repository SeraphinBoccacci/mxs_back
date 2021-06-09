import User from "../models/User";
import { UserAccountStatus } from "../types/user";

const randomString = (length = 10) => {
  const chars = "ABCDEFGHKMNPQRSTUVWXZ23456789";

  const a = new Array(length).fill("");

  const string = a.reduce((prevString) => {
    return prevString + chars.charAt(Math.floor(Math.random() * chars.length));
  }, "");

  return string;
};

export const generateNewVerificationReference = async (): Promise<string> => {
  const reference = randomString(10);

  if (
    await User.exists({
      verificationReference: reference,
      status: UserAccountStatus.PENDING_VERIFICATION,
    })
  )
    return generateNewVerificationReference();

  return reference;
};
