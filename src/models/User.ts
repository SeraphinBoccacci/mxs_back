import mongoose, { Schema } from "mongoose";

import { AlertVariation } from "../types/alerts";
import { ENV } from "../utils/env";
import { VariationSchema } from "./schemas/AlertVariation";
import {
  VariationGroup,
  VariationGroupKinds,
  VariationGroupSchema,
} from "./schemas/VariationGroup";

export enum UserAccountStatus {
  PENDING_VERIFICATION = 0,
  VERIFIED,
  PENDING_EDIT_PASSWORD_VERIFICATION,
}

export interface IftttParticleData {
  eventName: string;
  triggerKey: string;
  isActive: boolean;
}

export interface StreamElementData {
  variations: AlertVariation[];
  rowsStructure: {
    rows: string[];
    rowsGroupName?: string | undefined;
  }[];
  isActive: boolean;
}

export interface OverlayData {
  _id: string;
  rowsStructure?: {
    rows: string[];
    rowsGroupName?: string | undefined;
  }[];

  generatedLink: string;
  alerts: {
    variations: AlertVariation[];
    groups: VariationGroup[];
    // structure: { type: String, required: false },
  };
  // donationBar: { type: String, required: false },
  // particlesFalls: {
  //   variations: { type: String, required: false },
  //   structure: { type: String, required: false },
  // },
  // topDonators: { type: String, required: false },
}

export interface UserType {
  _id?: mongoose.Types.ObjectId;
  password?: string;
  pendingPassword?: string;
  herotag?: string;
  erdAddress?: string;
  status: UserAccountStatus;
  verificationReference?: string;
  passwordEditionVerificationReference?: string;
  verificationStartDate?: string;
  passwordEditionVerificationStartDate?: string;
  integrations?: {
    ifttt?: IftttParticleData;
    streamElements?: StreamElementData;
    overlays?: OverlayData[];
    minimumRequiredAmount?: number;
  };
  isStreaming?: boolean;
  streamingStartDate?: Date | null;

  referralLink?: string;
  herotagQrCodePath?: string;
}

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
  // donationBar: { type: String, required: false },
  // particlesFalls: {
  //   variations: { type: String, required: false },
  //   structure: { type: String, required: false },
  // },
  // topDonators: { type: String, required: false },
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
    erdAddress: { type: String, required: false },
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
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },

    referralLink: { type: String, required: false },
    herotagQrCodePath: { type: String, required: false },
  },
  { timestamps: true }
);

export type UserMongooseDocument = UserType & mongoose.Document;

export default mongoose.model<UserMongooseDocument>("User", UserSchema, "user");
