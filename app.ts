import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import userRouter from "./Routers/userRouters";
import adminRouter from "./Routers/adminRouters";
import AppError from "./utils/appError";
import globalErrorHandler from "./Controllers/errorController";

const app = express();

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

export default app;
