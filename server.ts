import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config({ path: "../monter/config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log("DB connection successful!...");
});

const app = require("./app");

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`App is Running on port ${port}`);
});
