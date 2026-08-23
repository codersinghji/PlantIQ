import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

import {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    getEquipmentDashboard,
    getEquipmentHistory
} from "../controllers/equipmentController.js";

const router = express.Router();

/* =========================================
   CREATE EQUIPMENT
   Admin + Engineer + Technician
========================================= */

router.post(
    "/",
    authMiddleware,
    allowRoles("Admin", "Engineer", "Technician"),
    createEquipment
);


/* =========================================
   GET ALL EQUIPMENT
   Everyone authenticated
========================================= */
router.get(
    "/",
    authMiddleware,
    allowRoles(
        "Admin",
        "Engineer",
        "Technician",
        "Viewer",
        "operator"
    ),
    getAllEquipment
);


/* =========================================
   EQUIPMENT DASHBOARD
   Everyone authenticated
========================================= */

router.get(
    "/:equipmentId/dashboard",
    authMiddleware,
    allowRoles(
        "Admin",
        "Engineer",
        "Technician",
        "Viewer",
        "operator"
    ),
    getEquipmentDashboard
);


/* =========================================
   EQUIPMENT HISTORY
   Everyone authenticated
========================================= */

router.get(
    "/:equipmentId/history",
    authMiddleware,
    allowRoles(
        "Admin",
        "Engineer",
        "Technician",
        "Viewer",
        "operator"
    ),
    getEquipmentHistory
);

/* =========================================
   GET ONE EQUIPMENT
   Everyone authenticated
========================================= */

router.get(
    "/:id",
    authMiddleware,
    allowRoles(
        "Admin",
        "Engineer",
        "Technician",
        "Viewer",
        "operator"
    ),
    getEquipmentById
);


/* =========================================
   UPDATE EQUIPMENT
   Admin + Engineer + Technician
========================================= */

router.put(
    "/:id",
    authMiddleware,
    allowRoles("Admin", "Engineer", "Technician"),
    updateEquipment
);


/* =========================================
   DELETE EQUIPMENT
   Admin only
========================================= */

router.delete(
    "/:id",
    authMiddleware,
    allowRoles("Admin"),
    deleteEquipment
);

export default router;