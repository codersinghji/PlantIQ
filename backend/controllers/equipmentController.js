import mongoose from "mongoose";
import Equipment from "../models/Equipment.js";
import SensorData from "../models/SensorData.js";
import Prediction from "../models/Prediction.js";

// ==========================================
// CREATE EQUIPMENT
// POST /api/equipment
// ==========================================

export const createEquipment = async (req, res) => {
    try {
        const {
            equipmentCode,
            name,
            type,
            location,
            status
        } = req.body;

        // Validate required fields
        if (!equipmentCode || !name || !type || !location || !status) {
         return res.status(400).json({
        success: false,
        message: "All fields are required"
       });
       }

        // Create equipment
        const equipment = await Equipment.create({
            equipmentCode,
            name,
            type,
            location,
            status
        });

        res.status(201).json({
            success: true,
            message: "Equipment created successfully",
            equipment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// GET ALL EQUIPMENT
// GET /api/equipment
// ==========================================

export const getAllEquipment = async (req, res) => {
    try {

        const equipment = await Equipment.find();

        res.status(200).json({
            success: true,
            equipment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// GET EQUIPMENT BY ID
// GET /api/equipment/:id
// ==========================================

export const getEquipmentById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid equipment ID"
            });
        }

        const equipment = await Equipment.findById(id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        return res.status(200).json({
            success: true,
            equipment
        });

    } catch (error) {
        console.error("Get Equipment Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch equipment"
        });
    }
};


// ==========================================
// UPDATE EQUIPMENT
// PUT /api/equipment/:id
// ==========================================

export const updateEquipment = async (req, res) => {
    try {

        const equipmentId = req.params.id;

        const {
            name,
            type,
            location,
            status
        } = req.body;

        // Update equipment
        const equipment = await Equipment.findByIdAndUpdate(
            equipmentId,
            {
                name,
                type,
                location,
                status
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Check if equipment exists
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Equipment updated successfully",
            equipment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// DELETE EQUIPMENT
// DELETE /api/equipment/:id
// ==========================================

export const deleteEquipment = async (req, res) => {
    try {

        const equipmentId = req.params.id;

        // Delete equipment
        const equipment = await Equipment.findByIdAndDelete(
            equipmentId
        );

        // Check if equipment exists
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Equipment deleted successfully",
            equipment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// GET EQUIPMENT DASHBOARD
// ==========================================

export const getEquipmentDashboard = async (req, res) => {
    try {

        const { equipmentId } = req.params;

        // 1. Validate equipment ID
        if (!mongoose.Types.ObjectId.isValid(equipmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid equipment ID"
            });
        }

        // 2. Find equipment
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        // 3. Find latest sensor data
        const latestSensorData = await SensorData.findOne({
            equipmentId: equipmentId
        })
            .sort({ createdAt: -1 });

        // 4. Find latest ML prediction
        const latestPrediction = await Prediction.findOne({
            equipmentId: equipmentId
        })
            .sort({ createdAt: -1 });

        // 5. Return dashboard data
        res.status(200).json({
            success: true,

            dashboard: {
                equipment: {
                    _id: equipment._id,
                    equipmentCode: equipment.equipmentCode,
                    name: equipment.name,
                    type: equipment.type,
                    location: equipment.location,
                    status: equipment.status
                },

                latestSensorData,

                latestPrediction
            }
        });

    } catch (error) {

        console.error(
            "Get Equipment Dashboard Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getEquipmentHistory = async (req, res) => {
    try {

        const { equipmentId } = req.params;

        // 1. Check equipment
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found"
            });
        }

        // 2. Get sensor history
        const sensorData = await SensorData.find({
            equipmentId
        }).sort({ createdAt: -1 });

        // 3. Get prediction history
        const predictions = await Prediction.find({
            equipmentId
        }).sort({ createdAt: -1 });

        // 4. Return history
        res.status(200).json({
            success: true,

            equipment: {
                _id: equipment._id,
                equipmentCode: equipment.equipmentCode,
                name: equipment.name,
                type: equipment.type,
                location: equipment.location,
                status: equipment.status
            },

            sensorHistory: sensorData,

            predictionHistory: predictions
        });

    } catch (error) {

        console.error("Equipment History Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};