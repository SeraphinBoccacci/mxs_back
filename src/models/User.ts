import mongoose, { Schema } from "mongoose";

import { VariationGroup, VariationGroupKinds } from "../types/overlays";
import { UserAccountStatus, UserType } from "../types/user";
import { ENV } from "../utils/env";
import { VariationSchema } from "./schemas/AlertVariation";
import { DonationBarSchema } from "./schemas/DonationBar";
import { DonationsDataSchema } from "./schemas/DonationsData";
import { VariationGroupSchema } from "./schemas/VariationGroup";

const AlertSchema = new Schema(
  {
    variations: { type: [VariationSchema], required: false },
    groups: {
      type: [VariationGroupSchema],
      required: false,
      validate: {
        validator: function(groups: VariationGroup[]) {
          groups.filter(({ kind }) => kind === VariationGroupKinds.DEFAULT)
            .length === 1;
        },
        message: "There should be exactly one default variations group",
      },
    },
  },
  { _id: false }
);

const OverlaysSchema = new Schema({
  generatedLink: { type: String, required: false },
  alerts: { type: AlertSchema, required: false },
  isActive: { type: Boolean, required: false },
  donationBar: { type: DonationBarSchema, required: false },
});

const UserSchema = new Schema(
  {
    password: { type: String, required: true },
    pendingPassword: { type: String, required: false },
    herotag: {
      type: String,
      required: true,
      validate: (herotag: string) =>
        herotag.endsWith(`${ENV.ELROND_HEROTAG_DOMAIN}`),
    },
    erdAddress: { type: String, required: true }, // TO-DO validate string format
    status: { type: UserAccountStatus, required: true },
    verificationReference: { type: String, required: true },
    passwordEditionVerificationReference: { type: String, required: false },
    verificationStartDate: { type: String, required: true },
    passwordEditionVerificationStartDate: { type: String, required: false },
    integrations: {
      ifttt: {
        eventName: { type: String, required: false },
        triggerKey: { type: String, required: false },
        isActive: { type: Boolean, required: false },
      },
      overlays: [OverlaysSchema],
      minimumRequiredAmount: { type: Number, required: false },
    },
    donationData: { type: DonationsDataSchema, required: false },
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },
    referralLink: { type: String, required: false },
    herotagQrCodePath: { type: String, required: false },
  },
  { timestamps: true }
);

export type UserMongooseDocument = UserType & mongoose.Document;

export default mongoose.model<UserMongooseDocument>("User", UserSchema, "user");
