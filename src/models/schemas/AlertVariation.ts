import mongoose from "mongoose";

import {
  EnterAnimationTypes,
  ExitAnimationTypes,
  TextStyles,
} from "../../types/style";

const AnimationSchema = new mongoose.Schema(
  {
    enter: {
      type: { type: EnterAnimationTypes, required: false },
      duration: { type: Number, required: false },
      delay: { type: Number, required: false },
    },
    exit: {
      type: { type: String, enum: ExitAnimationTypes, required: false },
      duration: { type: Number, required: false },
      offset: { type: Number, required: false },
    },
  },
  { _id: false, timestamps: true }
);

export const VariationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  offsetTop: { type: Number, default: 0 },
  offsetLeft: { type: Number, default: 0 },
  backgroundColor: { type: String, required: true },
  duration: { type: Number, required: false, default: 10 },
  chances: { type: Number, required: false, default: 100 },
  requiredAmount: { type: Number, required: false, default: 0 },
  width: { type: Number, required: false },
  heigth: { type: Number, required: false },
  filepath: { type: String, required: false },
  sound: {
    type: {
      soundPath: { type: String, required: false },
      soundDelay: { type: Number, required: false },
      soundOffset: { type: Number, required: false },
    },
    required: false,
  },
  image: {
    type: {
      imagePath: { type: String, required: false },
      width: { type: Number, required: false },
      height: { type: Number, required: false },
      animation: { type: AnimationSchema, required: false },
    },
    required: false,
  },
  text: {
    type: {
      offsetTop: { type: Number, default: 0 },
      offsetLeft: { type: Number, default: 0 },
      content: {
        type: String,
        required: false,
        default: "You can display whatever you want here",
      },
      width: { type: Number, required: false, default: 300 },
      height: { type: Number, required: false },
      size: { type: String, required: false, default: "50" },
      color: { type: String, required: false, default: "#2a2a2a" },
      lineHeight: { type: String, required: false, default: "50" },
      letterSpacing: { type: String, required: false },
      wordSpacing: { type: String, required: false },
      stroke: {
        color: { type: String, required: false, default: "#000000" },
        width: { type: Number, required: false, default: 1 },
      },
      textAlign: {
        type: String,
        required: false,
        default: "left",
      },
      textStyle: {
        type: [{ type: String, enum: TextStyles }],
        required: false,
      },
      fontFamily: {
        type: String,
        required: false,
      },
      animation: { type: AnimationSchema, required: false },
    },
    required: false,
  },
});
