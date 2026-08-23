import express from "express";

import {
    getAllPredictions,
    getPredictionById,
    getPredictionsByEquipment,
    getPredictionSummary
} from "../controllers/predictionController.js";

const router = express.Router();


// =========================================================
// ALL PREDICTIONS
// =========================================================

router.get(
    "/",
    getAllPredictions
);


// =========================================================
// SUMMARY
// IMPORTANT: MUST COME BEFORE /:id
// =========================================================

router.get(
    "/summary",
    getPredictionSummary
);


// =========================================================
// BY EQUIPMENT
// =========================================================

router.get(
    "/equipment/:equipmentId",
    getPredictionsByEquipment
);


// =========================================================
// BY ID
// =========================================================

router.get(
    "/:id",
    getPredictionById
);


export default router;