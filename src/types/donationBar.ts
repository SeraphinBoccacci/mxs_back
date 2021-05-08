import mongoose from "mongoose";

import { Text } from "./style";

export enum DonationBarDisplays {
  "Vertical" = "Vertical",
  "Horizontal" = "Horizontal",
  "Circle" = "Circle",
  "Blur" = "Blur",
}

interface CircleDisplaySettings {
  kind: DonationBarDisplays.Circle;
  width?: number;
  strokeWidth?: number;
}

interface LineDisplaySettings {
  kind: DonationBarDisplays.Vertical | DonationBarDisplays.Horizontal;
  width?: number;
  height?: number;
}

interface AmountPart {
  color: string;
  indicationDisplay: InBarAmountDisplay;
}

export enum InBarAmountDisplay {
  "EGLD" = "EGLD",
  "percent" = "percent",
  "none" = "none",
}

export enum TextPositions {
  TopLeft = "TopLeft",
  TopCenter = "TopCenter",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomCenter = "BottomCenter",
  BottomRight = "BottomRight",
}

interface DonationBarText extends Text {
  position?: TextPositions;
}

export enum LogoAnimations {
  "bounce" = "bounce",
  "rotate" = "rotate",
  "shake" = "shake",
}

export enum BarDisplayAnimations {
  "bounce" = "bounce",
  "lighten" = "lighten",
  "center" = "center",
}

interface DonationReaction {
  soundPath: string;
  duration: number;
  fillSentAmountPart: {
    duration: number;
    color: string;
  };
  animateLogo: {
    kind: LogoAnimations;
  };
  animateBarDisplay: {
    kind: BarDisplayAnimations;
  };
}

export interface DonationBar {
  _id: mongoose.Types.ObjectId;
  offsetTop?: number;
  offsetLeft?: number;
  displaySettings: CircleDisplaySettings | LineDisplaySettings;
  centerCursorPath?: string;
  donationGoalAmount: {
    value: number;
    text?: Omit<DonationBarText, "content">;
  };
  donationBarDescription?: DonationBarText;
  border?: {
    color?: string;
    width?: number;
    radius?: number;
  };
  sentAmountPart?: AmountPart;
  amountToSendPart?: AmountPart;
  donationReaction: DonationReaction;
}
