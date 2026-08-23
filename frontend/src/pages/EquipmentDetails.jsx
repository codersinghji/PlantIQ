import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../styles/EquipmentDetails.css";

import {
    Activity,
    ArrowLeft,
    Gauge,
    MapPin,
    Cpu,
    Thermometer,
    Waves,
    CircleGauge,
    Clock3,
    Wind,
    RotateCw,
    Settings2,
    Wrench,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    History,
    BarChart3,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import {
    getEquipmentDashboard,
    getEquipmentHistory,
} from "../services/api";


function EquipmentDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);

    const [history, setHistory] = useState(null);

    const [loading, setLoading] = useState(true);

    const [historyLoading, setHistoryLoading] = useState(true);

    const [error, setError] = useState("");

    const [historyError, setHistoryError] = useState("");


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getEquipmentDashboard(id);

            console.log(
                "Equipment Dashboard:",
                data
            );

            if (data?.success) {

                setDashboard(
                    data.dashboard || null
                );

            } else {

                setError(
                    data?.message ||
                    "Unable to load equipment details."
                );

            }

        } catch (err) {

            console.error(
                "Equipment Dashboard Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load equipment details."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOAD HISTORY
    ===================================================== */

    const loadHistory = async () => {

        try {

            setHistoryLoading(true);
            setHistoryError("");

            const data =
                await getEquipmentHistory(id);

            console.log(
                "Equipment History:",
                data
            );

            if (data?.success) {

                setHistory(data);

            } else {

                setHistoryError(
                    data?.message ||
                    "Unable to load equipment history."
                );

            }

        } catch (err) {

            console.error(
                "Equipment History Error:",
                err
            );

            setHistoryError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load equipment history."
            );

        } finally {

            setHistoryLoading(false);

        }

    };


    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        if (!id) {

            setError(
                "Equipment ID is missing."
            );

            setLoading(false);
            setHistoryLoading(false);

            return;

        }

        loadDashboard();
        loadHistory();

    }, [id]);


    /* =====================================================
       REFRESH
    ===================================================== */

    const refreshData = async () => {

        await Promise.all([
            loadDashboard(),
            loadHistory(),
        ]);

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="equipment-state">

                <div className="equipment-state-icon">

                    <RefreshCw
                        size={28}
                        className="loading-spinner"
                    />

                </div>

                <h2>
                    Loading equipment
                </h2>

                <p>
                    Fetching machine data...
                </p>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error || !dashboard) {

        return (

            <div className="equipment-state error">

                <div className="equipment-state-icon error-icon">

                    <AlertTriangle size={28} />

                </div>

                <h2>
                    Equipment unavailable
                </h2>

                <p>
                    {error ||
                        "Equipment data was not found."}
                </p>

                <button
                    type="button"
                    className="equipment-retry"
                    onClick={loadDashboard}
                >

                    <RefreshCw size={16} />

                    Try Again

                </button>

            </div>

        );

    }


    /* =====================================================
       DATA
    ===================================================== */

    const equipment =
        dashboard?.equipment || {};

    const sensor =
        dashboard?.latestSensorData || null;

    const prediction =
        dashboard?.latestPrediction || null;


    /* =====================================================
       STATUS
    ===================================================== */

    const status =
        equipment?.status || "Unknown";

    const statusClass =
        String(status)
            .toLowerCase()
            .replace(/\s+/g, "-");


    /* =====================================================
       PREDICTION
    ===================================================== */

    const predictionLevel =
        prediction?.prediction
            ? String(
                prediction.prediction
            ).toUpperCase()
            : null;


    const failureProbability =
        normalizeProbability(
            prediction?.failureProbability
        );


    const predictionClass =
        predictionLevel
            ? predictionLevel.toLowerCase()
            : "unknown";


    /* =====================================================
       HISTORY DATA
    ===================================================== */

    const sensorHistory =
        Array.isArray(history?.sensorHistory)
            ? history.sensorHistory
            : [];

    const predictionHistory =
        Array.isArray(history?.predictionHistory)
            ? history.predictionHistory
            : [];


    /* =====================================================
       CHART DATA
    ===================================================== */

    const chartData =
        createChartData(sensorHistory);


    return (

        <div className="equipment-details-page">


            {/* =================================================
               BACK
            ================================================= */}

            <button
                type="button"
                className="back-button"
                onClick={() =>
                    navigate("/equipment")
                }
            >

                <ArrowLeft size={17} />

                Back to Equipment

            </button>


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="equipment-details-header">

                <div className="equipment-details-title">

                    <div className="large-equipment-icon">

                        <Cpu size={30} />

                    </div>

                    <div>

                        <span className="equipment-eyebrow">
                            EQUIPMENT DETAILS
                        </span>

                        <h1>
                            {equipment.name ||
                                "Unnamed Equipment"}
                        </h1>

                        <p>
                            {equipment.equipmentCode ||
                                "No equipment code"}
                        </p>

                    </div>

                </div>


                <div
                    className={
                        `equipment-status large ${statusClass}`
                    }
                >

                    {status === "Running" ? (

                        <CheckCircle2 size={18} />

                    ) : (

                        <AlertTriangle size={18} />

                    )}

                    <span>
                        {status}
                    </span>

                </div>

            </div>


            {/* =================================================
               EQUIPMENT INFORMATION
            ================================================= */}

            <div className="equipment-info-grid">

                <InfoCard
                    icon={
                        <Wrench size={20} />
                    }
                    color="blue"
                    title="Equipment Type"
                    value={
                        equipment.type ||
                        "N/A"
                    }
                />

                <InfoCard
                    icon={
                        <MapPin size={20} />
                    }
                    color="green"
                    title="Location"
                    value={
                        equipment.location ||
                        "N/A"
                    }
                />

                <InfoCard
                    icon={
                        <Cpu size={20} />
                    }
                    color="purple"
                    title="Equipment Code"
                    value={
                        equipment.equipmentCode ||
                        "N/A"
                    }
                />

            </div>


            {/* =================================================
               SENSOR DATA
            ================================================= */}

            <div className="details-section">

                <div className="details-section-header">

                    <div>

                        <h2>
                            Latest Sensor Readings
                        </h2>

                        <p>
                            Most recent measurements
                            received from this machine.
                        </p>

                    </div>

                    <Activity size={23} />

                </div>


                {!sensor ? (

                    <NoData
                        icon={
                            <Activity size={25} />
                        }
                        title="No sensor data available"
                        message="This equipment has not reported sensor readings yet."
                    />

                ) : (

                    <div className="sensor-grid">

                        <SensorCard
                            icon={
                                <Thermometer size={21} />
                            }
                            title="Temperature"
                            value={
                                sensor.temperature ??
                                "N/A"
                            }
                            unit="°C"
                            color="red"
                        />

                        <SensorCard
                            icon={
                                <Waves size={21} />
                            }
                            title="Vibration"
                            value={
                                sensor.vibration ??
                                "N/A"
                            }
                            unit=""
                            color="purple"
                        />

                        <SensorCard
                            icon={
                                <CircleGauge size={21} />
                            }
                            title="Pressure"
                            value={
                                sensor.pressure ??
                                "N/A"
                            }
                            unit=""
                            color="blue"
                        />

                        <SensorCard
                            icon={
                                <Clock3 size={21} />
                            }
                            title="Operating Hours"
                            value={
                                sensor.operatingHours ??
                                "N/A"
                            }
                            unit="hrs"
                            color="green"
                        />

                    </div>

                )}

            </div>


            {/* =================================================
               MACHINE PARAMETERS
            ================================================= */}

            {sensor && (

                <div className="details-section">

                    <div className="details-section-header">

                        <div>

                            <h2>
                                Machine Parameters
                            </h2>

                            <p>
                                Parameters used for
                                monitoring and prediction.
                            </p>

                        </div>

                        <Settings2 size={23} />

                    </div>


                    <div className="parameter-grid">

                        <Parameter
                            icon={
                                <Cpu size={18} />
                            }
                            title="Machine Type"
                            value={
                                sensor.machineType ||
                                "N/A"
                            }
                        />

                        <Parameter
                            icon={
                                <Wind size={18} />
                            }
                            title="Air Temperature"
                            value={
                                sensor.airTemperature != null
                                    ? `${sensor.airTemperature} °C`
                                    : "N/A"
                            }
                        />

                        <Parameter
                            icon={
                                <Thermometer size={18} />
                            }
                            title="Process Temperature"
                            value={
                                sensor.processTemperature != null
                                    ? `${sensor.processTemperature} °C`
                                    : "N/A"
                            }
                        />

                        <Parameter
                            icon={
                                <RotateCw size={18} />
                            }
                            title="Rotational Speed"
                            value={
                                sensor.rotationalSpeed != null
                                    ? `${sensor.rotationalSpeed} RPM`
                                    : "N/A"
                            }
                        />

                        <Parameter
                            icon={
                                <Gauge size={18} />
                            }
                            title="Torque"
                            value={
                                sensor.torque != null
                                    ? sensor.torque
                                    : "N/A"
                            }
                        />

                        <Parameter
                            icon={
                                <Wrench size={18} />
                            }
                            title="Tool Wear"
                            value={
                                sensor.toolWear != null
                                    ? sensor.toolWear
                                    : "N/A"
                            }
                        />

                    </div>

                </div>

            )}


            {/* =================================================
               SENSOR ANALYTICS
            ================================================= */}

            <div className="details-section analytics-section">

                <div className="details-section-header">

                    <div>

                        <h2>
                            Sensor Analytics
                        </h2>

                        <p>
                            Visual analysis of historical
                            sensor measurements.
                        </p>

                    </div>

                    <BarChart3 size={23} />

                </div>


                {sensorHistory.length === 0 ? (

                    <NoData
                        icon={
                            <BarChart3 size={25} />
                        }
                        title="No analytics available"
                        message="Historical sensor data is required to display analytics."
                    />

                ) : (

                    <div className="analytics-grid">


                        {/* =================================
                           TEMPERATURE CHART
                        ================================= */}

                        <ChartCard
                            title="Temperature"
                            subtitle="Temperature history"
                            icon={
                                <Thermometer size={18} />
                            }
                            unit="°C"
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="chart-grid"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        width={45}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                            `${value} °C`,
                                            "Temperature",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="temperature"
                                        className="chart-line temperature-line"
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* =================================
                           VIBRATION CHART
                        ================================= */}

                        <ChartCard
                            title="Vibration"
                            subtitle="Vibration history"
                            icon={
                                <Waves size={18} />
                            }
                            unit=""
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="chart-grid"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        width={45}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                            value,
                                            "Vibration",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="vibration"
                                        className="chart-line vibration-line"
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* =================================
                           PRESSURE CHART
                        ================================= */}

                        <ChartCard
                            title="Pressure"
                            subtitle="Pressure history"
                            icon={
                                <CircleGauge size={18} />
                            }
                            unit=""
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="chart-grid"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        width={45}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                            value,
                                            "Pressure",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="pressure"
                                        className="chart-line pressure-line"
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* =================================
                           OPERATING HOURS CHART
                        ================================= */}

                        <ChartCard
                            title="Operating Hours"
                            subtitle="Machine operating hours"
                            icon={
                                <Clock3 size={18} />
                            }
                            unit="hrs"
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="chart-grid"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        width={50}
                                    />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) => [
                                            `${value} hrs`,
                                            "Operating Hours",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="operatingHours"
                                        className="chart-line operating-line"
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </ChartCard>

                    </div>

                )}

            </div>


            {/* =================================================
               LATEST PREDICTION
            ================================================= */}

            <div className="details-section prediction-section">

                <div className="details-section-header">

                    <div>

                        <h2>
                            Latest Prediction
                        </h2>

                        <p>
                            Latest machine failure
                            risk prediction.
                        </p>

                    </div>

                    <ShieldAlert size={23} />

                </div>


                {!prediction ? (

                    <NoData
                        icon={
                            <Gauge size={25} />
                        }
                        title="No prediction available"
                        message="No machine prediction has been generated for this equipment yet."
                    />

                ) : (

                    <div
                        className={
                            `prediction-card ${predictionClass}`
                        }
                    >

                        <div
                            className={
                                `prediction-risk-icon ${predictionClass}`
                            }
                        >

                            {predictionLevel === "LOW" ? (

                                <CheckCircle2 size={28} />

                            ) : (

                                <AlertTriangle size={28} />

                            )}

                        </div>


                        <div className="prediction-content">

                            <span>
                                Failure Risk
                            </span>

                            <strong
                                className={
                                    `prediction-risk-text ${predictionClass}`
                                }
                            >
                                {predictionLevel ||
                                    "UNKNOWN"}
                            </strong>

                            <small>
                                Machine failure risk level
                            </small>

                        </div>


                        <div className="prediction-probability">

                            <span>
                                Failure Probability
                            </span>

                            <strong>
                                {failureProbability !== null
                                    ? `${failureProbability}%`
                                    : "N/A"}
                            </strong>


                            {failureProbability !== null && (

                                <div className="probability-bar">

                                    <div
                                        className={
                                            `probability-fill ${predictionClass}`
                                        }
                                        style={{
                                            width:
                                                `${failureProbability}%`,
                                        }}
                                    />

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
               EQUIPMENT HISTORY
            ================================================= */}

            <div className="equipment-history-section">


                {/* HISTORY HEADER */}

                <div className="equipment-history-header">

                    <div className="equipment-history-title">

                        <div className="equipment-history-title-icon">

                            <History size={20} />

                        </div>

                        <div>

                            <h2>
                                Equipment History
                            </h2>

                            <p>
                                Historical sensor readings.
                            </p>

                        </div>

                    </div>

                </div>


                {/* HISTORY CONTENT */}

                {historyLoading ? (

                    <div className="history-loading">

                        <RefreshCw
                            size={22}
                            className="history-loading-spinner"
                        />

                        <div>
                            Loading history...
                        </div>

                    </div>

                ) : historyError ? (

                    <div className="history-empty">

                        <div className="history-empty-icon">

                            <AlertTriangle size={20} />

                        </div>

                        <h3>
                            Unable to load history
                        </h3>

                        <p>
                            {historyError}
                        </p>

                        <button
                            type="button"
                            className="equipment-retry"
                            onClick={loadHistory}
                        >

                            <RefreshCw size={15} />

                            Retry

                        </button>

                    </div>

                ) : (

                    <>

                        {/* =====================================
                           HISTORY SUMMARY
                        ===================================== */}

                        <div className="equipment-history-summary">

                            <HistoryStat
                                icon={
                                    <Activity size={18} />
                                }
                                color="blue"
                                title="Sensor Records"
                                value={
                                    sensorHistory.length
                                }
                            />


                            <HistoryStat
                                icon={
                                    <ShieldAlert size={18} />
                                }
                                color="purple"
                                title="Predictions"
                                value={
                                    predictionHistory.length
                                }
                            />


                            <HistoryStat
                                icon={
                                    <Activity size={18} />
                                }
                                color="green"
                                title="Latest Sensor"
                                value={
                                    sensorHistory.length > 0
                                        ? formatDate(
                                            sensorHistory[0]
                                                ?.createdAt
                                        )
                                        : "No data"
                                }
                            />


                            <HistoryStat
                                icon={
                                    <ShieldAlert size={18} />
                                }
                                color="orange"
                                title="Latest Prediction"
                                value={
                                    predictionHistory.length > 0
                                        ? formatDate(
                                            predictionHistory[0]
                                                ?.createdAt
                                        )
                                        : "No data"
                                }
                            />

                        </div>


                        {/* =====================================
                           SENSOR HISTORY TABLE
                        ===================================== */}

                        {sensorHistory.length === 0 ? (

                            <div className="history-empty">

                                <div className="history-empty-icon">

                                    <History size={20} />

                                </div>

                                <h3>
                                    No sensor history available
                                </h3>

                                <p>
                                    This equipment does not have
                                    any historical sensor readings.
                                </p>

                            </div>

                        ) : (

                            <div className="equipment-history-table-wrapper">

                                <table className="equipment-history-table">

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

                                            <th>
                                                Machine Type
                                            </th>

                                            <th>
                                                Air Temp.
                                            </th>

                                            <th>
                                                Process Temp.
                                            </th>

                                            <th>
                                                Speed
                                            </th>

                                            <th>
                                                Torque
                                            </th>

                                            <th>
                                                Tool Wear
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {sensorHistory.map(
                                            (
                                                record,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        record?._id ||
                                                        record?.id ||
                                                        index
                                                    }
                                                >

                                                    {/* DATE */}

                                                    <td>

                                                        <span className="history-date">

                                                            {formatDate(
                                                                record?.createdAt
                                                            )}

                                                        </span>

                                                    </td>


                                                    {/* TEMPERATURE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.temperature
                                                            }
                                                            unit="°C"
                                                        />

                                                    </td>


                                                    {/* VIBRATION */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.vibration
                                                            }
                                                        />

                                                    </td>


                                                    {/* PRESSURE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.pressure
                                                            }
                                                        />

                                                    </td>


                                                    {/* OPERATING HOURS */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.operatingHours
                                                            }
                                                            unit="hrs"
                                                        />

                                                    </td>


                                                    {/* MACHINE TYPE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.machineType
                                                            }
                                                        />

                                                    </td>


                                                    {/* AIR TEMPERATURE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.airTemperature
                                                            }
                                                            unit="°C"
                                                        />

                                                    </td>


                                                    {/* PROCESS TEMPERATURE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.processTemperature
                                                            }
                                                            unit="°C"
                                                        />

                                                    </td>


                                                    {/* SPEED */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.rotationalSpeed
                                                            }
                                                            unit="RPM"
                                                        />

                                                    </td>


                                                    {/* TORQUE */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.torque
                                                            }
                                                        />

                                                    </td>


                                                    {/* TOOL WEAR */}

                                                    <td>

                                                        <HistoryValue
                                                            value={
                                                                record?.toolWear
                                                            }
                                                        />

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </>

                )}

            </div>


            {/* =================================================
               FOOTER
            ================================================= */}

            <div className="details-footer">

                <span>
                    Latest data loaded from PlantIQ
                </span>

                <button
                    type="button"
                    onClick={refreshData}
                >

                    <RefreshCw size={15} />

                    Refresh Data

                </button>

            </div>

        </div>

    );

}


/* =========================================================
   CREATE CHART DATA
========================================================= */

function createChartData(
    sensorHistory
) {

    if (
        !Array.isArray(sensorHistory)
    ) {

        return [];

    }


    /*
       Reverse the history so the chart
       goes from oldest → newest.

       Your API appears to return:
       newest → oldest.
    */

    return [...sensorHistory]
        .reverse()
        .map(
            (record, index) => {

                return {

                    id:
                        record?._id ||
                        record?.id ||
                        index,

                    time:
                        formatChartTime(
                            record?.createdAt
                        ),

                    temperature:
                        toChartNumber(
                            record?.temperature
                        ),

                    vibration:
                        toChartNumber(
                            record?.vibration
                        ),

                    pressure:
                        toChartNumber(
                            record?.pressure
                        ),

                    operatingHours:
                        toChartNumber(
                            record?.operatingHours
                        ),

                };

            }
        );

}


/* =========================================================
   CHART NUMBER
========================================================= */

function toChartNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return Number.isNaN(number)
        ? null
        : number;

}


/* =========================================================
   CHART TIME
========================================================= */

function formatChartTime(
    date
) {

    if (!date) {

        return "";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";

    }


    return parsedDate.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
    icon,
    color,
    title,
    value,
}) {

    return (

        <div className="equipment-info-card">

            <div
                className={
                    `info-icon ${color}`
                }
            >

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
   SENSOR CARD
========================================================= */

function SensorCard({
    icon,
    title,
    value,
    unit,
    color,
}) {

    return (

        <div className="sensor-card">

            <div
                className={
                    `sensor-card-icon ${color}`
                }
            >

                {icon}

            </div>


            <div className="sensor-card-content">

                <span>
                    {title}
                </span>


                <div>

                    <strong>
                        {value}
                    </strong>

                    {unit && (

                        <small>
                            {unit}
                        </small>

                    )}

                </div>

            </div>

        </div>

    );

}


/* =========================================================
   PARAMETER
========================================================= */

function Parameter({
    icon,
    title,
    value,
}) {

    return (

        <div className="parameter-card">

            <div className="parameter-icon">

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
   NO DATA
========================================================= */

function NoData({
    icon,
    title,
    message,
}) {

    return (

        <div className="no-sensor-data">

            <div className="no-data-icon">

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
   CHART CARD
========================================================= */

function ChartCard({
    title,
    subtitle,
    icon,
    children,
}) {

    return (

        <div className="analytics-chart-card">

            <div className="analytics-chart-header">

                <div className="analytics-chart-title">

                    <div className="analytics-chart-icon">

                        {icon}

                    </div>

                    <div>

                        <h3>
                            {title}
                        </h3>

                        <p>
                            {subtitle}
                        </p>

                    </div>

                </div>

            </div>


            <div className="analytics-chart">

                {children}

            </div>

        </div>

    );

}


/* =========================================================
   HISTORY STAT
========================================================= */

function HistoryStat({
    icon,
    color,
    title,
    value,
}) {

    return (

        <div className="history-stat-card">

            <div
                className={
                    `history-stat-icon ${color}`
                }
            >

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
   HISTORY VALUE
========================================================= */

function HistoryValue({
    value,
    unit,
}) {

    const exists =
        value !== null &&
        value !== undefined &&
        value !== "";


    return (

        <>

            <span className="history-sensor-value">

                {exists
                    ? value
                    : "N/A"}

            </span>


            {exists && unit && (

                <span className="history-unit">

                    {unit}

                </span>

            )}

        </>

    );

}


/* =========================================================
   NORMALIZE PROBABILITY
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


    let result;


    if (
        raw >= 0 &&
        raw <= 1
    ) {

        result =
            Math.round(
                raw * 100
            );

    } else {

        result =
            Math.round(raw);

    }


    return Math.min(
        100,
        Math.max(
            0,
            result
        )
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "No data";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "Invalid date";

    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

}


export default EquipmentDetails;