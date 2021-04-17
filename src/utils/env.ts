/** @format */

import dotenv from "dotenv-defaults";
import path from "path";

// Load environment config
dotenv.config({
  encoding: "utf8",
  path: path.resolve(process.cwd(), ".env"),
  defaults: path.resolve(process.cwd(), ".env.defaults"),
});

// Debug ENV
const ENV: { [key: string]: string | boolean | undefined } = {};
Object.keys(process.env).forEach(_key => {
  // Get the key value
  let _val: string | boolean | undefined = process.env[_key];

  // Remove NPM fields
  if (/^npm_/.test(_key)) return true;

  // Convert booleans
  if (_val === "true") _val = true;
  else if (_val === "false") _val = false;
  else if (_val === "null") _val = undefined;

  // Convert escaped chars : |(mail=\\{\\{username\\}\\})(uid=\\{\\{username\\}\\})
  if (_val && typeof _val === "string" && _val !== "") {
    _val = _val.replace(/\\/g, "");
  }

  // Add to humanized env
  ENV[_key] = _val;
});

// Expose environment vars
export { ENV };
