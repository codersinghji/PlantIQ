import mongoose from "mongoose";
import SensorData from "../models/SensorData.js";
import Equipment from "../models/Equipment.js";
import Prediction from "../models/Prediction.js";
import { predictMachineFailure } from "../services/mlService.js";


// ==========================================
// CREATE SENSOR DATA
// ==========================================
export const createSensorData = async (req, res) => {
    try {

        const {
            equipmentId,

            // Existing sensor fields
            temperature,
            vibration,
            pressure,
            operatingHours,

            // ML fields
            machineType,
            airTemperature,
            processTemperature,
            rotationalSpeed,
            torque,
            toolWear

        } = req.body;


        // ==========================================
        // 1. CHECK REQUIRED FIELDS
        // ==========================================

        if (
            !equipmentId ||
            temperature === undefined ||
            vibration === undefined ||
            pressure === undefined ||
            operatingHours === undefined ||
            !machineType ||
            airTemperature === undefined ||
            processTemperature === undefined ||
            rotationalSpeed === undefined ||
            torque === undefined ||
            toolWear === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        // ==========================================
        // 2. VALIDATE EQUIPMENT ID
        // ==========================================

        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid equipment ID"
            });
        }


        // ==========================================
        // 3. CHECK EQUIPMENT
        // ==========================================

        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }


        // ==========================================
        // 4. CREATE SENSOR DATA
        // ==========================================

        const sensorData = await SensorData.create({

            equipmentId,

            temperature,
            vibration,
            pressure,
            operatingHours,

            machineType,
            airTemperature,
            processTemperature,
            rotationalSpeed,
            torque,
            toolWear

        });


        // ==========================================
        // 5. CALL ML SERVICE
        // ==========================================

        const mlResult = await predictMachineFailure({

            machineType,
            airTemperature,
            processTemperature,
            rotationalSpeed,
            torque,
            toolWear

        });


        // ==========================================
        // 6. CHECK ML RESULT
        // ==========================================

        if (!mlResult || !mlResult.success) {

            return res.status(500).json({
                success: false,
                message: "ML prediction failed",
                sensorData
            });

        }


        // ==========================================
        // 7. SAVE PREDICTION
        // ==========================================

        const prediction = await Prediction.create({

            equipmentId,

            sensorDataId: sensorData._id,

            prediction: mlResult.risk_level,

            failureProbability:
                mlResult.failure_probability

        });


        // ==========================================
        // 8. FINAL RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Sensor data and ML prediction created successfully",

            sensorData,

            prediction

        });


    } catch (error) {

        console.error(
            "Create Sensor Data Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};

export const getAllSensorData = async (req, res) => {
    try {

        const sensorData = await SensorData.find()
            .populate(
                "equipmentId",
                "equipmentCode name type location status"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sensorData.length,
            sensorData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


export const getSensorDataByEquipment = async (req, res) => {
    try {

        const { equipmentId } = req.params;

         const sensorData = await SensorData
    .find({ equipmentId })
    .populate(
        "equipmentId",
        "name type location status"
    )
    .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sensorData.length,
            sensorData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getSensorDataById = async (req, res) => {
    try {

        const { id } = req.params;

        // Check ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sensor data ID"
            });
        }

           const sensorData = await SensorData
           .findById(id)
          .populate(
          "equipmentId",
           "name type location status"
          );

        if (!sensorData) {
            return res.status(404).json({
                success: false,
                message: "Sensor data not found"
            });
        }

        res.status(200).json({
            success: true,
            sensorData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateSensorData = async (req, res) => {
    try {

        const sensorDataId = req.params.id;

        const {
            temperature,
            vibration,
            pressure,
            operatingHours
        } = req.body;

        const sensorData = await SensorData.findByIdAndUpdate(
            sensorDataId,
            {
                temperature,
                vibration,
                pressure,
                operatingHours
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!sensorData) {
            return res.status(404).json({
                success: false,
                message: "Sensor data not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Sensor data updated successfully",
            sensorData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteSensorData = async (req, res) => {
    try {

        const sensorDataId = req.params.id;

        const sensorData = await SensorData.findByIdAndDelete(
            sensorDataId
        );

        if (!sensorData) {
            return res.status(404).json({
                success: false,
                message: "Sensor data not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Sensor data deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
