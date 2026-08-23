import axios from "axios";


/* =========================================================
   PLANTIQ ML SERVICE
========================================================= */

const ML_API_URL =
    process.env.ML_API_URL ||
    "http://127.0.0.1:8000";


/* =========================================================
   PREDICT MACHINE FAILURE
========================================================= */

export const predictMachineFailure = async ({
    machineType,
    airTemperature,
    processTemperature,
    rotationalSpeed,
    torque,
    toolWear
}) => {

    try {

        console.log(
            "🤖 Sending data to ML service..."
        );

        console.log({
            machineType,
            airTemperature,
            processTemperature,
            rotationalSpeed,
            torque,
            toolWear
        });


        /* =====================================================
           CALL FASTAPI
        ===================================================== */

        const response = await axios.post(
            `${ML_API_URL}/predict`,
            {
                type: machineType,

                air_temperature:
                    Number(airTemperature),

                process_temperature:
                    Number(processTemperature),

                rotational_speed:
                    Number(rotationalSpeed),

                torque:
                    Number(torque),

                tool_wear:
                    Number(toolWear)
            },
            {
                timeout: 10000,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );


        console.log(
            "🤖 ML Response:",
            response.data
        );


        /* =====================================================
           VALIDATE RESPONSE
        ===================================================== */

        if (
            !response.data ||
            response.data.success !== true
        ) {

            return {
                success: false,
                message:
                    "Invalid response from ML service"
            };

        }


        /* =====================================================
           RETURN ML RESULT
        ===================================================== */

        return {

            success: true,

            failure_probability:
                Number(
                    response.data
                        .failure_probability
                ),

            prediction:
                response.data.prediction,

            risk_level:
                response.data.risk_level

        };


    } catch (error) {

        console.error(
            "❌ ML Service Error:"
        );


        if (error.response) {

            console.error(
                "Status:",
                error.response.status
            );

            console.error(
                "Response:",
                error.response.data
            );

        } else if (error.request) {

            console.error(
                "No response received from ML service."
            );

        } else {

            console.error(
                error.message
            );

        }


        return {

            success: false,

            message:
                "ML service is unavailable"

        };

    }

};