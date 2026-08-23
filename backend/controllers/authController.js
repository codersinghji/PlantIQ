import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
   REGISTER
========================================= */

export const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // =========================================
        // VALIDATION
        // =========================================

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }


        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }


        // =========================================
        // NORMALIZE EMAIL
        // =========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // =========================================
        // CHECK EXISTING USER
        // =========================================

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }


        // =========================================
        // ALLOWED ROLES
        // =========================================

        const allowedRoles = [
            "Admin",
            "Engineer",
            "Technician",
            "Viewer",
            "operator"
        ];


        // If no role is provided,
        // create the user as operator.

        const userRole =
            role && allowedRoles.includes(role)
                ? role
                : "operator";


        // =========================================
        // HASH PASSWORD
        // =========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =========================================
        // CREATE USER
        // =========================================

        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: userRole

        });


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(201).json({

            success: true,

            message: "User Registered Successfully",

            user: {

                id: user._id,

                _id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

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

export const createUserByAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // =========================================
        // VALIDATION
        // =========================================

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const allowedRoles = [
            "Admin",
            "Engineer",
            "Technician",
            "Viewer",
            "operator"
        ];

        const selectedRole = role || "Engineer";

        if (!allowedRoles.includes(selectedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        // =========================================
        // NORMALIZE EMAIL
        // =========================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // =========================================
        // CHECK EXISTING USER
        // =========================================

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // =========================================
        // HASH PASSWORD
        // =========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // =========================================
        // CREATE USER
        // =========================================

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: selectedRole
        });

        // =========================================
        // RESPONSE
        // =========================================

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error(
            "Admin Create User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

/* =========================================
   LOGIN
========================================= */

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.password) {
            return res.status(500).json({
                success: false,
                message: "User password is not configured"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                success: false,
                message: "Server authentication configuration is missing"
            });
        }

        const token = jwt.sign(
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

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================================
   VERIFY OTP
========================================= */

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.otp || String(user.otp) !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================================
   FORGOT PASSWORD
========================================= */

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
            
             const otp = Math.floor(
    100000 + Math.random() * 900000
).toString();

console.log("=================================");
console.log("📧 PASSWORD RESET OTP");
console.log("Email:", normalizedEmail);
console.log("OTP:", otp);
console.log("=================================");

user.otp = otp;

        user.otpExpire = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await user.save();

        /*
         * Send OTP through Gmail if EMAIL_USER
         * and EMAIL_PASS are configured.
         */

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: normalizedEmail,
                subject: "PlantIQ Password Reset OTP",
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2>PlantIQ</h2>
                        <p>Your password reset OTP is:</p>

                        <h1>${otp}</h1>

                        <p>
                            This OTP will expire in 10 minutes.
                        </p>
                    </div>
                `
            });
        }

        /*
         * Do NOT expose OTP in production.
         * For development, you can temporarily enable it
         * by setting:
         *
         * RETURN_OTP=true
         */

        const response = {
            success: true,
            message: "OTP Generated Successfully"
        };

        if (process.env.RETURN_OTP === "true") {
            response.otp = otp;
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================================
   RESET PASSWORD
========================================= */
export const resetPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (!email || !otp || !newPassword) {
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

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.otp || String(user.otp) !== String(otp)) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (
            !user.otpExpire ||
            new Date(user.otpExpire).getTime() < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        user.otp = null;
        user.otpExpire = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully"
        });

    } catch (error) {
        console.error("Reset Password Error:", error);

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
        /*
         * JWT authentication is stateless.
         * The actual token is removed by the frontend.
         */

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================================
   GET PROFILE
========================================= */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -otp -otpExpire");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch profile"
        });
    }
};

/* =========================================
   UPDATE PROFILE
========================================= */
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already in use"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim(),
                email: normalizedEmail
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password -otp -otpExpire");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* =========================================
   CHANGE PASSWORD
========================================= */
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

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

        user.password = await bcrypt.hash(
            newPassword,
            10
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
/* =========================================
   GET SETTINGS
========================================= */
export const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("settings");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
        console.error("Get Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load settings"
        });
    }
};

/* =========================================
   UPDATE SETTINGS
========================================= */
export const updateSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
           VALIDATION
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


        if (
            defaultPage !== undefined &&
            !allowedPages.includes(defaultPage)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid default page"
            });
        }


        if (
            appearance !== undefined &&
            !allowedAppearance.includes(appearance)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid appearance setting"
            });
        }


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
           UPDATE
        ===================================== */

        user.settings = {
            ...DEFAULT_SETTINGS,
            ...currentSettings,

            ...(emailNotifications !== undefined && {
                emailNotifications:
                    Boolean(emailNotifications)
            }),

            ...(equipmentAlerts !== undefined && {
                equipmentAlerts:
                    Boolean(equipmentAlerts)
            }),

            ...(predictionAlerts !== undefined && {
                predictionAlerts:
                    Boolean(predictionAlerts)
            }),

            ...(systemNotifications !== undefined && {
                systemNotifications:
                    Boolean(systemNotifications)
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
                    Boolean(compactMode)
            }),

            ...(soundAlerts !== undefined && {
                soundAlerts:
                    Boolean(soundAlerts)
            })
        };


        await user.save();


        const settings =
            user.settings?.toObject
                ? user.settings.toObject()
                : user.settings;


        return res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            settings
        });

    } catch (error) {
        console.error("Update Settings Error:", error);

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
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.settings = {
            ...DEFAULT_SETTINGS
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Settings reset successfully",
            settings: {
                ...DEFAULT_SETTINGS
            }
        });

    } catch (error) {
        console.error("Reset Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reset settings"
        });
    }
};




/* =========================================
   GET ALL USERS
   GET /api/system-access/users
========================================= */

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -otp -otpExpire")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


/* =========================================
   UPDATE USER ROLE
   PUT /api/system-access/users/:id/role
========================================= */

export const updateUserRole = async (req, res) => {
    try {

        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = [
            "Admin",
            "Engineer",
            "Technician",
            "Viewer"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            {
                new: true,
                runValidators: true
            }
        ).select("-password -otp -otpExpire");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user
        });

    } catch (error) {
        console.error("Update User Role Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};


/* =========================================
   DELETE USER
   DELETE /api/system-access/users/:id
========================================= */

export const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        // Prevent admin from deleting himself
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};