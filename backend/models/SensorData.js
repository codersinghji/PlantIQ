import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema(
    {
        // ==========================================
        // EQUIPMENT RELATION
        // ==========================================

        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            required: true
        },

        // ==========================================
        // EXISTING PLANTIQ SENSOR DATA
        // ==========================================

        temperature: {
            type: Number,
            required: true,
            min: 0
        },

        vibration: {
            type: Number,
            required: true,
            min: 0
        },

        pressure: {
            type: Number,
            required: true,
            min: 0
        },

        operatingHours: {
            type: Number,
            required: true,
            min: 0
        },

        // ==========================================
        // ML MODEL INPUT DATA
        // ==========================================

        machineType: {
            type: String,
            enum: ["L", "M", "H"]
        },

        airTemperature: {
            type: Number,
            min: 0
        },

        processTemperature: {
            type: Number,
            min: 0
        },

        rotationalSpeed: {
            type: Number,
            min: 0
        },

        torque: {
            type: Number,
            min: 0
        },

        toolWear: {
            type: Number,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("SensorData", sensorDataSchema);