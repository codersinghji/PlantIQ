import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";
import {
    createSensorData,
    getAllSensorData,
    getSensorDataByEquipment,
    getSensorDataById,
     updateSensorData ,
     deleteSensorData
} from "../controllers/sensorDataController.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createSensorData
);

router.get(
    "/",
    authMiddleware,
    getAllSensorData
);

router.get(
    "/equipment/:equipmentId",
    authMiddleware,
    getSensorDataByEquipment
);

router.get(
    "/:id",
    authMiddleware,
    getSensorDataById
);

router.put("/:id",
     authMiddleware, 
     updateSensorData
    );

router.delete(
        "/:id", 
        authMiddleware, 
        deleteSensorData
    );

export default router;