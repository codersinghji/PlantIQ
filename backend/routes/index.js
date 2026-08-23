import express from "express";

const router = express.Router();

// Home Route 

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to PlantIQ Backend"});
});

export default router;