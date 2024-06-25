const express = require("express");

const app = express();

const morgan = require("morgan");

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser reading data from body into req.body
app.user(express.json({ limit: "10kb" }));

app.use("/monter/api/v1/users", userRouter);
app.use("/monter/api/v1/admin", adminRouter);

module.exports = app;
