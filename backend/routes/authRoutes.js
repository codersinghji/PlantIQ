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

    // SYSTEM ACCESS
    getAllUsers,
    updateUserRole,
    deleteUser,

    // APPROVAL
    approveUser,
    rejectUser,
    getPendingUsers
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


/* =========================================================
   AUTH
========================================================= */

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


/* =========================================================
   PROFILE
========================================================= */

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


/* =========================================================
   SETTINGS
========================================================= */

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


/* =========================================================
   SYSTEM ACCESS
   ADMIN ONLY
========================================================= */

// GET ALL USERS
router.get(
    "/users",
    authMiddleware,
    allowRoles("Admin"),
    getAllUsers
);


// CREATE USER
router.post(
    "/users",
    authMiddleware,
    allowRoles("Admin"),
    createUserByAdmin
);


// CHANGE USER ROLE
router.put(
    "/users/:id/role",
    authMiddleware,
    allowRoles("Admin"),
    updateUserRole
);


// DELETE USER
router.delete(
    "/users/:id",
    authMiddleware,
    allowRoles("Admin"),
    deleteUser
);


/* =========================================================
   PENDING REGISTRATIONS
========================================================= */

// GET PENDING USERS
router.get(
    "/pending-users",
    authMiddleware,
    allowRoles("Admin"),
    getPendingUsers
);


// APPROVE USER
router.put(
    "/users/:id/approve",
    authMiddleware,
    allowRoles("Admin"),
    approveUser
);


// REJECT USER
router.put(
    "/users/:id/reject",
    authMiddleware,
    allowRoles("Admin"),
    rejectUser
);


export default router;