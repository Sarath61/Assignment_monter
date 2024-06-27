const express = require("express");

const app = express();

const morgan = require("morgan");

const helmet = require("helmet");

const rateLimit = require("express-rate-limit");

const mongoSanitize = require("express-mongo-sanitize");

const xss = require("xss-clean");

const userRouter = require("./Routers/userRouters");
const adminRouter = require("./Routers/adminRouters");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");

app.use(helmet());
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, Please try again in an hours!",
});

app.use("/api", limiter);

// Body parser reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Routes
app.use("/monter/api/v1/users", userRouter);
app.use("/monter/api/v1/admin", adminRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find this ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
