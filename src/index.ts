import { connectToDatabase } from "./services/mongoose";

connectToDatabase();

import http from "http";
import app from "./app";
import { listen } from "./services/sockets";
import { pollTransactionsToVerifyAccountStatuses } from "./processes/auth";
import { recoverPollingProcesses } from "./processes/maiar";

const PORT = 4000;

const server = http.createServer(app);

listen(server);

server.listen(PORT, async () => {
  console.log(`Start listenning on port : ${PORT}`);

  try {
    pollTransactionsToVerifyAccountStatuses();
    console.log("start polling transactions to verify account statuses");
    recoverPollingProcesses();
  } catch (err) {
    console.log(err);

    throw err;
  }
});
