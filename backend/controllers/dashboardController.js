import Equipment from "../models/Equipment.js";
import SensorData from "../models/SensorData.js";
import Prediction from "../models/Prediction.js";


// =========================================================
// DASHBOARD SUMMARY
// GET /api/dashboard/summary
// =========================================================

export const getDashboardSummary = async (req, res) => {

    try {

        // =====================================================
        // 1. EQUIPMENT STATISTICS
        // =====================================================

        const totalEquipment =
            await Equipment.countDocuments();


        const runningEquipment =
            await Equipment.countDocuments({
                status: {
                    $regex: /^running$/i
                }
            });


        const stoppedEquipment =
            await Equipment.countDocuments({
                status: {
                    $regex: /^stopped$/i
                }
            });


        const maintenanceEquipment =
            await Equipment.countDocuments({
                status: {
                    $regex: /maintenance/i
                }
            });


        // =====================================================
        // 2. PREDICTION STATISTICS
        // =====================================================

        const totalPredictions =
            await Prediction.countDocuments();


        const lowRisk =
            await Prediction.countDocuments({
                prediction: "LOW"
            });


        const mediumRisk =
            await Prediction.countDocuments({
                prediction: "MEDIUM"
            });


        const highRisk =
            await Prediction.countDocuments({
                prediction: "HIGH"
            });


        // =====================================================
        // 3. AVERAGE FAILURE PROBABILITY
        // =====================================================

        const probabilityResult =
            await Prediction.aggregate([
                {
                    $group: {
                        _id: null,

                        average: {
                            $avg: "$failureProbability"
                        }
                    }
                }
            ]);


        const averageFailureProbability =
            probabilityResult.length > 0
                ? Number(
                    (
                        probabilityResult[0].average || 0
                    ).toFixed(4)
                )
                : 0;


        // =====================================================
        // 4. LATEST SENSOR DATA
        // =====================================================

        const latestSensorData =
            await SensorData.find()
                .populate(
                    "equipmentId",
                    "equipmentCode name type location status"
                )
                .sort({
                    createdAt: -1
                })
                .limit(8)
                .lean();


        // =====================================================
        // 5. LATEST PREDICTIONS
        // =====================================================

        const latestPredictions =
            await Prediction.find()
                .populate(
                    "equipmentId",
                    "equipmentCode name type location status"
                )
                .populate(
                    "sensorDataId",
                    "temperature vibration pressure operatingHours machineType airTemperature processTemperature rotationalSpeed torque toolWear createdAt"
                )
                .sort({
                    createdAt: -1
                })
                .limit(8)
                .lean();


        // =====================================================
        // 6. RECENT SENSOR COUNT
        // =====================================================

        const totalSensorRecords =
            await SensorData.countDocuments();


        // =====================================================
        // 7. RECENT EQUIPMENT
        // =====================================================

        const recentEquipment =
            await Equipment.find()
                .sort({
                    createdAt: -1
                })
                .limit(6)
                .lean();


        // =====================================================
        // 8. RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            summary: {

                totalEquipment,

                runningEquipment,

                stoppedEquipment,

                maintenanceEquipment,

                totalPredictions,

                lowRisk,

                mediumRisk,

                highRisk,

                averageFailureProbability,

                totalSensorRecords

            },

            latestPredictions,

            latestSensorData,

            recentEquipment

        });

    } catch (error) {

        console.error(
            "Dashboard Summary Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch dashboard data",

            error: error.message

        });

    }

};