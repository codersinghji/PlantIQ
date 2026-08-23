import express from "express";

import {
    getDashboardSummary
} from "../controllers/dashboardController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


// =========================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// =========================================================

router.get(
    "/summary",
    authMiddleware,
    getDashboardSummary
);


export default router;