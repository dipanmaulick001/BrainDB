import dotenv from "dotenv"

dotenv.config();

export const MONGO_URL = process.env.MONGO_URL as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const PORT = process.env.PORT || 3000;

if(!MONGO_URL) throw new Error("MONGO_URL missing in .env");
if(!JWT_SECRET) throw new Error("JWT_SECRET missing in .env");