import mongoose from "mongoose";

import User from "../../models/User";
import { normalizeHerotag } from "../../utils/transactions";

export const getDonationGoalSentAmount = async (
  herotag: string
): Promise<number> => {
  const user = await User.findOne({ herotag: normalizeHerotag(herotag) })
    .select({ donationData: true })
    .orFail(new Error("User not found"))
    .lean();

  const currentSentAmount =
    user?.donationData?.donationGoal?.sentAmountAtDate || 0;

  return currentSentAmount;
};

export const resetDonationGoal = async (herotag: string): Promise<void> => {
  await User.updateOne(
    { herotag: normalizeHerotag(herotag) },
    {
      $set: {
        "donationData.donationGoal": {
          sentAmountAtDate: 0,
          lastResetDate: new Date(),
        },
      },
    }
  );
};

export const incrementDonationGoalSentAmount = async (
  userId: mongoose.Types.ObjectId,
  amount: number
): Promise<void> => {
  const user = await User.findOne(userId)
    .select({ donationData: true })
    .orFail(new Error("User not found"))
    .lean();

  const currentSentAmount =
    user?.donationData?.donationGoal?.sentAmountAtDate || 0;

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        "donationData.donationGoal.sentAmountAtDate":
          currentSentAmount + amount,
      },
    }
  );
  return;
};
