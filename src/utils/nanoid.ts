import { nanoid } from "nanoid";

import User, { UserAccountStatus } from "../models/User";

export const generateNewVerificationReference = async (): Promise<string> => {
  const reference = nanoid(10);

  if (
    await User.exists({
      verificationReference: reference,
      status: UserAccountStatus.PENDING_VERIFICATION,
    })
  )
    return await generateNewVerificationReference();

  return reference;
};
