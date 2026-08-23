import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    CircleGauge,
    Clock3,
    Cpu,
    Gauge,
    MapPin,
    RefreshCw,
    ShieldAlert,
    Thermometer,
    TrendingUp,
    Waves,
    Wind,
    RotateCw,
    Wrench,
    Zap
} from "lucide-react";

import {
    getAllEquipment,
    getMonitoringData
} from "../services/api";

import "../styles/monitoring.css";


function Monitoring() {

    /* =====================================================
       STATE
    ===================================================== */

    const [equipmentList, setEquipmentList] =
        useState([]);

    const [selectedEquipmentId, setSelectedEquipmentId] =
        useState("");

    const [monitoring, setMonitoring] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [monitoringLoading, setMonitoringLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [lastRefresh, setLastRefresh] =
        useState(null);


    /* =====================================================
       LOAD EQUIPMENT
    ===================================================== */

    const loadEquipment = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAllEquipment();

            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Unable to load equipment."
                );

            }


            const equipment =
                Array.isArray(data.equipment)
                    ? data.equipment
                    : Array.isArray(data.data)
                        ? data.data
                        : Array.isArray(data)
                            ? data
                            : [];


            setEquipmentList(
                equipment
            );


            if (
                equipment.length > 0 &&
                !selectedEquipmentId
            ) {

                const firstEquipment =
                    equipment[0];

                setSelectedEquipmentId(
                    firstEquipment?._id ||
                    firstEquipment?.id ||
                    ""
                );

            }

        } catch (err) {

            console.error(
                "Monitoring Equipment Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load equipment."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOAD MONITORING
    ===================================================== */

    const loadMonitoring = async (
        equipmentId = selectedEquipmentId
    ) => {

        if (!equipmentId) {
            return;
        }


        try {

            setMonitoringLoading(true);
            setError("");

            const data =
                await getMonitoringData(
                    equipmentId
                );


            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Unable to load monitoring data."
                );

            }


            setMonitoring(
                data.monitoring ||
                null
            );


            setLastRefresh(
                new Date()
            );

        } catch (err) {

            console.error(
                "Monitoring Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load monitoring data."
            );

        } finally {

            setMonitoringLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadEquipment();

    }, []);


    /* =====================================================
       LOAD MONITORING WHEN EQUIPMENT CHANGES
    ===================================================== */

    useEffect(() => {

        if (!selectedEquipmentId) {
            return;
        }

        loadMonitoring(
            selectedEquipmentId
        );

    }, [selectedEquipmentId]);


    /* =====================================================
       AUTO REFRESH
       
       Refresh every 30 seconds.
    ===================================================== */

    useEffect(() => {

        if (!selectedEquipmentId) {
            return;
        }


        const interval =
            setInterval(() => {

                loadMonitoring(
                    selectedEquipmentId
                );

            }, 30000);


        return () => {

            clearInterval(
                interval
            );

        };

    }, [selectedEquipmentId]);


    /* =====================================================
       SELECTED EQUIPMENT
    ===================================================== */

    const selectedEquipment =
        useMemo(() => {

            return equipmentList.find(
                (equipment) =>
                    String(
                        equipment?._id ||
                        equipment?.id
                    ) ===
                    String(
                        selectedEquipmentId
                    )
            );

        }, [
            equipmentList,
            selectedEquipmentId
        ]);


    /* =====================================================
       DATA
    ===================================================== */

    const equipment =
        monitoring?.equipment ||
        selectedEquipment ||
        {};


    const sensor =
        monitoring?.latestSensorData ||
        null;


    const prediction =
        monitoring?.latestPrediction ||
        null;


    const sensorHistory =
        Array.isArray(
            monitoring?.sensorHistory
        )
            ? monitoring.sensorHistory
            : [];


    /* =====================================================
       PREDICTION
    ===================================================== */

    const predictionLevel =
        prediction?.prediction
            ? String(
                prediction.prediction
            ).toUpperCase()
            : "UNKNOWN";


    const probability =
        normalizeProbability(
            prediction?.failureProbability
        );


    const predictionClass =
        predictionLevel.toLowerCase();


    /* =====================================================
       EQUIPMENT STATUS
    ===================================================== */

    const equipmentStatus =
        equipment?.status ||
        "Unknown";


    const equipmentStatusClass =
        String(
            equipmentStatus
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    /* =====================================================
       ALERTS
    ===================================================== */

    const alerts =
        useMemo(() => {

            const result = [];


            if (!sensor) {

                result.push({

                    type: "warning",

                    title:
                        "No sensor data",

                    message:
                        "This equipment has not reported sensor readings."

                });

                return result;

            }


            const temperature =
                Number(
                    sensor.temperature
                );


            const vibration =
                Number(
                    sensor.vibration
                );


            const pressure =
                Number(
                    sensor.pressure
                );


            if (
                !Number.isNaN(
                    temperature
                ) &&
                temperature >= 80
            ) {

                result.push({

                    type: "critical",

                    title:
                        "High temperature",

                    message:
                        `Temperature is ${temperature} °C.`

                });

            } else if (
                !Number.isNaN(
                    temperature
                ) &&
                temperature >= 70
            ) {

                result.push({

                    type: "warning",

                    title:
                        "Elevated temperature",

                    message:
                        `Temperature is ${temperature} °C.`

                });

            }


            if (
                !Number.isNaN(
                    vibration
                ) &&
                vibration >= 0.8
            ) {

                result.push({

                    type: "critical",

                    title:
                        "High vibration",

                    message:
                        `Vibration is ${vibration}.`

                });

            }


            if (
                !Number.isNaN(
                    pressure
                ) &&
                pressure >= 8
            ) {

                result.push({

                    type: "warning",

                    title:
                        "High pressure",

                    message:
                        `Pressure is ${pressure}.`

                });

            }


            if (
                predictionLevel ===
                "HIGH"
            ) {

                result.push({

                    type: "critical",

                    title:
                        "High failure risk",

                    message:
                        probability !== null
                            ? `Failure probability is ${probability}%.`
                            : "Latest prediction indicates high failure risk."

                });

            } else if (
                predictionLevel ===
                "MEDIUM"
            ) {

                result.push({

                    type: "warning",

                    title:
                        "Medium failure risk",

                    message:
                        probability !== null
                            ? `Failure probability is ${probability}%.`
                            : "Latest prediction requires attention."

                });

            }


            return result;

        }, [
            sensor,
            predictionLevel,
            probability
        ]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="monitoring-state">

                <div className="monitoring-state-icon">

                    <RefreshCw
                        size={28}
                        className="monitoring-spinner"
                    />

                </div>

                <h2>
                    Loading monitoring
                </h2>

                <p>
                    Loading PlantIQ equipment...
                </p>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error &&
        equipmentList.length === 0
    ) {

        return (

            <div className="monitoring-state error">

                <div className="monitoring-state-icon error">

                    <AlertTriangle
                        size={28}
                    />

                </div>

                <h2>
                    Monitoring unavailable
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    className="monitoring-retry-button"
                    onClick={loadEquipment}
                >

                    <RefreshCw size={16} />

                    Try Again

                </button>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="monitoring-page">


            {/* =================================================
               HEADER
            ================================================= */}

            <section className="monitoring-header">

                <div>

                    <span className="monitoring-eyebrow">
                        REAL-TIME MONITORING
                    </span>

                    <h1>
                        Equipment Monitoring
                    </h1>

                    <p>
                        Monitor current machine conditions,
                        sensor readings and failure risk.
                    </p>

                </div>


                <div className="monitoring-header-actions">

                    <div className="monitoring-online">

                        <span className="monitoring-online-dot" />

                        System Online

                    </div>


                    <button
                        type="button"
                        className="monitoring-refresh-button"
                        onClick={() =>
                            loadMonitoring(
                                selectedEquipmentId
                            )
                        }
                        disabled={
                            monitoringLoading
                        }
                    >

                        <RefreshCw
                            size={15}
                            className={
                                monitoringLoading
                                    ? "monitoring-spinner"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </section>


            {/* =================================================
               EQUIPMENT SELECTOR
            ================================================= */}

            <section className="monitoring-selector-card">

                <div className="monitoring-selector-left">

                    <div className="monitoring-selector-icon">

                        <Cpu size={20} />

                    </div>


                    <div>

                        <span>
                            MONITORING EQUIPMENT
                        </span>

                        <strong>
                            {equipment?.name ||
                                "Select equipment"}
                        </strong>

                    </div>

                </div>


                <div className="monitoring-selector">

                    <select
                        value={
                            selectedEquipmentId
                        }
                        onChange={(event) =>
                            setSelectedEquipmentId(
                                event.target.value
                            )
                        }
                    >

                        {equipmentList.length === 0 ? (

                            <option value="">
                                No equipment available
                            </option>

                        ) : (

                            equipmentList.map(
                                (item) => (

                                    <option
                                        key={
                                            item?._id ||
                                            item?.id
                                        }
                                        value={
                                            item?._id ||
                                            item?.id
                                        }
                                    >

                                        {item?.name ||
                                            "Unnamed Equipment"}

                                        {item?.equipmentCode
                                            ? ` — ${item.equipmentCode}`
                                            : ""}

                                    </option>

                                )
                            )

                        )}

                    </select>

                    <ChevronDown
                        size={17}
                    />

                </div>

            </section>


            {/* =================================================
               ERROR BANNER
            ================================================= */}

            {error && (

                <div className="monitoring-error-banner">

                    <AlertTriangle size={17} />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
               EQUIPMENT OVERVIEW
            ================================================= */}

            <section className="monitoring-equipment-overview">

                <div>

                    <div className="monitoring-equipment-name-row">

                        <h2>
                            {equipment?.name ||
                                "Unnamed Equipment"}
                        </h2>


                        <span
                            className={
                                `monitoring-equipment-status ${equipmentStatusClass}`
                            }
                        >

                            {equipmentStatus ===
                            "Running" ? (

                                <CheckCircle2
                                    size={14}
                                />

                            ) : (

                                <AlertTriangle
                                    size={14}
                                />

                            )}

                            {equipmentStatus}

                        </span>

                    </div>


                    <div className="monitoring-equipment-meta">

                        <span>
                            <Cpu size={14} />

                            {equipment?.equipmentCode ||
                                "No equipment code"}
                        </span>


                        <span>
                            <MapPin size={14} />

                            {equipment?.location ||
                                "Location unavailable"}
                        </span>


                        <span>
                            <Wrench size={14} />

                            {equipment?.type ||
                                "Equipment"}
                        </span>

                    </div>

                </div>


                <div className="monitoring-last-updated">

                    <span>
                        LAST UPDATED
                    </span>

                    <strong>
                        {formatDate(
                            monitoring?.lastUpdated ||
                            lastRefresh
                        )}
                    </strong>

                </div>

            </section>


            {/* =================================================
               SENSOR CARDS
            ================================================= */}

            <section className="monitoring-section">

                <div className="monitoring-section-header">

                    <div>

                        <h2>
                            Live Sensor Readings
                        </h2>

                        <p>
                            Latest measurements reported
                            by this machine.
                        </p>

                    </div>


                    <Activity
                        size={22}
                    />

                </div>


                {!sensor ? (

                    <EmptyMonitoring
                        icon={
                            <Activity size={24} />
                        }
                        title="No sensor data"
                        message="This equipment has not reported sensor readings yet."
                    />

                ) : (

                    <div className="monitoring-sensor-grid">

                        <MonitoringSensorCard
                            icon={
                                <Thermometer
                                    size={21}
                                />
                            }
                            title="Temperature"
                            value={
                                sensor.temperature
                            }
                            unit="°C"
                            color="red"
                            status={getSensorStatus(
                                sensor.temperature,
                                70,
                                80
                            )}
                        />


                        <MonitoringSensorCard
                            icon={
                                <Waves
                                    size={21}
                                />
                            }
                            title="Vibration"
                            value={
                                sensor.vibration
                            }
                            unit=""
                            color="purple"
                            status={getSensorStatus(
                                sensor.vibration,
                                0.5,
                                0.8
                            )}
                        />


                        <MonitoringSensorCard
                            icon={
                                <CircleGauge
                                    size={21}
                                />
                            }
                            title="Pressure"
                            value={
                                sensor.pressure
                            }
                            unit=""
                            color="blue"
                            status={getSensorStatus(
                                sensor.pressure,
                                6,
                                8
                            )}
                        />


                        <MonitoringSensorCard
                            icon={
                                <Clock3
                                    size={21}
                                />
                            }
                            title="Operating Hours"
                            value={
                                sensor.operatingHours
                            }
                            unit="hrs"
                            color="green"
                            status="Normal"
                        />

                    </div>

                )}

            </section>


            {/* =================================================
               CHARTS
            ================================================= */}

            <section className="monitoring-chart-grid">


                <TrendCard
                    title="Temperature Trend"
                    subtitle="Recent temperature readings"
                    data={sensorHistory}
                    field="temperature"
                    unit="°C"
                    color="red"
                    icon={
                        <Thermometer size={18} />
                    }
                />


                <TrendCard
                    title="Vibration Trend"
                    subtitle="Recent vibration readings"
                    data={sensorHistory}
                    field="vibration"
                    unit=""
                    color="purple"
                    icon={
                        <Waves size={18} />
                    }
                />


                <TrendCard
                    title="Pressure Trend"
                    subtitle="Recent pressure readings"
                    data={sensorHistory}
                    field="pressure"
                    unit=""
                    color="blue"
                    icon={
                        <CircleGauge size={18} />
                    }
                />

            </section>


            {/* =================================================
               LOWER GRID
            ================================================= */}

            <section className="monitoring-lower-grid">


                {/* MACHINE PARAMETERS */}

                <div className="monitoring-panel">

                    <div className="monitoring-panel-header">

                        <div>

                            <h2>
                                Machine Parameters
                            </h2>

                            <p>
                                Current operating parameters.
                            </p>

                        </div>

                        <Gauge size={21} />

                    </div>


                    {!sensor ? (

                        <EmptyMonitoring
                            icon={
                                <Gauge size={22} />
                            }
                            title="No parameters available"
                            message="Sensor data is not available."
                        />

                    ) : (

                        <div className="monitoring-parameter-grid">

                            <MonitoringParameter
                                icon={
                                    <Cpu size={17} />
                                }
                                title="Machine Type"
                                value={
                                    sensor.machineType ||
                                    "N/A"
                                }
                            />


                            <MonitoringParameter
                                icon={
                                    <Wind size={17} />
                                }
                                title="Air Temperature"
                                value={
                                    sensor.airTemperature != null
                                        ? `${sensor.airTemperature} °C`
                                        : "N/A"
                                }
                            />


                            <MonitoringParameter
                                icon={
                                    <Thermometer
                                        size={17}
                                    />
                                }
                                title="Process Temperature"
                                value={
                                    sensor.processTemperature != null
                                        ? `${sensor.processTemperature} °C`
                                        : "N/A"
                                }
                            />


                            <MonitoringParameter
                                icon={
                                    <RotateCw size={17} />
                                }
                                title="Rotational Speed"
                                value={
                                    sensor.rotationalSpeed != null
                                        ? `${sensor.rotationalSpeed} RPM`
                                        : "N/A"
                                }
                            />


                            <MonitoringParameter
                                icon={
                                    <Gauge size={17} />
                                }
                                title="Torque"
                                value={
                                    sensor.torque != null
                                        ? sensor.torque
                                        : "N/A"
                                }
                            />


                            <MonitoringParameter
                                icon={
                                    <Wrench size={17} />
                                }
                                title="Tool Wear"
                                value={
                                    sensor.toolWear != null
                                        ? sensor.toolWear
                                        : "N/A"
                                }
                            />

                        </div>

                    )}

                </div>


                {/* PREDICTION */}

                <div className="monitoring-panel">

                    <div className="monitoring-panel-header">

                        <div>

                            <h2>
                                Current Prediction
                            </h2>

                            <p>
                                Latest machine failure risk.
                            </p>

                        </div>

                        <ShieldAlert size={21} />

                    </div>


                    {!prediction ? (

                        <EmptyMonitoring
                            icon={
                                <ShieldAlert
                                    size={22}
                                />
                            }
                            title="No prediction available"
                            message="A machine prediction has not been generated yet."
                        />

                    ) : (

                        <div
                            className={
                                `monitoring-prediction-card ${predictionClass}`
                            }
                        >

                            <div className="monitoring-prediction-top">

                                <div
                                    className={
                                        `monitoring-prediction-icon ${predictionClass}`
                                    }
                                >

                                    {predictionLevel ===
                                    "LOW" ? (

                                        <CheckCircle2
                                            size={28}
                                        />

                                    ) : (

                                        <AlertTriangle
                                            size={28}
                                        />

                                    )}

                                </div>


                                <div>

                                    <span>
                                        FAILURE RISK
                                    </span>

                                    <strong>
                                        {predictionLevel}
                                    </strong>

                                </div>

                            </div>


                            <div className="monitoring-probability">

                                <div>

                                    <span>
                                        Failure Probability
                                    </span>

                                    <strong>
                                        {probability !== null
                                            ? `${probability}%`
                                            : "N/A"}
                                    </strong>

                                </div>


                                {probability !== null && (

                                    <div className="monitoring-probability-bar">

                                        <div
                                            className={
                                                `monitoring-probability-fill ${predictionClass}`
                                            }
                                            style={{
                                                width:
                                                    `${probability}%`
                                            }}
                                        />

                                    </div>

                                )}

                            </div>


                            <div className="monitoring-prediction-footer">

                                <span>
                                    Prediction generated
                                </span>

                                <strong>
                                    {formatDate(
                                        prediction.createdAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    )}

                </div>

            </section>


            {/* =================================================
               ALERTS
            ================================================= */}

            <section className="monitoring-alert-section">

                <div className="monitoring-section-header">

                    <div>

                        <h2>
                            Active Alerts
                        </h2>

                        <p>
                            Conditions requiring attention.
                        </p>

                    </div>


                    <Zap size={22} />

                </div>


                {alerts.length === 0 ? (

                    <div className="monitoring-no-alerts">

                        <div className="monitoring-no-alerts-icon">

                            <CheckCircle2 size={22} />

                        </div>

                        <div>

                            <strong>
                                No active alerts
                            </strong>

                            <span>
                                Equipment is currently operating
                                within monitored limits.
                            </span>

                        </div>

                    </div>

                ) : (

                    <div className="monitoring-alert-list">

                        {alerts.map(
                            (alert, index) => (

                                <div
                                    key={index}
                                    className={
                                        `monitoring-alert ${alert.type}`
                                    }
                                >

                                    <div className="monitoring-alert-icon">

                                        {alert.type ===
                                        "critical" ? (

                                            <AlertTriangle
                                                size={18}
                                            />

                                        ) : (

                                            <AlertTriangle
                                                size={18}
                                            />

                                        )}

                                    </div>


                                    <div>

                                        <strong>
                                            {alert.title}
                                        </strong>

                                        <span>
                                            {alert.message}
                                        </span>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
               FOOTER
            ================================================= */}

            <footer className="monitoring-footer">

                <span>
                    PlantIQ Monitoring
                </span>

                <span>
                    Auto-refresh: 30 seconds
                </span>

                <button
                    type="button"
                    onClick={() =>
                        loadMonitoring(
                            selectedEquipmentId
                        )
                    }
                >

                    <RefreshCw size={14} />

                    Refresh Data

                </button>

            </footer>

        </div>

    );

}


/* =========================================================
   SENSOR CARD
========================================================= */

function MonitoringSensorCard({
    icon,
    title,
    value,
    unit,
    color,
    status
}) {

    const safeValue =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : "N/A";


    return (

        <div className="monitoring-sensor-card">

            <div
                className={
                    `monitoring-sensor-icon ${color}`
                }
            >
                {icon}
            </div>


            <div className="monitoring-sensor-content">

                <div className="monitoring-sensor-title">

                    <span>
                        {title}
                    </span>

                    <small
                        className={
                            `monitoring-sensor-status ${getStatusClass(
                                status
                            )}`
                        }
                    >
                        {status}
                    </small>

                </div>


                <div className="monitoring-sensor-value">

                    <strong>
                        {safeValue}
                    </strong>

                    {unit && (

                        <span>
                            {unit}
                        </span>

                    )}

                </div>

            </div>

        </div>

    );

}


/* =========================================================
   TREND CARD
========================================================= */

function TrendCard({
    title,
    subtitle,
    data,
    field,
    unit,
    color,
    icon
}) {

    const points =
        useMemo(() => {

            if (!Array.isArray(data)) {
                return [];
            }


            return data
                .filter(
                    (item) =>
                        item?.[field] !== null &&
                        item?.[field] !== undefined &&
                        !Number.isNaN(
                            Number(
                                item[field]
                            )
                        )
                )
                .map(
                    (item) => ({
                        value:
                            Number(
                                item[field]
                            ),
                        date:
                            item.createdAt
                    })
                );

        }, [
            data,
            field
        ]);


    return (

        <div className="monitoring-chart-card">

            <div className="monitoring-chart-header">

                <div>

                    <div className="monitoring-chart-title">

                        <div
                            className={
                                `monitoring-chart-icon ${color}`
                            }
                        >
                            {icon}
                        </div>

                        <h3>
                            {title}
                        </h3>

                    </div>

                    <p>
                        {subtitle}
                    </p>

                </div>


                {points.length > 0 && (

                    <div className="monitoring-chart-current">

                        <strong>
                            {points[
                                points.length - 1
                            ].value}
                        </strong>

                        {unit && (
                            <span>
                                {unit}
                            </span>
                        )}

                    </div>

                )}

            </div>


            <MiniLineChart
                points={points}
                color={color}
            />

        </div>

    );

}


/* =========================================================
   MINI LINE CHART
========================================================= */

function MiniLineChart({
    points,
    color
}) {

    const width = 500;
    const height = 180;

    const padding = 20;


    if (
        !points ||
        points.length < 2
    ) {

        return (

            <div className="monitoring-chart-empty">

                <Activity size={22} />

                <span>
                    Not enough data for trend
                </span>

            </div>

        );

    }


    const values =
        points.map(
            (point) =>
                point.value
        );


    const minimum =
        Math.min(
            ...values
        );


    const maximum =
        Math.max(
            ...values
        );


    const range =
        maximum -
        minimum ||
        1;


    const chartPoints =
        points.map(
            (point, index) => {

                const x =
                    padding +
                    (
                        index /
                        (points.length - 1)
                    ) *
                    (
                        width -
                        padding * 2
                    );


                const y =
                    height -
                    padding -
                    (
                        (
                            point.value -
                            minimum
                        ) /
                        range
                    ) *
                    (
                        height -
                        padding * 2
                    );


                return {
                    x,
                    y
                };

            }
        );


    const path =
        chartPoints
            .map(
                (point, index) =>
                    `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
            )
            .join(" ");


    const gradientId =
        `monitoringGradient-${color}`;


    return (

        <div className="monitoring-chart">

            <svg
                viewBox={
                    `0 0 ${width} ${height}`
                }
                preserveAspectRatio="none"
            >

                <defs>

                    <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >

                        <stop
                            offset="0%"
                            stopOpacity="0.22"
                        />

                        <stop
                            offset="100%"
                            stopOpacity="0"
                        />

                    </linearGradient>

                </defs>


                {/* GRID */}

                <line
                    x1="20"
                    y1="40"
                    x2="480"
                    y2="40"
                    className="chart-grid-line"
                />

                <line
                    x1="20"
                    y1="90"
                    x2="480"
                    y2="90"
                    className="chart-grid-line"
                />

                <line
                    x1="20"
                    y1="140"
                    x2="480"
                    y2="140"
                    className="chart-grid-line"
                />


                {/* AREA */}

                <path
                    d={
                        `${path} L ${chartPoints[
                            chartPoints.length - 1
                        ].x} ${height - padding} L ${chartPoints[0].x} ${height - padding} Z`
                    }
                    className={
                        `chart-area ${color}`
                    }
                />


                {/* LINE */}

                <path
                    d={path}
                    className={
                        `chart-line ${color}`
                    }
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />


                {/* LAST POINT */}

                <circle
                    cx={
                        chartPoints[
                            chartPoints.length - 1
                        ].x
                    }
                    cy={
                        chartPoints[
                            chartPoints.length - 1
                        ].y
                    }
                    r="4"
                    className={
                        `chart-point ${color}`
                    }
                />

            </svg>


            <div className="monitoring-chart-range">

                <span>
                    {formatShortDate(
                        points[0].date
                    )}
                </span>

                <span>
                    {formatShortDate(
                        points[
                            points.length - 1
                        ].date
                    )}
                </span>

            </div>

        </div>

    );

}


/* =========================================================
   PARAMETER
========================================================= */

function MonitoringParameter({
    icon,
    title,
    value
}) {

    return (

        <div className="monitoring-parameter">

            <div className="monitoring-parameter-icon">
                {icon}
            </div>

            <div>

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );

}


/* =========================================================
   EMPTY
========================================================= */

function EmptyMonitoring({
    icon,
    title,
    message
}) {

    return (

        <div className="monitoring-empty">

            <div className="monitoring-empty-icon">

                {icon}

            </div>

            <h3>
                {title}
            </h3>

            <p>
                {message}
            </p>

        </div>

    );

}


/* =========================================================
   SENSOR STATUS
========================================================= */

function getSensorStatus(
    value,
    warning,
    critical
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "No Data";

    }


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "No Data";

    }


    if (
        number >= critical
    ) {

        return "Critical";

    }


    if (
        number >= warning
    ) {

        return "Warning";

    }


    return "Normal";

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    return String(
        status
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


/* =========================================================
   PROBABILITY
========================================================= */

function normalizeProbability(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const raw =
        Number(value);


    if (
        Number.isNaN(raw)
    ) {

        return null;

    }


    const result =
        raw >= 0 &&
        raw <= 1
            ? Math.round(
                raw * 100
            )
            : Math.round(
                raw
            );


    return Math.max(
        0,
        Math.min(
            100,
            result
        )
    );

}


/* =========================================================
   DATE
========================================================= */

function formatDate(
    date
) {

    if (!date) {
        return "No data";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "Invalid date";

    }


    return parsed.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   SHORT DATE
========================================================= */

function formatShortDate(
    date
) {

    if (!date) {
        return "";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "";

    }


    return parsed.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


export default Monitoring;