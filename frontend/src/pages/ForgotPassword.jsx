import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import "../styles/ForgotPassword.css";

function ForgotPassword() {

    const navigate = useNavigate();

    // -------------------------
    // STEP
    // -------------------------
    const [step, setStep] = useState(1);

    // -------------------------
    // FORM DATA
    // -------------------------
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // -------------------------
    // UI STATE
    // -------------------------
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // -------------------------
    // OTP TIMER
    // -------------------------
    const [timer, setTimer] = useState(300);

    // -------------------------
    // TIMER
    // -------------------------
    useEffect(() => {

        if (step !== 2 || timer <= 0) {
            return;
        }

        const interval = setInterval(() => {
            setTimer((previous) => previous - 1);
        }, 1000);

        return () => clearInterval(interval);

    }, [step, timer]);


    // -------------------------
    // FORMAT TIMER
    // -------------------------
    const formatTime = () => {

        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        return `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };


    // -------------------------
    // SEND OTP
    // -------------------------
    const handleSendOTP = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {

            setLoading(true);

            const response = await API.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

            console.log("Forgot Password:", response.data);

            setMessage(
                response.data.message ||
                "OTP sent successfully"
            );

            // Move to OTP screen
            setStep(2);

            // Start 5 minute timer
            setTimer(300);

        } catch (error) {

            console.error(
                "Forgot Password Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to send OTP"
            );

        } finally {

            setLoading(false);

        }
    };



const handleOtpChange = (value, index) => {
    // Allow only numbers
    const digit = value.replace(/\D/g, "");

    const newOtp = [...otp];

    // If user pasted multiple digits
    if (digit.length > 1) {
        const digits = digit.slice(0, 6).split("");

        digits.forEach((num, i) => {
            if (index + i < 6) {
                newOtp[index + i] = num;
            }
        });

        setOtp(newOtp);

        // Focus last filled box
        const nextIndex = Math.min(index + digits.length, 5);

        document
            .getElementById(`otp-${nextIndex}`)
            ?.focus();

        return;
    }

    newOtp[index] = digit;

    setOtp(newOtp);

    // Automatically move to next box
    if (digit && index < 5) {
        document
            .getElementById(`otp-${index + 1}`)
            ?.focus();
    }
};


const handleOtpKeyDown = (e, index) => {

    // Backspace
    if (e.key === "Backspace") {

        if (!otp[index] && index > 0) {

            const newOtp = [...otp];

            newOtp[index - 1] = "";

            setOtp(newOtp);

            document
                .getElementById(`otp-${index - 1}`)
                ?.focus();
        }
    }

    // Arrow Left
    if (e.key === "ArrowLeft" && index > 0) {
        document
            .getElementById(`otp-${index - 1}`)
            ?.focus();
    }

    // Arrow Right
    if (e.key === "ArrowRight" && index < 5) {
        document
            .getElementById(`otp-${index + 1}`)
            ?.focus();
    }
};


const handleOtpPaste = (e) => {

    e.preventDefault();

    const pastedData =
        e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedData
        .split("")
        .forEach((digit, index) => {
            newOtp[index] = digit;
        });

    setOtp(newOtp);

    const focusIndex =
        Math.min(pastedData.length - 1, 5);

    document
        .getElementById(`otp-${focusIndex}`)
        ?.focus();
};




    // -------------------------
    // VERIFY OTP
    // -------------------------
 const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // Convert OTP array to string
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
        setError("Please enter the complete 6-digit OTP");
        return;
    }

    if (timer <= 0) {
        setError("OTP has expired. Please request a new OTP.");
        return;
    }

    try {
        setLoading(true);

        const response = await API.post(
            "/auth/verify-otp",
            {
                email,
                otp: otpValue
            }
        );

        console.log("OTP Verification:", response.data);

        if (response.data.success) {

            setMessage(
                response.data.message ||
                "OTP verified successfully"
            );

            // IMPORTANT
            // Save verified OTP for reset password
            localStorage.setItem("resetEmail", email);
            localStorage.setItem("resetOtp", otpValue);

            setStep(3);
        }

    } catch (error) {

        console.error(
            "OTP Verification Error:",
            error
        );

        setError(
            error.response?.data?.message ||
            "Invalid OTP"
        );

    } finally {
        setLoading(false);
    }
};

    // -------------------------
    // RESET PASSWORD
    // -------------------------
const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
        setError("Please fill both password fields");
        return;
    }

    if (password.length < 6) {
        setError("Password must contain at least 6 characters");
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    const resetEmail = localStorage.getItem("resetEmail");
    const resetOtp = localStorage.getItem("resetOtp");

    if (!resetEmail || !resetOtp) {
        setError(
            "Password reset session expired. Please start again."
        );
        return;
    }

    try {

        setLoading(true);

        const response = await API.post(
            "/auth/reset-password",
            {
                email: resetEmail,
                otp: resetOtp,
                newPassword: password
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

            // Remove reset information
            localStorage.removeItem("resetEmail");
            localStorage.removeItem("resetOtp");

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
    // -------------------------
    // RESEND OTP
    // -------------------------
 const handleResendOTP = async () => {

    setError("");
    setMessage("");

    try {

        setLoading(true);

        const response = await API.post(
            "/auth/forgot-password",
            {
                email
            }
        );

        setMessage(
            response.data.message ||
            "New OTP sent successfully"
        );

        // Clear old OTP
        setOtp(["", "", "", "", "", ""]);

        // Restart timer
        setTimer(300);

        // Focus first OTP box
        setTimeout(() => {
            document
                .getElementById("otp-0")
                ?.focus();
        }, 100);

    } catch (error) {

        setError(
            error.response?.data?.message ||
            "Unable to resend OTP"
        );

    } finally {

        setLoading(false);
    }
};

    return (

        <div className="login-page">

            {/* =========================
                LEFT SIDE
            ========================== */}

            <div className="login-left">

                <div className="login-brand">

                    <h1>PlantIQ</h1>

                    <p>
                        Machine Intelligence
                    </p>

                </div>


                <div className="login-content">

                    <span className="login-eyebrow">
                        ACCOUNT RECOVERY
                    </span>


                    {step === 1 && (
                        <>
                            <h2>
                                Reset your
                                <br />
                                PlantIQ password.
                            </h2>

                            <p>
                                Enter your registered email
                                address and we will send you
                                an OTP to reset your password.
                            </p>
                        </>
                    )}


                    {step === 2 && (
                        <>
                            <h2>
                                Verify your
                                <br />
                                email address.
                            </h2>

                            <p>
                                Enter the 6-digit OTP sent to
                                your registered email address.
                            </p>
                        </>
                    )}


                    {step === 3 && (
                        <>
                            <h2>
                                Create a new
                                <br />
                                password.
                            </h2>

                            <p>
                                Your OTP has been verified.
                                Create a secure new password.
                            </p>
                        </>
                    )}


                    {step === 4 && (
                        <>
                            <h2>
                                Password reset
                                <br />
                                successful.
                            </h2>

                            <p>
                                Your PlantIQ password has been
                                updated successfully.
                            </p>
                        </>
                    )}

                </div>


                <div className="login-footer">

                    © 2026 PlantIQ. All rights reserved.

                </div>

            </div>


            {/* =========================
                RIGHT SIDE
            ========================== */}

            <div className="login-right">

                <div className="login-card">


                    {/* =====================
                        STEP 1
                    ====================== */}

                    {step === 1 && (

                        <>

                            <div className="login-card-header">

                                <div className="login-icon">
                                    🔑
                                </div>

                                <h2>
                                    Forgot Password?
                                </h2>

                                <p>
                                    Enter your registered email
                                </p>

                            </div>


                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}


                            {message && (
                                <div className="login-success">
                                    {message}
                                </div>
                            )}


                            <form onSubmit={handleSendOTP}>

                                <div className="form-group">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Sending OTP..."
                                        : "Send OTP"
                                    }

                                </button>

                            </form>


                            <button
                                className="back-login"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                ← Back to Login
                            </button>

                        </>

                    )}


                    {/* =====================
                        STEP 2
                    ====================== */}

                    {step === 2 && (

                        <>

                            <div className="login-card-header">

                                <div className="login-icon">
                                    🔐
                                </div>

                                <h2>
                                    Verify OTP
                                </h2>

                                <p>
                                    OTP sent to {email}
                                </p>

                            </div>


                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}


                            {message && (
                                <div className="login-success">
                                    {message}
                                </div>
                            )}


                            <form onSubmit={handleVerifyOTP}>

                                <div className="form-group">

                                    <label>
                                        Enter OTP
                                    </label>

                                    <div className="otp-container">

                                     {otp.map((digit, index) => (

                                  <input
                                       key={index}
                                                 id={`otp-${index}`}
                                               className="otp-box"
                                            type="text"
                                   inputMode="numeric"
                                  maxLength="1"
                                   value={digit}
                                 onChange={(e) =>
                                  handleOtpChange(
                                 e.target.value,
                                  index
                                 )
                                      }
                                onKeyDown={(e) =>
                                   handleOtpKeyDown(
                                         e,
                                      index
                                      )
                                      }
                                onPaste={handleOtpPaste}
                                 autoComplete={
                                 index === 0
                                  ? "one-time-code"
                                      : "off"
                                  }
                               />

                               ))}

                              </div>

                                </div>


                               <div className="otp-footer">

    {timer > 0 ? (

        <p className="otp-countdown">
            OTP expires in{" "}
            <strong>
                {formatTime()}
            </strong>
        </p>

    ) : (

        <p className="otp-expired">
            OTP has expired
        </p>

    )}

</div>
                             <button
    type="submit"
    disabled={loading}
    style={{
        display: "block",
        width: "100%",
        height: "48px",
        marginTop: "20px",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "9px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    }}
>
    {loading ? "Sending OTP..." : "SEND OTP TEST"}
</button>
                              
                             
                               
                            </form>


                             <button
                             type="button"
                            className="resend-otp"
                            onClick={handleResendOTP}
                          disabled={loading || timer > 0}
                        >
                         {timer > 0
                          ? "Resend OTP"
                            : "↻ Resend OTP"
                             }
                          </button>


                            <button
                                className="back-login"
                                onClick={() => setStep(1)}
                            >
                                ← Change Email
                            </button>

                        </>

                    )}


                    {/* =====================
                        STEP 3
                    ====================== */}

                    {step === 3 && (

                        <>

                            <div className="login-card-header">

                                <div className="login-icon">
                                    🔒
                                </div>

                                <h2>
                                    New Password
                                </h2>

                                <p>
                                    Create your new password
                                </p>

                            </div>


                            {error && (
                                <div className="login-error">
                                    {error}
                                </div>
                            )}


                            {message && (
                                <div className="login-success">
                                    {message}
                                </div>
                            )}


                            <form
                                onSubmit={
                                    handleResetPassword
                                }
                            >

                                <div className="form-group">

                                    <label>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"
                                    }

                                </button>

                            </form>

                        </>

                    )}


                    {/* =====================
                        STEP 4
                    ====================== */}

                    {step === 4 && (

                        <>

                            <div className="login-card-header">

                                <div className="login-icon">
                                    ✅
                                </div>

                                <h2>
                                    Password Reset!
                                </h2>

                                <p>
                                    Your password has been
                                    successfully changed.
                                </p>

                            </div>


                            <button
                                className="login-button"
                                onClick={() =>
                                    navigate("/login")
                                }
                            >
                                Go to Login
                            </button>

                        </>

                    )}

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;