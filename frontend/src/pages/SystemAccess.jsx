import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "../styles/SystemAccess.css";

/* =========================================================
   ROLES
========================================================= */

const ROLES = [
    {
        value: "admin",
        label: "Admin",
    },
    {
        value: "engineer",
        label: "Engineer",
    },
    {
        value: "technician",
        label: "Technician",
    },
    {
        value: "viewer",
        label: "Viewer",
    },
    {
        value: "operator",
        label: "Operator",
    },
    {
        value: "plant_manager",
        label: "Plant Manager",
    },
];

/* =========================================================
   STATUS FILTERS
========================================================= */

const STATUS_FILTERS = [
    "all",
    "pending",
    "approved",
    "rejected",
];

/* =========================================================
   EMPTY USER
========================================================= */

const EMPTY_USER = {
    name: "",
    email: "",
    password: "",
    role: "engineer",
};

/* =========================================================
   SYSTEM ACCESS
========================================================= */

const SystemAccess = () => {
    /* =====================================================
       USERS
    ===================================================== */

    const [users, setUsers] = useState([]);

    /* =====================================================
       CURRENT USER
    ===================================================== */

    const [currentUser, setCurrentUser] = useState({});

    /* =====================================================
       SEARCH / FILTER
    ===================================================== */

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    /* =====================================================
       LOADING
    ===================================================== */

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(null);

    const [creatingUser, setCreatingUser] =
        useState(false);

    /* =====================================================
       ALERTS
    ===================================================== */

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    /* =====================================================
       ADD USER MODAL
    ===================================================== */

    const [showAddUser, setShowAddUser] =
        useState(false);

    const [newUser, setNewUser] =
        useState(EMPTY_USER);

    /* =====================================================
       CURRENT USER ID
    ===================================================== */

    const currentUserId =
        currentUser?._id ||
        currentUser?.id;

    /* =====================================================
       CURRENT USER ROLE
    ===================================================== */

    const currentUserRole = String(
        currentUser?.role || ""
    )
        .trim()
        .toLowerCase();

    /* =====================================================
       PERMISSIONS
    ===================================================== */

    const isAdmin =
        currentUserRole === "admin";

    const isOperator =
        currentUserRole === "operator";

    // User-management endpoints are Admin-only.
    const canManageUsers = isAdmin;
    const canApproveUsers = isAdmin;

    /* =====================================================
       ROLE LABEL
    ===================================================== */

    const getRoleLabel = (role) => {
        if (!role) {
            return "Unknown";
        }

        const normalized = String(role)
            .trim()
            .toLowerCase();

        switch (normalized) {
            case "admin":
                return "Admin";

            case "engineer":
                return "Engineer";

            case "technician":
                return "Technician";

            case "viewer":
                return "Viewer";

            case "operator":
                return "Operator";

            case "plant_manager":
            case "plant-manager":
                return "Plant Manager";

            default:
                return String(role)
                    .replace(/_/g, " ")
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                    );
        }
    };

    /* =====================================================
       ROLE CLASS
    ===================================================== */

    const getRoleClass = (role) => {
        const normalized = String(
            role || ""
        )
            .trim()
            .toLowerCase();

        switch (normalized) {
            case "admin":
                return "role-admin";

            case "engineer":
                return "role-engineer";

            case "technician":
                return "role-technician";

            case "viewer":
                return "role-viewer";

            case "operator":
                return "role-operator";

            case "plant_manager":
            case "plant-manager":
                return "role-manager";

            default:
                return "role-default";
        }
    };

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    const getAccountStatus = (user) => {
        const rawStatus = String(
            user?.status ??
            user?.approvalStatus ??
            ""
        )
            .trim()
            .toLowerCase();

        if (
            rawStatus === "pending" ||
            rawStatus === "pending approval"
        ) {
            return "pending";
        }

        if (
            rawStatus === "rejected" ||
            rawStatus === "reject"
        ) {
            return "rejected";
        }

        if (
            rawStatus === "approved" ||
            rawStatus === "active"
        ) {
            return "approved";
        }

        /*
         * Old users that do not have a status
         * are treated as approved.
         */
        return "approved";
    };

    /* =====================================================
       STATUS LABEL
    ===================================================== */

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Pending Approval";

            case "approved":
                return "Active";

            case "rejected":
                return "Rejected";

            default:
                return "Unknown";
        }
    };

    /* =====================================================
       LOAD CURRENT USER
    ===================================================== */

    const loadCurrentUser = async () => {
        try {
            const response =
                await API.get("/auth/profile");

            const user =
                response.data?.user ||
                response.data ||
                {};

            console.log(
                "CURRENT USER:",
                user
            );

            setCurrentUser(user);

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            return user;
        } catch (err) {
            console.error(
                "Profile Error:",
                err
            );

            /*
             * Fallback to localStorage
             */

            try {
                const storedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    );

                setCurrentUser(
                    storedUser
                );

                return storedUser;
            } catch {
                setCurrentUser({});

                return {};
            }
        }
    };

    /* =====================================================
       LOAD USERS
    ===================================================== */

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await API.get(
                    "/auth/users"
                );

            console.log(
                "USERS RESPONSE:",
                response.data
            );

            let loadedUsers = [];

            if (
                Array.isArray(
                    response.data
                )
            ) {
                loadedUsers =
                    response.data;
            } else if (
                Array.isArray(
                    response.data?.users
                )
            ) {
                loadedUsers =
                    response.data.users;
            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {
                loadedUsers =
                    response.data.data;
            }

            console.log(
                "LOADED USERS:",
                loadedUsers
            );

            setUsers(
                loadedUsers
            );
        } catch (err) {
            console.error(
                "Load Users Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        const initialize = async () => {
            const user =
                await loadCurrentUser();

            const role = String(
                user?.role || ""
            )
                .trim()
                .toLowerCase();

            if (
                role === "admin" ||
                role === "operator"
            ) {
                await loadUsers();
            } else {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    /* =====================================================
       OPEN ADD USER
    ===================================================== */

    const openAddUser = () => {
        setError("");
        setSuccess("");

        setNewUser({
            ...EMPTY_USER,
        });

        setShowAddUser(true);
    };

    /* =====================================================
       CLOSE ADD USER
    ===================================================== */

    const closeAddUser = () => {
        if (creatingUser) {
            return;
        }

        setShowAddUser(false);

        setNewUser({
            ...EMPTY_USER,
        });
    };

    /* =====================================================
       CREATE USER
    ===================================================== */

    const handleCreateUser = async (event) => {
        event.preventDefault();

        if (!isAdmin) {
            setError("Only Admin can create users.");
            return;
        }

        setError("");
        setSuccess("");

        const name =
            newUser.name.trim();

        const email =
            newUser.email
                .trim()
                .toLowerCase();

        const password =
            newUser.password;

        const role =
            newUser.role;

        if (!name) {
            setError(
                "Name is required."
            );
            return;
        }

        if (!email) {
            setError(
                "Email is required."
            );
            return;
        }

        if (!email.includes("@")) {
            setError(
                "Please enter a valid email address."
            );
            return;
        }

        if (!password) {
            setError(
                "Password is required."
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (!role) {
            setError(
                "Please select a role."
            );
            return;
        }

        try {
            setCreatingUser(true);

            const response =
                await API.post(
                    "/auth/users",
                    {
                        name,
                        email,
                        password,
                        role,
                    }
                );

            console.log(
                "CREATE USER:",
                response.data
            );

            const createdUser =
                response.data?.user ||
                response.data?.data;

            if (createdUser) {
                setUsers(
                    (previous) => [
                        ...previous,
                        createdUser,
                    ]
                );
            } else {
                await loadUsers();
            }

            setShowAddUser(false);

            setNewUser({
                ...EMPTY_USER,
            });

            setSuccess(
                `${name} was created successfully.`
            );
        } catch (err) {
            console.error(
                "Create User Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create user."
            );
        } finally {
            setCreatingUser(false);
        }
    };

    /* =====================================================
       APPROVE USER
    ===================================================== */
    const handleApprove = async (userId) => {
    if (!canApproveUsers) {
        setError("Only Admin can approve registrations.");
        return;
    }

    try {
        setLoading(true);
        setError("");
        setSuccess("");

        console.log("Approving user:", userId);

        const response = await API.put(
            `/auth/users/${userId}/approve`
        );

        console.log(
            "APPROVE RESPONSE:",
            response.data
        );

        if (response.data.success) {

            const approvedUser = response.data.user;

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId
                        ? {
                            ...user,
                            role: approvedUser.role,
                            status: "approved"
                        }
                        : user
                )
            );

                setSuccess(
                `${approvedUser.name} approved successfully as ${getRoleLabel(approvedUser.role)}.`
            );

            // Reload from database
            await loadUsers();
        }

    } catch (error) {

        console.error(
            "Approve Error:",
            error.response?.data || error
        );

        setError(
            error.response?.data?.message ||
            "Failed to approve user"
        );

    } finally {
        setLoading(false);
    }
   };
    
    /* =====================================================
       REJECT USER
    ===================================================== */

    const handleReject = async (user) => {
        if (!canApproveUsers) {
            setError(
                "Only Admin can reject registrations."
            );
            return;
        }

        if (
            String(user._id) ===
            String(currentUserId)
        ) {
            setError(
                "You cannot reject your own account."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Reject ${user.name}'s registration?\n\nThis user will not be allowed to log in.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(
                `reject-${user._id}`
            );

            setError("");
            setSuccess("");

            const response =
                await API.put(
                    `/auth/users/${user._id}/reject`
                );

            console.log(
                "REJECT RESPONSE:",
                response.data
            );

            /*
             * Update UI immediately
             */

            setUsers(
                (previous) =>
                    previous.map(
                        (item) =>
                            String(
                                item._id
                            ) ===
                            String(
                                user._id
                            )
                                ? {
                                      ...item,
                                      status:
                                          "rejected",
                                      approvalStatus:
                                          "rejected",
                                  }
                                : item
                    )
            );

            setSuccess(
                `${user.name}'s registration has been rejected.`
            );

            /*
             * Refresh database data
             */

            await loadUsers();
        } catch (err) {
            console.error(
                "Reject User Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to reject user."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       CHANGE ROLE
    ===================================================== */

    const handleRoleChange = async (userId, newRole) => {
        const normalizedUserId =
            typeof userId === "object" && userId !== null
                ? userId._id || userId.id
                : userId;

        const normalizedRole = String(newRole || "")
            .trim()
            .toLowerCase()
            .replace(/-/g, "_");

        if (!normalizedUserId) {
            setError("Unable to change role: user ID is missing.");
            return;
        }

        if (!normalizedRole) {
            setError("Please select a valid role.");
            return;
        }

        if (!isAdmin) {
            setError("Only Admin can change user roles.");
            return;
        }

        try {
            setActionLoading(`role-${normalizedUserId}`);
            setError("");
            setSuccess("");

            console.log("=================================");
            console.log("CHANGING ROLE");
            console.log("USER ID:", normalizedUserId);
            console.log("NEW ROLE:", normalizedRole);
            console.log("=================================");

            const response = await API.put(
                `/auth/users/${normalizedUserId}/role`,
                { role: normalizedRole }
            );

            console.log("ROLE UPDATE RESPONSE:", response.data);

            if (response.data?.success) {
                const updatedUser = response.data?.user || {};

                setUsers((previousUsers) =>
                    previousUsers.map((item) =>
                        String(item._id) === String(normalizedUserId)
                            ? {
                                  ...item,
                                  ...updatedUser,
                                  role:
                                      updatedUser.role ||
                                      normalizedRole,
                              }
                            : item
                    )
                );

                setSuccess(
                    `${updatedUser.name || "User"}'s role changed to ${getRoleLabel(
                        updatedUser.role || normalizedRole
                    )}.`
                );

                await loadUsers();
            } else {
                setError(
                    response.data?.message ||
                    "Failed to change role."
                );
            }
        } catch (error) {
            console.error(
                "ROLE CHANGE ERROR:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Failed to change role."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       DELETE USER
    ===================================================== */

    const handleDelete = async (user) => {
        if (!canManageUsers) {
            setError(
                "You do not have permission to delete users."
            );
            return;
        }

        if (
            String(user._id) ===
            String(currentUserId)
        ) {
            setError(
                "You cannot delete your own account."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${user.name}?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(
                `delete-${user._id}`
            );

            setError("");
            setSuccess("");

            const response =
                await API.delete(
                    `/auth/users/${user._id}`
                );

            console.log(
                "DELETE RESPONSE:",
                response.data
            );

            setUsers(
                (previous) =>
                    previous.filter(
                        (item) =>
                            String(
                                item._id
                            ) !==
                            String(
                                user._id
                            )
                    )
            );

            setSuccess(
                `${user.name} was deleted successfully.`
            );
        } catch (err) {
            console.error(
                "Delete Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete user."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = async () => {
        setError("");
        setSuccess("");

        await loadUsers();
    };

    /* =====================================================
       COUNTS
    ===================================================== */

    const totalUsers =
        users.length;

    const pendingUserList =
        users.filter(
            (user) =>
                getAccountStatus(user) ===
                "pending"
        );

    const pendingUsers =
        pendingUserList.length;

    const approvedUsers =
        users.filter(
            (user) =>
                getAccountStatus(user) ===
                "approved"
        ).length;

    const rejectedUsers =
        users.filter(
            (user) =>
                getAccountStatus(user) ===
                "rejected"
        ).length;

    const adminUsers =
        users.filter(
            (user) =>
                String(
                    user.role || ""
                ).toLowerCase() ===
                "admin"
        ).length;

    const engineerUsers =
        users.filter(
            (user) =>
                String(
                    user.role || ""
                ).toLowerCase() ===
                "engineer"
        ).length;

    const technicianUsers =
        users.filter(
            (user) =>
                String(
                    user.role || ""
                ).toLowerCase() ===
                "technician"
        ).length;

    /* =====================================================
       FILTER USERS
    ===================================================== */

    const filteredUsers =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return users.filter(
                (user) => {
                    const name =
                        String(
                            user.name || ""
                        ).toLowerCase();

                    const email =
                        String(
                            user.email || ""
                        ).toLowerCase();

                    const role =
                        String(
                            user.role || ""
                        ).toLowerCase();

                    const matchesSearch =
                        !searchValue ||
                        name.includes(
                            searchValue
                        ) ||
                        email.includes(
                            searchValue
                        ) ||
                        role.includes(
                            searchValue
                        );

                    const status =
                        getAccountStatus(
                            user
                        );

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            users,
            search,
            statusFilter,
        ]);

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        try {
            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return "—";
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="system-access-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="system-access-header">

                <div>
                    <div className="system-access-eyebrow">
                        SECURITY & ACCESS
                    </div>

                    <h1>
                        System Access
                    </h1>

                    <p>
                        Manage users, roles,
                        registrations and
                        system permissions.
                    </p>
                </div>

                <div className="system-access-header-info">

                    <div className="access-icon">
                        🛡️
                    </div>

                    <div>

                        <strong>
                            {canManageUsers
                                ? isAdmin
                                    ? "Main Administrator"
                                    : "System Operator"
                                : "Restricted Access"}
                        </strong>

                        <span>
                            {canManageUsers
                                ? `${totalUsers} registered users`
                                : `${getRoleLabel(
                                      currentUser.role
                                  )} account`}
                        </span>

                    </div>

                </div>

            </div>

            {/* =================================================
                ALERT - ERROR
            ================================================= */}

            {error && (
                <div className="system-alert system-alert-error">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                ALERT - SUCCESS
            ================================================= */}

            {success && (
                <div className="system-alert system-alert-success">

                    <span>
                        ✓
                    </span>

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =================================================
                RESTRICTED ACCESS
            ================================================= */}

            {!canManageUsers &&
                !loading && (
                    <div className="system-alert system-alert-error">

                        <span>
                            🔒
                        </span>

                        <span>
                            You are logged in as{" "}
                            <strong>
                                {getRoleLabel(
                                    currentUser.role
                                )}
                            </strong>
                            . Only Admin users can
                            manage system access.
                        </span>

                    </div>
                )}

            {/* =================================================
                ADMIN / OPERATOR CONTENT
            ================================================= */}

            {canManageUsers && (
                <>

                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div className="system-stats">

                        {/* TOTAL */}

                        <div className="system-stat-card">

                            <div className="stat-icon blue">
                                👥
                            </div>

                            <div>
                                <span>
                                    Total Users
                                </span>

                                <strong>
                                    {totalUsers}
                                </strong>
                            </div>

                        </div>

                        {/* PENDING */}

                        <div
                            className={`system-stat-card pending-stat ${
                                pendingUsers > 0
                                    ? "has-pending"
                                    : ""
                            }`}
                            onClick={() => {
                                if (
                                    pendingUsers >
                                    0
                                ) {
                                    setStatusFilter(
                                        "pending"
                                    );
                                }
                            }}
                            style={{
                                cursor:
                                    pendingUsers >
                                    0
                                        ? "pointer"
                                        : "default",
                            }}
                        >

                            <div className="stat-icon orange">
                                ⏳
                            </div>

                            <div>
                                <span>
                                    Pending Approval
                                </span>

                                <strong>
                                    {pendingUsers}
                                </strong>
                            </div>

                        </div>

                        {/* APPROVED */}

                        <div className="system-stat-card">

                            <div className="stat-icon green">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Active Users
                                </span>

                                <strong>
                                    {approvedUsers}
                                </strong>
                            </div>

                        </div>

                        {/* REJECTED */}

                        <div className="system-stat-card">

                            <div className="stat-icon red">
                                ✕
                            </div>

                            <div>
                                <span>
                                    Rejected
                                </span>

                                <strong>
                                    {rejectedUsers}
                                </strong>
                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        ⭐ DEDICATED PENDING APPROVAL SECTION
                    ================================================= */}

                    {isAdmin && (
                        <div
                            className="pending-approvals-panel"
                            style={{
                                marginBottom:
                                    "24px",
                                background:
                                    "#ffffff",
                                border:
                                    pendingUsers >
                                    0
                                        ? "2px solid #fed7aa"
                                        : "1px solid #e2e8f0",
                                borderRadius:
                                    "16px",
                                overflow:
                                    "hidden",
                                boxShadow:
                                    "0 4px 16px rgba(15, 23, 42, 0.06)",
                            }}
                        >

                            {/* HEADER */}

                            <div
                                style={{
                                    padding:
                                        "22px 24px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap:
                                        "20px",
                                    background:
                                        pendingUsers >
                                        0
                                            ? "#fffaf5"
                                            : "#ffffff",
                                    borderBottom:
                                        "1px solid #eef2f7",
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        gap:
                                            "14px",
                                    }}
                                >

                                    <div
                                        style={{
                                            width:
                                                "48px",
                                            height:
                                                "48px",
                                            borderRadius:
                                                "12px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            background:
                                                pendingUsers >
                                                0
                                                    ? "#ffedd5"
                                                    : "#ecfdf5",
                                            fontSize:
                                                "23px",
                                        }}
                                    >
                                        {pendingUsers >
                                        0
                                            ? "⏳"
                                            : "✓"}
                                    </div>

                                    <div>

                                        <h2
                                            style={{
                                                margin:
                                                    0,
                                                fontSize:
                                                    "19px",
                                                color:
                                                    "#0f172a",
                                            }}
                                        >
                                            Pending Approvals
                                        </h2>

                                        <p
                                            style={{
                                                margin:
                                                    "4px 0 0",
                                                color:
                                                    "#64748b",
                                                fontSize:
                                                    "13px",
                                            }}
                                        >
                                            {pendingUsers >
                                            0
                                                ? "New user registrations are waiting for your approval."
                                                : "There are no registrations waiting for approval."}
                                        </p>

                                    </div>

                                </div>

                                <div
                                    style={{
                                        minWidth:
                                            "48px",
                                        height:
                                            "32px",
                                        padding:
                                            "0 12px",
                                        borderRadius:
                                            "18px",
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        background:
                                            pendingUsers >
                                            0
                                                ? "#fff7ed"
                                                : "#ecfdf5",
                                        color:
                                            pendingUsers >
                                            0
                                                ? "#c2410c"
                                                : "#15803d",
                                        fontWeight:
                                            700,
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    {pendingUsers}{" "}
                                    {pendingUsers ===
                                    1
                                        ? "Pending"
                                        : "Pending"}
                                </div>

                            </div>

                            {/* PENDING USERS */}

                            {pendingUsers >
                            0 ? (
                                <div
                                    style={{
                                        overflowX:
                                            "auto",
                                    }}
                                >

                                    <table
                                        style={{
                                            width:
                                                "100%",
                                            borderCollapse:
                                                "collapse",
                                        }}
                                    >

                                        <thead>

                                            <tr
                                                style={{
                                                    background:
                                                        "#f8fafc",
                                                }}
                                            >

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    USER
                                                </th>

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    EMAIL
                                                </th>

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    REQUESTED ROLE
                                                </th>

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    REGISTERED
                                                </th>

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    STATUS
                                                </th>

                                                <th
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        textAlign:
                                                            "left",
                                                        color:
                                                            "#64748b",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    ACTIONS
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {pendingUserList.map(
                                                (user) => {
                                                    const approveLoading =
                                                        actionLoading ===
                                                        `approve-${user._id}`;

                                                    const rejectLoading =
                                                        actionLoading ===
                                                        `reject-${user._id}`;

                                                    const rowLoading =
                                                        approveLoading ||
                                                        rejectLoading;

                                                    return (
                                                        <tr
                                                            key={
                                                                user._id
                                                            }
                                                            style={{
                                                                borderTop:
                                                                    "1px solid #eef2f7",
                                                            }}
                                                        >

                                                            {/* USER */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap:
                                                                            "11px",
                                                                    }}
                                                                >

                                                                    <div
                                                                        style={{
                                                                            width:
                                                                                "40px",
                                                                            height:
                                                                                "40px",
                                                                            borderRadius:
                                                                                "50%",
                                                                            background:
                                                                                "#2563eb",
                                                                            color:
                                                                                "#ffffff",
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                            fontWeight:
                                                                                700,
                                                                        }}
                                                                    >
                                                                        {user.name
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase()}
                                                                    </div>

                                                                    <div>

                                                                        <strong
                                                                            style={{
                                                                                display:
                                                                                    "block",
                                                                                color:
                                                                                    "#0f172a",
                                                                                fontSize:
                                                                                    "14px",
                                                                            }}
                                                                        >
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </strong>

                                                                        <span
                                                                            style={{
                                                                                color:
                                                                                    "#94a3b8",
                                                                                fontSize:
                                                                                    "12px",
                                                                            }}
                                                                        >
                                                                            New registration
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            </td>

                                                            {/* EMAIL */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                    color:
                                                                        "#475569",
                                                                    fontSize:
                                                                        "13px",
                                                                }}
                                                            >
                                                                {
                                                                    user.email
                                                                }
                                                            </td>

                                                            {/* ROLE */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                }}
                                                            >

                                                                <span
                                                                    className={`role-badge ${getRoleClass(
                                                                        user.role
                                                                    )}`}
                                                                >
                                                                    {getRoleLabel(
                                                                        user.role
                                                                    )}
                                                                </span>

                                                            </td>

                                                            {/* DATE */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                    color:
                                                                        "#64748b",
                                                                    fontSize:
                                                                        "13px",
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    user.createdAt
                                                                )}
                                                            </td>

                                                            {/* STATUS */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                }}
                                                            >

                                                                <span
                                                                    style={{
                                                                        display:
                                                                            "inline-flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap:
                                                                            "6px",
                                                                        padding:
                                                                            "6px 10px",
                                                                        borderRadius:
                                                                            "8px",
                                                                        background:
                                                                            "#fff7ed",
                                                                        color:
                                                                            "#c2410c",
                                                                        fontSize:
                                                                            "12px",
                                                                        fontWeight:
                                                                            700,
                                                                    }}
                                                                >

                                                                    <span>
                                                                        ●
                                                                    </span>

                                                                    Pending Approval

                                                                </span>

                                                            </td>

                                                            {/* ACTIONS */}

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "16px 20px",
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap:
                                                                            "8px",
                                                                        flexWrap:
                                                                            "wrap",
                                                                    }}
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            rowLoading
                                                                        }
                                                                        onClick={() =>
                                                                            handleApprove(
                                                                                user._id
                                                                            )
                                                                        }
                                                                        style={{
                                                                            border:
                                                                                "none",
                                                                            borderRadius:
                                                                                "7px",
                                                                            padding:
                                                                                "9px 13px",
                                                                            background:
                                                                                "#dcfce7",
                                                                            color:
                                                                                "#15803d",
                                                                            fontWeight:
                                                                                700,
                                                                            fontSize:
                                                                                "12px",
                                                                            cursor:
                                                                                rowLoading
                                                                                    ? "not-allowed"
                                                                                    : "pointer",
                                                                            opacity:
                                                                                rowLoading
                                                                                    ? 0.6
                                                                                    : 1,
                                                                        }}
                                                                    >
                                                                        {approveLoading
                                                                            ? "Approving..."
                                                                            : "✓ Approve"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            rowLoading
                                                                        }
                                                                        onClick={() =>
                                                                            handleReject(
                                                                                user
                                                                            )
                                                                        }
                                                                        style={{
                                                                            border:
                                                                                "none",
                                                                            borderRadius:
                                                                                "7px",
                                                                            padding:
                                                                                "9px 13px",
                                                                            background:
                                                                                "#fee2e2",
                                                                            color:
                                                                                "#dc2626",
                                                                            fontWeight:
                                                                                700,
                                                                            fontSize:
                                                                                "12px",
                                                                            cursor:
                                                                                rowLoading
                                                                                    ? "not-allowed"
                                                                                    : "pointer",
                                                                            opacity:
                                                                                rowLoading
                                                                                    ? 0.6
                                                                                    : 1,
                                                                        }}
                                                                    >
                                                                        {rejectLoading
                                                                            ? "Rejecting..."
                                                                            : "✕ Reject"}
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            ) : (
                                <div
                                    style={{
                                        textAlign:
                                            "center",
                                        padding:
                                            "40px 20px",
                                    }}
                                >

                                    <div
                                        style={{
                                            width:
                                                "52px",
                                            height:
                                                "52px",
                                            margin:
                                                "0 auto 12px",
                                            borderRadius:
                                                "50%",
                                            background:
                                                "#dcfce7",
                                            color:
                                                "#16a34a",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            fontSize:
                                                "24px",
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        ✓
                                    </div>

                                    <h3
                                        style={{
                                            margin:
                                                "0 0 6px",
                                            color:
                                                "#0f172a",
                                        }}
                                    >
                                        No Pending Approvals
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                0,
                                            color:
                                                "#64748b",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        All user
                                        registrations
                                        have been
                                        processed.
                                    </p>

                                </div>
                            )}

                        </div>
                    )}

                    {/* =================================================
                        USER MANAGEMENT
                    ================================================= */}

                    <div className="system-users-panel">

                        {/* TOOLBAR */}

                        <div className="system-users-toolbar">

                            <div>

                                <h2>
                                    User Management
                                </h2>

                                <p>
                                    Manage registered
                                    PlantIQ users,
                                    roles and account
                                    status.
                                </p>

                            </div>

                            <div className="system-toolbar-actions">

                                {/* SEARCH */}

                                <div className="system-search">

                                    <span>
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                {/* REFRESH */}

                                <button
                                    type="button"
                                    className="refresh-users-button"
                                    onClick={
                                        handleRefresh
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    ↻ Refresh
                                </button>

                                {/* ADD USER */}

                                <button
                                    type="button"
                                    className="add-user-button"
                                    onClick={
                                        openAddUser
                                    }
                                >
                                    <span>
                                        +
                                    </span>

                                    Add User
                                </button>

                            </div>

                        </div>

                        {/* =================================================
                            STATUS FILTERS
                        ================================================= */}

                        <div className="system-status-filters">

                            {STATUS_FILTERS.map(
                                (status) => {

                                    let count =
                                        0;

                                    if (
                                        status ===
                                        "all"
                                    ) {
                                        count =
                                            totalUsers;
                                    }

                                    if (
                                        status ===
                                        "pending"
                                    ) {
                                        count =
                                            pendingUsers;
                                    }

                                    if (
                                        status ===
                                        "approved"
                                    ) {
                                        count =
                                            approvedUsers;
                                    }

                                    if (
                                        status ===
                                        "rejected"
                                    ) {
                                        count =
                                            rejectedUsers;
                                    }

                                    return (
                                        <button
                                            key={
                                                status
                                            }
                                            type="button"
                                            className={
                                                statusFilter ===
                                                status
                                                    ? "status-filter active"
                                                    : "status-filter"
                                            }
                                            onClick={() =>
                                                setStatusFilter(
                                                    status
                                                )
                                            }
                                        >

                                            {status ===
                                                "all" &&
                                                "All Users"}

                                            {status ===
                                                "pending" &&
                                                "⏳ Pending"}

                                            {status ===
                                                "approved" &&
                                                "✓ Approved"}

                                            {status ===
                                                "rejected" &&
                                                "✕ Rejected"}

                                            <span>
                                                {count}
                                            </span>

                                        </button>
                                    );
                                }
                            )}

                        </div>

                        {/* =================================================
                            USER TABLE
                        ================================================= */}

                        {loading ? (
                            <div className="system-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading users...
                                </p>

                            </div>
                        ) : filteredUsers.length ===
                          0 ? (
                            <div className="system-empty">

                                <div>
                                    👥
                                </div>

                                <h3>
                                    No users found
                                </h3>

                                <p>
                                    No users match
                                    your current
                                    search or
                                    status filter.
                                </p>

                            </div>
                        ) : (
                            <div className="system-table-wrapper">

                                <table className="system-users-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                USER
                                            </th>

                                            <th>
                                                EMAIL
                                            </th>

                                            <th>
                                                ROLE
                                            </th>

                                            <th>
                                                ACCOUNT
                                            </th>

                                            <th>
                                                ACTIONS
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredUsers.map(
                                            (user) => {

                                                const isCurrentUser =
                                                    String(
                                                        user._id
                                                    ) ===
                                                    String(
                                                        currentUserId
                                                    );

                                                const userStatus =
                                                    getAccountStatus(
                                                        user
                                                    );

                                                const roleLoading =
                                                    actionLoading ===
                                                    `role-${user._id}`;

                                                const deleteLoading =
                                                    actionLoading ===
                                                    `delete-${user._id}`;

                                                const approveLoading =
                                                    actionLoading ===
                                                    `approve-${user._id}`;

                                                const rejectLoading =
                                                    actionLoading ===
                                                    `reject-${user._id}`;

                                                const rowLoading =
                                                    roleLoading ||
                                                    deleteLoading ||
                                                    approveLoading ||
                                                    rejectLoading;

                                                return (
                                                    <tr
                                                        key={
                                                            user._id
                                                        }
                                                        className={
                                                            userStatus ===
                                                            "pending"
                                                                ? "pending-user-row"
                                                                : ""
                                                        }
                                                    >

                                                        {/* USER */}

                                                        <td>

                                                            <div className="user-cell">

                                                                <div className="user-avatar">

                                                                    {user.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()}

                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </strong>

                                                                    {isCurrentUser && (
                                                                        <small>
                                                                            You
                                                                        </small>
                                                                    )}

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* EMAIL */}

                                                        <td>

                                                            <span className="user-email">
                                                                {
                                                                    user.email
                                                                }
                                                            </span>

                                                        </td>

                                                        {/* ROLE */}

                                                        <td>

                                                            <select
                                                                className={`role-select ${getRoleClass(
                                                                    user.role
                                                                )}`}
                                                                value={
                                                                    String(
                                                                        user.role || ""
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase()
                                                                        .replace(
                                                                            /-/g,
                                                                            "_"
                                                                        )
                                                                }
                                                                disabled={
                                                                    isCurrentUser ||
                                                                    rowLoading ||
                                                                    !isAdmin
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleRoleChange(
                                                                        user._id,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >

                                                                {ROLES.map(
                                                                    (
                                                                        role
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                role.value
                                                                            }
                                                                            value={
                                                                                role.value
                                                                            }
                                                                        >
                                                                            {
                                                                                role.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}

                                                            </select>

                                                        </td>

                                                        {/* ACCOUNT */}

                                                        <td>

                                                            <span
                                                                className={`status-badge status-${userStatus}`}
                                                            >

                                                                <span className="status-dot"></span>

                                                                {getStatusLabel(
                                                                    userStatus
                                                                )}

                                                            </span>

                                                        </td>

                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="user-actions">

                                                                {/* CURRENT USER */}

                                                                {isCurrentUser ? (
                                                                    <span className="current-user-label">
                                                                        Current user
                                                                    </span>
                                                                ) : (
                                                                    <>

                                                                        {/* PENDING */}

                                                                        {userStatus ===
                                                                            "pending" &&
                                                                            canApproveUsers && (
                                                                                <>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="approve-user-button"
                                                                                        disabled={
                                                                                            rowLoading
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleApprove(
                                                                                                user._id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {approveLoading
                                                                                            ? "Approving..."
                                                                                            : "✓ Approve"}
                                                                                    </button>

                                                                                    <button
                                                                                        type="button"
                                                                                        className="reject-user-button"
                                                                                        disabled={
                                                                                            rowLoading
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleReject(
                                                                                                user
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {rejectLoading
                                                                                            ? "Rejecting..."
                                                                                            : "✕ Reject"}
                                                                                    </button>
                                                                                </>
                                                                            )}

                                                                        {/* APPROVED */}

                                                                        {userStatus ===
                                                                            "approved" && (
                                                                            <button
                                                                                type="button"
                                                                                className="delete-user-button"
                                                                                disabled={
                                                                                    rowLoading
                                                                                }
                                                                                onClick={() =>
                                                                                    handleDelete(
                                                                                        user
                                                                                    )
                                                                                }
                                                                            >
                                                                                {deleteLoading
                                                                                    ? "Deleting..."
                                                                                    : "Delete"}
                                                                            </button>
                                                                        )}

                                                                        {/* REJECTED */}

                                                                        {userStatus ===
                                                                            "rejected" && (
                                                                            <>
                                                                                {canApproveUsers && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="approve-user-button"
                                                                                        disabled={
                                                                                            rowLoading
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleApprove(
                                                                                                user._id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {approveLoading
                                                                                            ? "Approving..."
                                                                                            : "✓ Approve"}
                                                                                    </button>
                                                                                )}

                                                                                <button
                                                                                    type="button"
                                                                                    className="delete-user-button"
                                                                                    disabled={
                                                                                        rowLoading
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleDelete(
                                                                                            user
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {deleteLoading
                                                                                        ? "Deleting..."
                                                                                        : "Delete"}
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                    </>
                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {/* =================================================
                        ROLE PERMISSIONS
                    ================================================= */}

                    <div className="roles-information">

                        <div className="roles-information-header">

                            <div className="roles-info-icon">
                                ℹ️
                            </div>

                            <div>

                                <h3>
                                    Role Permissions
                                </h3>

                                <p>
                                    User permissions are
                                    determined by their
                                    assigned role.
                                </p>

                            </div>

                        </div>

                        <div className="role-permission-grid">

                            <div className="permission-item">

                                <span className="role-badge role-admin">
                                    Admin
                                </span>

                                <p>
                                    Full system access,
                                    user management and
                                    registration
                                    approval.
                                </p>

                            </div>

                            <div className="permission-item">

                                <span className="role-badge role-operator">
                                    Operator
                                </span>

                                <p>
                                    System management
                                    and user access
                                    control.
                                </p>

                            </div>

                            <div className="permission-item">

                                <span className="role-badge role-manager">
                                    Plant Manager
                                </span>

                                <p>
                                    Plant-level
                                    monitoring,
                                    equipment and
                                    operational
                                    oversight.
                                </p>

                            </div>

                            <div className="permission-item">

                                <span className="role-badge role-engineer">
                                    Engineer
                                </span>

                                <p>
                                    Equipment,
                                    monitoring and
                                    predictions.
                                </p>

                            </div>

                            <div className="permission-item">

                                <span className="role-badge role-technician">
                                    Technician
                                </span>

                                <p>
                                    Equipment
                                    monitoring and
                                    maintenance.
                                </p>

                            </div>

                            <div className="permission-item">

                                <span className="role-badge role-viewer">
                                    Viewer
                                </span>

                                <p>
                                    Read-only access
                                    to system
                                    information.
                                </p>

                            </div>

                        </div>

                    </div>

                </>
            )}

            {/* =================================================
                ADD USER MODAL
            ================================================= */}

            {showAddUser && (
                <div
                    className="add-user-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeAddUser();
                        }
                    }}
                >

                    <div
                        className="add-user-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="add-user-modal-header">

                            <div>

                                <span className="add-user-modal-eyebrow">
                                    USER MANAGEMENT
                                </span>

                                <h2>
                                    Add New User
                                </h2>

                                <p>
                                    Create a new
                                    PlantIQ user
                                    account.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeAddUser
                                }
                                disabled={
                                    creatingUser
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            className="add-user-form"
                            onSubmit={
                                handleCreateUser
                            }
                        >

                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={
                                        newUser.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewUser(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                name:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                    autoFocus
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={
                                        newUser.email
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewUser(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                email:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                />

                            </div>

                            {/* PASSWORD */}

                            <div className="form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={
                                        newUser.password
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewUser(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                password:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                />

                            </div>

                            {/* ROLE */}

                            <div className="form-group">

                                <label>
                                    Role
                                </label>

                                <select
                                    value={
                                        newUser.role
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewUser(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                role:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                >

                                    {ROLES.map(
                                        (role) => (
                                            <option
                                                key={
                                                    role.value
                                                }
                                                value={
                                                    role.value
                                                }
                                            >
                                                {
                                                    role.label
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* INFO */}

                            <div className="add-user-info">

                                <span>
                                    🛡️
                                </span>

                                <p>
                                    Users created
                                    directly by an
                                    Admin are added
                                    to the system
                                    immediately.
                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="add-user-form-actions">

                                <button
                                    type="button"
                                    className="cancel-user-button"
                                    onClick={
                                        closeAddUser
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-user-button"
                                    disabled={
                                        creatingUser
                                    }
                                >
                                    {creatingUser
                                        ? "Creating..."
                                        : "Create User"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default SystemAccess;