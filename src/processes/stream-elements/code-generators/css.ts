/* eslint-disable quotes */
import {
  Text,
  TextPositions,
  TextStyles,
  Variation,
} from "../../../types/streamElements";
import { formatVariationName } from "./javascript";

export const x = "";

const baseCss = [
  ".logo {",
  "  width: 100%;",
  "}",
  "",
  "",
  "/* ENTER ANIMATIONS */",
  "",
  "@keyframes slideLeftEnter {",
  "  from {",
  "    transform: translateX(-100%);",
  "  }",
  "  to {",
  "    transform: translateX(0);",
  "  }",
  "}",
  "",
  ".slide-left-enter {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideLeftEnter !important;",
  "}",
  "",
  "@keyframes slideRightEnter {",
  "  from {",
  "    transform: translateX(100%);",
  "  }",
  "",
  "  to {",
  "    transform: translateX(0);",
  "  }",
  "}",
  "",
  ".slide-right-enter {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideRightEnter !important;",
  "}",
  "",
  "@keyframes slideUpEnter {",
  "  from {",
  "    transform: translateY(-100%);",
  "  }",
  "  to {",
  "    transform: translateY(0);",
  "  }",
  "}",
  "",
  ".slide-up-enter {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideUpEnter !important;",
  "}",
  "",
  "@keyframes slideDownEnter {",
  "  from {",
  "    transform: translateY(100%);",
  "  }",
  "",
  "  to {",
  "    transform: translateY(0);",
  "  }",
  "}",
  "",
  ".slide-down-enter {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideDownEnter !important;",
  "}",
  "",
  "@keyframes fadeIn {",
  "  from {",
  "    opacity: 0;",
  "  }",
  "  to {",
  "    opacity: 1;",
  "  }",
  "}",
  "",
  ".fade-in {",
  "  opacity: 1;",
  "  animation-duration: 1s !important;",
  "  animation-name: fadeIn !important;",
  "}",
  "",
  "@keyframes grow {",
  "  from {",
  "    transform: scale(0);",
  "  }",
  "",
  "  to {",
  "    transform: scale(1);",
  "  }",
  "}",
  "",
  ".grow {",
  "  animation-duration: 1s !important;",
  "  animation-name: grow !important;",
  "}",
  "",
  "/* EXIT ANIMATIONS */",
  "",
  "@keyframes slideLeftExit {",
  "  from {",
  "    transform: translateX(0);",
  "  }",
  "  to {",
  "    transform: translateX(100%);",
  "  }",
  "}",
  "",
  ".slide-left-exit {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideLeftExit !important;",
  "}",
  "",
  "@keyframes slideRightExit {",
  "  from {",
  "    transform: translateX(0);",
  "  }",
  "",
  "  to {",
  "    transform: translateX(-100%);",
  "  }",
  "}",
  "",
  ".slide-right-exit {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideRightExit !important;",
  "}",
  "",
  "@keyframes slideUpExit {",
  "  from {",
  "    transform: translateY(0);",
  "  }",
  "  to {",
  "    transform: translateY(-100%);",
  "  }",
  "}",
  "",
  ".slide-up-exit {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideUpExit !important;",
  "}",
  "",
  "@keyframes slideDownExit {",
  "  from {",
  "    transform: translateY(0);",
  "  }",
  "",
  "  to {",
  "    transform: translateY(100%);",
  "  }",
  "}",
  "",
  ".slide-down-exit {",
  "  animation-duration: 1s !important;",
  "  animation-name: slideDownExit !important;",
  "}",
  "",
  "@keyframes fadeOut {",
  "  from {",
  "    opacity: 1;",
  "  }",
  "",
  "  to {",
  "    opacity: 0;",
  "  }",
  "}",
  "",
  ".fade-out {",
  "  animation-duration: 1s !important;",
  "  animation-name: fadeOut !important;",
  "}",
  "",
  "@keyframes shrink {",
  "  from {",
  "    transform: scale(1);",
  "  }",
  "",
  "  to {",
  "    transform: scale(0);",
  "  }",
  "}",
  "",
  ".shrink {",
  "  animation-duration: 1s !important;",
  "  animation-name: shrink !important;",
  "}",
];

const displayMapper = (position: TextPositions) => {
  const mapper = {
    [TextPositions.over]: [
      "display: flex;",
      "flex-direction: column;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.bottom]: [
      "display: flex;",
      "flex-direction: column;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.top]: [
      "display: flex;",
      "flex-direction: column-reverse;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.left]: [
      "display: flex;",
      "flex-direction: row-reverse;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.right]: [
      "display: flex;",
      "flex-direction: row;",
      "justify-content: center;",
      "align-items: center;",
    ],
  };

  return mapper[position];
};

const widgetContainer = (name: string, textPosition: TextPositions) => [
  `.widget-container-${formatVariationName(name)} {`,
  "  position: absolute;",
  "  top: 0;",
  "  left: 0;",
  "  width: max-content;",
  "  height: max-content;",
  "",
  ...displayMapper(textPosition),
  "",
  "  padding: 0;",
  "",
  "  overflow: hidden;",
  "}",
];

const imageContainer = (name: string, width = 0, height = 0) => [
  `.image-container-${formatVariationName(name)} {`,
  "  position: relative;",
  `  width: ${width}px;`,
  `  height: ${height}px;`,
  "  margin: auto;",
  "}",
];

const paragraph = (name: string, text?: Text) => [
  `.p-container-${formatVariationName(name)} > p {`,
  "  width: 100%;",
  "  height: max-content;",
  `  font-size: ${text?.size ? `${text.size}px` : "normal"};`,
  `  color: ${text?.color || "normal"};`,
  `  line-height: ${text?.lineHeight ? `${text.lineHeight}px` : "normal"};`,
  `  letter-spacing: ${
    text?.letterSpacing ? `${text.letterSpacing}px` : "normal"
  };`,
  `  word-spacing: ${text?.wordSpacing ? `${text.wordSpacing}px` : "normal"};`,
  `  text-align: ${text?.textAlign || "normal"};`,
  `  font-weight: ${
    text?.textStyle?.some((style) => style === TextStyles.bold)
      ? "800"
      : "normal"
  };`,
  `  text-decoration: ${
    text?.textStyle?.some((style) => style === TextStyles.underline)
      ? "underline"
      : "normal"
  };`,
  `  font-style: ${
    text?.textStyle?.some((style) => style === TextStyles.italic)
      ? "italic"
      : "normal"
  };`,
  "}",
];

const pContainer = (name: string, width = 0, height = 0) => [
  `.p-container-${formatVariationName(name)} {`,
  "  position: relative;",
  `  width: ${width}px;`,
  `  height: ${height}px;`,
  "  overflow: hidden;",
  "}",
];

const generateCssForVariation = (variation: Variation) => {
  return [
    "* {",
    ' font-family: "Noto Sans JP", sans-serif; ',
    "}",
    "",
    ...widgetContainer(
      formatVariationName(variation.name),
      variation.text?.position || TextPositions.bottom
    ),
    "",
    ...imageContainer(
      formatVariationName(variation.name),
      variation?.image?.width,
      variation?.image?.height
    ),
    "",
    ...pContainer(
      formatVariationName(variation.name),
      variation.text?.width,
      variation.text?.height
    ),
    "",
    ...paragraph(formatVariationName(variation.name), variation.text),
  ];
};

export const generateCss = (variations: Variation[]): string => {
  return [...baseCss, ...variations.flatMap(generateCssForVariation)].join(
    "\n"
  );
};