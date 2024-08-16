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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_variables_1 = require("./env-variables");
const mongodb_1 = __importDefault(require("./configs/mongodb"));
const leadRoutes_1 = __importDefault(require("./routes/lead/leadRoutes"));
const userRoutes_1 = __importDefault(require("./routes/user/userRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profile/profileRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const callsRoutes_1 = __importDefault(require("./routes/calls/callsRoutes"));
const clientComplaintRoutes_1 = __importDefault(require("./routes/clientComplaint/clientComplaintRoutes"));
const monthlyComplaintRoutes_1 = __importDefault(require("./routes/monthlyComplaint/monthlyComplaintRoutes"));
const AnnualComplaintRoutes_1 = __importDefault(require("./routes/AnnualComplaint/AnnualComplaintRoutes"));
const app = (0, express_1.default)();
const port = env_variables_1.PORT || 8081;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://finvia.vercel.app",
    ],
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: "test msg" });
}));
app.use("/leads", leadRoutes_1.default);
app.use("/users", userRoutes_1.default);
app.use("/profile", profileRoutes_1.default);
app.use("/calls", callsRoutes_1.default);
app.use("/ClientComplaint", clientComplaintRoutes_1.default);
app.use("/MonthlyComplaint", monthlyComplaintRoutes_1.default);
app.use("/AnnualComplaint", AnnualComplaintRoutes_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongodb_1.default;
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}/`);
        });
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
});
startServer();
