import { useEffect, useMemo, useState } from "react";

import {
    getAllPredictions,
    getPredictionSummary
} from "../services/api";

import "../styles/Prediction.css";


function Prediction() {

    // =====================================================
    // STATE
    // =====================================================

    const [predictions, setPredictions] = useState([]);

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [riskFilter, setRiskFilter] = useState("ALL");


    // =====================================================
    // LOAD PREDICTIONS
    // =====================================================

    useEffect(() => {
        loadPredictionData();
    }, []);


    const loadPredictionData = async () => {

        try {

            setError("");

            if (predictions.length === 0) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }


            const [
                predictionResponse,
                summaryResponse
            ] = await Promise.all([

                getAllPredictions(),

                getPredictionSummary()

            ]);


            // =================================================
            // PREDICTIONS
            // =================================================

            if (predictionResponse?.success) {

                const data =
                    predictionResponse.predictions || [];


                // Newest prediction first

                const sortedData =
                    [...data].sort(
                        (a, b) =>
                            new Date(b.createdAt || 0) -
                            new Date(a.createdAt || 0)
                    );


                setPredictions(sortedData);

            } else {

                setPredictions([]);

            }


            // =================================================
            // SUMMARY
            // =================================================

            if (summaryResponse?.success) {

                setSummary(
                    summaryResponse.summary || null
                );

            }

        } catch (error) {

            console.error(
                "Prediction Loading Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load prediction data."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    // =====================================================
    // FILTERED PREDICTIONS
    // =====================================================

    const filteredPredictions = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();


        return predictions.filter((item) => {

            const equipment =
                item?.equipmentId;


            const equipmentName =
                typeof equipment === "object"
                    ? equipment?.name || ""
                    : "";


            const equipmentCode =
                typeof equipment === "object"
                    ? equipment?.equipmentCode || ""
                    : "";


            const equipmentType =
                typeof equipment === "object"
                    ? equipment?.type || ""
                    : "";


            const searchText =
                `${equipmentName} ${equipmentCode} ${equipmentType}`
                    .toLowerCase();


            const matchesSearch =
                !searchValue ||
                searchText.includes(searchValue);


            const prediction =
                String(
                    item?.prediction || ""
                ).toUpperCase();


            const matchesRisk =
                riskFilter === "ALL" ||
                prediction === riskFilter;


            return (
                matchesSearch &&
                matchesRisk
            );

        });

    }, [
        predictions,
        search,
        riskFilter
    ]);


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "--";
        }


        const parsedDate =
            new Date(date);


        if (Number.isNaN(parsedDate.getTime())) {
            return "--";
        }


        return parsedDate.toLocaleString(
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
            Number(value);


        if (!Number.isFinite(number)) {
            return 0;
        }


        // MongoDB / ML may return:
        // 0.25 = 25%
        // 25   = 25%

        if (number >= 0 && number <= 1) {

            return Math.round(
                number * 100
            );

        }


        return Math.min(
            Math.max(
                Math.round(number),
                0
            ),
            100
        );

    };


    // =====================================================
    // RISK
    // =====================================================

    const getRisk = (prediction) => {

        return String(
            prediction || "UNKNOWN"
        ).toUpperCase();

    };


    // =====================================================
    // SUMMARY VALUES
    // =====================================================

    const totalPredictions =
        summary?.total ??
        predictions.length;


    const lowPredictions =
        summary?.low ??
        predictions.filter(
            item =>
                getRisk(item.prediction) === "LOW"
        ).length;


    const mediumPredictions =
        summary?.medium ??
        predictions.filter(
            item =>
                getRisk(item.prediction) === "MEDIUM"
        ).length;


    const highPredictions =
        summary?.high ??
        predictions.filter(
            item =>
                getRisk(item.prediction) === "HIGH"
        ).length;


    // =====================================================
    // LATEST PREDICTION
    // =====================================================

    const latestPrediction =
        predictions.length > 0
            ? predictions[0]
            : null;


    const latestProbability =
        getProbability(
            latestPrediction?.failureProbability
        );


    const latestRisk =
        getRisk(
            latestPrediction?.prediction
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="prediction-page">

                <div className="prediction-loading">

                    <div className="prediction-spinner"></div>

                    <h3>
                        Loading predictions
                    </h3>

                    <p>
                        Fetching AI prediction data...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="prediction-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="prediction-header">

                <div>

                    <span className="prediction-eyebrow">
                        AI / PREDICTIVE MAINTENANCE
                    </span>

                    <h1>
                        Machine Predictions
                    </h1>

                    <p>
                        Monitor AI-generated machine
                        health predictions and failure risk.
                    </p>

                </div>


                <button
                    type="button"
                    className="prediction-refresh"
                    onClick={loadPredictionData}
                    disabled={refreshing}
                >

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="prediction-error">

                    <strong>
                        Error
                    </strong>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="prediction-summary-grid">


                {/* TOTAL */}

                <div className="prediction-summary-card">

                    <span>
                        Total Predictions
                    </span>

                    <strong>
                        {totalPredictions}
                    </strong>

                    <small>
                        AI predictions generated
                    </small>

                </div>


                {/* LOW */}

                <div className="prediction-summary-card low">

                    <span>
                        Low Risk
                    </span>

                    <strong>
                        {lowPredictions}
                    </strong>

                    <small>
                        Normal machine condition
                    </small>

                </div>


                {/* MEDIUM */}

                <div className="prediction-summary-card medium">

                    <span>
                        Medium Risk
                    </span>

                    <strong>
                        {mediumPredictions}
                    </strong>

                    <small>
                        Monitor machine
                    </small>

                </div>


                {/* HIGH */}

                <div className="prediction-summary-card high">

                    <span>
                        High Risk
                    </span>

                    <strong>
                        {highPredictions}
                    </strong>

                    <small>
                        Maintenance recommended
                    </small>

                </div>

            </div>


            {/* =================================================
                LATEST AI RESULT
            ================================================= */}

            {latestPrediction && (

                <section className="latest-prediction">

                    <div className="latest-prediction-header">

                        <div>

                            <span>
                                LATEST AI RESULT
                            </span>

                            <h2>
                                Current Machine Health
                            </h2>

                        </div>


                        <span className="latest-time">

                            {formatDate(
                                latestPrediction.createdAt
                            )}

                        </span>

                    </div>


                    <div className="latest-prediction-body">


                        {/* EQUIPMENT */}

                        <div className="latest-equipment">

                            <span>
                                Equipment
                            </span>

                            <strong>

                                {latestPrediction
                                    ?.equipmentId
                                    ?.name ||
                                    "--"}

                            </strong>

                            <small>

                                {latestPrediction
                                    ?.equipmentId
                                    ?.equipmentCode ||
                                    "--"}

                            </small>

                        </div>


                        {/* RISK */}

                        <div className="latest-risk">

                            <span>
                                Risk Level
                            </span>

                            <strong
                                className={`risk-badge risk-${latestRisk.toLowerCase()}`}
                            >

                                {latestRisk}

                            </strong>

                        </div>


                        {/* PROBABILITY */}

                        <div className="latest-probability">

                            <div className="probability-heading">

                                <span>
                                    Failure Probability
                                </span>

                                <strong>
                                    {latestProbability}%
                                </strong>

                            </div>


                            <div className="prediction-progress">

                                <div
                                    className={`prediction-progress-fill risk-fill-${latestRisk.toLowerCase()}`}
                                    style={{
                                        width: `${latestProbability}%`
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                HISTORY
            ================================================= */}

            <section className="prediction-history">

                <div className="prediction-history-header">

                    <div>

                        <span>
                            PREDICTION HISTORY
                        </span>

                        <h2>
                            AI Prediction Records
                        </h2>

                        <p>
                            Historical machine failure
                            predictions generated by PlantIQ.
                        </p>

                    </div>


                    <div className="history-count">

                        {filteredPredictions.length}

                        <span>
                            records
                        </span>

                    </div>

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="prediction-filters">

                    <div className="prediction-search">

                        <input
                            type="text"
                            placeholder="Search equipment..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <select
                        value={riskFilter}
                        onChange={(event) =>
                            setRiskFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Risk Levels
                        </option>

                        <option value="LOW">
                            Low Risk
                        </option>

                        <option value="MEDIUM">
                            Medium Risk
                        </option>

                        <option value="HIGH">
                            High Risk
                        </option>

                    </select>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                {filteredPredictions.length > 0 ? (

                    <div className="prediction-table-wrapper">

                        <table className="prediction-table">

                            <thead>

                                <tr>

                                    <th>
                                        Equipment
                                    </th>

                                    <th>
                                        Risk
                                    </th>

                                    <th>
                                        Failure Probability
                                    </th>

                                    <th>
                                        Temperature
                                    </th>

                                    <th>
                                        Vibration
                                    </th>

                                    <th>
                                        Time
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredPredictions.map(
                                    (item) => {

                                        const sensor =
                                            typeof item.sensorDataId === "object"
                                                ? item.sensorDataId
                                                : null;


                                        const probability =
                                            getProbability(
                                                item.failureProbability
                                            );


                                        const risk =
                                            getRisk(
                                                item.prediction
                                            );


                                        const equipment =
                                            typeof item.equipmentId === "object"
                                                ? item.equipmentId
                                                : null;


                                        return (

                                            <tr
                                                key={
                                                    item._id
                                                }
                                            >


                                                {/* EQUIPMENT */}

                                                <td>

                                                    <div className="prediction-equipment">

                                                        <strong>

                                                            {equipment?.name ||
                                                                "--"}

                                                        </strong>

                                                        <span>

                                                            {equipment?.equipmentCode ||
                                                                "--"}

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* RISK */}

                                                <td>

                                                    <span
                                                        className={`risk-badge risk-${risk.toLowerCase()}`}
                                                    >

                                                        {risk}

                                                    </span>

                                                </td>


                                                {/* PROBABILITY */}

                                                <td>

                                                    <div className="table-probability">

                                                        <div className="table-probability-top">

                                                            <strong>
                                                                {probability}%
                                                            </strong>

                                                        </div>


                                                        <div className="table-progress">

                                                            <div
                                                                className={`table-progress-fill risk-fill-${risk.toLowerCase()}`}
                                                                style={{
                                                                    width: `${probability}%`
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* TEMPERATURE */}

                                                <td>

                                                    {sensor?.temperature ??
                                                        "--"}

                                                    <span className="table-unit">
                                                        °C
                                                    </span>

                                                </td>


                                                {/* VIBRATION */}

                                                <td>

                                                    {sensor?.vibration ??
                                                        "--"}

                                                    <span className="table-unit">
                                                        mm/s
                                                    </span>

                                                </td>


                                                {/* DATE */}

                                                <td className="prediction-date">

                                                    {formatDate(
                                                        item.createdAt
                                                    )}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="prediction-empty">

                        <div className="empty-icon">
                            AI
                        </div>

                        <h3>
                            No prediction records
                        </h3>

                        <p>
                            Predictions will appear here
                            after sensor data is processed.
                        </p>

                    </div>

                )}

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="prediction-footer">

                Showing{" "}

                <strong>
                    {filteredPredictions.length}
                </strong>{" "}

                of{" "}

                <strong>
                    {predictions.length}
                </strong>{" "}

                prediction records

            </div>

        </div>

    );

}


export default Prediction;