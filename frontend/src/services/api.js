import axios from "axios";


/* =========================================================
   API INSTANCE
========================================================= */

const API = axios.create({
    baseURL: "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});


/* =========================================================
   AUTOMATIC JWT TOKEN
========================================================= */

API.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }
);


/* =========================================================
   DASHBOARD
========================================================= */

export const getDashboardSummary = async () => {

    const response = await API.get(
        "/dashboard/summary"
    );

    return response.data;
};


/* =========================================================
   EQUIPMENT
========================================================= */

export const getAllEquipment = async () => {

    const response = await API.get(
        "/equipment"
    );

    return response.data;
};


export const getEquipmentById = async (
    id
) => {

    const response = await API.get(
        `/equipment/${id}`
    );

    return response.data;
};


export const getEquipmentDashboard = async (
    equipmentId
) => {

    const response = await API.get(
        `/equipment/${equipmentId}/dashboard`
    );

    return response.data;
};


export const getEquipmentHistory = async (
    equipmentId
) => {

    const response = await API.get(
        `/equipment/${equipmentId}/history`
    );

    return response.data;
};


/* =========================================================
   AUTH / PROFILE
========================================================= */

export const getProfile = async () => {

    const response = await API.get(
        "/auth/profile"
    );

    return response.data;
};


export const updateProfile = async (
    profileData
) => {

    const response = await API.put(
        "/auth/profile",
        profileData
    );

    return response.data;
};


export const changePassword = async (
    passwordData
) => {

    const response = await API.put(
        "/auth/change-password",
        passwordData
    );

    return response.data;
};


/* =========================================================
   SETTINGS
========================================================= */

export const getSettings = async () => {

    const response = await API.get(
        "/auth/settings"
    );

    return response.data;
};


export const updateSettings = async (
    settings
) => {

    const response = await API.put(
        "/auth/settings",
        settings
    );

    return response.data;
};


export const resetSettings = async () => {

    const response = await API.post(
        "/auth/settings/reset"
    );

    return response.data;
};


/* =========================================================
   SYSTEM ACCESS
========================================================= */

export const getAllUsers = async () => {

    const response = await API.get(
        "/system-access/users"
    );

    return response.data;
};


export const updateUserRole = async (
    userId,
    role
) => {

    const response = await API.put(
        `/system-access/users/${userId}/role`,
        {
            role,
        }
    );

    return response.data;
};


export const deleteUser = async (
    userId
) => {

    const response = await API.delete(
        `/system-access/users/${userId}`
    );

    return response.data;
};


/* =========================================================
   MONITORING
========================================================= */

/* =========================================================
   MONITORING
========================================================= */

export const getMonitoringData = async (equipmentId = "") => {

    const response = await API.get(
        "/monitoring",
        {
            params: equipmentId
                ? { equipmentId }
                : {}
        }
    );
    return response.data;
};


// =========================================================
// PREDICTIONS
// =========================================================

export const getAllPredictions = async () => {

    const response = await API.get(
        "/predictions"
    );

    return response.data;
};


// =========================================================
// PREDICTION SUMMARY
// =========================================================

export const getPredictionSummary = async () => {

    const response = await API.get(
        "/predictions/summary"
    );

    return response.data;
};


// =========================================================
// PREDICTION BY ID
// =========================================================

export const getPredictionById = async (id) => {

    const response = await API.get(
        `/predictions/${id}`
    );

    return response.data;
};


// =========================================================
// PREDICTIONS BY EQUIPMENT
// =========================================================

export const getPredictionsByEquipment = async (
    equipmentId
) => {

    const response = await API.get(
        `/predictions/equipment/${equipmentId}`
    );

    return response.data;
};



/* =========================================================
   DEFAULT API
========================================================= */

export default API;