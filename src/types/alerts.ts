import mongoose from "mongoose";

import { Animation, Text } from "./style";

export interface Sound {
  soundPath?: string;
  soundDelay?: string;
  soundOffset?: string;
}

export interface Image {
  imagePath?: string;
  width?: number;
  height?: number;
  animation?: Animation;
}

export enum TextPositions {
  top = "top",
  bottom = "bottom",
  right = "right",
  left = "left",
  over = "over",
}

export interface AlertText extends Text {
  position?: TextPositions;
  animation?: Animation;
}

export interface AlertVariation {
  _id: mongoose.Types.ObjectId;
  name: string;
  backgroundColor: string;
  duration?: number;
  chances?: number;
  requiredAmount?: number;
  width?: number;
  heigth?: number;
  offsetTop?: number;
  offsetLeft?: number;
  sound?: Sound;
  image?: Image;
  text?: AlertText;
  filepath?: string;
}

export enum AlertVariationLenses {
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
  "text_stroke_width" = "text_stroke_width",
  "text_stroke_color" = "text_stroke_color",
  "text_animation_enter_type" = "text_animation_enter_type",
  "text_animation_enter_duration" = "text_animation_enter_duration",
  "text_animation_enter_delay" = "text_animation_enter_delay",
  "text_animation_exit_type" = "text_animation_exit_type",
  "text_animation_exit_duration" = "text_animation_exit_duration",
  "text_animation_exit_offset" = "text_animation_exit_offset",
}
