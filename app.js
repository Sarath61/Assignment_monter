const express = require("express");

const app = express();

const morgan = require("morgan");

const userRouter = require("./Routers/userRouters");

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

app.use('/monter/api/v1/users', userRouter);
// app.use("/monter/api/v1/admin", adminRouter);

module.exports = app;
