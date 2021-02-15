// https://soyuka.me/mieux-organiser-ses-sockets-avec-express-js/

import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { isProfileVerified } from "../processes/auth";
import { normalizeHerotag } from "../utils/maiar";
import { subscriber } from "./redis";

export const listen = (server: HttpServer) => {
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
      console.log(
        "socket joined room ",
        `-${normalizeHerotag(room as string)}-`
      );
      socket.join(normalizeHerotag(room as string));
    }
  });

  subscriber.on("psubscribe", function(channel, count) {
    console.log(channel, count, "subcribed");
  });

  subscriber.psubscribe("NEW_DONATION");

  subscriber.on("pmessage", function(_, channel, stringifiedData) {
    try {
      const { room, ...parsedData } = JSON.parse(stringifiedData);

      console.log(parsedData);

      io.to(room).emit("newDonation", parsedData);
    } catch (e) {
      console.log(e);
      console.log("Unable to parse data", { channel, stringifiedData });
    }
  });
};
