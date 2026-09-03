import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import EquipmentDetails from "./pages/EquipmentDetails";
import Prediction from "./pages/Prediction";
import SensorMonitoring from "./pages/SensorMonitoring";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SystemAccess from "./pages/SystemAccess";

import DashboardLayout from "./layouts/DashboardLayout";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import Monitoring from "./pages/Monitoring";

import Register from "./pages/Register";






function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =================================
                    PUBLIC ROUTES
                ================================= */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                     path="/register"
                     element={<Register />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />


                {/* =================================
                    PROTECTED APPLICATION
                ================================= */}

                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* Profile */}

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />


                    {/* Settings */}

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />


                    {/* System Access */}

                    <Route
                        path="/system-access"
                        element={<SystemAccess />}
                    />


                    {/* Equipment */}

                    <Route
                        path="/equipment"
                        element={<Equipment />}
                    />


                    {/* Equipment Details */}

                    <Route
                        path="/equipment/:id"
                        element={<EquipmentDetails />}
                    />


                    {/* Monitoring */}

                    <Route
                        path="/monitoring"
                        element={<SensorMonitoring />}
                    />


                    {/* Predictions */}

                    <Route
                        path="/predictions"
                        element={<Prediction />}
                    />

                </Route>


                {/* =================================
                    FALLBACK
                ================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                <Route
                 path="/monitoring"
                  element={<Monitoring />}
                   />

            </Routes>

        </BrowserRouter>
    );
}


export default App;