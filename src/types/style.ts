export enum TextStyles {
  bold = "bold",
  italic = "italic",
  underline = "underline",
}

export interface Text {
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
  fontFamily?: string;
  stroke?: {
    color?: string;
    width?: number;
  };
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

export interface Animation {
  enter?: { type?: EnterAnimationTypes; duration?: number; delay?: number };
  exit?: { type?: ExitAnimationTypes; duration?: number; offset?: number };
}
