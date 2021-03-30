import mongoose, { Schema } from "mongoose";

import { VariationSchema } from "../models/schemas/StreamElementsVariation";
import { Variation } from "../types/streamElements";

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
  variations: Variation[];
  rowsStructure: {
    rows: string[];
    rowsGroupName?: string | undefined;
  }[];
  isActive: boolean;
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
    minimumRequiredAmount?: number;
  };
  isStreaming?: boolean;
  streamingStartDate?: Date | null;
}

const UserSchema = new Schema(
  {
    password: { type: String, required: true },
    pendingPassword: { type: String, required: false },
    herotag: {
      type: String,
      required: true,
      validate: (herotag: string) => herotag.endsWith(".elrond"),
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
      streamElements: {
        variations: { type: [VariationSchema], required: false },
        rowsStructure: {
          type: [
            {
              rowsGroupName: { type: String, required: false },
              rows: { type: [String], required: false },
            },
          ],
          required: false,
        },
        isActive: { type: Boolean, required: false },
      },
      minimumRequiredAmount: { type: Number, required: false },
    },
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export type UserMongooseDocument = UserType & mongoose.Document;

export default mongoose.model<UserMongooseDocument>("User", UserSchema, "user");
