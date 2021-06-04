import mongoose from "mongoose";

import { IftttParticleData } from "./ifttt";
import { OverlayData } from "./overlays";

export enum UserAccountStatus {
  PENDING_VERIFICATION = 0,
  VERIFIED,
  PENDING_EDIT_PASSWORD_VERIFICATION,
}

export interface UserType {
  _id: mongoose.Types.ObjectId;
  password?: string;
  pendingPassword?: string;
  herotag: string;
  erdAddress: string;
  status: UserAccountStatus;
  verificationReference?: string;
  passwordEditionVerificationReference?: string;
  verificationStartDate?: string;
  passwordEditionVerificationStartDate?: string;
  integrations?: {
    ifttt?: IftttParticleData;
    overlays?: OverlayData[];
    minimumRequiredAmount?: number;
  };
  donationData?: {
    donationGoal?: {
      sentAmountAtDate: number;
      lastResetDate?: Date;
    };
  };
  isStreaming?: boolean;
  streamingStartDate?: Date | null;
  referralLink?: string;
  herotagQrCodePath?: string;
}
