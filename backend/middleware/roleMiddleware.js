const allowRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        console.log("========== ROLE CHECK ==========");
        console.log("User:", req.user.email);
        console.log("User role:", req.user.role);
        console.log("Allowed roles:", allowedRoles);
        console.log("================================");

        // Convert both user role and allowed roles to lowercase
        const userRole = req.user.role?.trim().toLowerCase();

        const normalizedAllowedRoles = allowedRoles.map(
            role => role.trim().toLowerCase()
        );

        console.log("Normalized user role:", userRole);
        console.log("Normalized allowed roles:", normalizedAllowedRoles);

        if (!normalizedAllowedRoles.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message: "Access denied",
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });

        }

        next();
    };
};

export default allowRoles;