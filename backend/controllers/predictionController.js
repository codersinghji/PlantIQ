import mongoose from "mongoose";

import Prediction from "../models/Prediction.js";
import Equipment from "../models/Equipment.js";
import SensorData from "../models/SensorData.js";


// =========================================================
// COMMON POPULATE
// =========================================================

const populatePrediction = (query) => {

    return query
        .populate(
            "equipmentId",
            "equipmentCode name type location status"
        )
        .populate(
            "sensorDataId",
            "temperature vibration pressure operatingHours machineType airTemperature processTemperature rotationalSpeed torque toolWear createdAt"
        );

};


// =========================================================
// GET ALL PREDICTIONS
// GET /api/predictions
// =========================================================

export const getAllPredictions = async (req, res) => {

    try {

        const predictions = await populatePrediction(
            Prediction.find()
        )
            .sort({ createdAt: -1 })
            .lean();


        return res.status(200).json({

            success: true,

            count: predictions.length,

            predictions

        });

    } catch (error) {

        console.error(
            "Get All Predictions Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Unable to fetch predictions",

            error: error.message

        });

    }

};


// =========================================================
// GET PREDICTION BY ID
// GET /api/predictions/:id
// =========================================================

export const getPredictionById = async (req, res) => {

    try {

        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid prediction ID"

            });

        }


        const prediction = await populatePrediction(
            Prediction.findById(id)
        )
            .lean();


        if (!prediction) {

            return res.status(404).json({

                success: false,

                message: "Prediction not found"

            });

        }


        return res.status(200).json({

            success: true,

            prediction

        });

    } catch (error) {

        console.error(
            "Get Prediction By ID Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Unable to fetch prediction",

            error: error.message

        });

    }

};


// =========================================================
// GET PREDICTIONS BY EQUIPMENT
// GET /api/predictions/equipment/:equipmentId
// =========================================================

export const getPredictionsByEquipment = async (
    req,
    res
) => {

    try {

        const { equipmentId } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                equipmentId
            )
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid equipment ID"

            });

        }


        const equipment =
            await Equipment.findById(
                equipmentId
            ).lean();


        if (!equipment) {

            return res.status(404).json({

                success: false,

                message: "Equipment not found"

            });

        }


        const predictions =
            await populatePrediction(
                Prediction.find({
                    equipmentId
                })
            )
                .sort({
                    createdAt: -1
                })
                .lean();


        return res.status(200).json({

            success: true,

            count: predictions.length,

            equipment,

            predictions

        });

    } catch (error) {

        console.error(
            "Get Equipment Predictions Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch equipment predictions",

            error: error.message

        });

    }

};


// =========================================================
// GET PREDICTION SUMMARY
// GET /api/predictions/summary
// =========================================================

export const getPredictionSummary = async (
    req,
    res
) => {

    try {

        const predictions =
            await Prediction.find()
                .sort({
                    createdAt: -1
                })
                .lean();


        const total =
            predictions.length;


        const low =
            predictions.filter(
                item =>
                    String(item.prediction)
                        .toUpperCase() === "LOW"
            ).length;


        const medium =
            predictions.filter(
                item =>
                    String(item.prediction)
                        .toUpperCase() === "MEDIUM"
            ).length;


        const high =
            predictions.filter(
                item =>
                    String(item.prediction)
                        .toUpperCase() === "HIGH"
            ).length;


        const averageFailureProbability =
            total > 0

                ? predictions.reduce(
                    (sum, item) => {

                        return (
                            sum +
                            Number(
                                item.failureProbability || 0
                            )
                        );

                    },
                    0
                ) / total

                : 0;


        // =====================================================
        // GET LATEST PREDICTION WITH EQUIPMENT + SENSOR
        // =====================================================

        let latest = null;


        if (predictions.length > 0) {

            latest =
                await populatePrediction(
                    Prediction.findById(
                        predictions[0]._id
                    )
                )
                    .lean();

        }


        return res.status(200).json({

            success: true,

            summary: {

                total,

                low,

                medium,

                high,

                averageFailureProbability:
                    Number(
                        averageFailureProbability.toFixed(4)
                    ),

                latest

            }

        });

    } catch (error) {

        console.error(
            "Prediction Summary Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch prediction summary",

            error: error.message

        });

    }

};