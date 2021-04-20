/* eslint-disable quotes */
import {
  AlertPositions,
  AlertVariation,
  Text,
  TextPositions,
  TextStyles,
} from "../../../types/alerts";
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

const positionMapper = (position?: AlertPositions) => {
  const mapper = {
    [AlertPositions.BottomCenter]: [
      "  bottom: 1rem;",
      "  left: 50%;",
      "  transform: translateX(-50%);",
    ],
    [AlertPositions.BottomLeft]: ["  bottom: 1rem;", "  left: 1rem;"],
    [AlertPositions.BottomRight]: ["  bottom: 1rem;", "  right: 1rem;"],
    [AlertPositions.CenterCenter]: [
      "  top: 50%;",
      "  left: 50%;",
      "  transform: translateX(-50%) translateY(-50%);",
    ],
    [AlertPositions.CenterLeft]: [
      "  top: 50%;",
      "  left: 1rem;",
      "  transform: translateY(-50%);",
    ],
    [AlertPositions.CenterRight]: [
      "  top: 50%;",
      "  right: 1rem;",
      "  transform: translateY(-50%);",
    ],
    [AlertPositions.TopCenter]: [
      "  top: 1rem;",
      "  left: 50%;",
      "  transform: translateX(-50%);",
    ],
    [AlertPositions.TopLeft]: ["  top: 1rem;", "  left: 1rem;"],
    [AlertPositions.TopRight]: ["  top: 1rem;", "  right: 1rem;"],
  };

  return mapper[position || AlertPositions.BottomRight];
};

const displayMapper = (position?: TextPositions) => {
  const mapper = {
    [TextPositions.over]: [
      "display: flex;",
      "flex-direction: column;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.bottom]: [
      "display: flex;",
      "flex-direction: column-reverse;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.top]: [
      "display: flex;",
      "flex-direction: column;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.left]: [
      "display: flex;",
      "flex-direction: row;",
      "justify-content: center;",
      "align-items: center;",
    ],
    [TextPositions.right]: [
      "display: flex;",
      "flex-direction: row-reverse;",
      "justify-content: center;",
      "align-items: center;",
    ],
  };

  return mapper[position || TextPositions.bottom];
};

const widgetContainer = (
  name: string,
  variationPosition?: AlertPositions,
  variationWidth?: number,
  variationHeight?: number,
  textPosition?: TextPositions
) => [
  `.widget-container-${formatVariationName(name)} {`,
  "  position: absolute;",
  ...positionMapper(variationPosition),
  `  width: ${variationWidth ? `${variationWidth}px` : "max-content"};`,
  `  height: ${variationHeight ? `${variationHeight}px` : "max-content"};`,
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
  `  width: ${width ? `${width}px` : "max-content"};`,
  `  height: ${height ? `${height}px` : "max-content"};`,
  "  margin: auto;",
  "}",
];

const paragraph = (name: string, text?: Text) => {
  const strokeColor = text?.stroke?.color?.startsWith("#")
    ? text?.stroke?.color
    : `#${text?.stroke?.color}`;
  const strokeWidth = text?.stroke?.width;

  return [
    `.p-container-${formatVariationName(name)} > p {`,
    "  width: 100%;",
    "  height: max-content;",
    ...(strokeColor && strokeWidth
      ? [`  -webkit-text-stroke: ${strokeWidth}px ${strokeColor};`]
      : []),
    `  font-size: ${text?.size ? `${text.size}px` : "normal"};`,
    `  color: ${text?.color || "normal"};`,
    `  line-height: ${text?.lineHeight ? `${text.lineHeight}px` : "normal"};`,
    `  letter-spacing: ${
      text?.letterSpacing ? `${text.letterSpacing}px` : "normal"
    };`,
    `  word-spacing: ${
      text?.wordSpacing ? `${text.wordSpacing}px` : "normal"
    };`,
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
};

const pContainer = (name: string, width = 0, height = 0) => [
  `.p-container-${formatVariationName(name)} {`,
  "  position: relative;",
  `  width: ${width ? `${width}px` : "max-content"};`,
  `  height: ${height ? `${height}px` : "max-content"};`,
  "  overflow: hidden;",
  "  margin: 1.3rem",
  "}",
];

const generateCssForVariation = (variation: AlertVariation) => {
  return [
    "* {",
    ' font-family: "Noto Sans JP", sans-serif; ',
    "}",
    "",
    ...widgetContainer(
      formatVariationName(variation.name),
      variation.position,
      variation.width,
      variation.heigth,
      variation.text?.position
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

export const generateCss = (variations: AlertVariation[]): string => {
  return [...baseCss, ...variations.flatMap(generateCssForVariation)].join(
    "\n"
  );
};
