import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {

    return (

        <aside className="sidebar">

            {/* =====================================
                LOGO
            ===================================== */}

            <div className="sidebar-logo">

                <h2>
                    PlantIQ
                </h2>

                <span>
                    Machine Intelligence
                </span>

            </div>


            {/* =====================================
                NAVIGATION
            ===================================== */}

            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >
                    Dashboard
                </NavLink>


                <NavLink
                    to="/equipment"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >
                    Equipment
                </NavLink>


                <NavLink
                    to="/monitoring"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >
                    Monitoring
                </NavLink>


                <NavLink
                    to="/predictions"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >
                    Predictions
                </NavLink>


                {/* =================================
                    PROFILE
                ================================= */}

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "active"
                            : ""
                    }
                >
                    Profile
                </NavLink>

            </nav>

        </aside>

    );

}

export default Sidebar;