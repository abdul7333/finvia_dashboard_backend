import mongoose from "mongoose";
import { MONGO_URL } from "../env-variables";

const mongoConnection = mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Successfully connected to Database"))
  .catch((err) => console.error("Error", err));

export default mongoConnection;
