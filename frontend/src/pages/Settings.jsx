import React, { useEffect, useState } from "react";

import {
    Settings as SettingsIcon,
    Bell,
    LayoutDashboard,
    Palette,
    ShieldCheck,
    Save,
    RotateCcw
} from "lucide-react";

import {
    getSettings,
    updateSettings,
    resetSettings
} from "../services/api";

import "../styles/settings.css";


/* =========================================
   DEFAULT SETTINGS
========================================= */

const DEFAULT_SETTINGS = {
    emailNotifications: true,
    equipmentAlerts: true,
    predictionAlerts: true,
    systemNotifications: true,

    dashboardRefresh: "30",

    defaultPage: "/dashboard",

    appearance: "light",

    compactMode: false,

    soundAlerts: true
};


/* =========================================
   SETTINGS PAGE
========================================= */

const Settings = () => {

    /* =========================================
       USER
    ========================================= */

    const [user, setUser] = useState(null);


    /* =========================================
       SETTINGS
    ========================================= */

    const [settings, setSettings] = useState(
        DEFAULT_SETTINGS
    );


    /* =========================================
       UI STATE
    ========================================= */

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [resetting, setResetting] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    /* =========================================
       LOAD USER
    ========================================= */

    useEffect(() => {

        try {

            const savedUser =
                localStorage.getItem("user");

            if (savedUser) {

                setUser(
                    JSON.parse(savedUser)
                );

            }

        } catch (err) {

            console.error(
                "Unable to load user:",
                err
            );

        }

    }, []);


    /* =========================================
       LOAD SETTINGS FROM DATABASE
    ========================================= */

    useEffect(() => {

        const loadSettings = async () => {

            try {

                setLoading(true);

                setError("");

                const data =
                    await getSettings();


                if (
                    data?.success &&
                    data?.settings
                ) {

                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...data.settings
                    });

                } else {

                    setSettings(
                        DEFAULT_SETTINGS
                    );

                }

            } catch (err) {

                console.error(
                    "Unable to load settings:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load settings"
                );

            } finally {

                setLoading(false);

            }

        };


        loadSettings();

    }, []);


    /* =========================================
       APPLY APPEARANCE
    ========================================= */

    useEffect(() => {

        let appearance =
            settings.appearance;


        /* System theme */

        if (appearance === "system") {

            const prefersDark =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;

            appearance =
                prefersDark
                    ? "dark"
                    : "light";

        }


        /* Root attribute */

        document.documentElement.setAttribute(
            "data-theme",
            appearance
        );


        /* Body class */

        document.body.classList.remove(
            "theme-light",
            "theme-dark"
        );

        document.body.classList.add(
            `theme-${appearance}`
        );


        /* System theme listener */

        if (
            settings.appearance === "system"
        ) {

            const mediaQuery =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                );


            const handleThemeChange = () => {

                const newAppearance =
                    mediaQuery.matches
                        ? "dark"
                        : "light";


                document.documentElement.setAttribute(
                    "data-theme",
                    newAppearance
                );


                document.body.classList.remove(
                    "theme-light",
                    "theme-dark"
                );


                document.body.classList.add(
                    `theme-${newAppearance}`
                );

            };


            mediaQuery.addEventListener(
                "change",
                handleThemeChange
            );


            return () => {

                mediaQuery.removeEventListener(
                    "change",
                    handleThemeChange
                );

            };

        }

    }, [settings.appearance]);


    /* =========================================
       UPDATE SETTING
    ========================================= */

    const updateSetting = (
        key,
        value
    ) => {

        setSettings(previous => ({

            ...previous,

            [key]: value

        }));

        setMessage("");

        setError("");

    };


    /* =========================================
       SAVE SETTINGS
    ========================================= */

    const handleSave = async () => {

        try {

            setSaving(true);

            setMessage("");

            setError("");


            const data =
                await updateSettings(
                    settings
                );


            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Failed to save settings"
                );

            }


            /* Backend is source of truth */

            const savedSettings = {

                ...DEFAULT_SETTINGS,

                ...(data.settings || settings)

            };


            setSettings(
                savedSettings
            );


            /* Notify application */

            window.dispatchEvent(
                new CustomEvent(
                    "settingsUpdated",
                    {
                        detail: {
                            settings:
                                savedSettings
                        }
                    }
                )
            );


            setMessage(
                "Settings saved successfully"
            );

        } catch (err) {

            console.error(
                "Save settings error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save settings"
            );

        } finally {

            setSaving(false);

        }

    };


    /* =========================================
       RESET SETTINGS
    ========================================= */

    const handleReset = async () => {

        try {

            setResetting(true);

            setMessage("");

            setError("");


            const data =
                await resetSettings();


            if (!data?.success) {

                throw new Error(
                    data?.message ||
                    "Failed to reset settings"
                );

            }


            const resetData = {

                ...DEFAULT_SETTINGS,

                ...(data.settings || {})

            };


            setSettings(
                resetData
            );


            /* Notify application */

            window.dispatchEvent(
                new CustomEvent(
                    "settingsUpdated",
                    {
                        detail: {
                            settings:
                                resetData
                        }
                    }
                )
            );


            setMessage(
                "Settings reset successfully"
            );

        } catch (err) {

            console.error(
                "Reset settings error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to reset settings"
            );

        } finally {

            setResetting(false);

        }

    };


    /* =========================================
       TOGGLE
    ========================================= */

    const Toggle = ({
        checked,
        onChange,
        label
    }) => {

        return (

            <button
                type="button"
                className={`settings-toggle ${
                    checked
                        ? "active"
                        : ""
                }`}
                onClick={() =>
                    onChange(!checked)
                }
                aria-pressed={checked}
                aria-label={
                    label ||
                    "Toggle setting"
                }
            >

                <span />

            </button>

        );

    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="settings-page">

                <div className="settings-loading">

                    <SettingsIcon size={22} />

                    <span>
                        Loading settings...
                    </span>

                </div>

            </div>

        );

    }


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div className="settings-page">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="settings-header">

                <div className="settings-header-icon">

                    <SettingsIcon size={22} />

                </div>


                <div>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage your PlantIQ
                        application preferences
                    </p>

                </div>

            </div>


            {/* =====================================
                USER
            ===================================== */}

            {user && (

                <div className="settings-user-info">

                    <div className="settings-user-avatar">

                        {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}

                    </div>


                    <div>

                        <strong>
                            {user.name || "User"}
                        </strong>

                        <span>
                            {user.email || ""}
                        </span>

                    </div>

                </div>

            )}


            {/* =====================================
                SUCCESS MESSAGE
            ===================================== */}

            {message && (

                <div className="settings-success">

                    {message}

                </div>

            )}


            {/* =====================================
                ERROR MESSAGE
            ===================================== */}

            {error && (

                <div className="settings-error">

                    {error}

                </div>

            )}


            {/* =====================================
                SETTINGS GRID
            ===================================== */}

            <div className="settings-grid">


                {/* =================================
                    NOTIFICATIONS
                ================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-section-icon">

                            <Bell size={18} />

                        </div>


                        <div>

                            <h2>
                                Notifications
                            </h2>

                            <p>
                                Control how PlantIQ
                                sends alerts
                            </p>

                        </div>

                    </div>


                    <div className="settings-options">


                        {/* EMAIL */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    Email Notifications
                                </strong>

                                <span>
                                    Receive important
                                    PlantIQ updates
                                    by email
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.emailNotifications
                                }
                                label="Email notifications"
                                onChange={value =>
                                    updateSetting(
                                        "emailNotifications",
                                        value
                                    )
                                }
                            />

                        </div>


                        {/* EQUIPMENT */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    Equipment Alerts
                                </strong>

                                <span>
                                    Get notified when
                                    equipment requires
                                    attention
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.equipmentAlerts
                                }
                                label="Equipment alerts"
                                onChange={value =>
                                    updateSetting(
                                        "equipmentAlerts",
                                        value
                                    )
                                }
                            />

                        </div>


                        {/* PREDICTION */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    Prediction Alerts
                                </strong>

                                <span>
                                    Receive predictive
                                    maintenance alerts
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.predictionAlerts
                                }
                                label="Prediction alerts"
                                onChange={value =>
                                    updateSetting(
                                        "predictionAlerts",
                                        value
                                    )
                                }
                            />

                        </div>


                        {/* SYSTEM */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    System Notifications
                                </strong>

                                <span>
                                    Receive important
                                    system notifications
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.systemNotifications
                                }
                                label="System notifications"
                                onChange={value =>
                                    updateSetting(
                                        "systemNotifications",
                                        value
                                    )
                                }
                            />

                        </div>


                        {/* SOUND */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    Sound Alerts
                                </strong>

                                <span>
                                    Play sound for
                                    critical equipment
                                    alerts
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.soundAlerts
                                }
                                label="Sound alerts"
                                onChange={value =>
                                    updateSetting(
                                        "soundAlerts",
                                        value
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================
                    DASHBOARD
                ================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-section-icon">

                            <LayoutDashboard
                                size={18}
                            />

                        </div>


                        <div>

                            <h2>
                                Dashboard
                            </h2>

                            <p>
                                Customize your
                                dashboard behavior
                            </p>

                        </div>

                    </div>


                    <div className="settings-form">


                        {/* DEFAULT PAGE */}

                        <div className="settings-field">

                            <label>
                                Default Page
                            </label>


                            <select
                                value={
                                    settings.defaultPage
                                }
                                onChange={e =>
                                    updateSetting(
                                        "defaultPage",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="/dashboard">
                                    Dashboard
                                </option>

                                <option value="/equipment">
                                    Equipment
                                </option>

                                <option value="/monitoring">
                                    Monitoring
                                </option>

                                <option value="/predictions">
                                    Predictions
                                </option>

                            </select>

                        </div>


                        {/* REFRESH */}

                        <div className="settings-field">

                            <label>
                                Dashboard Refresh
                            </label>


                            <select
                                value={
                                    settings.dashboardRefresh
                                }
                                onChange={e =>
                                    updateSetting(
                                        "dashboardRefresh",
                                        e.target.value
                                    )
                                }
                            >

                                <option value="15">
                                    Every 15 seconds
                                </option>

                                <option value="30">
                                    Every 30 seconds
                                </option>

                                <option value="60">
                                    Every 1 minute
                                </option>

                                <option value="300">
                                    Every 5 minutes
                                </option>

                                <option value="0">
                                    Manual refresh
                                </option>

                            </select>

                        </div>


                        {/* COMPACT MODE */}

                        <div className="settings-option">

                            <div>

                                <strong>
                                    Compact Mode
                                </strong>

                                <span>
                                    Display more information
                                    in less space
                                </span>

                            </div>


                            <Toggle
                                checked={
                                    settings.compactMode
                                }
                                label="Compact mode"
                                onChange={value =>
                                    updateSetting(
                                        "compactMode",
                                        value
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================
                    APPEARANCE
                ================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-section-icon">

                            <Palette size={18} />

                        </div>


                        <div>

                            <h2>
                                Appearance
                            </h2>

                            <p>
                                Choose how PlantIQ
                                looks on your screen
                            </p>

                        </div>

                    </div>


                    <div className="appearance-options">


                        {/* LIGHT */}

                        <button
                            type="button"
                            className={`appearance-option ${
                                settings.appearance ===
                                "light"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                updateSetting(
                                    "appearance",
                                    "light"
                                )
                            }
                        >

                            <div className="appearance-preview light-preview">

                                <div />

                            </div>


                            <strong>
                                Light
                            </strong>

                            <span>
                                Clean and bright
                            </span>

                        </button>


                        {/* DARK */}

                        <button
                            type="button"
                            className={`appearance-option ${
                                settings.appearance ===
                                "dark"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                updateSetting(
                                    "appearance",
                                    "dark"
                                )
                            }
                        >

                            <div className="appearance-preview dark-preview">

                                <div />

                            </div>


                            <strong>
                                Dark
                            </strong>

                            <span>
                                Easier on the eyes
                            </span>

                        </button>


                        {/* SYSTEM */}

                        <button
                            type="button"
                            className={`appearance-option ${
                                settings.appearance ===
                                "system"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                updateSetting(
                                    "appearance",
                                    "system"
                                )
                            }
                        >

                            <div className="appearance-preview system-preview">

                                <div />

                            </div>


                            <strong>
                                System
                            </strong>

                            <span>
                                Follow device setting
                            </span>

                        </button>

                    </div>

                </section>


                {/* =================================
                    SECURITY
                ================================= */}

                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-section-icon">

                            <ShieldCheck
                                size={18}
                            />

                        </div>


                        <div>

                            <h2>
                                Security
                            </h2>

                            <p>
                                Manage your account
                                security
                            </p>

                        </div>

                    </div>


                    <div className="security-info">


                        {/* PASSWORD */}

                        <div className="security-row">

                            <div>

                                <strong>
                                    Password
                                </strong>

                                <span>
                                    Change your account
                                    password from your
                                    Profile page
                                </span>

                            </div>


                            <button
                                type="button"
                                className="settings-secondary-button"
                                onClick={() => {
                                    window.location.href =
                                        "/profile";
                                }}
                            >

                                Manage

                            </button>

                        </div>


                        {/* AUTH */}

                        <div className="security-row">

                            <div>

                                <strong>
                                    Authentication
                                </strong>

                                <span>
                                    Your PlantIQ account
                                    uses JWT authentication
                                </span>

                            </div>


                            <span className="security-badge">

                                Protected

                            </span>

                        </div>

                    </div>

                </section>

            </div>


            {/* =====================================
                ACTIONS
            ===================================== */}

            <div className="settings-actions">


                {/* RESET */}

                <button
                    type="button"
                    className="settings-reset-button"
                    onClick={handleReset}
                    disabled={
                        saving ||
                        resetting
                    }
                >

                    <RotateCcw size={16} />

                    {resetting
                        ? "Resetting..."
                        : "Reset"}

                </button>


                {/* SAVE */}

                <button
                    type="button"
                    className="settings-save-button"
                    onClick={handleSave}
                    disabled={
                        saving ||
                        resetting
                    }
                >

                    <Save size={16} />

                    {saving
                        ? "Saving..."
                        : "Save Settings"}

                </button>

            </div>

        </div>

    );

};


export default Settings;