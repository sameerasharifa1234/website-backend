import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import admin from "firebase-admin";
import authRoutes from "./routes/auth";

// ─── Load Environment Variables ─────────────────────────────────────────
dotenv.config();

// ─── Firebase Admin Init ───────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// ─── Express App ───────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// ─── Start Server ──────────────────────────────────────────────────────
const PORT: number = parseInt(process.env.PORT || "4000", 10);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});