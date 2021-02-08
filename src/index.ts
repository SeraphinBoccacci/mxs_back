import { connectToDatabase } from "./services/mongoose";

connectToDatabase();

import http from "http";
import { pollBalance } from "./utils/poll";
import app from "./app";
import { listen } from "./services/sockets";
import { pollTransactionsToVerifyAccountStatuses } from "./processes/auth";

const server = http.createServer(app);

listen(server);

var stop = false;

setTimeout(() => {
  stop = true;
}, 5000);

server.listen(4000, async () => {
  console.log("start listenning");

  try {
    await pollTransactionsToVerifyAccountStatuses();
    console.log("start to poll transactions to verify account statuses");
  } catch (err) {
    console.log(err);

    throw err;
  }
});
