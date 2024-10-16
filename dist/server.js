"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../config.env") });
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose_1.default.connect(DB).then((con) => {
    console.log("DB connection successful!...");
});
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT || 8000;
const server = app_1.default.listen(port, () => {
    console.log(`App is Running on port ${port}`);
});
