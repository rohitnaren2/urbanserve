import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { dbInit } from "./backend/models/db-json-backup.js";
import authRoutes from "./backend/routes/authRoutes.js";
import serviceRoutes from "./backend/routes/serviceRoutes.js";
import bookingRoutes from "./backend/routes/bookingRoutes.js";
import adminRoutes from "./backend/routes/adminRoutes.js";

dotenv.config();

async function startServer() {
  // Synchronously initialize or seed tables if fresh container
  dbInit();

  const app = express();
  const PORT = 3000;

  // JSON Body Parser with limit for base64 photo uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route Registrations
  app.use("/api/auth", authRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", database: "connected" });
  });

  // Vite Single-Port integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Marketplace app listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
