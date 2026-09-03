import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

/* =========================================
   RESEND
========================================= */
        const RESEND_FROM =
    process.env.RESEND_FROM || "PlantIQ <onboarding@resend.dev>";

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
   ALLOWED ROLES
========================================= */

const ALLOWED_ROLES = [
    "admin",
    "engineer",
    "technician",
    "viewer",
    "operator",
    "plant_manager"
];

/* =========================================
   NORMALIZE ROLE
========================================= */

const normalizeRole = (role) => {
    if (!role) {
        return "operator";
    }

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

        plant_manager: "plant_manager",
        plantmanager: "plant_manager"
    };

    return roleMap[normalized] || normalized;
};

/* =========================================
   NORMALIZE BOOLEAN
========================================= */

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        return value.toLowerCase() === "true";
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return Boolean(value);
};

/* =========================================
   REGISTER USER
   POST /api/auth/register
========================================= */

export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        /* =====================================
           VALIDATION
        ===================================== */

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters"
            });
        }

        /* =====================================
           NORMALIZE EMAIL
        ===================================== */

        const normalizedEmail =
            email.trim().toLowerCase();

        /* =====================================
           CHECK EXISTING USER
        ===================================== */

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "User already exists"
            });
        }

        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message:
                    `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`
            });
        }

        /* =====================================
           HASH PASSWORD
        ===================================== */

        const hashedPassword =
            await bcrypt.hash(password, 10);

        /* =====================================
           CREATE USER
        ===================================== */

        const user = await User.create({
            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: normalizedRole,

            status: "pending",

            settings: {
                ...DEFAULT_SETTINGS
            }
        });

        /* =====================================
           RESPONSE
        ===================================== */

        return res.status(201).json({
            success: true,

            message:
                "Registration submitted successfully. Your account is waiting for Admin approval.",

            user: {
                id: user._id,

                _id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                status: user.status
            }
        });

    } catch (error) {
        console.error(
            "Register Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   CREATE USER BY ADMIN
   POST /api/system-access/users
========================================= */

export const createUserByAdmin = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        /* =====================================
           VALIDATION
        ===================================== */

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters"
            });
        }

        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const selectedRole =
            normalizeRole(role || "engineer");

        if (!ALLOWED_ROLES.includes(selectedRole)) {
            return res.status(400).json({
                success: false,
                message:
                    `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`
            });
        }

        /* =====================================
           NORMALIZE EMAIL
        ===================================== */

        const normalizedEmail =
            email.trim().toLowerCase();

        /* =====================================
           CHECK EXISTING USER
        ===================================== */

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "User already exists"
            });
        }

        /* =====================================
           HASH PASSWORD
        ===================================== */

        const hashedPassword =
            await bcrypt.hash(password, 10);

        /* =====================================
           CREATE USER
        ===================================== */

        const user = await User.create({
            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: selectedRole,

            status: "approved",

            settings: {
                ...DEFAULT_SETTINGS
            }
        });

        /* =====================================
           RESPONSE
        ===================================== */

        return res.status(201).json({
            success: true,

            message:
                "User created successfully and approved.",

            user: {
                _id: user._id,

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                status: user.status
            }
        });

    } catch (error) {
        console.error(
            "Admin Create User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   LOGIN
   POST /api/auth/login
========================================= */

export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        /* =====================================
           VALIDATION
        ===================================== */

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        /* =====================================
           NORMALIZE EMAIL
        ===================================== */

        const normalizedEmail =
            email.trim().toLowerCase();

        /* =====================================
           FIND USER
        ===================================== */

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        /* =====================================
           NORMALIZE OLD ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (
            ALLOWED_ROLES.includes(normalizedRole) &&
            user.role !== normalizedRole
        ) {
            user.role = normalizedRole;
            await user.save();
        }

        /* =====================================
           APPROVAL CHECK
        ===================================== */

        if (user.status === "pending") {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is waiting for Admin approval."
            });
        }

        if (user.status === "rejected") {
            return res.status(403).json({
                success: false,
                message:
                    "Your registration has been rejected by Admin."
            });
        }

        /* =====================================
           PASSWORD CHECK
        ===================================== */

        if (!user.password) {
            return res.status(500).json({
                success: false,
                message:
                    "User password is not configured"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid Password"
            });
        }

        /* =====================================
           JWT SECRET
        ===================================== */

        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is missing"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Server authentication configuration is missing"
            });
        }

        /* =====================================
           JWT
        ===================================== */

        const token =
            jwt.sign(
                {
                    id: user._id.toString(),

                    email: user.email,

                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );

        /* =====================================
           RESPONSE
        ===================================== */

        return res.status(200).json({
            success: true,

            message:
                "Login Successful",

            token,

            user: {
                id: user._id,

                _id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                status: user.status
            }
        });

    } catch (error) {
        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   VERIFY OTP
   POST /api/auth/verify-otp
========================================= */

export const verifyOTP = async (req, res) => {
    try {
        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (
            !user.otp ||
            String(user.otp) !== String(otp)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() <=
                Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "OTP verified successfully"
        });

    } catch (error) {
        console.error(
            "Verify OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
========================================= */

export const forgotPassword = async (req, res) => {
    try {
        const {
            email
        } = req.body;

        /* =====================================
           EMAIL VALIDATION
        ===================================== */

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }

        /* =====================================
           NORMALIZE EMAIL
        ===================================== */

        const normalizedEmail =
            email.trim().toLowerCase();

        /* =====================================
           FIND USER
        ===================================== */

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        /* =====================================
           NORMALIZE OLD ROLE
           
           IMPORTANT:
           This fixes old users such as:
           "Admin"
           "Engineer"
           "Plant Manager"
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        /* =====================================
   GENERATE OTP
===================================== */

const otp = Math.floor(
    100000 + Math.random() * 900000
).toString();

console.log("Generated OTP:", otp);


/* =====================================
   SAVE OTP
===================================== */

const otpExpire = new Date(
    Date.now() + 10 * 60 * 1000
);

await User.updateOne(
    { _id: user._id },
    {
        $set: {
            otp: otp,
            otpExpire: otpExpire
        }
    }
);

console.log("OTP saved in MongoDB");
         



        /* =====================================
           CHECK RESEND
        ===================================== */
          
        if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY is missing");
    return res.status(500).json({
        success: false,
        message: "Email service is not configured"
    });
}

const resend = new Resend(process.env.RESEND_API_KEY);
        

        /* =====================================
           SEND EMAIL
        ===================================== */

        const {
            data,
            error
        } = await resend.emails.send({
            from: RESEND_FROM,

            to: [normalizedEmail],

            subject:
                "PlantIQ Password Reset OTP",

            html: `
                <div
                    style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                    "
                >

                    <h2
                        style="
                            color: #2563eb;
                        "
                    >
                        PlantIQ
                    </h2>

                    <p>
                        Hello ${user.name},
                    </p>

                    <p>
                        We received a request to
                        reset your PlantIQ password.
                    </p>

                    <p>
                        Your password reset OTP is:
                    </p>

                    <div
                        style="
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #2563eb;
                            margin: 25px 0;
                        "
                    >
                        ${otp}
                    </div>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a
                        password reset, you can
                        safely ignore this email.
                    </p>

                    <hr />

                    <p
                        style="
                            color: #6b7280;
                            font-size: 13px;
                        "
                    >
                        PlantIQ Machine Intelligence
                    </p>

                </div>
            `
        });

        /* =====================================
           RESEND ERROR
        ===================================== */

        if (error) {
            console.error(
                "Resend Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to send OTP email"
            });
        }

        console.log(
            "OTP EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            "Resend ID:",
            data?.id
        );

        /* =====================================
           RESPONSE
        ===================================== */

        return res.status(200).json({
            success: true,
            message:
                "OTP sent successfully"
        });

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   RESET PASSWORD
   POST /api/auth/reset-password
========================================= */

export const resetPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (
            !email ||
            !otp ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 8 characters"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        /* =====================================
           NORMALIZE OLD ROLE BEFORE SAVE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        /* =====================================
           CHECK OTP
        ===================================== */

        if (
            !user.otp ||
            String(user.otp) !== String(otp)
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() <=
                Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP Expired"
            });
        }

        /* =====================================
           HASH NEW PASSWORD
        ===================================== */

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password =
            hashedPassword;

        user.otp = null;

        user.otpExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password Reset Successfully"
        });

    } catch (error) {
        console.error(
            "Reset Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   LOGOUT
========================================= */

export const logoutUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message:
                "Logout successful"
        });

    } catch (error) {
        console.error(
            "Logout Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   GET PROFILE
   GET /api/auth/profile
========================================= */

export const getProfile = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.user.id
            ).select(
                "-password -otp -otpExpire"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Profile fetched successfully",

            user
        });

    } catch (error) {
        console.error(
            "Get Profile Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch profile"
        });
    }
};


