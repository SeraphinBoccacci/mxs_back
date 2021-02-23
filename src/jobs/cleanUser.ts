import sub from "date-fns/sub";

import User, { UserAccountStatus } from "../models/User";
import { connectToDatabase } from "../services/mongoose";

export const cleanUnverifiedUserAccount = async (): Promise<void> => {
  const result = await User.deleteMany({
    status: UserAccountStatus.PENDING_VERIFICATION,
    $or: [
      {
        verificationStartDate: { $lt: sub(new Date(), { minutes: 10 }) },
      },
      {
        verificationStartDate: { $exists: true },
      },
    ],
  });
};

connectToDatabase().then(async () => {
  await cleanUnverifiedUserAccount();

  setInterval(async () => {
    await cleanUnverifiedUserAccount();
  }, 1000 * 60 * 60 * 10);
});
