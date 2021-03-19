import mongoose, { Schema } from "mongoose";

import { Variation, VariationSchema } from "../types/streamElements";

export enum UserAccountStatus {
  PENDING_VERIFICATION = 0,
  VERIFIED,
}

export interface IftttIntegrationData {
  eventName: string;
  triggerKey: string;
  isActive: boolean;
}

export interface UserType {
  _id?: mongoose.Types.ObjectId;
  password?: string;
  herotag?: string;
  erdAddress?: string;
  status: UserAccountStatus;
  verificationReference?: string;
  verificationStartDate?: Date;
  integrations?: {
    ifttt?: IftttIntegrationData;
    streamElements?: {
      variations: Variation[];
    };
  };
  isStreaming?: boolean;
  streamingStartDate?: Date | null;
}

const UserSchema = new Schema(
  {
    password: { type: String, required: true },
    herotag: {
      type: String,
      required: true,
      validate: (herotag: string) => herotag.endsWith(".elrond"),
    },
    erdAddress: { type: String, required: false },
    status: { type: UserAccountStatus, required: true },
    verificationReference: { type: String, required: true },
    verificationStartDate: { type: String, required: true },
    integrations: {
      ifttt: {
        eventName: { type: String, required: false },
        triggerKey: { type: String, required: false },
        isActive: { type: Boolean, required: false },
      },
      streamElements: {
        variations: { type: [VariationSchema], required: false },
      },
    },
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export type UserMongooseDocument = UserType & mongoose.Document;

export default mongoose.model<UserMongooseDocument>("User", UserSchema, "user");