/* =========================================
   UPDATE PROFILE
   PUT /api/auth/profile
========================================= */

export const updateProfile = async (req, res) => {
    try {
        const {
            name,
            email
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message:
                    "Name and email are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail,

                _id: {
                    $ne: req.user.id
                }
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "Email is already in use"
            });
        }

        const user =
            await User.findByIdAndUpdate(
                req.user.id,

                {
                    name: name.trim(),

                    email: normalizedEmail
                },

                {
                    new: true,

                    runValidators: true
                }
            ).select(
                "-password -otp -otpExpire"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        return res.status(200).json({
            success: true,

            message:
                "Profile updated successfully",

            user
        });

    } catch (error) {
        console.error(
            "Update Profile Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   CHANGE PASSWORD
   PUT /api/auth/change-password
========================================= */

export const changePassword = async (req, res) => {
    try {
        const userId =
            req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 8 characters"
            });
        }

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        /* =====================================
           NORMALIZE OLD ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        /* =====================================
           CURRENT PASSWORD
        ===================================== */

        const isCurrentPasswordCorrect =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isCurrentPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message:
                    "Current password is incorrect"
            });
        }

        /* =====================================
           CHECK SAME PASSWORD
        ===================================== */

        const isSamePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password"
            });
        }

        /* =====================================
           HASH PASSWORD
        ===================================== */

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully"
        });

    } catch (error) {
        console.error(
            "Change Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   GET SETTINGS
   GET /api/auth/settings
========================================= */

export const getSettings = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.user.id
            ).select("settings");

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        const existingSettings =
            user.settings?.toObject
                ? user.settings.toObject()
                : user.settings || {};

        const settings = {
            ...DEFAULT_SETTINGS,
            ...existingSettings
        };

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        console.error(
            "Get Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load settings"
        });
    }
};


