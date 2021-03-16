/* eslint-disable quotes */
import config from "../../../config/config";
import { Image, Sound, Text, Variation } from "../../../types/streamElements";

export const formatVariationName = (variationName: string): string =>
  variationName.replace(/[\s-'"`]/g, "_");

const stringifyStringInterpolation = (variableString: string): string => {
  return "${" + variableString + "}";
};

const messageToStringInterpolation = (message: string): string => {
  return message.replace(/({{2})(\w+)(}{2})/g, (searchValue, p1, p2) => {
    return stringifyStringInterpolation(p2);
  });
};

const addHtmlBreaklines = (message: string) => {
  return message.replace(/\n/g, "<br></br>");
};

const secondsToMilliseconds = (seconds?: string | number): number => {
  return seconds ? Number(seconds) * 1000 : 0;
};

//-----------------------------------------

const removeElementLines = () => [
  "const removeElement = (",
  "  elementId,",
  "  exitAnimation,",
  "  exitAnimDuration,",
  "  enterAnimation",
  ") => {",
  "  setTimeout(() => {",
  "    $(`#${elementId}`).remove();",
  "  }, exitAnimDuration);",
  "",
  "  $(`#${elementId}`).removeClass(enterAnimation);",
  "  $(`#${elementId}`).addClass(exitAnimation);",
  "};",
];

const appendElementAndRemoveLines = () => [
  "const appendElementAndRemove = (",
  "  elementId,",
  "  element,",
  "  parentId,",
  "  alertDuration = 10,",
  '  enterAnimation = "",',
  "  enterAnimDuration = 0,",
  "  delay = 0,",
  '  exitAnimation = "",',
  "  exitAnimDuration = 0,",
  "  offset = 0",
  ") => {",
  "  const timeBeforeRemovalStart =",
  "    alertDuration - delay - enterAnimDuration - exitAnimDuration - offset;",
  "",
  "  setTimeout(() => {",
  "    setTimeout(",
  "      () =>",
  "        removeElement(",
  "          elementId,",
  "          exitAnimation,",
  "          exitAnimDuration,",
  "          enterAnimation",
  "        ),",
  "      timeBeforeRemovalStart",
  "    );",
  "",
  "    $(`#${parentId}`).append(`${element}`);",
  "    $(`#${elementId}`).addClass(enterAnimation);",
  "  }, delay);",
  "};",
];

const appendTextLines = (name: string, text: Text, duration = 10) => [
  "  appendElementAndRemove(",
  "    `text_${currentIndex}`,",
  '    ` <div id="text_${currentIndex}" class="p-container-' +
    formatVariationName(name) +
    '">',
  `        <p>${addHtmlBreaklines(
    messageToStringInterpolation(text.content as string)
  )}</p>`,
  "      </div>`,",
  "    `widget-container-${currentIndex}`,",
  `    ${secondsToMilliseconds(duration)},`,
  `    "${text?.animation?.enter?.type || ""}",`,
  `    "${secondsToMilliseconds(text?.animation?.enter?.duration || 0)}",`,
  `    "${secondsToMilliseconds(text?.animation?.enter?.delay || 0)}",`,
  `    "${text?.animation?.exit?.type || ""}",`,
  `    "${secondsToMilliseconds(text?.animation?.exit?.duration || 0)}",`,
  `    "${secondsToMilliseconds(text?.animation?.exit?.offset || 0)}",`,
  "  );",
];

const appendImageLines = (name: string, image: Image, duration = 10) => [
  "  appendElementAndRemove(",
  "    `image_${currentIndex}`,",
  '    ` <div class="image-container-' +
    formatVariationName(name) +
    '" id="image_${currentIndex}">',
  '        <img class="logo"',
  `        src="${config.url}/images/${`${image.imagePath}${"?ts=${now}"}`}"/>`,
  "      </div>`,",
  "    `widget-container-${currentIndex}`,",
  `    ${secondsToMilliseconds(duration)},`,
  `    "${image?.animation?.enter?.type || ""}",`,
  `    "${secondsToMilliseconds(image?.animation?.enter?.duration || 0)}",`,
  `    "${secondsToMilliseconds(image?.animation?.enter?.delay || 0)}",`,
  `    "${image?.animation?.exit?.type || ""}",`,
  `    "${secondsToMilliseconds(image?.animation?.exit?.duration || 0)}",`,
  `    "${secondsToMilliseconds(image?.animation?.exit?.offset || 0)}",`,
  "  );",
];

const appendAudioLines = (sound: Sound, duration = 10) => [
  "  appendElementAndRemove(",
  "    `audio_${currentIndex}`,",
  '    ` <audio id="audio_${currentIndex}" autoplay ',
  `        src="${config.url}/audios/${`${sound.soundPath}${"?ts=${now}"}`}">`,
  "      </audio>`,",
  "    `widget-container-${currentIndex}`,",
  `    ${secondsToMilliseconds(duration)},`,
  '    "",',
  "    0,",
  `    ${secondsToMilliseconds(sound.soundDelay)},`,
  '    "",',
  "    0,",
  `    ${secondsToMilliseconds(sound.soundOffset)},`,
  "  );",
];

const appendAnimationLines = (variation: Variation) => [
  `const appendAnimation_${formatVariationName(
    variation.name
  )} = (herotag, amount, message) => {`,
  "  containerIndex++;",
  "",
  "  const currentIndex = containerIndex;",
  "",
  "  const now = new Date().getTime();",
  "",
  "  $(`<div ",
  `      class="widget-container-${formatVariationName(variation.name)}" `,
  '      id=${`widget-container-${currentIndex}`} class="container">',
  "    </div>`).appendTo(document.body);",
  "",
  ...(variation?.text?.content
    ? appendTextLines(variation?.name, variation?.text, variation.duration)
    : []),
  "",
  ...(variation?.image?.imagePath
    ? appendImageLines(variation?.name, variation?.image, variation.duration)
    : []),
  "",
  ...(variation?.sound?.soundPath
    ? appendAudioLines(variation?.sound, variation.duration)
    : []),
  "",
  "  setTimeout(() => {",
  "    $(`#widget-container-${currentIndex}`).remove();",
  `  }, ${secondsToMilliseconds(variation.duration)});`,
  "};",
];

const variationsMapperLines = (variations: Variation[]) => {
  return [
    "const variations = [",
    ...variations.reduce(
      (acc: string[], cur) => [
        ...acc,
        `    {appendAnimation: appendAnimation_${formatVariationName(
          cur.name
        )}, chances: ${cur.chances ||
          0}, requiredAmount: ${cur.requiredAmount || 0}},`,
      ],
      []
    ),
    "]",
  ];
};

const findVariationLines = () => [
  "const findVariation = (amount) => {",
  "  const matchingVariations = variations.filter((variation) => {",
  "    return (",
  "      !variation.requiredAmount ||",
  "      (Number(amount) >= Number(variation.requiredAmount) && !!variation.chances)",
  "    );",
  "  });",
  "",
  "  const totalChances = matchingVariations.reduce(",
  "    (acc, cur) => acc + cur.chances,",
  "    0",
  "  );",
  "",
  "  const randomNumber = Math.random() * totalChances;",
  "",
  "  const variationFounder = (leftVariations, totalSpentChances) => {",
  "    const [variation, ...newLeftVariations] = leftVariations;",
  "",
  "    if (!newLeftVariations.length) return variation;",
  "",
  "    const newTotalSpentChances = variation.chances + totalSpentChances;",
  "",
  "    if (randomNumber <= newTotalSpentChances) return variation;",
  "",
  "    return variationFounder(newLeftVariations, newTotalSpentChances);",
  "  };",
  "",
  "  return variationFounder(matchingVariations, 0);",
  "};",
];

const socketLines = (herotag: string) => [
  `const socket = io("${config.url}", {`,
  "  query: {",
  `    streamerHerotag: "${herotag}",`,
  "  },",
  "});",
  "",
  'socket.on("newDonation", (data) => {',
  "  const variation = findVariation(data.amount)",
  "",
  "  variation.appendAnimation(data.herotag, data.amount, data.message);",
  "});",
];

const manualTriggerLines = (
  variationName: string,
  mockedData = {
    herotag: "TestHerotag",
    amount: "X.XXX",
    message: "TEST MESSAGE TEST MESSAGE",
  }
) => [
  `appendAnimation_${formatVariationName(variationName)}(`,
  `  "${mockedData.herotag}",`,
  `  "${mockedData.amount}",`,
  `  "${mockedData.message}"`,
  ")",
];

export const generateJavascript = (
  herotag: string,
  variations: Variation[],
  {
    triggerMode,
    targetVariation,
  }: { triggerMode?: string; targetVariation: string } = {
    targetVariation: "",
    triggerMode: "socket",
  }
): string => {
  return [
    "var containerIndex = 0;",
    "",
    ...removeElementLines(),
    "",
    ...appendElementAndRemoveLines(),
    "",
    ...variations.flatMap((variation) => appendAnimationLines(variation)),
    "",
    ...variationsMapperLines(variations),
    "",
    ...findVariationLines(),
    "",
    ...(triggerMode === "manual"
      ? manualTriggerLines(targetVariation)
      : socketLines(herotag)),
  ].join("\n");
};
