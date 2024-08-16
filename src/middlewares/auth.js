"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_variables_1 = require("../env-variables");
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const privateKey = env_variables_1.JWT_TOKEN;
        const token = req.cookies["next-token"];
        if (!token) {
            res.status(401).json({
                success: false,
                error: "Unauthorized access",
                message: "No token found",
            });
            return;
        }
        jsonwebtoken_1.default.verify(token, privateKey, (err, decoded) => {
            var _a;
            if (err) {
                res.status(401).json({
                    success: false,
                    error: "Unauthorized access",
                    message: (_a = err.message) !== null && _a !== void 0 ? _a : "Invalid token",
                });
                return;
            }
            else {
                req.userId = decoded.userId;
                next();
            }
        });
    }
    catch (error) {
        console.error("Error in authentication middleware:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
exports.isAuth = isAuth;
