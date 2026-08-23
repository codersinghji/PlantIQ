import React, { useEffect, useState } from "react";

import {
    getProfile,
    updateProfile,
    changePassword
} from "../services/api";

import "../styles/profile.css";


const Profile = () => {

    /* =========================================
       PROFILE STATE
    ========================================= */

    const [profile, setProfile] =
        useState(null);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");


    /* =========================================
       PASSWORD STATE
    ========================================= */

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    /* =========================================
       LOADING STATE
    ========================================= */

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [passwordLoading, setPasswordLoading] =
        useState(false);


    /* =========================================
       MESSAGE STATE
    ========================================= */

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    /* =========================================
       LOAD PROFILE
    ========================================= */

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getProfile();


            if (data.success) {

                setProfile(
                    data.user
                );

                setName(
                    data.user.name || ""
                );

                setEmail(
                    data.user.email || ""
                );


                /*
                 * Keep localStorage synchronized
                 * with the backend.
                 */

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

            }

        } catch (err) {

            console.error(
                "Profile error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Failed to load profile"
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================
       UPDATE PROFILE
    ========================================= */

    const handleUpdateProfile = async (e) => {

        e.preventDefault();


        try {

            setSaving(true);

            setMessage("");

            setError("");


            /*
             * Basic validation
             */

            if (!name.trim()) {

                setError(
                    "Name is required"
                );

                return;

            }


            if (!email.trim()) {

                setError(
                    "Email is required"
                );

                return;

            }


            const data =
                await updateProfile({
                    name: name.trim(),
                    email: email.trim()
                });


            if (data.success) {

                /*
                 * Update Profile page
                 */

                setProfile(
                    data.user
                );


                setName(
                    data.user.name || ""
                );


                setEmail(
                    data.user.email || ""
                );


                /*
                 * Update localStorage
                 */

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );


                /*
                 * IMPORTANT:
                 *
                 * Tell Navbar that the profile
                 * has changed.
                 *
                 * Send the updated user directly.
                 */

                window.dispatchEvent(
                    new CustomEvent(
                        "profileUpdated",
                        {
                            detail: {
                                user: data.user
                            }
                        }
                    )
                );


                setMessage(
                    "Profile updated successfully"
                );

            }

        } catch (err) {

            console.error(
                "Update profile error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);

        }

    };


    /* =========================================
       CHANGE PASSWORD
    ========================================= */

    const handleChangePassword = async (e) => {

        e.preventDefault();


        try {

            setPasswordLoading(true);

            setMessage("");

            setError("");


            /* =====================================
               VALIDATION
            ===================================== */

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                setError(
                    "Please fill in all password fields"
                );

                return;

            }


            /*
             * Minimum password length
             */

            if (
                newPassword.length < 8
            ) {

                setError(
                    "New password must be at least 8 characters"
                );

                return;

            }


            /*
             * Confirm password
             */

            if (
                newPassword !==
                confirmPassword
            ) {

                setError(
                    "New passwords do not match"
                );

                return;

            }


            /*
             * Prevent obvious same password
             */

            if (
                currentPassword ===
                newPassword
            ) {

                setError(
                    "New password must be different from current password"
                );

                return;

            }


            /* =====================================
               API REQUEST
            ===================================== */

            const data =
                await changePassword({
                    currentPassword,
                    newPassword
                });


            if (data.success) {

                setMessage(
                    "Password changed successfully"
                );


                /*
                 * Clear password fields
                 */

                setCurrentPassword("");

                setNewPassword("");

                setConfirmPassword("");

            }

        } catch (err) {

            console.error(
                "Change password error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Failed to change password"
            );

        } finally {

            setPasswordLoading(false);

        }

    };


    /* =========================================
       LOADING SCREEN
    ========================================= */

    if (loading) {

        return (

            <div className="profile-page">

                <div className="profile-loading">

                    Loading profile...

                </div>

            </div>

        );

    }


    /* =========================================
       PROFILE ERROR
    ========================================= */

    if (!profile) {

        return (

            <div className="profile-page">

                <div className="profile-error">

                    Unable to load profile.

                    <button
                        type="button"
                        className="profile-button"
                        onClick={loadProfile}
                        style={{
                            marginTop: "15px"
                        }}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div className="profile-page">


            {/* =====================================
                PROFILE HEADER
            ===================================== */}

            <div className="profile-header">


                <div className="profile-avatar">

                    {profile.name
                        ?.charAt(0)
                        ?.toUpperCase()}

                </div>


                <div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your PlantIQ account
                    </p>

                </div>

            </div>


            {/* =====================================
                SUCCESS MESSAGE
            ===================================== */}

            {message && (

                <div className="profile-success">

                    {message}

                </div>

            )}


            {/* =====================================
                ERROR MESSAGE
            ===================================== */}

            {error && (

                <div className="profile-error">

                    {error}

                </div>

            )}


            <div className="profile-grid">


                {/* =================================
                    PROFILE INFORMATION
                ================================= */}

                <div className="profile-card">


                    <div className="card-header">

                        <h2>
                            Profile Information
                        </h2>

                        <p>
                            Your PlantIQ account details
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleUpdateProfile
                        }
                    >


                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Name
                            </label>


                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your name"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>


                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                required
                            />

                        </div>


                        {/* ROLE */}

                        <div className="form-group">

                            <label>
                                Role
                            </label>


                            <input
                                type="text"
                                value={
                                    profile.role ||
                                    "User"
                                }
                                disabled
                            />

                        </div>


                        {/* SAVE */}

                        <button
                            type="submit"
                            className="profile-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </form>

                </div>


                {/* =================================
                    ACCOUNT INFORMATION
                ================================= */}

                <div className="profile-card">


                    <div className="card-header">

                        <h2>
                            Account
                        </h2>

                        <p>
                            Your PlantIQ account information
                        </p>

                    </div>


                    {/* ACCOUNT ID */}

                    <div className="account-row">

                        <span>
                            Account ID
                        </span>

                        <strong>
                            {profile._id}
                        </strong>

                    </div>


                    {/* EMAIL */}

                    <div className="account-row">

                        <span>
                            Email
                        </span>

                        <strong>
                            {profile.email}
                        </strong>

                    </div>


                    {/* ROLE */}

                    <div className="account-row">

                        <span>
                            Role
                        </span>


                        <span className="role-badge">

                            {profile.role ||
                                "User"}

                        </span>

                    </div>


                    {/* NAME */}

                    <div className="account-row">

                        <span>
                            Name
                        </span>

                        <strong>
                            {profile.name}
                        </strong>

                    </div>

                </div>


                {/* =================================
                    CHANGE PASSWORD
                ================================= */}

                <div className="profile-card">


                    <div className="card-header">

                        <h2>
                            Change Password
                        </h2>

                        <p>
                            Update your account password
                        </p>

                    </div>


                    <form
                        onSubmit={
                            handleChangePassword
                        }
                    >


                        {/* CURRENT PASSWORD */}

                        <div className="form-group">

                            <label>
                                Current Password
                            </label>


                            <input
                                type="password"
                                value={
                                    currentPassword
                                }
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter current password"
                                autoComplete="current-password"
                                required
                            />

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="form-group">

                            <label>
                                New Password
                            </label>


                            <input
                                type="password"
                                value={
                                    newPassword
                                }
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm New Password
                            </label>


                            <input
                                type="password"
                                value={
                                    confirmPassword
                                }
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>


                        {/* PASSWORD HINT */}

                        <p
                            style={{
                                fontSize: "13px",
                                marginTop: "-5px",
                                marginBottom: "15px",
                                opacity: 0.7
                            }}
                        >
                            Password must be at least
                            8 characters.
                        </p>


                        {/* CHANGE PASSWORD BUTTON */}

                        <button
                            type="submit"
                            className="profile-button"
                            disabled={
                                passwordLoading
                            }
                        >

                            {passwordLoading
                                ? "Changing..."
                                : "Change Password"}

                        </button>

                    </form>

                </div>


            </div>

        </div>

    );

};


export default Profile;