/* =========================================
   UPDATE SETTINGS
   PUT /api/auth/settings
========================================= */

export const updateSettings = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        const {
            emailNotifications,
            equipmentAlerts,
            predictionAlerts,
            systemNotifications,
            dashboardRefresh,
            defaultPage,
            appearance,
            compactMode,
            soundAlerts
        } = req.body;

        /* =====================================
           ALLOWED VALUES
        ===================================== */

        const allowedPages = [
            "/dashboard",
            "/equipment",
            "/monitoring",
            "/predictions"
        ];

        const allowedAppearance = [
            "light",
            "dark",
            "system"
        ];

        const allowedRefreshValues = [
            "0",
            "15",
            "30",
            "60",
            "300"
        ];

        /* =====================================
           VALIDATE DEFAULT PAGE
        ===================================== */

        if (
            defaultPage !== undefined &&
            !allowedPages.includes(defaultPage)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid default page"
            });
        }

        /* =====================================
           VALIDATE APPEARANCE
        ===================================== */

        if (
            appearance !== undefined &&
            !allowedAppearance.includes(
                appearance
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid appearance setting"
            });
        }

        /* =====================================
           VALIDATE REFRESH
        ===================================== */

        if (
            dashboardRefresh !== undefined &&
            !allowedRefreshValues.includes(
                String(dashboardRefresh)
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid dashboard refresh value"
            });
        }

        /* =====================================
           CURRENT SETTINGS
        ===================================== */

        const currentSettings =
            user.settings?.toObject
                ? user.settings.toObject()
                : user.settings || {};

        /* =====================================
           UPDATE SETTINGS
        ===================================== */

        user.settings = {
            ...DEFAULT_SETTINGS,

            ...currentSettings,

            ...(emailNotifications !== undefined && {
                emailNotifications:
                    normalizeBoolean(
                        emailNotifications
                    )
            }),

            ...(equipmentAlerts !== undefined && {
                equipmentAlerts:
                    normalizeBoolean(
                        equipmentAlerts
                    )
            }),

            ...(predictionAlerts !== undefined && {
                predictionAlerts:
                    normalizeBoolean(
                        predictionAlerts
                    )
            }),

            ...(systemNotifications !== undefined && {
                systemNotifications:
                    normalizeBoolean(
                        systemNotifications
                    )
            }),

            ...(dashboardRefresh !== undefined && {
                dashboardRefresh:
                    String(dashboardRefresh)
            }),

            ...(defaultPage !== undefined && {
                defaultPage
            }),

            ...(appearance !== undefined && {
                appearance
            }),

            ...(compactMode !== undefined && {
                compactMode:
                    normalizeBoolean(
                        compactMode
                    )
            }),

            ...(soundAlerts !== undefined && {
                soundAlerts:
                    normalizeBoolean(
                        soundAlerts
                    )
            })
        };

        /* =====================================
           NORMALIZE ROLE BEFORE SAVE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        await user.save();

        const settings =
            user.settings?.toObject
                ? user.settings.toObject()
                : user.settings;

        return res.status(200).json({
            success: true,

            message:
                "Settings updated successfully",

            settings
        });

    } catch (error) {
        console.error(
            "Update Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* =========================================
   RESET SETTINGS
========================================= */

