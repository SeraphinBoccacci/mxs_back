import sub from "date-fns/sub";

import User, { UserAccountStatus } from "../models/User";
import logger from "../services/logger";

export const cleanUnverifiedUserAccount = async (): Promise<void> => {
  logger.info({ data: "Start cleaning unverified accounts" });

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

  logger.info({ data: "Unverified user accounts cleaned", ...result });
};

const main = (): void => {
  setInterval(async () => {
    await cleanUnverifiedUserAccount();
  }, 1000 * 60 * 60 * 10);
};

export default main;
