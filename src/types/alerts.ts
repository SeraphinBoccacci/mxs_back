import mongoose from "mongoose";

import { Animation, Text, TextStyles } from "./style";

export interface Sound {
  soundPath?: string;
  soundDelay?: number;
  soundOffset?: number;
}

export interface Image {
  imagePath?: string;
  width?: number;
  height?: number;
  animation?: Animation;
}

export interface AlertText extends Text {
  offsetTop?: number;
  offsetLeft?: number;
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
  "offsetTop" = "offsetTop",
  "offsetLeft" = "offsetLeft",
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
  "text_offsetTop" = "text_offsetTop",
  "text_offsetLeft" = "text_offsetLeft",
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
  "text_fontFamily" = "text_fontFamily",
  "text_stroke_width" = "text_stroke_width",
  "text_stroke_color" = "text_stroke_color",
  "text_animation_enter_type" = "text_animation_enter_type",
  "text_animation_enter_duration" = "text_animation_enter_duration",
  "text_animation_enter_delay" = "text_animation_enter_delay",
  "text_animation_exit_type" = "text_animation_exit_type",
  "text_animation_exit_duration" = "text_animation_exit_duration",
  "text_animation_exit_offset" = "text_animation_exit_offset",
}

export interface AlertVariationData {
  name?: string;
  duration?: string;
  chances?: string;
  requiredAmount?: string;
  backgroundColor?: string;
  width?: number;
  heigth?: number;
  offsetTop?: number;
  offsetLeft?: number;
  sound_soundPath?: string;
  sound_soundDelay?: number;
  sound_soundOffset?: number;
  image_imagePath?: string;
  image_width?: string;
  image_height?: string;
  image_animation_enter_type?: string;
  image_animation_enter_duration?: string;
  image_animation_enter_delay?: string;
  image_animation_exit_type?: string;
  image_animation_exit_duration?: string;
  image_animation_exit_offset?: string;
  text_offsetTop?: string;
  text_offsetLeft?: string;
  text_content?: string;
  text_width?: string;
  text_height?: string;
  text_size?: string;
  text_color?: string;
  text_stroke_width?: number;
  text_stroke_color?: string;
  text_lineHeight?: string;
  text_letterSpacing?: string;
  text_wordSpacing?: string;
  text_textAlign?: string;
  text_textStyle?: TextStyles[];
  text_fontFamily?: TextStyles[];
  text_animation_enter_type?: string;
  text_animation_enter_duration?: string;
  text_animation_enter_delay?: string;
  text_animation_exit_type?: string;
  text_animation_exit_duration?: string;
  text_animation_exit_offset?: string;
}

export type AlertVariationFormData = AlertVariationData & {
  [x: string]: string;
};

export interface Alerts {
  variations: AlertVariation[];
}
