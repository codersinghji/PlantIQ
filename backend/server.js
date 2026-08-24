import express from "express";  
import dotenv from "dotenv";
import cors from "cors";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import sensorDataRoutes from "./routes/sensorDataRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";


import connectDB from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());

// =========================================
// ROOT
// =========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PlantIQ API is running"
    });
});

// =========================================
// API ROUTES
// =========================================

app.use("/api", indexRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/equipment", equipmentRoutes);

app.use("/api/predictions", predictionRoutes);

app.use("/api/sensor-data", sensorDataRoutes);

app.use("/api/ml", mlRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use(
    "/api/monitoring",
    monitoringRoutes
);

// =========================================
// DATABASE
// =========================================

connectDB();

// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {
    console.log(
        `🚀 Server is running on http://localhost:${PORT}`
    );
});