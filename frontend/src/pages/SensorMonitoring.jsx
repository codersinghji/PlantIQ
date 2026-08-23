import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getAllEquipment,
    getMonitoringData
} from "../services/api";

import "../styles/SensorMonitoring.css";


function SensorMonitoring() {

    // =====================================================
    // STATE
    // =====================================================

    const [equipmentList, setEquipmentList] = useState([]);

    const [selectedEquipment, setSelectedEquipment] =
        useState("");

    const [monitoring, setMonitoring] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastRefresh, setLastRefresh] =
        useState(null);


    // =====================================================
    // LOAD EQUIPMENT
    // =====================================================

    useEffect(() => {

        const loadEquipment = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getAllEquipment();

                console.log(
                    "Equipment Response:",
                    response
                );


                const equipment =
                    response?.equipment ||
                    response?.data ||
                    response?.data?.equipment ||
                    [];


                setEquipmentList(equipment);


                // Automatically select first equipment
                if (
                    equipment.length > 0 &&
                    !selectedEquipment
                ) {

                    setSelectedEquipment(
                        equipment[0]._id
                    );

                }

            } catch (error) {

                console.error(
                    "Equipment Loading Error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load equipment."
                );

            } finally {

                setLoading(false);

            }

        };


        loadEquipment();

    }, []);


    // =====================================================
    // LOAD MONITORING DATA
    // =====================================================

    const loadMonitoring = useCallback(
        async (showLoader = false) => {

            if (!selectedEquipment) {
                return;
            }


            try {

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }


                const response =
                    await getMonitoringData(
                        selectedEquipment
                    );


                console.log(
                    "Monitoring Response:",
                    response
                );


                if (response?.success) {

                    setMonitoring(
                        response.monitoring || null
                    );

                    setError("");

                    setLastRefresh(
                        new Date()
                    );

                } else {

                    setError(
                        response?.message ||
                        "Unable to load monitoring data."
                    );

                }

            } catch (error) {

                console.error(
                    "Monitoring Error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load monitoring data."
                );

            } finally {

                if (showLoader) {
                    setLoading(false);
                } else {
                    setRefreshing(false);
                }

            }

        },
        [selectedEquipment]
    );


    // =====================================================
    // LOAD WHEN EQUIPMENT CHANGES
    // =====================================================

    useEffect(() => {

        if (!selectedEquipment) {
            return;
        }


        // First load
        loadMonitoring(true);


    }, [
        selectedEquipment,
        loadMonitoring
    ]);


    // =====================================================
    // AUTO REFRESH
    // Every 10 seconds
    // =====================================================

    useEffect(() => {

        if (!selectedEquipment) {
            return;
        }


        const interval = setInterval(() => {

            loadMonitoring(false);

        }, 10000);


        return () => {

            clearInterval(interval);

        };

    }, [
        selectedEquipment,
        loadMonitoring
    ]);


    // =====================================================
    // SAFE DATA
    // =====================================================

    const equipment =
        monitoring?.equipment || null;


    const latestSensorData =
        monitoring?.latestSensorData || null;


    const latestPrediction =
        monitoring?.latestPrediction || null;


    const sensorHistory =
        monitoring?.sensorHistory || [];


    const predictionHistory =
        monitoring?.predictionHistory || [];


    // =====================================================
    // FAILURE PROBABILITY
    // =====================================================

    const failureProbability =
        Math.min(
            Math.max(
                Number(
                    latestPrediction?.failureProbability || 0
                ),
                0
            ),
            1
        );


    const failurePercentage =
        Math.round(
            failureProbability * 100
        );


    // =====================================================
    // PREDICTION CLASS
    // =====================================================

    const predictionLevel =
        (
            latestPrediction?.prediction ||
            "N/A"
        ).toUpperCase();


    const predictionClass =
        predictionLevel.toLowerCase();


    // =====================================================
    // HISTORY
    // =====================================================

    const recentHistory =
        useMemo(() => {

            return [...sensorHistory]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                )
                .slice(0, 20);

        }, [sensorHistory]);


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDateTime = (date) => {

        if (!date) {
            return "--";
        }


        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =====================================================
    // FORMAT SHORT TIME
    // =====================================================

    const formatTime = (date) => {

        if (!date) {
            return "--";
        }


        return new Date(date).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading && !monitoring) {

        return (

            <div className="monitoring-page">

                <div className="monitoring-loading">

                    <div className="loading-spinner"></div>

                    <h3>
                        Loading Monitoring
                    </h3>

                    <p>
                        Connecting to equipment sensors...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="monitoring-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="monitoring-header">

                <div className="monitoring-title">

                    <div className="monitoring-eyebrow">

                        <span className="live-dot"></span>

                        LIVE MONITORING

                    </div>


                    <h1>
                        Sensor Monitoring
                    </h1>


                    <p>
                        Monitor real-time equipment
                        sensor data and machine health.
                    </p>


                    {lastRefresh && (

                        <div className="refresh-info">

                            <span>
                                Last synced:
                            </span>

                            <strong>
                                {formatTime(lastRefresh)}
                            </strong>

                            {refreshing && (

                                <span className="refreshing-text">
                                    Updating...
                                </span>

                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    EQUIPMENT SELECTOR
                ================================================= */}

                <div className="equipment-selector">

                    <label htmlFor="equipment-select">
                        Select Equipment
                    </label>


                    <select
                        id="equipment-select"
                        value={selectedEquipment}
                        onChange={(event) =>
                            setSelectedEquipment(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Select Equipment
                        </option>


                        {equipmentList.map(
                            (item) => (

                                <option
                                    key={item._id}
                                    value={item._id}
                                >

                                    {item.equipmentCode}
                                    {" - "}
                                    {item.name}

                                </option>

                            )
                        )}

                    </select>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="monitoring-error">

                    <div>

                        <strong>
                            Monitoring Error
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadMonitoring(true)
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!monitoring && !error && (

                <div className="monitoring-empty">

                    <div className="empty-icon">
                        📡
                    </div>

                    <h3>
                        No Monitoring Data
                    </h3>

                    <p>
                        Select an equipment to view
                        live sensor information.
                    </p>

                </div>

            )}


            {/* =================================================
                MONITORING CONTENT
            ================================================= */}

            {monitoring && (

                <>


                    {/* =================================================
                        EQUIPMENT SUMMARY
                    ================================================= */}

                    <section className="equipment-summary">

                        <div className="summary-item">

                            <span>
                                Equipment
                            </span>

                            <strong>
                                {equipment?.name || "--"}
                            </strong>

                        </div>


                        <div className="summary-item">

                            <span>
                                Equipment Code
                            </span>

                            <strong>
                                {equipment?.equipmentCode || "--"}
                            </strong>

                        </div>


                        <div className="summary-item">

                            <span>
                                Type
                            </span>

                            <strong>
                                {equipment?.type || "--"}
                            </strong>

                        </div>


                        <div className="summary-item">

                            <span>
                                Location
                            </span>

                            <strong>
                                {equipment?.location || "--"}
                            </strong>

                        </div>


                        <div className="summary-item">

                            <span>
                                Status
                            </span>

                            <strong
                                className={`equipment-status ${
                                    equipment?.status
                                        ?.toLowerCase()
                                        .replace(
                                            /\s+/g,
                                            "-"
                                        )
                                }`}
                            >

                                {equipment?.status || "--"}

                            </strong>

                        </div>

                    </section>


                    {/* =================================================
                        SENSOR CARDS
                    ================================================= */}

                    <section className="sensor-grid">


                        {/* TEMPERATURE */}

                        <div className="sensor-card temperature-card">

                            <div className="sensor-card-top">

                                <span className="sensor-label">
                                    Temperature
                                </span>

                                <span className="sensor-icon">
                                    🌡
                                </span>

                            </div>


                            <div className="sensor-value">

                                {latestSensorData?.temperature ??
                                    "--"}

                                <small>
                                    °C
                                </small>

                            </div>


                            <div className="sensor-card-footer">
                                Current reading
                            </div>

                        </div>


                        {/* VIBRATION */}

                        <div className="sensor-card vibration-card">

                            <div className="sensor-card-top">

                                <span className="sensor-label">
                                    Vibration
                                </span>

                                <span className="sensor-icon">
                                    ≋
                                </span>

                            </div>


                            <div className="sensor-value">

                                {latestSensorData?.vibration ??
                                    "--"}

                                <small>
                                    mm/s
                                </small>

                            </div>


                            <div className="sensor-card-footer">
                                Current reading
                            </div>

                        </div>


                        {/* PRESSURE */}

                        <div className="sensor-card pressure-card">

                            <div className="sensor-card-top">

                                <span className="sensor-label">
                                    Pressure
                                </span>

                                <span className="sensor-icon">
                                    ◉
                                </span>

                            </div>


                            <div className="sensor-value">

                                {latestSensorData?.pressure ??
                                    "--"}

                                <small>
                                    bar
                                </small>

                            </div>


                            <div className="sensor-card-footer">
                                Current reading
                            </div>

                        </div>


                        {/* OPERATING HOURS */}

                        <div className="sensor-card operating-card">

                            <div className="sensor-card-top">

                                <span className="sensor-label">
                                    Operating Hours
                                </span>

                                <span className="sensor-icon">
                                    ◷
                                </span>

                            </div>


                            <div className="sensor-value">

                                {latestSensorData?.operatingHours ??
                                    "--"}

                                <small>
                                    hrs
                                </small>

                            </div>


                            <div className="sensor-card-footer">
                                Total operating time
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        MACHINE PARAMETERS
                    ================================================= */}

                    <section className="monitoring-section">

                        <div className="section-header">

                            <div>

                                <span className="section-eyebrow">
                                    MACHINE DATA
                                </span>

                                <h2>
                                    Machine Parameters
                                </h2>

                                <p>
                                    Latest machine operating values
                                </p>

                            </div>

                        </div>


                        <div className="parameter-grid">


                            <div className="parameter-card">

                                <span>
                                    Air Temperature
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.airTemperature ??
                                        "--"}

                                    <small>
                                        K
                                    </small>

                                </strong>

                            </div>


                            <div className="parameter-card">

                                <span>
                                    Process Temperature
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.processTemperature ??
                                        "--"}

                                    <small>
                                        K
                                    </small>

                                </strong>

                            </div>


                            <div className="parameter-card">

                                <span>
                                    Rotational Speed
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.rotationalSpeed ??
                                        "--"}

                                    <small>
                                        RPM
                                    </small>

                                </strong>

                            </div>


                            <div className="parameter-card">

                                <span>
                                    Torque
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.torque ??
                                        "--"}

                                    <small>
                                        Nm
                                    </small>

                                </strong>

                            </div>


                            <div className="parameter-card">

                                <span>
                                    Tool Wear
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.toolWear ??
                                        "--"}

                                    <small>
                                        min
                                    </small>

                                </strong>

                            </div>


                            <div className="parameter-card">

                                <span>
                                    Machine Type
                                </span>

                                <strong>

                                    {latestSensorData
                                        ?.machineType ??
                                        "--"}

                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        MACHINE HEALTH
                    ================================================= */}

                    <section className="monitoring-section">

                        <div className="section-header">

                            <div>

                                <span className="section-eyebrow">
                                    AI ANALYSIS
                                </span>

                                <h2>
                                    Machine Health Prediction
                                </h2>

                                <p>
                                    Latest predictive maintenance result
                                </p>

                            </div>

                        </div>


                        <div className="prediction-card">


                            <div className="prediction-main">

                                <span className="prediction-label">
                                    Current Risk Level
                                </span>


                                <strong
                                    className={`prediction-value prediction-${predictionClass}`}
                                >

                                    {predictionLevel}

                                </strong>

                            </div>


                            <div className="prediction-probability">

                                <div className="probability-header">

                                    <span>
                                        Failure Probability
                                    </span>

                                    <strong>
                                        {failurePercentage}%
                                    </strong>

                                </div>


                                <div className="probability-bar">

                                    <div
                                        className={`probability-fill prediction-fill-${predictionClass}`}
                                        style={{
                                            width: `${failurePercentage}%`
                                        }}
                                    />

                                </div>


                                <div className="probability-scale">

                                    <span>
                                        Low
                                    </span>

                                    <span>
                                        Medium
                                    </span>

                                    <span>
                                        High
                                    </span>

                                </div>

                            </div>


                            <div className="prediction-time">

                                <span>
                                    Prediction generated
                                </span>

                                <strong>
                                    {formatDateTime(
                                        latestPrediction?.createdAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        SENSOR HISTORY
                    ================================================= */}

                    <section className="sensor-history">


                        <div className="sensor-history-header">

                            <div>

                                <span className="section-eyebrow">
                                    HISTORICAL DATA
                                </span>

                                <h2>
                                    Sensor History
                                </h2>

                                <p>
                                    Latest sensor readings for this equipment
                                </p>

                            </div>


                            <div className="sensor-history-count">

                                <strong>
                                    {recentHistory.length}
                                </strong>

                                <span>
                                    recent records
                                </span>

                            </div>

                        </div>


                        {recentHistory.length > 0 ? (

                            <div className="sensor-history-table-wrapper">

                                <table className="sensor-history-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date & Time
                                            </th>

                                            <th>
                                                Temperature
                                            </th>

                                            <th>
                                                Vibration
                                            </th>

                                            <th>
                                                Pressure
                                            </th>

                                            <th>
                                                Operating Hours
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {recentHistory.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item._id
                                                    }
                                                >

                                                    <td>

                                                        <div className="history-time">

                                                            <strong>
                                                                {formatTime(
                                                                    item.createdAt
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {item.createdAt
                                                                    ? new Date(
                                                                        item.createdAt
                                                                    ).toLocaleDateString(
                                                                        "en-IN",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric"
                                                                        }
                                                                    )
                                                                    : "--"}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="history-value">

                                                            {item.temperature ??
                                                                "--"}

                                                            <small>
                                                                °C
                                                            </small>

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="history-value">

                                                            {item.vibration ??
                                                                "--"}

                                                            <small>
                                                                mm/s
                                                            </small>

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="history-value">

                                                            {item.pressure ??
                                                                "--"}

                                                            <small>
                                                                bar
                                                            </small>

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="history-value">

                                                            {item.operatingHours ??
                                                                "--"}

                                                            <small>
                                                                hrs
                                                            </small>

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        ) : (

                            <div className="sensor-history-empty">

                                <div className="empty-icon">
                                    📊
                                </div>

                                <h3>
                                    No Sensor History
                                </h3>

                                <p>
                                    No sensor readings are
                                    available for this equipment.
                                </p>

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        PREDICTION HISTORY
                    ================================================= */}

                    {/* =================================================
    AI PREDICTION HISTORY
================================================= */}

{/* =================================================
    AI PREDICTION HISTORY
================================================= */}

<section className="prediction-history">

    {/* HEADER */}
    <div className="prediction-history-header">

        <div>
            <span className="prediction-history-eyebrow">
                AI HISTORY
            </span>

            <h2>
                Prediction History
            </h2>

            <p>
                Previous machine health predictions
            </p>
        </div>

        <div className="prediction-history-count">
            {predictionHistory.length}
            <span>
                predictions
            </span>
        </div>

    </div>


    {/* HISTORY CONTENT */}

    {predictionHistory.length > 0 ? (

        <div className="prediction-history-list">

            {predictionHistory.map((item, index) => {

                const prediction =
                    item.prediction || "N/A";

                const probability =
                    Number(
                        item.failureProbability || 0
                    );

                const probabilityPercent =
                    probability <= 1
                        ? probability * 100
                        : probability;

                const predictionClass =
                    prediction
                        .toString()
                        .toLowerCase();


                return (

                    <div
                        className="prediction-history-item"
                        key={
                            item._id ||
                            item.sensorDataId ||
                            index
                        }
                    >

                        {/* LEFT SIDE */}

                        <div className="prediction-history-main">

                            <div className="prediction-history-time">

                                {item.createdAt
                                    ? new Date(
                                        item.createdAt
                                    ).toLocaleString()
                                    : "--"}

                            </div>


                            <div className="prediction-history-probability">

                                Failure probability

                                <strong>
                                    {probabilityPercent.toFixed(0)}%
                                </strong>

                            </div>

                        </div>


                        {/* RIGHT SIDE */}

                        <div
                            className={
                                `prediction-history-badge prediction-${predictionClass}`
                            }
                        >
                            {prediction}
                        </div>

                    </div>

                );

            })}

        </div>

    ) : (

        <div className="prediction-history-empty">

            <div className="prediction-empty-icon">
                AI
            </div>

            <h3>
                No prediction history
            </h3>

            <p>
                AI predictions will appear here after
                sensor data is processed.
            </p>

        </div>

    )}

</section>
                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <footer className="monitoring-footer">

                        <div>

                            <span>
                                Data last updated
                            </span>

                            <strong>
                                {formatDateTime(
                                    monitoring.lastUpdated
                                )}
                            </strong>

                        </div>


                        <div className="live-status">

                            <span className="live-dot"></span>

                            <span>
                                Auto-refresh every 10 seconds
                            </span>

                            {refreshing && (
                                <span className="refreshing-text">
                                    Syncing...
                                </span>
                            )}

                        </div>

                    </footer>

                </>

            )}

        </div>

    );

}




export default SensorMonitoring;