import express from "express";

import {
    registerUser,
    createUserByAdmin,
    loginUser,
    verifyOTP,
    forgotPassword,
    resetPassword,
    logoutUser,
    getProfile,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings,
    resetSettings,
    getAllUsers,
    updateUserRole,
    deleteUser

} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


/* =========================================
   AUTH
========================================= */

router.post(
    "/register",
    registerUser
);

router.post(
    "/login",
    loginUser
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-otp",
    verifyOTP
);

router.post(
    "/reset-password",
    resetPassword
);

router.post(
    "/logout",
    logoutUser
);


/* =========================================
   PROFILE
========================================= */

router.get(
    "/profile",
    authMiddleware,
    getProfile
);

router.put(
    "/profile",
    authMiddleware,
    updateProfile
);

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);


/* =========================================
   SETTINGS
========================================= */

router.get(
    "/settings",
    authMiddleware,
    getSettings
);

router.put(
    "/settings",
    authMiddleware,
    updateSettings
);

router.post(
    "/settings/reset",
    authMiddleware,
    resetSettings
);

/* =========================================
   SYSTEM ACCESS
   ADMIN ONLY
========================================= */

// View users
router.get(
    "/users",
    authMiddleware,
    allowRoles("Admin", "operator"),
    getAllUsers
);

// Create user
router.post(
    "/users",
    authMiddleware,
    allowRoles("Admin", "operator"),
    createUserByAdmin
);

// Only Admin can change roles
router.put(
    "/users/:id/role",
    authMiddleware,
    allowRoles("Admin", "operator"),
    updateUserRole
);

// Only Admin can delete users
router.delete(
    "/users/:id",
    authMiddleware,
    allowRoles("Admin", "operator"),
    deleteUser
);



export default router;