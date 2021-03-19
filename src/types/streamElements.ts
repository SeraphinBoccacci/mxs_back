import mongoose from "mongoose";

export enum VariationPositions {
  TopLeft = "TopLeft",
  TopCenter = "TopCenter",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomCenter = "BottomCenter",
  BottomRight = "BottomRight",
  CenterLeft = "CenterLeft",
  CenterCenter = "CenterCenter",
  CenterRight = "CenterRight",
}

export interface Variation {
  _id?: mongoose.Types.ObjectId;
  name: string;
  backgroundColor: string;
  duration?: number;
  chances?: number;
  requiredAmount?: number;
  width?: number;
  heigth?: number;
  position?: VariationPositions;
  sound?: Sound;
  image?: Image;
  text?: Text;
}

interface Sound {
  soundPath?: string;
  soundDelay?: string;
  soundOffset?: string;
}

interface Image {
  imagePath?: string;
  width?: number;
  height?: number;
  animation?: Animation;
}

interface Text {
  position?: TextPositions;
  content?: string;
  width?: number;
  height?: number;
  size?: string;
  color?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textAlign?: string;
  textStyle?: TextStyles[];
  animation?: Animation;
}

export enum VariationLenses {
  "name" = "name",
  "duration" = "duration",
  "chances" = "chances",
  "requiredAmount" = "requiredAmount",
  "backgroundColor" = "backgroundColor",
  "width" = "width",
  "heigth" = "heigth",
  "position" = "position",
  "sound_soundPath" = "sound_soundPath",
  "sound_soundDelay" = "sound_soundDelay",
  "sound_soundOffset" = "sound_soundOffset",
  "image_imagePath" = "image_imagePath",
  "image_width" = "image_width",
  "image_height" = "image_height",
  "image_animation_enter_type" = "image_animation_enter_type",
  "image_animation_enter_duration" = "image_animation_enter_duration",
  "image_animation_enter_delay" = "image_animation_enter_delay",
  "image_animation_exit_type" = "image_animation_exit_type",
  "image_animation_exit_duration" = "image_animation_exit_duration",
  "image_animation_exit_offset" = "image_animation_exit_offset",
  "text_position" = "text_position",
  "text_content" = "text_content",
  "text_width" = "text_width",
  "text_height" = "text_height",
  "text_size" = "text_size",
  "text_color" = "text_color",
  "text_lineHeight" = "text_lineHeight",
  "text_letterSpacing" = "text_letterSpacing",
  "text_wordSpacing" = "text_wordSpacing",
  "text_textAlign" = "text_textAlign",
  "text_textStyle" = "text_textStyle",
  "text_animation_enter_type" = "text_animation_enter_type",
  "text_animation_enter_duration" = "text_animation_enter_duration",
  "text_animation_enter_delay" = "text_animation_enter_delay",
  "text_animation_exit_type" = "text_animation_exit_type",
  "text_animation_exit_duration" = "text_animation_exit_duration",
  "text_animation_exit_offset" = "text_animation_exit_offset",
}

export enum TextPositions {
  top = "top",
  bottom = "bottom",
  right = "right",
  left = "left",
  over = "over",
}

export enum EnterAnimationTypes {
  slideUp = "slide-up-enter",
  slideDown = "slide-down-enter",
  slideLeft = "slide-left-enter",
  slideRight = "slide-right-enter",
  fadeIn = "fade-in",
  growth = "grow",
}

export enum ExitAnimationTypes {
  slideUp = "slide-up-exit",
  slideDown = "slide-down-exit",
  slideLeft = "slide-left-exit",
  slideRight = "slide-right-exit",
  fadeOut = "fade-out",
  shrink = "shrink",
}

export enum TextStyles {
  bold = "bold",
  italic = "italic",
  underline = "underline",
}

interface Animation {
  enter?: { type?: EnterAnimationTypes; duration?: number; delay?: number };
  exit?: { type?: ExitAnimationTypes; duration?: number; offset?: number };
}

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
  position: { type: String, enum: VariationPositions },
  backgroundColor: { type: String, required: true },
  duration: { type: Number, required: false },
  chances: { type: Number, required: false },
  requiredAmount: { type: Number, required: false },
  width: { type: Number, required: false },
  heigth: { type: Number, required: false },
  sound: {
    type: {
      soundPath: { type: String, required: false },
      soundDelay: { type: String, required: false },
      soundOffset: { type: String, required: false },
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
      position: { type: String, required: false },
      content: { type: String, required: false },
      width: { type: Number, required: false },
      height: { type: Number, required: false },
      size: { type: String, required: false },
      color: { type: String, required: false },
      lineHeight: { type: String, required: false },
      letterSpacing: { type: String, required: false },
      wordSpacing: { type: String, required: false },
      textAlign: { type: String, required: false },
      textStyle: {
        type: [{ type: String, enum: TextStyles }],
        required: false,
      },
      animation: { type: AnimationSchema, required: false },
    },
    required: false,
  },
});
