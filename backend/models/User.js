import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "Engineer"
    },

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
            enum: ["light", "dark", "system"],
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

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;