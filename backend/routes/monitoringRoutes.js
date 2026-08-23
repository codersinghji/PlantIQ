import express from "express";

import {
    getMonitoringData
} from "../controllers/monitoringController.js";

const router = express.Router();

/* =========================================================
   MONITORING
========================================================= */

router.get(
    "/",
    getMonitoringData
);

export default router;