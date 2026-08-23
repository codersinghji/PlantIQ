import pandas as pd
import joblib

from sklearn.model_selection import train_test_split

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("dataset/ai4i2020.csv")


# ==========================================
# 2. DATA INSPECTION
# ==========================================

print("Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns)

print("\nFirst 5 rows:")
print(df.head())

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

print("\nTarget distribution:")
print(df["Machine failure"].value_counts())


# ==========================================
# 3. FEATURE SELECTION
# ==========================================

features = [
    "Type",
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]"
]

target = "Machine failure"


X = df[features]

y = df[target]


# ==========================================
# 4. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nX shape:", X.shape)
print("y shape:", y.shape)

print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)

print("y_train shape:", y_train.shape)
print("y_test shape:", y_test.shape)


# ==========================================
# 5. PREPROCESSING
# ==========================================

categorical_features = [
    "Type"
]

numerical_features = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]"
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            StandardScaler(),
            numerical_features
        ),

        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ]
)


# Fit preprocessing on training data
X_train_processed = preprocessor.fit_transform(
    X_train
)

# Transform test data
X_test_processed = preprocessor.transform(
    X_test
)


print(
    "Processed training shape:",
    X_train_processed.shape
)

print(
    "Processed testing shape:",
    X_test_processed.shape
)


# ==========================================
# 6. CREATE ML MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# 7. TRAIN MODEL
# ==========================================

print("\nTraining model...")

model.fit(
    X_train_processed,
    y_train
)

print("Model training completed.")


# ==========================================
# 8. FAILURE PROBABILITY
# ==========================================

y_probability = model.predict_proba(
    X_test_processed
)[:, 1]


print("\nFirst 10 failure probabilities:")

print(y_probability[:10])


# ==========================================
# 9. FEATURE IMPORTANCE
# ==========================================

feature_names = preprocessor.get_feature_names_out()


print("\n================================")
print("       FEATURE IMPORTANCE")
print("================================")


for name, value in zip(
    feature_names,
    model.feature_importances_
):
    print(
        f"{name}: {value:.4f}"
    )


# ==========================================
# 10. THRESHOLD ANALYSIS
# ==========================================

print("\n================================")
print("       THRESHOLD ANALYSIS")
print("================================")


thresholds = [
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
    0.50
]


for threshold in thresholds:

    y_threshold_pred = (
        y_probability >= threshold
    ).astype(int)


    threshold_precision = precision_score(
        y_test,
        y_threshold_pred,
        zero_division=0
    )


    threshold_recall = recall_score(
        y_test,
        y_threshold_pred,
        zero_division=0
    )


    threshold_f1 = f1_score(
        y_test,
        y_threshold_pred,
        zero_division=0
    )


    print(
        f"Threshold: {threshold:.2f} | "
        f"Precision: {threshold_precision:.3f} | "
        f"Recall: {threshold_recall:.3f} | "
        f"F1: {threshold_f1:.3f}"
    )


# ==========================================
# 11. PLANTIQ DECISION THRESHOLD
# ==========================================

THRESHOLD = 0.40


y_pred = (
    y_probability >= THRESHOLD
).astype(int)


print(
    "\nSelected threshold:",
    THRESHOLD
)


# ==========================================
# 12. MODEL EVALUATION
# ==========================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)


recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)


f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)


cm = confusion_matrix(
    y_test,
    y_pred
)


print("\n================================")
print("       FINAL MODEL EVALUATION")
print("================================")


print(
    "Accuracy :",
    accuracy
)


print(
    "Precision:",
    precision
)


print(
    "Recall   :",
    recall
)


print(
    "F1 Score :",
    f1
)


print("\nConfusion Matrix:")

print(cm)


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ==========================================
# 13. RISK LEVEL FUNCTION
# ==========================================

def get_risk_level(probability):

    if probability < 0.20:
        return "LOW"

    elif probability < 0.40:
        return "MEDIUM"

    else:
        return "HIGH"


# ==========================================
# 14. SAMPLE RISK PREDICTIONS
# ==========================================

print("\n================================")
print("       SAMPLE RISK PREDICTIONS")
print("================================")


for probability in y_probability[:10]:

    risk = get_risk_level(
        probability
    )

    print(
        f"Probability: {probability:.2%} "
        f"| Risk: {risk}"
    )

   
# ==========================================
# 15. SAVE MODEL AND PREPROCESSOR
# ==========================================

print("\nSaving model...")

joblib.dump(
    model,
    "models/model.pkl"
)

print("Model saved successfully.")


print("Saving preprocessor...")

joblib.dump(
    preprocessor,
    "models/preprocessor.pkl"
)

print("Preprocessor saved successfully.")


print("\n================================")
print("       MODEL SAVED")
print("================================")

print("Model saved: models/model.pkl")
print("Preprocessor saved: models/preprocessor.pkl")   