import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import "../styles/Register.css";

const ROLES = [
    {
        value: "admin",
        label: "Admin"
    },
    {
        value: "engineer",
        label: "Engineer"
    },
    {
        value: "technician",
        label: "Technician"
    },
    {
        value: "viewer",
        label: "Viewer"
    },
    {
        value: "operator",
        label: "Operator"
    },
    {
        value: "Plant manager",
        label: "Plant Manager"
    }
];

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "engineer"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [success, setSuccess] = useState(false);

    // =========================================
    // HANDLE INPUT
    // =========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) {
            setError("");
        }
    };

    // =========================================
    // REGISTER
    // =========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        // =====================================
        // VALIDATION
        // =====================================

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!formData.password) {
            setError("Please enter a password.");
            return;
        }

        if (!formData.confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        if (!formData.role) {
            setError("Please select a role.");
            return;
        }

        // =====================================
        // EMAIL VALIDATION
        // =====================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        // =====================================
        // PASSWORD VALIDATION
        // =====================================

        if (formData.password.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }

        if (formData.password !== formData.confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        // =====================================
        // API REQUEST
        // =====================================

        try {

            setLoading(true);

            const response = await API.post(
                "/auth/register",
                {
                    name: formData.name.trim(),

                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    password: formData.password,

                    role: formData.role
                }
            );

            console.log(
                "Registration Success:",
                response.data
            );

            // =====================================
            // IMPORTANT
            // DO NOT SAVE JWT AFTER REGISTER
            // ACCOUNT IS STILL PENDING
            // =====================================

            localStorage.removeItem("token");

            // =====================================
            // SHOW PENDING SCREEN
            // =====================================

            setSuccess(true);

        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================
    // ROLE FORMATTER
    // =========================================

    const getRoleLabel = (role) => {

        const foundRole = ROLES.find(
            (item) => item.value === role
        );

        return foundRole
            ? foundRole.label
            : role;
    };

    // =========================================
    // SUCCESS / PENDING SCREEN
    // =========================================

    if (success) {

        return (

            <div className="register-page">

                {/* LEFT */}

                <section className="register-left">

                    <div className="register-brand">

                        <h1>PlantIQ</h1>

                        <p>
                            MACHINE INTELLIGENCE
                        </p>

                    </div>


                    <div className="register-content">

                        <span className="register-eyebrow">
                            PLANT MONITORING SYSTEM
                        </span>

                        <h2>
                            Smarter Machines.
                            <br />
                            Better Maintenance.
                        </h2>

                        <p className="register-description">
                            Your registration request has been
                            submitted successfully.
                        </p>

                    </div>


                    <div className="register-footer">

                        © 2026 PlantIQ. All rights reserved.

                    </div>

                </section>


                {/* RIGHT */}

                <section className="register-right">

                    <div className="register-card approval-card">

                        {/* ICON */}

                        <div className="approval-icon">
                            ⏳
                        </div>


                        <div className="approval-badge">
                            PENDING APPROVAL
                        </div>


                        <h2>
                            Registration Submitted
                        </h2>


                        <p className="approval-title">
                            Waiting for Main Admin Approval
                        </p>


                        <p className="approval-description">

                            Your PlantIQ account has been
                            created successfully. However,
                            you cannot sign in until a Main
                            Admin reviews and approves your
                            registration.

                        </p>


                        {/* USER INFORMATION */}

                        <div className="approval-box">

                            <div className="approval-row">

                                <span>
                                    Name
                                </span>

                                <strong>
                                    {formData.name}
                                </strong>

                            </div>


                            <div className="approval-row">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {formData.email}
                                </strong>

                            </div>


                            <div className="approval-row">

                                <span>
                                    Requested Role
                                </span>

                                <strong>
                                    {getRoleLabel(formData.role)}
                                </strong>

                            </div>


                            <div className="approval-row">

                                <span>
                                    Status
                                </span>

                                <strong className="pending-status">
                                    ● Pending Approval
                                </strong>

                            </div>

                        </div>


                        {/* APPROVAL MESSAGE */}

                        <div className="approval-message">

                            <div className="approval-message-icon">
                                🛡️
                            </div>

                            <div>

                                <strong>
                                    Admin Review Required
                                </strong>

                                <p>
                                    A Main Admin must review
                                    your account before you
                                    can access the PlantIQ
                                    dashboard.
                                </p>

                            </div>

                        </div>


                        {/* STATUS TIMELINE */}

                        <div className="approval-timeline">

                            <div className="timeline-item completed">

                                <div className="timeline-dot">
                                    ✓
                                </div>

                                <div>
                                    <strong>
                                        Registration Submitted
                                    </strong>

                                    <span>
                                        Your account has been created
                                    </span>
                                </div>

                            </div>


                            <div className="timeline-line"></div>


                            <div className="timeline-item active">

                                <div className="timeline-dot">
                                    2
                                </div>

                                <div>
                                    <strong>
                                        Main Admin Review
                                    </strong>

                                    <span>
                                        Waiting for approval
                                    </span>
                                </div>

                            </div>


                            <div className="timeline-line"></div>


                            <div className="timeline-item">

                                <div className="timeline-dot">
                                    3
                                </div>

                                <div>
                                    <strong>
                                        Account Activated
                                    </strong>

                                    <span>
                                        Login after approval
                                    </span>
                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="register-button"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </button>

                    </div>

                </section>

            </div>
        );
    }


    // =========================================
    // REGISTER FORM
    // =========================================

    return (

        <div className="register-page">

            {/* =====================================
                LEFT SIDE
            ====================================== */}

            <section className="register-left">

                <div className="register-brand">

                    <h1>
                        PlantIQ
                    </h1>

                    <p>
                        MACHINE INTELLIGENCE
                    </p>

                </div>


                <div className="register-content">

                    <span className="register-eyebrow">
                        PLANT MONITORING SYSTEM
                    </span>

                    <h2>
                        Join PlantIQ.
                        <br />
                        Monitor Smarter.
                    </h2>

                    <p className="register-description">

                        Create your PlantIQ account to monitor
                        equipment, analyze sensor data and use
                        intelligent predictive maintenance.

                    </p>


                    <div className="register-features">

                        <div className="register-feature">

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


                        <div className="register-feature">

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


                        <div className="register-feature">

                            <div className="feature-check">
                                ✓
                            </div>

                            <div className="feature-text">

                                <strong>
                                    Admin Approval
                                </strong>

                                <span>
                                    Secure account verification process
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="register-footer">

                    © 2026 PlantIQ. All rights reserved.

                </div>

            </section>


            {/* =====================================
                RIGHT SIDE
            ====================================== */}

            <section className="register-right">

                <div className="register-card">

                    {/* HEADER */}

                    <div className="register-card-header">

                        <div className="register-icon">
                            👤
                        </div>

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Register for access to PlantIQ
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="register-error">

                            <span>
                                ⚠
                            </span>

                            <p>
                                {error}
                            </p>

                        </div>

                    )}


                    {/* FORM */}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        {/* NAME */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                disabled={loading}
                            />

                        </div>


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
                                disabled={loading}
                            />

                        </div>


                        {/* ROLE */}

                        <div className="form-group">

                            <label htmlFor="role">
                                Select Role
                            </label>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                            >

                                {ROLES.map((role) => (

                                    <option
                                        key={role.value}
                                        value={role.value}
                                    >
                                        {role.label}
                                    </option>

                                ))}

                            </select>

                            <small className="field-help">
                                Your selected role requires Main Admin approval.
                            </small>

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="password"
                                    name="password"
                                    placeholder="Minimum 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="register-password-eye"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {showPassword
                                        ? "🙈"
                                        : "👁️"}

                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="register-password-wrapper">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="register-password-eye"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {showConfirmPassword
                                        ? "🙈"
                                        : "👁️"}

                                </button>

                            </div>

                        </div>


                        {/* APPROVAL INFO */}

                        <div className="approval-info">

                            <div className="approval-info-icon">
                                🛡️
                            </div>

                            <div>

                                <strong>
                                    Main Admin Approval
                                </strong>

                                <p>
                                    Your account will remain
                                    pending until a Main Admin
                                    approves your registration.
                                </p>

                            </div>

                        </div>


                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Submitting Registration..."
                                : "Create Account"
                            }

                        </button>

                    </form>


                    {/* DIVIDER */}

                    <div className="register-divider">

                        <span>
                            Already have an account?
                        </span>

                    </div>


                    {/* LOGIN */}

                    <button
                        type="button"
                        className="login-redirect-button"
                        onClick={() => navigate("/login")}
                        disabled={loading}
                    >
                        Sign In
                    </button>

                </div>

            </section>

        </div>
    );
}

export default Register;