import express from "express";
import cors from "cors";
import { PORT } from "./env-variables";
import mongoConnection from "./configs/mongodb";
import leadRoutes from "./routes/lead/leadRoutes";
import userRoutes from "./routes/user/userRoutes";
import profileRoutes from "./routes/profile/profileRoutes";
import cookieParser from "cookie-parser";
import CallsRoutes from "./routes/calls/callsRoutes";
import ClientComplaintRoutes from "./routes/clientComplaint/clientComplaintRoutes";
import monthlyComplaintRoutes from "./routes/monthlyComplaint/monthlyComplaintRoutes";
import AnnualComplaintRoutes from "./routes/AnnualComplaint/AnnualComplaintRoutes";
const app = express();

const port = PORT || 8081;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://finvia.vercel.app/",
    ],
  })
);
app.get("/", async (req, res) => {
  res.json({ message: "test msg" });
});
app.use("/leads", leadRoutes);
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/calls",CallsRoutes);
app.use("/ClientComplaint",ClientComplaintRoutes)
app.use("/MonthlyComplaint",monthlyComplaintRoutes)
app.use("/AnnualComplaint",AnnualComplaintRoutes)
const startServer = async () => {
  try {
    await mongoConnection;
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}/`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

startServer();
