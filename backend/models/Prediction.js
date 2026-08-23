import mongoose from "mongoose";


// =========================================================
// PREDICTION SCHEMA
// =========================================================

const predictionSchema = new mongoose.Schema(
    {

        // =====================================================
        // EQUIPMENT
        // =====================================================

        equipmentId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Equipment",

            required: true,

            index: true

        },


        // =====================================================
        // SENSOR DATA
        // =====================================================

        sensorDataId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "SensorData",

            required: true,

            index: true

        },


        // =====================================================
        // PREDICTION RESULT
        // =====================================================

        prediction: {

            type: String,

            enum: [
                "LOW",
                "MEDIUM",
                "HIGH"
            ],

            required: true,

            uppercase: true,

            trim: true

        },


        // =====================================================
        // FAILURE PROBABILITY
        // Stored as decimal:
        //
        // 0     = 0%
        // 0.25  = 25%
        // 0.75  = 75%
        // 1     = 100%
        // =====================================================

        failureProbability: {

            type: Number,

            required: true,

            min: 0,

            max: 1

        }

    },

    {
        timestamps: true
    }
);


// =========================================================
// INDEXES
// =========================================================

predictionSchema.index({
    equipmentId: 1,
    createdAt: -1
});


predictionSchema.index({
    createdAt: -1
});


// =========================================================
// MODEL
// =========================================================

const Prediction = mongoose.model(
    "Prediction",
    predictionSchema
);


export default Prediction;