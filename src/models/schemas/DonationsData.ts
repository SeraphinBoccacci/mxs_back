import mongoose from "mongoose";

const DonationGoalSchema = new mongoose.Schema(
  {
    sentAmountAtDate: { type: Number, required: true },
    lastResetDate: { type: Date, required: false },
  },
  { _id: false, timestamps: true }
);

export const DonationsDataSchema = new mongoose.Schema(
  {
    donationGoal: DonationGoalSchema,
  },
  { _id: false }
);
