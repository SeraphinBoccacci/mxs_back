import mongoose from "mongoose";

import { Text, TextStyles } from "./style";

export enum DonationBarDisplays {
  "Vertical" = "Vertical",
  "Horizontal" = "Horizontal",
  "Circle" = "Circle",
  "Blur" = "Blur",
}

export const isCircleDisplay = (
  displaySettings?: CircleDisplaySettings | LineDisplaySettings
): displaySettings is CircleDisplaySettings => {
  return displaySettings?.kind === DonationBarDisplays.Circle;
};

export interface CircleDisplaySettings {
  kind: DonationBarDisplays.Circle;
  width?: number;
  strokeWidth?: number;
}

export const isLineDisplay = (
  displaySettings?: CircleDisplaySettings | LineDisplaySettings
): displaySettings is LineDisplaySettings => {
  return (
    !!displaySettings?.kind &&
    [DonationBarDisplays.Vertical, DonationBarDisplays.Horizontal].includes(
      displaySettings?.kind
    )
  );
};

export interface LineDisplaySettings {
  kind: DonationBarDisplays.Vertical | DonationBarDisplays.Horizontal;
  width?: number;
  height?: number;
}

interface AmountPart {
  color?: string;
  textColor?: string;
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
  soundPath?: string;
  duration?: number;
  fillSentAmountPart?: {
    color?: string;
  };
  animateLogo?: {
    kind?: LogoAnimations;
  };
  animateBarDisplay?: {
    kind?: BarDisplayAnimations;
  };
}

export interface DonationBar {
  _id: mongoose.Types.ObjectId;
  offsetTop?: number;
  offsetLeft?: number;
  indicationDisplay: InBarAmountDisplay;
  displaySettings: CircleDisplaySettings | LineDisplaySettings;
  centerCursorPath?: string;
  donationGoalAmount: {
    value: number;
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

export enum DonationBarLenses {
  "offsetTop" = "offsetTop",
  "offsetLeft" = "offsetLeft",
  "indicationDisplay" = "indicationDisplay",
  "displaySettings_kind" = "displaySettings_kind",
  "displaySettings_width" = "displaySettings_width",
  "displaySettings_strokeWidth" = "displaySettings_strokeWidth",
  "displaySettings_height" = "displaySettings_height",
  "centerCursorPath" = "centerCursorPath",
  "donationGoalAmount_value" = "donationGoalAmount_value",
  "donationBarDescription_position" = "donationBarDescription_position",
  "donationBarDescription_content" = "donationBarDescription_content",
  "donationBarDescription_width" = "donationBarDescription_width",
  "donationBarDescription_height" = "donationBarDescription_height",
  "donationBarDescription_size" = "donationBarDescription_size",
  "donationBarDescription_color" = "donationBarDescription_color",
  "donationBarDescription_lineHeight" = "donationBarDescription_lineHeight",
  "donationBarDescription_letterSpacing" = "donationBarDescription_letterSpacing",
  "donationBarDescription_wordSpacing" = "donationBarDescription_wordSpacing",
  "donationBarDescription_textAlign" = "donationBarDescription_textAlign",
  "donationBarDescription_textStyle" = "donationBarDescription_textStyle",
  "donationBarDescription_stroke_width" = "donationBarDescription_stroke_width",
  "donationBarDescription_stroke_color" = "donationBarDescription_stroke_color",
  "border_color" = "border_color",
  "border_width" = "border_width",
  "border_radius" = "border_radius",
  "sentAmountPart_color" = "sentAmountPart_color",
  "amountToSendPart_color" = "amountToSendPart_color",
  "sentAmountPart_textColor" = "sentAmountPart_textColor",
  "amountToSendPart_textColor" = "amountToSendPart_textColor",
  "donationReaction_soundPath" = "donationReaction_soundPath",
  "donationReaction_duration" = "donationReaction_duration",
  "donationReaction_fillSentAmountPart_color" = "donationReaction_fillSentAmountPart_color",
  "donationReaction_animateLogo_kind" = "donationReaction_animateLogo_kind",
  "donationReaction_animateBarDisplay_kind" = "donationReaction_animateBarDisplay_kind",
}

export interface DonationBarData {
  offsetTop?: number;
  offsetLeft?: number;
  indicationDisplay?: number;
  displaySettings_kind?: DonationBarDisplays;
  displaySettings_width?: number;
  displaySettings_strokeWidth?: number;
  displaySettings_height?: number;
  centerCursorPath?: string;
  donationGoalAmount_value?: number;
  donationBarDescription_position?: TextPositions;
  donationBarDescription_content?: string;
  donationBarDescription_width?: number;
  donationBarDescription_height?: number;
  donationBarDescription_size?: string;
  donationBarDescription_color?: string;
  donationBarDescription_lineHeight?: string;
  donationBarDescription_letterSpacing?: string;
  donationBarDescription_wordSpacing?: string;
  donationBarDescription_textAlign?: string;
  donationBarDescription_textStyle?: TextStyles[];
  donationBarDescription_stroke_width?: number;
  donationBarDescription_stroke_color?: string;
  border_color?: string;
  border_width?: number;
  border_radius?: number;
  sentAmountPart_color?: string;
  amountToSendPart_color?: string;
  sentAmountPart_textColor?: string;
  amountToSendPart_textColor?: string;
  donationReaction_soundPath?: string;
  donationReaction_duration?: number;
  donationReaction_fillSentAmountPart_color?: string;
  donationReaction_animateLogo_kind?: LogoAnimations;
  donationReaction_animateBarDisplay_kind?: BarDisplayAnimations;
}

export type DonationBarFormData = DonationBarData & {
  [x: string]: string;
};
