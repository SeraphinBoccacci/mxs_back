import mongoose from "mongoose";

import {
  BarDisplayAnimations,
  DonationBarDisplays,
  InBarAmountDisplay,
  LogoAnimations,
} from "../../types/donationBar";
import { TextStyles } from "../../types/style";

const DonationBarDisplay = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: DonationBarDisplays,
      default: DonationBarDisplays.Horizontal,
    },
    height: { type: Number, required: false },
    width: { type: Number, required: false },
    strokeWidth: { type: Number, required: false },
  },
  { _id: false }
);

const DonationBarTextStroke = new mongoose.Schema(
  {
    color: { type: String, required: false },
    width: { type: Number, required: false },
  },
  { _id: false }
);

const DonationBarText = new mongoose.Schema(
  {
    offsetTop: { type: Number, default: 0 },
    offsetLeft: { type: Number, default: 0 },
    content: {
      type: String,
      required: false,
    },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    size: { type: String, required: false },
    color: { type: String, required: false },
    lineHeight: { type: String, required: false },
    letterSpacing: { type: String, required: false },
    wordSpacing: { type: String, required: false },
    textAlign: { type: String, required: false },
    textStyle: { type: [String], enum: TextStyles, required: false },
    stroke: {
      type: DonationBarTextStroke,
      required: false,
    },
  },
  { _id: false }
);

const DonationGoalAmount = new mongoose.Schema(
  {
    value: { type: Number, required: false },
  },
  { _id: false }
);

const DonationBarBorder = new mongoose.Schema(
  {
    color: { type: String, required: false },
    width: { type: Number, required: false },
    radius: { type: Number, required: false },
  },
  { _id: false }
);

const AmountPart = new mongoose.Schema(
  {
    color: { type: String, required: false },
    textColor: { type: String, required: false },
  },
  { _id: false }
);

const FillSentAmountAnimation = new mongoose.Schema(
  {
    color: { type: String, required: false },
  },
  { _id: false }
);

const AnimateLogo = new mongoose.Schema(
  {
    kind: { type: String, enum: LogoAnimations, required: false },
  },
  { _id: false }
);

const AnimateBarDisplay = new mongoose.Schema(
  {
    kind: { type: String, enum: BarDisplayAnimations, required: false },
  },
  { _id: false }
);

const DonationReaction = new mongoose.Schema(
  {
    soundPath: { type: String, required: false },
    duration: { type: Number, required: false },
    fillSentAmountPart: { type: FillSentAmountAnimation, required: false },
    animateLogo: { type: AnimateLogo, required: false },
    animateBarDisplay: { type: AnimateBarDisplay, required: false },
  },
  { _id: false }
);

export const DonationBarSchema = new mongoose.Schema({
  width: { type: Number, required: false },
  height: { type: Number, required: false },
  offsetTop: { type: Number, required: false },
  offsetLeft: { type: Number, required: false },
  indicationDisplay: {
    type: String,
    enum: InBarAmountDisplay,
    required: false,
  },
  displaySettings: {
    type: DonationBarDisplay,
    required: false,
  },
  centerCursorPath: { type: String, required: false },
  centerCursorScale: { type: Number, required: false },
  donationGoalAmount: { type: DonationGoalAmount, required: true },
  donationBarDescription: { type: DonationBarText, required: false },
  border: { type: DonationBarBorder, required: false },
  sentAmountPart: { type: AmountPart, required: false },
  amountToSendPart: { type: AmountPart, required: false },
  donationReaction: { type: DonationReaction, required: false },
});
