import config from "../../../config/config";

/* eslint-disable quotes */
export const generatePreviewHtml = (filename: string): string => {
  return [
    "<!DOCTYPE html>",
    "",
    '<html lang="en">',
    "<link",
    '    rel="stylesheet"',
    `    href="${config.url}/files/css/file-name/${filename}"`,
    "/>",
    "<body>",
    "    <link",
    '    href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap"',
    '    rel="stylesheet"',
    "    />",
    '    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>',
    '    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.1/socket.io.js"></script>',
    "    <script",
    '    type="text/javascript"',
    `    src="${config.url}/files/js/file-name/${filename}"`,
    "    ></script>",
    "</body>",
    "</html>",
  ].join("\n");
};

export const generateSnippetHtml = (): string =>
  [
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet"/>',
    '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.1/socket.io.js"></script>',
  ].join("\n");
