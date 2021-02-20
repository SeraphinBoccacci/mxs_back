// https://soyuka.me/mieux-organiser-ses-sockets-avec-express-js/

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

import { normalizeHerotag } from "../utils/transactions";
import logger from "./logger";
import { subscriber } from "./redis";

export const listen = (server: HttpServer): void => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  io.sockets.on("connection", (socket: Socket) => {
    const room = socket?.handshake?.query?.streamerHerotag;
    if (room) {
      socket.join(normalizeHerotag(room as string));
    }
  });

  subscriber.psubscribe("NEW_DONATION");

  subscriber.on("pmessage", function(_, channel, stringifiedData) {
    try {
      const { room, ...parsedData } = JSON.parse(stringifiedData);

      io.to(room).emit("newDonation", parsedData);
    } catch (error) {
      logger.error("Unparsable redis publish data", {
        error,
        channel,
        stringifiedData,
      });
    }
  });
};
