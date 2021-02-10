import { connectToDatabase } from "./services/mongoose";

connectToDatabase();

import https from "https";
import http from "http";
import fs from "fs";
import app from "./app";
import { listen } from "./services/sockets";
import { pollTransactionsToVerifyAccountStatuses } from "./processes/auth";

const PORT = 4000;

const server = http.createServer(app);

listen(server);

server.listen(PORT, async () => {
  console.log(`Start listenning on port : ${PORT}`);

  try {
    await pollTransactionsToVerifyAccountStatuses();
    console.log("start to poll transactions to verify account statuses");
  } catch (err) {
    console.log(err);

    throw err;
  }
});
