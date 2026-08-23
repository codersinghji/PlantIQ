import mongoose from "mongoose";
import Equipment from "../models/Equipment.js";
import SensorData from "../models/SensorData.js";
import Prediction from "../models/Prediction.js";


// =========================================================
// GET MONITORING DATA
// GET /api/monitoring?equipmentId=...
// =========================================================

export const getMonitoringData = async (req, res) => {

    try {

        const { equipmentId } = req.query;


        // =====================================================
        // VALIDATE EQUIPMENT ID
        // =====================================================

        if (!equipmentId) {

            return res.status(400).json({
                success: false,
                message: "Equipment ID is required."
            });

        }


        // =====================================================
        // VALIDATE OBJECT ID FORMAT
        // =====================================================

        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid equipment ID."
            });

        }


        // =====================================================
        // FIND EQUIPMENT
        // =====================================================

        const equipment = await Equipment
            .findById(equipmentId)
            .lean();


        if (!equipment) {

            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });

        }


        // =====================================================
        // LATEST SENSOR DATA
        // =====================================================

        const latestSensorData = await SensorData
            .findOne({
                equipmentId
            })
            .sort({
                createdAt: -1
            })
            .lean();


        // =====================================================
        // LATEST PREDICTION
        // =====================================================

        const latestPrediction = await Prediction
            .findOne({
                equipmentId
            })
            .sort({
                createdAt: -1
            })
            .lean();


        // =====================================================
        // SENSOR HISTORY
        // =====================================================

        const sensorHistory = await SensorData
            .find({
                equipmentId
            })
            .sort({
                createdAt: -1
            })
            .limit(20)
            .lean();


        // =====================================================
        // PREDICTION HISTORY
        // =====================================================

        const predictionHistory = await Prediction
            .find({
                equipmentId
            })
            .sort({
                createdAt: -1
            })
            .limit(20)
            .lean();


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            monitoring: {

                equipment,

                latestSensorData,

                latestPrediction,

                // Oldest → newest for charts/table
                sensorHistory: sensorHistory.reverse(),

                predictionHistory: predictionHistory.reverse(),

                lastUpdated:
                    latestSensorData?.createdAt ||
                    latestPrediction?.createdAt ||
                    equipment.updatedAt ||
                    null

            }

        });

    } catch (error) {

        console.error(
            "Monitoring Data Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load monitoring data."

        });

    }

};