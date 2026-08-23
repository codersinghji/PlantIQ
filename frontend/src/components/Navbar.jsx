import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

import {
    Bell,
    ChevronDown,
    CheckCircle2,
    AlertTriangle,
    X,
    Wifi,
    User,
    Settings,
    ShieldCheck,
    LogOut
} from "lucide-react";

import { getProfile } from "../services/api";


function Navbar() {

    const navigate = useNavigate();

    const [currentTime, setCurrentTime] = useState(
        new Date()
    );

    const [showProfile, setShowProfile] = useState(false);

    const [showNotifications, setShowNotifications] =
        useState(false);


    /* =========================================
       USER STATE
    ========================================= */

    const [user, setUser] = useState(() => {

        try {

            const savedUser =
                localStorage.getItem("user");

            return savedUser
                ? JSON.parse(savedUser)
                : null;

        } catch (error) {

            console.error(
                "Unable to read saved user:",
                error
            );

            return null;
        }
    });


    const profileRef = useRef(null);

    const notificationRef = useRef(null);


    /* =========================================
       LOAD CURRENT USER FROM BACKEND
    ========================================= */

    useEffect(() => {

        const loadUserProfile = async () => {

            const token =
                localStorage.getItem("token");

            if (!token) {

                setUser(null);

                return;
            }


            try {

                const data =
                    await getProfile();


                if (
                    data?.success &&
                    data?.user
                ) {

                    setUser(data.user);


                    /*
                     * Keep localStorage synchronized
                     * with MongoDB.
                     */

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to load navbar profile:",
                    error
                );


                /*
                 * If the token is invalid/expired,
                 * remove the local session.
                 */

                if (
                    error.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    setUser(null);

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                }

            }

        };


        loadUserProfile();

    }, [navigate]);


    /* =========================================
       LISTEN FOR PROFILE UPDATES
    ========================================= */

    useEffect(() => {

        const handleProfileUpdated = (
            event
        ) => {

            /*
             * Profile.jsx can send the updated
             * user directly with the event.
             */

            if (
                event.detail &&
                event.detail.user
            ) {

                setUser(
                    event.detail.user
                );

                return;
            }


            /*
             * Fallback:
             * read the latest user from localStorage.
             */

            try {

                const savedUser =
                    localStorage.getItem(
                        "user"
                    );


                if (savedUser) {

                    setUser(
                        JSON.parse(
                            savedUser
                        )
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to update navbar user:",
                    error
                );

            }

        };


        window.addEventListener(
            "profileUpdated",
            handleProfileUpdated
        );


        return () => {

            window.removeEventListener(
                "profileUpdated",
                handleProfileUpdated
            );

        };

    }, []);


    /* =========================================
       LIVE TIME
    ========================================= */

    useEffect(() => {

        const timer =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 30000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    /* =========================================
       CLOSE DROPDOWNS
    ========================================= */

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target
                )
            ) {

                setShowProfile(false);

            }


            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(false);

            }

        };


        const handleEscape = (
            event
        ) => {

            if (
                event.key === "Escape"
            ) {

                setShowProfile(false);

                setShowNotifications(
                    false
                );

            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, []);


    /* =========================================
       USER DISPLAY DATA
    ========================================= */

    const userName =
        user?.name || "User";


    const userRole =
        user?.role || "User";


    /*
     * Convert:
     *
     * operator
     * plant_manager
     * plant-manager
     *
     * into:
     *
     * Operator
     * Plant Manager
     */

    const formattedRole =
        userRole
            .toString()
            .replace(
                /[_-]/g,
                " "
            )
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );


    /* =========================================
       USER INITIALS
    ========================================= */

    const getInitials = (
        name
    ) => {

        if (!name) {

            return "U";

        }


        const words =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            words.length === 1
        ) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[
                words.length - 1
            ][0]
        ).toUpperCase();

    };


    const userInitials =
        getInitials(userName);


    /* =========================================
       GREETING
    ========================================= */

    const hour =
        currentTime.getHours();


    let greeting =
        "Good morning";


    if (
        hour >= 12 &&
        hour < 17
    ) {

        greeting =
            "Good afternoon";

    }


    if (
        hour >= 17
    ) {

        greeting =
            "Good evening";

    }


    /* =========================================
       NOTIFICATIONS
    ========================================= */

    const notifications = [

        {
            id: 1,

            type: "success",

            title:
                "System operational",

            message:
                "All plant monitoring systems are running normally.",

            time:
                "Just now"
        },

        {
            id: 2,

            type: "warning",

            title:
                "Equipment monitoring",

            message:
                "Continue monitoring equipment health.",

            time:
                "5 min ago"
        }

    ];


    const notificationCount =
        notifications.length;


    /* =========================================
       NAVIGATION
    ========================================= */

    const openProfile = () => {

        setShowProfile(false);

        setShowNotifications(
            false
        );

        navigate("/profile");

    };


    const openSettings = () => {

        setShowProfile(false);

        setShowNotifications(
            false
        );

        navigate("/settings");

    };


    const openSystemAccess = () => {

        setShowProfile(false);

        setShowNotifications(
            false
        );

        navigate("/system-access");

    };


    const openNotifications = () => {

        setShowNotifications(
            false
        );

        setShowProfile(false);

        navigate(
            "/notifications"
        );

    };


    const openMonitoring = () => {

        setShowNotifications(
            false
        );

        setShowProfile(false);

        navigate(
            "/monitoring"
        );

    };


    /* =========================================
       SIGN OUT
    ========================================= */

    const handleSignOut = () => {

        setShowProfile(false);

        setShowNotifications(
            false
        );


        /*
         * JWT authentication is stateless.
         *
         * Removing the token from the browser
         * logs the user out on the frontend.
         */

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        setUser(null);


        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    /* =========================================
       RENDER
    ========================================= */

    return (

        <header className="navbar">


            {/* =====================================
                LEFT — GREETING
            ===================================== */}

            <div className="navbar-greeting">

                <h2>

                    {greeting},{" "}

                    {userName}

                    {" "}👋

                </h2>


                <p>

                    Here's your equipment
                    health overview

                </p>

            </div>


            {/* =====================================
                RIGHT SIDE
            ===================================== */}

            <div className="navbar-right">


                {/* =================================
                    SYSTEM STATUS
                ================================= */}

                <div className="system-status">

                    <div className="wifi-status-icon">

                        <Wifi size={18} />

                    </div>


                    <span className="status-dot"></span>


                    <div className="status-text">

                        <strong>
                            System Online
                        </strong>


                        <small>
                            All systems operational
                        </small>

                    </div>

                </div>


                {/* =================================
                    NOTIFICATIONS
                ================================= */}

                <div
                    className="notification-wrapper"
                    ref={notificationRef}
                >

                    <button
                        type="button"
                        className={`notification ${
                            showNotifications
                                ? "notification-active"
                                : ""
                        }`}
                        onClick={() => {

                            setShowNotifications(
                                (previous) =>
                                    !previous
                            );

                            setShowProfile(
                                false
                            );

                        }}
                        aria-label="Open notifications"
                        aria-expanded={
                            showNotifications
                        }
                    >

                        <Bell size={18} />


                        {notificationCount > 0 && (

                            <span className="notification-badge">

                                {
                                    notificationCount
                                }

                            </span>

                        )}

                    </button>


                    {/* =================================
                        NOTIFICATION DROPDOWN
                    ================================= */}

                    {showNotifications && (

                        <div className="notification-dropdown">


                            <div className="dropdown-header">

                                <div>

                                    <strong>
                                        Notifications
                                    </strong>


                                    <span>
                                        {
                                            notificationCount
                                        } new
                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="dropdown-close"
                                    onClick={() =>
                                        setShowNotifications(
                                            false
                                        )
                                    }
                                    aria-label="Close notifications"
                                >

                                    <X size={16} />

                                </button>

                            </div>


                            <div className="notification-list">

                                {notifications.map(
                                    (
                                        notification
                                    ) => (

                                        <button
                                            type="button"
                                            className="notification-item"
                                            key={
                                                notification.id
                                            }
                                            onClick={
                                                openMonitoring
                                            }
                                        >

                                            <div
                                                className={`notification-icon ${notification.type}`}
                                            >

                                                {
                                                    notification.type ===
                                                    "success"
                                                        ? (
                                                            <CheckCircle2
                                                                size={16}
                                                            />
                                                        )
                                                        : (
                                                            <AlertTriangle
                                                                size={16}
                                                            />
                                                        )
                                                }

                                            </div>


                                            <div className="notification-content">

                                                <strong>

                                                    {
                                                        notification.title
                                                    }

                                                </strong>


                                                <p>

                                                    {
                                                        notification.message
                                                    }

                                                </p>


                                                <small>

                                                    {
                                                        notification.time
                                                    }

                                                </small>

                                            </div>

                                        </button>

                                    )
                                )}

                            </div>


                            <button
                                type="button"
                                className="view-notifications"
                                onClick={
                                    openNotifications
                                }
                            >

                                View all notifications

                            </button>

                        </div>

                    )}

                </div>


                {/* =================================
                    USER PROFILE
                ================================= */}

                <div
                    className="operator-profile-wrapper"
                    ref={profileRef}
                >

                    <button
                        type="button"
                        className={`operator-profile ${
                            showProfile
                                ? "operator-profile-active"
                                : ""
                        }`}
                        onClick={() => {

                            setShowProfile(
                                (previous) =>
                                    !previous
                            );

                            setShowNotifications(
                                false
                            );

                        }}
                        aria-label="Open user menu"
                        aria-expanded={
                            showProfile
                        }
                    >


                        {/* Avatar */}

                        <div className="operator-avatar">

                            {
                                userInitials
                            }

                        </div>


                        {/* User information */}

                        <div className="operator-info">

                            <strong>

                                {
                                    userName
                                }

                            </strong>


                            <small>

                                {
                                    formattedRole
                                }

                            </small>

                        </div>


                        <ChevronDown
                            size={16}
                            className={`dropdown-arrow ${
                                showProfile
                                    ? "rotate"
                                    : ""
                            }`}
                        />

                    </button>


                    {/* =================================
                        PROFILE DROPDOWN
                    ================================= */}

                    {showProfile && (

                        <div className="profile-dropdown">


                            {/* Profile header */}

                            <div className="profile-dropdown-top">

                                <div className="large-avatar">

                                    {
                                        userInitials
                                    }

                                </div>


                                <div>

                                    <strong>

                                        {
                                            userName
                                        }

                                    </strong>


                                    <span>

                                        {
                                            formattedRole
                                        }

                                    </span>

                                </div>

                            </div>


                            <div className="profile-divider"></div>


                            {/* My Profile */}

                            <button
                                type="button"
                                className="profile-menu-item"
                                onClick={
                                    openProfile
                                }
                            >

                                <User size={16} />


                                <span>
                                    My Profile
                                </span>

                            </button>


                            {/* Settings */}

                            <button
                                type="button"
                                className="profile-menu-item"
                                onClick={
                                    openSettings
                                }
                            >

                                <Settings size={16} />


                                <span>
                                    Settings
                                </span>

                            </button>


                            {/* System Access */}

                            <button
                                type="button"
                                className="profile-menu-item"
                                onClick={
                                    openSystemAccess
                                }
                            >

                                <ShieldCheck
                                    size={16}
                                />


                                <span>
                                    System Access
                                </span>

                            </button>


                            <div className="profile-divider"></div>


                            {/* Sign Out */}

                            <button
                                type="button"
                                className="profile-menu-item logout"
                                onClick={
                                    handleSignOut
                                }
                            >

                                <LogOut size={16} />


                                <span>
                                    Sign Out
                                </span>

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}


export default Navbar;