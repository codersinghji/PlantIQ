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

        if (!allowedRoles.includes(req.user.role)) {

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