import mongoose, { Schema } from "mongoose";

export enum UserAccountStatus {
  PENDING_VERIFICATION,
  VERIFIED,
}

export interface IftttIntegrationData {
  eventName: string;
  triggerKey: string;
  isActive: boolean;
}

export interface UserType {
  _id?: Schema.Types.ObjectId;
  name?: string;
  password?: string;
  herotag?: string;
  erdAddress?: string;
  status: UserAccountStatus;
  verificationReference?: string;
  verificationStartDate?: Date;
  integrations?: {
    ifttt?: IftttIntegrationData;
  };
  isStreaming?: boolean;
  streamingStartDate?: Date | null;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: false },
    password: { type: String, required: false },
    herotag: {
      type: String,
      required: false,
      validate: (herotag: string) => herotag.endsWith(".elrond"),
    },
    erdAddress: { type: String, required: false },
    status: { type: UserAccountStatus, required: false },
    verificationReference: { type: String, required: false },
    integrations: {
      ifttt: {
        eventName: { type: String, required: false },
        triggerKey: { type: String, required: false },
        isActive: { type: Boolean, required: false },
      },
    },
    isStreaming: { type: Boolean, required: false },
    streamingStartDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export type UserMongooseDocument = UserType & mongoose.Document;

export default mongoose.model<UserMongooseDocument>("User", UserSchema, "user");
