import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log("DB connection successful!...");
});

import app from "./app";

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App is Running on port ${port}`);
});
