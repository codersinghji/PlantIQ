import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/resetPassword.css";

function ResetPassword() {

    const navigate = useNavigate();

    // Get email saved after OTP verification
    const email = localStorage.getItem("resetEmail");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // =====================================
    // RESET PASSWORD
    // =====================================

    const handleResetPassword = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
        setError("Email is missing. Please restart password recovery.");
        return;
    }

    if (!password || !confirmPassword) {
        setError("Please fill both password fields");
        return;
    }

    if (password.length < 6) {
        setError(
            "Password must contain at least 6 characters"
        );
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    try {

        setLoading(true);

        const response = await API.post(
            "/auth/reset-password",
            {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }
        );

        console.log(
            "Password Reset:",
            response.data
        );

        if (response.data.success) {

            setMessage(
                response.data.message ||
                "Password reset successfully"
            );

            setStep(4);
        }

    } catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );

        setError(
            error.response?.data?.message ||
            "Unable to reset password"
        );

    } finally {

        setLoading(false);
    }
};


    return (

        <div className="reset-password-page">


            {/* =================================
                LEFT SIDE
            ================================= */}

            <div className="reset-left">


                {/* BRAND */}

                <div className="reset-brand">

                    <h1>
                        PlantIQ
                    </h1>

                    <p>
                        Machine Intelligence
                    </p>

                </div>


                {/* CONTENT */}

                <div className="reset-content">

                    <span className="reset-eyebrow">
                        ACCOUNT RECOVERY
                    </span>


                    <h2>
                        Create a new
                        <br />
                        password.
                    </h2>


                    <p>
                        Your OTP has been verified.
                        Create a secure new password
                        for your PlantIQ account.
                    </p>

                </div>


                {/* FOOTER */}

                <div className="reset-footer">

                    © 2026 PlantIQ.
                    All rights reserved.

                </div>

            </div>



            {/* =================================
                RIGHT SIDE
            ================================= */}

            <div className="reset-right">


                <div className="reset-card">


                    {/* HEADER */}

                    <div className="reset-card-header">


                        <div className="reset-icon">
                            🔐
                        </div>


                        <h2>
                            New Password
                        </h2>


                        <p>
                            Create your new password
                        </p>

                    </div>



                    {/* ERROR */}

                    {error && (

                        <div className="reset-error">

                            {error}

                        </div>

                    )}



                    {/* SUCCESS */}

                    {message && (

                        <div className="reset-success">

                            {message}

                        </div>

                    )}



                    {/* FORM */}

                    <form
                        onSubmit={handleResetPassword}
                        className="reset-form"
                    >


                        {/* NEW PASSWORD */}

                        <div className="reset-form-group">

                            <label>
                                New Password
                            </label>


                            <div className="password-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>



                        {/* CONFIRM PASSWORD */}

                        <div className="reset-form-group">

                            <label>
                                Confirm Password
                            </label>


                            <div className="password-wrapper">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>



                        {/* PASSWORD REQUIREMENTS */}

                        <div className="password-hint">

                            <span>
                                ✓ At least 6 characters
                            </span>

                            <span
                                className={
                                    newPassword &&
                                    newPassword ===
                                        confirmPassword
                                        ? "valid"
                                        : ""
                                }
                            >
                                ✓ Passwords match
                            </span>

                        </div>



                        {/* RESET BUTTON */}

                        <button
                            type="submit"
                            className="reset-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Resetting Password..."
                                : "Reset Password"
                            }

                        </button>

                    </form>



                    {/* BACK TO LOGIN */}

                    <button
                        type="button"
                        className="reset-back-login"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        ← Back to Login
                    </button>


                </div>

            </div>

        </div>
    );
}


export default ResetPassword;