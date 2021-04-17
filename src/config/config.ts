/** @format */

import { ENV } from "../utils/env";
interface Config {
  url: string;
  apiUrl: string;
  uploadsUrl: string;
  withConsoleTransport: boolean;
  port: number;
}

// eslint-disable-next-line no-console
const config: Config = {
  url: `${ENV.ENTRYPOINT_FRONT_URL}`,
  apiUrl: `${ENV.ENTRYPOINT_API_URL}`,
  uploadsUrl: `${ENV.ENTRYPOINT_UPLOAD_PATH}`,
  withConsoleTransport: ENV.ENABLE_CONSOLE_TRANSPORT === true,
  port: parseInt(`${ENV.ENTRYPOINT_API_PORT}`),
};
export default config;
