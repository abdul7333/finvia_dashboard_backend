"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_TOKEN = exports.PORT = exports.MONGO_URL = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.MONGO_URL = process.env.MONGO_URL;
exports.PORT = process.env.PORT;
exports.JWT_TOKEN = process.env.JWT_TOKEN;
