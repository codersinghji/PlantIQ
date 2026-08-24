import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import "../styles/login.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Remove error while typing
        if (error) {
            setError("");
        }
    };


    // =========================
    // LOGIN
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter email and password");
            return;
        }

        try {

            setLoading(true);

            const response = await API.post(
                "/auth/login",
                formData
            );

            console.log("Login Success:", response.data);

            // Save JWT token
            if (response.data.token) {

                localStorage.setItem(
                    "token",
                    response.data.token
                );
            }

            // Save user
            if (response.data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            // Go to dashboard
            navigate("/dashboard");

        } catch (error) {

            console.error("Login Error:", error);

            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="login-page">

            {/* =====================================
                LEFT SIDE
            ====================================== */}

            <section className="login-left">

                {/* Brand */}

                <div className="login-brand">

                    <h1>PlantIQ</h1>

                    <p>
                        MACHINE INTELLIGENCE
                    </p>

                </div>


                {/* Main Content */}

                <div className="login-content">

                    <span className="login-eyebrow">
                        PLANT MONITORING SYSTEM
                    </span>

                    <h2>
                        Smarter Machines.
                        <br />
                        Better Maintenance.
                    </h2>

                    <p className="login-description">
                        Monitor equipment health, analyze sensor
                        data and predict machine failures using
                        intelligent predictive maintenance.
                    </p>


                    {/* Features */}

                    <div className="login-features">

                        <div className="login-feature">

                            <div className="feature-check">
                                ✓
                            </div>

                            <div className="feature-text">

                                <strong>
                                    Real-time Monitoring
                                </strong>

                                <span>
                                    Track machine health continuously
                                </span>

                            </div>

                        </div>


                        <div className="login-feature">

                            <div className="feature-check">
                                ✓
                            </div>

                            <div className="feature-text">

                                <strong>
                                    AI Predictions
                                </strong>

                                <span>
                                    Detect potential failures early
                                </span>

                            </div>

                        </div>


                        <div className="login-feature">

                            <div className="feature-check">
                                ✓
                            </div>

                            <div className="feature-text">

                                <strong>
                                    Predictive Maintenance
                                </strong>

                                <span>
                                    Reduce downtime and maintenance costs
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Footer */}

                <div className="login-footer">
                    © 2026 PlantIQ. All rights reserved.
                </div>

            </section>


            {/* =====================================
                RIGHT SIDE
            ====================================== */}

            <section className="login-right">

                <div className="login-card">

                    {/* Header */}

                    <div className="login-card-header">

                        <div className="login-icon">
                            🔐
                        </div>

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Sign in to access your PlantIQ dashboard
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* Form */}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() =>
                                        navigate("/forgot-password")
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>


                            {/* IMPORTANT:
                                Eye + Input are inside this wrapper
                            */}

                            <div className="login-password-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                />


                                {/* EYE BUTTON */}

                                <button
                                    type="button"
                                    className="login-password-eye"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {showPassword ? (

                                        /* Eye OFF */

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                d="M3 3l18 18"
                                            />

                                            <path
                                                d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
                                            />

                                            <path
                                                d="M9.88 4.24A10.7 10.7 0 0 1 12 4c5 0 8.27 4 9 8a13.4 13.4 0 0 1-2.05 4.24"
                                            />

                                            <path
                                                d="M6.61 6.61C4.62 7.94 3.35 10 3 12c.73 4 4 8 9 8a10.7 10.7 0 0 0 3.88-.73"
                                            />
                                        </svg>

                                    ) : (

                                        /* Eye ON */

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                                            />

                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                            />
                                        </svg>

                                    )}

                                </button>

                            </div>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }

                        </button>

                    </form>


                    {/* Divider */}

                    <div className="login-divider">

                        <span>
                            Secure access
                        </span>

                    </div>


                    {/* Security Box */}

                    <div className="login-security">

                        <div className="security-icon">
                            🛡️
                        </div>

                        <div className="security-content">

                            <strong>
                                Protected System
                            </strong>

                            <p>
                                Your PlantIQ account is secured
                                with encrypted authentication.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Login;