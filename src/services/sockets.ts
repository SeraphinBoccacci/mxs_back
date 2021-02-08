// https://soyuka.me/mieux-organiser-ses-sockets-avec-express-js/

import { Server as HttpServer } from "http";
import { Socket, Server } from "socket.io";
import { isProfileVerified } from "../processes/auth";

export const listen = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      methods: ["GET", "POST"],
    },
  });

  io.sockets.on("connection", (socket: Socket) => {
    // console.log("A new socket has joined: " + socket.id);
    // socket.on("hello", function(data: any) {
    //   console.log(data);
    // });
    // socket.on("pendingVerification", async (data: { herotag: string }) => {
    //   const isVerified = await isProfileVerified(data.herotag);
    //   if (isVerified) socket.emit("profilVerified", { herotag: data.herotag });
    // });
  });
};
