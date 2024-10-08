"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const userRouters_1 = __importDefault(require("./Routers/userRouters"));
const adminRouters_1 = __importDefault(require("./Routers/adminRouters"));
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./Controllers/errorController"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, Please try again in an hours!",
});
app.use("/api", limiter);
// Body parser reading data from body into req.body
app.use(express_1.default.json({ limit: "10kb" }));
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Data sanitization against XSS
app.use((0, xss_clean_1.default)());
// Routes
app.use("/monter/api/v1/users", userRouters_1.default);
app.use("/monter/api/v1/admin", adminRouters_1.default);
app.all("*", (req, res, next) => {
    next(new appError_1.default(`can't find this ${req.originalUrl} on this server`, 404));
});
app.use(errorController_1.default);
exports.default = app;
