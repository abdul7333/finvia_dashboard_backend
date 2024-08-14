import { config } from "dotenv";
config();

export const MONGO_URL = process.env.MONGO_URL as string;
export const PORT = process.env.PORT as string;
export const JWT_TOKEN = process.env.JWT_TOKEN as string;
