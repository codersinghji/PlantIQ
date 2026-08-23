import React, { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/SystemAccess.css";

const ROLES = [
    "Admin",
    "Engineer",
    "Technician",
    "Viewer",
    "operator"
];

const SystemAccess = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [currentUser, setCurrentUser] = useState({});

    // Add User Modal
    const [showAddUser, setShowAddUser] = useState(false);

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "Engineer"
    });

    const [creatingUser, setCreatingUser] = useState(false);

    const currentUserId =
        currentUser?._id || currentUser?.id;

    // =========================================================
    // ADMIN + OPERATOR CAN MANAGE
    // =========================================================

    const canManageUsers =
        currentUser?.role === "Admin" ||
        currentUser?.role === "operator";

    // =========================================================
    // ROLE CLASS
    // =========================================================

    const getRoleClass = (role) => {
        switch (role) {
            case "Admin":
                return "role-admin";

            case "Engineer":
                return "role-engineer";

            case "Technician":
                return "role-technician";

            case "Viewer":
                return "role-viewer";

            case "operator":
                return "role-operator";

            default:
                return "role-default";
        }
    };

    // =========================================================
    // LOAD CURRENT USER
    // =========================================================

    const loadCurrentUser = async () => {
        try {
            const response = await API.get("/auth/profile");

            const user =
                response.data?.user ||
                response.data;

            console.log("CURRENT USER:", user);

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

            try {
                const storedUser =
                    JSON.parse(
                        localStorage.getItem("user") || "{}"
                    );

                setCurrentUser(storedUser);

                return storedUser;

            } catch {
                setCurrentUser({});
                return {};
            }
        }
    };

    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await API.get("/auth/users");

            console.log(
                "USERS:",
                response.data
            );

            setUsers(
                response.data?.users || []
            );

        } catch (err) {
            console.error(
                "Load Users Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load users"
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        const initialize = async () => {

            const user =
                await loadCurrentUser();

            const allowed =
                user?.role === "Admin" ||
                user?.role === "operator";

            if (allowed) {
                await loadUsers();
            } else {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    // =========================================================
    // OPEN ADD USER
    // =========================================================

    const openAddUser = () => {
        setError("");
        setSuccess("");

        setNewUser({
            name: "",
            email: "",
            password: "",
            role: "Engineer"
        });

        setShowAddUser(true);
    };

    // =========================================================
    // CLOSE ADD USER
    // =========================================================

    const closeAddUser = () => {

        if (creatingUser) {
            return;
        }

        setShowAddUser(false);

        setNewUser({
            name: "",
            email: "",
            password: "",
            role: "Engineer"
        });
    };

    // =========================================================
    // CREATE USER
    // =========================================================

    const handleCreateUser = async (e) => {

        e.preventDefault();

        if (!newUser.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!newUser.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!newUser.password) {
            setError("Password is required.");
            return;
        }

        if (newUser.password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        try {

            setCreatingUser(true);

            setError("");
            setSuccess("");

            const response =
                await API.post(
                    "/auth/users",
                    {
                        name:
                            newUser.name.trim(),

                        email:
                            newUser.email.trim(),

                        password:
                            newUser.password,

                        role:
                            newUser.role
                    }
                );

            console.log(
                "CREATE USER:",
                response.data
            );

            const createdUser =
                response.data?.user;

            if (!createdUser) {
                throw new Error(
                    "User was created but server returned no user data."
                );
            }

            // Add new user immediately
            setUsers(
                previousUsers => [
                    ...previousUsers,
                    createdUser
                ]
            );

            setShowAddUser(false);

            setNewUser({
                name: "",
                email: "",
                password: "",
                role: "Engineer"
            });

            setSuccess(
                `${createdUser.name} was created successfully.`
            );

        } catch (err) {

            console.error(
                "Create User Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create user"
            );

        } finally {

            setCreatingUser(false);
        }
    };

    // =========================================================
    // ROLE CHANGE
    // =========================================================

    const handleRoleChange = async (
        user,
        newRole
    ) => {

        if (!canManageUsers) {
            setError(
                "You do not have permission to change roles."
            );
            return;
        }

        if (
            String(user._id) ===
            String(currentUserId)
        ) {
            setError(
                "You cannot change your own role."
            );
            return;
        }

        if (user.role === newRole) {
            return;
        }

        try {

            setActionLoading(
                `role-${user._id}`
            );

            setError("");
            setSuccess("");

            const response =
                await API.put(
                    `/auth/users/${user._id}/role`,
                    {
                        role: newRole
                    }
                );

            console.log(
                "ROLE UPDATE:",
                response.data
            );

            setUsers(previous =>
                previous.map(item =>
                    String(item._id) ===
                    String(user._id)
                        ? {
                            ...item,
                            role: newRole
                        }
                        : item
                )
            );

            setSuccess(
                `${user.name}'s role changed to ${newRole}.`
            );

        } catch (err) {

            console.error(
                "Role Update Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update role"
            );

        } finally {

            setActionLoading(null);
        }
    };

    // =========================================================
    // DELETE USER
    // =========================================================

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
                "DELETE:",
                response.data
            );

            setUsers(previous =>
                previous.filter(
                    item =>
                        String(item._id) !==
                        String(user._id)
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
                "Failed to delete user"
            );

        } finally {

            setActionLoading(null);
        }
    };

    // =========================================================
    // SEARCH
    // =========================================================

    const searchValue =
        search.trim().toLowerCase();

    const filteredUsers =
        users.filter(user =>
            user.name
                ?.toLowerCase()
                .includes(searchValue) ||

            user.email
                ?.toLowerCase()
                .includes(searchValue) ||

            user.role
                ?.toLowerCase()
                .includes(searchValue)
        );

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="system-access-page">

            {/* HEADER */}
            <div className="system-access-header">

                <div>

                    <div className="system-access-eyebrow">
                        SECURITY & ACCESS
                    </div>

                    <h1>
                        System Access
                    </h1>

                    <p>
                        Manage users, roles and system
                        permissions.
                    </p>

                </div>

                <div className="system-access-header-info">

                    <div className="access-icon">
                        🛡️
                    </div>

                    <div>

                        <strong>
                            {canManageUsers
                                ? currentUser.role === "Admin"
                                    ? "Administrator"
                                    : "System Operator"
                                : "Restricted Access"}
                        </strong>

                        <span>
                            {canManageUsers
                                ? `${users.length} registered users`
                                : `${currentUser.role || "Unknown"} account`}
                        </span>

                    </div>

                </div>

            </div>

            {/* ERROR */}
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
                        onClick={() => setError("")}
                    >
                        ×
                    </button>

                </div>
            )}

            {/* SUCCESS */}
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
                        onClick={() => setSuccess("")}
                    >
                        ×
                    </button>

                </div>
            )}

            {/* RESTRICTED */}
            {!canManageUsers && !loading && (
                <div className="system-alert system-alert-error">

                    <span>
                        🔒
                    </span>

                    <span>
                        You are logged in as{" "}
                        <strong>
                            {currentUser.role || "Unknown"}
                        </strong>
                        . Only Admin and operator users
                        can manage system access.
                    </span>

                </div>
            )}

            {/* ADMIN / OPERATOR CONTENT */}
            {canManageUsers && (
                <>

                    {/* STATS */}
                    <div className="system-stats">

                        <div className="system-stat-card">

                            <div className="stat-icon blue">
                                👥
                            </div>

                            <div>
                                <span>
                                    Total Users
                                </span>

                                <strong>
                                    {users.length}
                                </strong>
                            </div>

                        </div>

                        <div className="system-stat-card">

                            <div className="stat-icon purple">
                                🛡️
                            </div>

                            <div>
                                <span>
                                    Administrators
                                </span>

                                <strong>
                                    {
                                        users.filter(
                                            user =>
                                                user.role ===
                                                "Admin"
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>

                        <div className="system-stat-card">

                            <div className="stat-icon green">
                                ⚙️
                            </div>

                            <div>
                                <span>
                                    Engineers
                                </span>

                                <strong>
                                    {
                                        users.filter(
                                            user =>
                                                user.role ===
                                                "Engineer"
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>

                        <div className="system-stat-card">

                            <div className="stat-icon orange">
                                🔧
                            </div>

                            <div>
                                <span>
                                    Technicians
                                </span>

                                <strong>
                                    {
                                        users.filter(
                                            user =>
                                                user.role ===
                                                "Technician"
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>

                    {/* USERS PANEL */}
                    <div className="system-users-panel">

                        {/* TOOLBAR */}
                        <div className="system-users-toolbar">

                            <div>
                                <h2>
                                    User Management
                                </h2>

                                <p>
                                    Manage registered PlantIQ users.
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
                                        value={search}
                                        onChange={e =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                {/* ADD USER */}
                                <button
                                    type="button"
                                    className="add-user-button"
                                    onClick={openAddUser}
                                >
                                    <span>
                                        +
                                    </span>

                                    Add User
                                </button>

                            </div>

                        </div>

                        {/* TABLE */}
                        {loading ? (

                            <div className="system-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading users...
                                </p>

                            </div>

                        ) : filteredUsers.length === 0 ? (

                            <div className="system-empty">

                                <div>
                                    👥
                                </div>

                                <h3>
                                    No users found
                                </h3>

                                <p>
                                    No users match your search.
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
                                            user => {

                                                const isCurrentUser =
                                                    String(
                                                        user._id
                                                    ) ===
                                                    String(
                                                        currentUserId
                                                    );

                                                const roleLoading =
                                                    actionLoading ===
                                                    `role-${user._id}`;

                                                const deleteLoading =
                                                    actionLoading ===
                                                    `delete-${user._id}`;

                                                return (
                                                    <tr
                                                        key={
                                                            user._id
                                                        }
                                                    >

                                                        {/* USER */}
                                                        <td>

                                                            <div className="user-cell">

                                                                <div className="user-avatar">
                                                                    {user.name
                                                                        ?.charAt(0)
                                                                        ?.toUpperCase()}
                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {user.name}
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
                                                                {user.email}
                                                            </span>

                                                        </td>

                                                        {/* ROLE */}
                                                        <td>

                                                            <select
                                                                className={`role-select ${getRoleClass(
                                                                    user.role
                                                                )}`}
                                                                value={
                                                                    user.role ||
                                                                    ""
                                                                }
                                                                disabled={
                                                                    isCurrentUser ||
                                                                    roleLoading ||
                                                                    deleteLoading
                                                                }
                                                                onChange={e =>
                                                                    handleRoleChange(
                                                                        user,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >

                                                                {ROLES.map(
                                                                    role => (
                                                                        <option
                                                                            key={
                                                                                role
                                                                            }
                                                                            value={
                                                                                role
                                                                            }
                                                                        >
                                                                            {
                                                                                role
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}

                                                            </select>

                                                        </td>

                                                        {/* ACCOUNT */}
                                                        <td>

                                                            <span className="status-badge">

                                                                <span className="status-dot"></span>

                                                                Active

                                                            </span>

                                                        </td>

                                                        {/* ACTION */}
                                                        <td>

                                                            <div className="user-actions">

                                                                {!isCurrentUser ? (

                                                                    <button
                                                                        type="button"
                                                                        className="delete-user-button"
                                                                        disabled={
                                                                            roleLoading ||
                                                                            deleteLoading
                                                                        }
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                user
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            deleteLoading
                                                                                ? "Deleting..."
                                                                                : "Delete"
                                                                        }
                                                                    </button>

                                                                ) : (

                                                                    <span className="current-user-label">
                                                                        Current user
                                                                    </span>

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

                </>
            )}

            {/* ROLE INFORMATION */}
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
                            User permissions are determined
                            by their assigned role.
                        </p>

                    </div>

                </div>

                <div className="role-permission-grid">

                    <div className="permission-item">

                        <span className="role-badge role-admin">
                            Admin
                        </span>

                        <p>
                            Full system access and user management.
                        </p>

                    </div>

                    <div className="permission-item">

                        <span className="role-badge role-operator">
                            operator
                        </span>

                        <p>
                            System management and user access control.
                        </p>

                    </div>

                    <div className="permission-item">

                        <span className="role-badge role-engineer">
                            Engineer
                        </span>

                        <p>
                            Equipment, monitoring and predictions.
                        </p>

                    </div>

                    <div className="permission-item">

                        <span className="role-badge role-technician">
                            Technician
                        </span>

                        <p>
                            Equipment monitoring and maintenance.
                        </p>

                    </div>

                    <div className="permission-item">

                        <span className="role-badge role-viewer">
                            Viewer
                        </span>

                        <p>
                            Read-only access to system information.
                        </p>

                    </div>

                </div>

            </div>

            {/* =====================================================
                ADD USER MODAL
            ===================================================== */}

            {showAddUser && (

                <div
                    className="add-user-modal-overlay"
                    onMouseDown={e => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeAddUser();
                        }

                    }}
                >

                    <div
                        className="add-user-modal"
                        onMouseDown={e =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}
                        <div className="add-user-modal-header">

                            <div>

                                <span className="add-user-modal-eyebrow">
                                    USER MANAGEMENT
                                </span>

                                <h2>
                                    Add New User
                                </h2>

                                <p>
                                    Create a new PlantIQ user account.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeAddUser}
                                disabled={creatingUser}
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
                                    onChange={e =>
                                        setNewUser(
                                            previous => ({
                                                ...previous,
                                                name:
                                                    e.target.value
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
                                    onChange={e =>
                                        setNewUser(
                                            previous => ({
                                                ...previous,
                                                email:
                                                    e.target.value
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
                                    onChange={e =>
                                        setNewUser(
                                            previous => ({
                                                ...previous,
                                                password:
                                                    e.target.value
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
                                    onChange={e =>
                                        setNewUser(
                                            previous => ({
                                                ...previous,
                                                role:
                                                    e.target.value
                                            })
                                        )
                                    }
                                    disabled={
                                        creatingUser
                                    }
                                >

                                    {ROLES.map(
                                        role => (
                                            <option
                                                key={
                                                    role
                                                }
                                                value={
                                                    role
                                                }
                                            >
                                                {role}
                                            </option>
                                        )
                                    )}

                                </select>

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