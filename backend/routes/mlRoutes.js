import express from "express";
import { predictMachineFailure } from "../services/mlService.js";

const router = express.Router();

router.post("/test-ml", async (req, res) => {
    try {

        const result = await predictMachineFailure(req.body);

        res.status(200).json({
            success: true,
            message: "ML service called successfully",
            result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

export default router;