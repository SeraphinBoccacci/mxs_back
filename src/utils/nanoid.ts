import { nanoid } from "nanoid";

import User from "../models/User";
import { UserAccountStatus } from "../types/user";

export const generateNewVerificationReference = async (): Promise<string> => {
  const reference = nanoid(10);

  if (
    await User.exists({
      verificationReference: reference,
      status: UserAccountStatus.PENDING_VERIFICATION,
    })
  )
    return generateNewVerificationReference();

  return reference;
};