export const resetSettings = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.user.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        user.settings = {
            ...DEFAULT_SETTINGS
        };

        /* Normalize old roles too */
        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        await user.save();

        return res.status(200).json({
            success: true,

            message:
                "Settings reset successfully",

            settings: {
                ...DEFAULT_SETTINGS
            }
        });

    } catch (error) {
        console.error(
            "Reset Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reset settings"
        });
    }
};


/* =========================================
   GET ALL USERS
   GET /api/system-access/users
========================================= */

export const getAllUsers = async (req, res) => {
    try {
        const users =
            await User.find()
                .select(
                    "-password -otp -otpExpire"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch users"
        });
    }
};


/* =========================================
   UPDATE USER ROLE
   PUT /api/system-access/users/:id/role
========================================= */

export const updateUserRole = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        const {
            role
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message:
                    "User ID is required"
            });
        }

        if (!role) {
            return res.status(400).json({
                success: false,
                message:
                    "Role is required"
            });
        }

        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message:
                    `Invalid role: ${normalizedRole}`
            });
        }

        /* =====================================
           FIND USER
        ===================================== */

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        /* =====================================
           UPDATE
        ===================================== */

        user.role = normalizedRole;

        const updatedUser =
            await user.save();

        /* =====================================
           RESPONSE
        ===================================== */

        return res.status(200).json({
            success: true,

            message:
                `${updatedUser.name}'s role changed to ${updatedUser.role}`,

            user: {
                _id: updatedUser._id,

                id: updatedUser._id,

                name: updatedUser.name,

                email: updatedUser.email,

                role: updatedUser.role,

                status: updatedUser.status
            }
        });

    } catch (error) {
        console.error(
            "Update Role Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to update user role",

            error:
                error.message
        });
    }
};


/* =========================================
   DELETE USER
   DELETE /api/system-access/users/:id
========================================= */

export const deleteUser = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        /* =====================================
           PREVENT SELF DELETE
        ===================================== */

        if (
            id === req.user.id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account"
            });
        }

        const user =
            await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "User deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to delete user"
        });
    }
};


/* =========================================
   GET PENDING USERS
   GET /api/system-access/pending
========================================= */

export const getPendingUsers = async (req, res) => {
    try {
        const users =
            await User.find({
                status: "pending"
            })
                .select(
                    "-password -otp -otpExpire"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error(
            "Get Pending Users Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch pending users"
        });
    }
};


/* =========================================
   APPROVE USER
   PUT /api/auth/users/:id/approve
========================================= */

export const approveUser = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message:
                    "User ID is required"
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (
            user.status !== "pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `User is already ${user.status}`
            });
        }

        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        /* =====================================
           APPROVE
        ===================================== */

        user.status = "approved";

        await user.save();

        return res.status(200).json({
            success: true,

            message:
                `${user.name} approved successfully`,

            user: {
                _id: user._id,

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                status: user.status
            }
        });

    } catch (error) {
        console.error(
            "Approve User Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to approve user",

            error:
                error.message
        });
    }
};


/* =========================================
   REJECT USER
   PUT /api/auth/users/:id/reject
========================================= */

export const rejectUser = async (req, res) => {
    try {
        const {
            id
        } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message:
                    "User ID is required"
            });
        }

        const user =
            await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (
            user.status !== "pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `User is already ${user.status}`
            });
        }

        /* =====================================
           NORMALIZE ROLE
        ===================================== */

        const normalizedRole =
            normalizeRole(user.role);

        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(500).json({
                success: false,
                message:
                    `User has invalid role: ${user.role}`
            });
        }

        user.role = normalizedRole;

        /* =====================================
           REJECT
        ===================================== */

        user.status = "rejected";

        await user.save();

        return res.status(200).json({
            success: true,

            message:
                `${user.name}'s registration rejected`,

            user: {
                _id: user._id,

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                status: user.status
            }
        });

    } catch (error) {
        console.error(
            "Reject User Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to reject user",

            error:
                error.message
        });
    }
};