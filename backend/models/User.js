import mongoose from "mongoose";

/* =========================================
   ROLE NORMALIZATION
========================================= */

const normalizeRole = (role) => {
    if (!role) return "operator";

    const normalized = role
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    const roleMap = {
        admin: "admin",
        engineer: "engineer",
        technician: "technician",
        viewer: "viewer",
        operator: "operator",

        "plant_manager": "plant_manager",
        "plantmanager": "plant_manager",

        // Support old/display-style values
        "plant manager": "plant_manager"
    };

    return roleMap[normalized] || normalized;
};


/* =========================================
   USER SCHEMA
========================================= */

const userSchema = new mongoose.Schema(
    {
        /* =========================================
           BASIC USER INFORMATION
        ========================================= */

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },


        /* =========================================
           USER ROLE
        ========================================= */

        role: {
            type: String,
            enum: [
                "admin",
                "engineer",
                "technician",
                "viewer",
                "operator",
                "plant_manager"
            ],
            default: "operator",
            set: normalizeRole
        },


        /* =========================================
           ACCOUNT STATUS
        ========================================= */

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected"
            ],
            default: "pending"
        },


        /* =========================================
           PASSWORD RESET OTP
        ========================================= */

        otp: {
            type: String,
            default: null
        },

        otpExpire: {
            type: Date,
            default: null
        },


        /* =========================================
           USER SETTINGS
        ========================================= */

        settings: {
            emailNotifications: {
                type: Boolean,
                default: true
            },

            equipmentAlerts: {
                type: Boolean,
                default: true
            },

            predictionAlerts: {
                type: Boolean,
                default: true
            },

            systemNotifications: {
                type: Boolean,
                default: true
            },

            dashboardRefresh: {
                type: String,
                default: "30"
            },

            defaultPage: {
                type: String,
                default: "/dashboard"
            },

            appearance: {
                type: String,
                enum: [
                    "light",
                    "dark",
                    "system"
                ],
                default: "light"
            },

            compactMode: {
                type: Boolean,
                default: false
            },

            soundAlerts: {
                type: Boolean,
                default: true
            }
        }
    },
    {
        timestamps: true
    }
);


/* =========================================
   NORMALIZE ROLE BEFORE VALIDATION/SAVE
========================================= */

userSchema.pre("validate", function (next) {
    if (this.role) {
        this.role = normalizeRole(this.role);
    }

    next();
});


/* =========================================
   MODEL
========================================= */

const User = mongoose.model("User", userSchema);

export default User;