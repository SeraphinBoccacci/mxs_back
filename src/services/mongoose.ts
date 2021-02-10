import mongoose from "mongoose";

export const connectToDatabase = async () => {
  mongoose
    .connect("mongodb://localhost:27017/mxs", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log(`CONNECTED TO DATABASE`);
    })
    .catch((err: any) => {
      console.log("Connection failed", err);
    });
};
