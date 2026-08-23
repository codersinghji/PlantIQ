import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Cpu,
    Gauge,
    RefreshCw,
    ShieldAlert,
    Thermometer,
    Waves
} from "lucide-react";

import {
    getDashboardSummary
} from "../services/api";

import "../styles/dashboard.css";


function Dashboard() {

    // =====================================================
    // STATE
    // =====================================================

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard = useCallback(
        async (isRefresh = false) => {

            try {

                if (isRefresh) {

                    setRefreshing(true);

                } else {

                    setLoading(true);

                }


                setError("");


                const response =
                    await getDashboardSummary();


                console.log(
                    "Dashboard Response:",
                    response
                );


                if (response?.success) {

                    setDashboard(response);

                } else {

                    setError(
                        response?.message ||
                        "Unable to load dashboard."
                    );

                }

            } catch (error) {

                console.error(
                    "Dashboard Loading Error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    // =====================================================
    // AUTO REFRESH
    // =====================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                loadDashboard(true);

            }, 30000);


        return () => {

            clearInterval(interval);

        };

    }, [loadDashboard]);


    // =====================================================
    // SAFE DATA
    // =====================================================

    const summary =
        dashboard?.summary || {};


    const predictions =
        dashboard?.latestPredictions || [];


    const sensorData =
        dashboard?.latestSensorData || [];


    const equipment =
        dashboard?.recentEquipment || [];


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

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
    // PROBABILITY
    // =====================================================

    const getProbability = (value) => {

        const number =
            Number(value || 0);


        if (number <= 1) {

            return Math.round(
                number * 100
            );

        }


        return Math.round(number);

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="dashboard-page">

                <div className="dashboard-loading">

                    <div className="dashboard-spinner"></div>

                    <h3>
                        Loading PlantIQ
                    </h3>

                    <p>
                        Preparing your plant health dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div className="dashboard-header-content">

                    <span className="dashboard-eyebrow">
                        PLANTIQ / OVERVIEW
                    </span>

                    <h1>
                        Plant Health Dashboard
                    </h1>

                    <p>
                        Monitor equipment health,
                        sensor activity and AI-powered
                        predictive maintenance.
                    </p>

                </div>


                <button
                    className="dashboard-refresh"
                    onClick={() =>
                        loadDashboard(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    <AlertTriangle size={18} />

                    <div>

                        <strong>
                            Dashboard Error
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                </div>

            )}


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="dashboard-kpi-grid">


                {/* TOTAL EQUIPMENT */}

                <div className="dashboard-kpi-card">

                    <div className="kpi-icon">
                        <Cpu size={21} />
                    </div>

                    <div className="kpi-content">

                        <span>
                            Total Equipment
                        </span>

                        <strong>
                            {summary.totalEquipment ?? 0}
                        </strong>

                        <small>
                            Registered machines
                        </small>

                    </div>

                </div>


                {/* RUNNING */}

                <div className="dashboard-kpi-card">

                    <div className="kpi-icon">
                        <Activity size={21} />
                    </div>

                    <div className="kpi-content">

                        <span>
                            Running
                        </span>

                        <strong>
                            {summary.runningEquipment ?? 0}
                        </strong>

                        <small>
                            Currently operational
                        </small>

                    </div>

                </div>


                {/* WARNING */}

                <div className="dashboard-kpi-card">

                    <div className="kpi-icon warning">
                        <AlertTriangle size={21} />
                    </div>

                    <div className="kpi-content">

                        <span>
                            Medium Risk
                        </span>

                        <strong>
                            {summary.mediumRisk ?? 0}
                        </strong>

                        <small>
                            Requires monitoring
                        </small>

                    </div>

                </div>


                {/* CRITICAL */}

                <div className="dashboard-kpi-card">

                    <div className="kpi-icon critical">
                        <ShieldAlert size={21} />
                    </div>

                    <div className="kpi-content">

                        <span>
                            High Risk
                        </span>

                        <strong>
                            {summary.highRisk ?? 0}
                        </strong>

                        <small>
                            Maintenance recommended
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                HEALTH OVERVIEW
            ================================================= */}

            <section className="dashboard-health-section">

                <div className="dashboard-section-header">

                    <div>

                        <span className="section-eyebrow">
                            MACHINE HEALTH
                        </span>

                        <h2>
                            Equipment Health Overview
                        </h2>

                        <p>
                            Current distribution of
                            equipment and AI risk levels.
                        </p>

                    </div>

                </div>


                <div className="health-overview-grid">


                    {/* EQUIPMENT STATUS */}

                    <div className="health-panel">

                        <div className="health-panel-header">

                            <div>

                                <span>
                                    EQUIPMENT STATUS
                                </span>

                                <h3>
                                    Operational State
                                </h3>

                            </div>

                            <Gauge size={20} />

                        </div>


                        <div className="health-bars">

                            <div className="health-bar-row">

                                <div className="health-bar-label">

                                    <span>
                                        Running
                                    </span>

                                    <strong>
                                        {summary.runningEquipment ?? 0}
                                    </strong>

                                </div>

                                <div className="health-bar">

                                    <div
                                        className="health-fill running"
                                        style={{
                                            width:
                                                `${
                                                    summary.totalEquipment
                                                        ? (
                                                            (
                                                                summary.runningEquipment ||
                                                                0
                                                            ) /
                                                            summary.totalEquipment
                                                        ) *
                                                        100
                                                        : 0
                                                }%`
                                        }}
                                    />

                                </div>

                            </div>


                            <div className="health-bar-row">

                                <div className="health-bar-label">

                                    <span>
                                        Stopped
                                    </span>

                                    <strong>
                                        {summary.stoppedEquipment ?? 0}
                                    </strong>

                                </div>

                                <div className="health-bar">

                                    <div
                                        className="health-fill stopped"
                                        style={{
                                            width:
                                                `${
                                                    summary.totalEquipment
                                                        ? (
                                                            (
                                                                summary.stoppedEquipment ||
                                                                0
                                                            ) /
                                                            summary.totalEquipment
                                                        ) *
                                                        100
                                                        : 0
                                                }%`
                                        }}
                                    />

                                </div>

                            </div>


                            <div className="health-bar-row">

                                <div className="health-bar-label">

                                    <span>
                                        Maintenance
                                    </span>

                                    <strong>
                                        {summary.maintenanceEquipment ?? 0}
                                    </strong>

                                </div>

                                <div className="health-bar">

                                    <div
                                        className="health-fill maintenance"
                                        style={{
                                            width:
                                                `${
                                                    summary.totalEquipment
                                                        ? (
                                                            (
                                                                summary.maintenanceEquipment ||
                                                                0
                                                            ) /
                                                            summary.totalEquipment
                                                        ) *
                                                        100
                                                        : 0
                                                }%`
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* AI RISK */}

                    <div className="health-panel">

                        <div className="health-panel-header">

                            <div>

                                <span>
                                    AI RISK
                                </span>

                                <h3>
                                    Prediction Distribution
                                </h3>

                            </div>

                            <ShieldAlert size={20} />

                        </div>


                        <div className="risk-distribution">

                            <div className="risk-distribution-item">

                                <div>

                                    <span className="risk-dot low"></span>

                                    <span>
                                        Low
                                    </span>

                                </div>

                                <strong>
                                    {summary.lowRisk ?? 0}
                                </strong>

                            </div>


                            <div className="risk-distribution-item">

                                <div>

                                    <span className="risk-dot medium"></span>

                                    <span>
                                        Medium
                                    </span>

                                </div>

                                <strong>
                                    {summary.mediumRisk ?? 0}
                                </strong>

                            </div>


                            <div className="risk-distribution-item">

                                <div>

                                    <span className="risk-dot high"></span>

                                    <span>
                                        High
                                    </span>

                                </div>

                                <strong>
                                    {summary.highRisk ?? 0}
                                </strong>

                            </div>

                        </div>


                        <div className="average-risk">

                            <div>

                                <span>
                                    Average Failure Probability
                                </span>

                                <strong>
                                    {getProbability(
                                        summary.averageFailureProbability
                                    )}
                                    %
                                </strong>

                            </div>

                            <div className="average-risk-bar">

                                <div
                                    style={{
                                        width:
                                            `${getProbability(
                                                summary.averageFailureProbability
                                            )}%`
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                LOWER GRID
            ================================================= */}

            <div className="dashboard-main-grid">


                {/* =================================================
                    LATEST PREDICTIONS
                ================================================= */}

                <section className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <span>
                                AI PREDICTIONS
                            </span>

                            <h2>
                                Latest Predictions
                            </h2>

                        </div>

                        <div className="panel-count">

                            {predictions.length}

                        </div>

                    </div>


                    {predictions.length > 0 ? (

                        <div className="prediction-list">

                            {predictions.map(
                                (item) => {

                                    const probability =
                                        getProbability(
                                            item.failureProbability
                                        );


                                    const risk =
                                        (
                                            item.prediction ||
                                            "UNKNOWN"
                                        ).toLowerCase();


                                    return (

                                        <div
                                            className="dashboard-prediction-row"
                                            key={item._id}
                                        >

                                            <div className="prediction-machine-icon">
                                                <Cpu size={17} />
                                            </div>


                                            <div className="prediction-machine">

                                                <strong>
                                                    {item.equipmentId?.name ||
                                                        "--"}
                                                </strong>

                                                <span>
                                                    {item.equipmentId?.equipmentCode ||
                                                        "--"}
                                                </span>

                                            </div>


                                            <div className="prediction-risk">

                                                <span
                                                    className={
                                                        `dashboard-risk-badge risk-${risk}`
                                                    }
                                                >
                                                    {item.prediction ||
                                                        "N/A"}
                                                </span>

                                            </div>


                                            <div className="prediction-percent">

                                                <strong>
                                                    {probability}%
                                                </strong>

                                                <div className="mini-progress">

                                                    <div
                                                        className={
                                                            `mini-progress-fill fill-${risk}`
                                                        }
                                                        style={{
                                                            width:
                                                                `${probability}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    ) : (

                        <div className="dashboard-empty">

                            <ShieldAlert size={30} />

                            <h3>
                                No predictions yet
                            </h3>

                            <p>
                                AI predictions will appear
                                after sensor data is processed.
                            </p>

                        </div>

                    )}

                </section>


                {/* =================================================
                    SENSOR DATA
                ================================================= */}

                <section className="dashboard-panel">

                    <div className="dashboard-panel-header">

                        <div>

                            <span>
                                SENSOR ACTIVITY
                            </span>

                            <h2>
                                Latest Readings
                            </h2>

                        </div>

                        <div className="panel-count">

                            {sensorData.length}

                        </div>

                    </div>


                    {sensorData.length > 0 ? (

                        <div className="sensor-reading-list">

                            {sensorData.map(
                                (item) => (

                                    <div
                                        className="dashboard-sensor-row"
                                        key={item._id}
                                    >

                                        <div className="sensor-machine">

                                            <div className="sensor-machine-icon">
                                                <Activity size={16} />
                                            </div>

                                            <div>

                                                <strong>
                                                    {item.equipmentId?.name ||
                                                        "--"}
                                                </strong>

                                                <span>
                                                    {formatDate(
                                                        item.createdAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="sensor-reading-values">

                                            <div>

                                                <Thermometer
                                                    size={14}
                                                />

                                                <span>
                                                    {item.temperature ?? "--"}
                                                    °C
                                                </span>

                                            </div>


                                            <div>

                                                <Waves
                                                    size={14}
                                                />

                                                <span>
                                                    {item.vibration ?? "--"}
                                                    mm/s
                                                </span>

                                            </div>


                                            <div>

                                                <Gauge
                                                    size={14}
                                                />

                                                <span>
                                                    {item.pressure ?? "--"}
                                                    bar
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <div className="dashboard-empty">

                            <Activity size={30} />

                            <h3>
                                No sensor readings
                            </h3>

                            <p>
                                Sensor data will appear here
                                once machines start reporting.
                            </p>

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                RECENT EQUIPMENT
            ================================================= */}

            <section className="dashboard-panel recent-equipment-panel">

                <div className="dashboard-panel-header">

                    <div>

                        <span>
                            EQUIPMENT
                        </span>

                        <h2>
                            Recent Equipment
                        </h2>

                    </div>

                    <div className="panel-count">

                        {equipment.length}

                    </div>

                </div>


                {equipment.length > 0 ? (

                    <div className="equipment-dashboard-grid">

                        {equipment.map(
                            (item) => {

                                const status =
                                    String(
                                        item.status ||
                                        "unknown"
                                    ).toLowerCase();


                                return (

                                    <div
                                        className="equipment-dashboard-card"
                                        key={item._id}
                                    >

                                        <div className="equipment-card-top">

                                            <div className="equipment-card-icon">
                                                <Cpu size={18} />
                                            </div>

                                            <span
                                                className={
                                                    `equipment-status-badge status-${status}`
                                                }
                                            >
                                                {item.status ||
                                                    "Unknown"}
                                            </span>

                                        </div>


                                        <strong>
                                            {item.name ||
                                                "--"}
                                        </strong>

                                        <span>
                                            {item.equipmentCode ||
                                                "--"}
                                        </span>

                                        <small>
                                            {item.type ||
                                                "Equipment"}
                                            {" • "}
                                            {item.location ||
                                                "Location unavailable"}
                                        </small>

                                    </div>

                                );

                            }
                        )}

                    </div>

                ) : (

                    <div className="dashboard-empty">

                        <Cpu size={30} />

                        <h3>
                            No equipment
                        </h3>

                        <p>
                            Add equipment to start
                            monitoring your plant.
                        </p>

                    </div>

                )}

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="dashboard-footer">

                <span>
                    <Clock3 size={13} />
                    Dashboard automatically refreshes every 30 seconds.
                </span>

                <span>
                    Total sensor records:
                    {" "}
                    <strong>
                        {summary.totalSensorRecords ?? 0}
                    </strong>
                </span>

            </footer>

        </div>

    );

}


export default Dashboard;