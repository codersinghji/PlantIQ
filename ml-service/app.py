from fastapi import FastAPI
from pydantic import BaseModel

import pandas as pd
import joblib


# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI(
    title="PlantIQ ML API",
    description="Machine Failure Prediction API",
    version="1.0.0"
)


# ==========================================
# LOAD MODEL
# ==========================================

model = joblib.load(
    "models/model.pkl"
)

preprocessor = joblib.load(
    "models/preprocessor.pkl"
)


print("✅ ML Model Loaded")
print("✅ Preprocessor Loaded")


# ==========================================
# INPUT DATA MODEL
# ==========================================

class MachineData(BaseModel):

    type: str

    air_temperature: float

    process_temperature: float

    rotational_speed: float

    torque: float

    tool_wear: float


# ==========================================
# HOME API
# ==========================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "PlantIQ ML API is running"
    }


# ==========================================
# PREDICTION API
# ==========================================

@app.post("/predict")
def predict_machine(data: MachineData):

    # Create DataFrame

    input_data = pd.DataFrame([
        {
            "Type": data.type,

            "Air temperature [K]":
                data.air_temperature,

            "Process temperature [K]":
                data.process_temperature,

            "Rotational speed [rpm]":
                data.rotational_speed,

            "Torque [Nm]":
                data.torque,

            "Tool wear [min]":
                data.tool_wear
        }
    ])


    # Apply same preprocessing
    # used during training

    processed_data = preprocessor.transform(
        input_data
    )


    # Calculate failure probability

    probability = model.predict_proba(
        processed_data
    )[0][1]


    # PlantIQ threshold

    THRESHOLD = 0.40


    # Final prediction

    prediction = int(
        probability >= THRESHOLD
    )


    # Risk level

    if probability < 0.20:

        risk = "LOW"

    elif probability < 0.40:

        risk = "MEDIUM"

    else:

        risk = "HIGH"


    # API response

    return {

        "success": True,

        "failure_probability":
            round(float(probability), 4),

        "prediction":
            prediction,

        "risk_level":
            risk
    }