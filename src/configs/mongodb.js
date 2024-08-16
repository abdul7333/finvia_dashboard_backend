"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_variables_1 = require("../env-variables");
const mongoConnection = mongoose_1.default
    .connect(env_variables_1.MONGO_URL)
    .then(() => console.log("Successfully connected to Database"))
    .catch((err) => console.error("Error", err));
exports.default = mongoConnection;
