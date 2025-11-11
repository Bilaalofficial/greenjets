import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backendBaseUrl from "./config";
import "./Admin.css";

function Admin() {
    const [loginDetails, setLoginDetails] = useState({ username: "", password: "" });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            fetchUsers();
        }
    }, [isLoggedIn]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendBaseUrl}/admin/login`, loginDetails);
            if (response.data.status === "success") {
                setIsLoggedIn(true);
            } else {
                alert("Invalid admin credentials");
            }
        } catch (error) {
            console.error("Error logging in", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${backendBaseUrl}/admin/users`);
            setUsers(response.data);
    
            const permissionsResponse = await Promise.all(response.data.map(user => 
                axios.get(`${backendBaseUrl}/permissions/${user.name}`)
            ));
            const initialPermissions = response.data.reduce((acc, user, index) => {
                acc[user.id] = {
                    ...permissionsResponse[index].data.permissions,
                    script4_enabled: permissionsResponse[index].data.permissions.script4_enabled || false // Add this line
                };
                return acc;
            }, {});
            setPermissions(initialPermissions);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };
    
    const updatePermissions = async (userId) => {
        try {
            const { script1_enabled, script2_enabled, script3_enabled, simple_plot_enabled, browser_plot_enabled, script4_enabled } = permissions[userId]; // Add script4_enabled
            const response = await axios.post(`${backendBaseUrl}/admin/set-permissions`, {
                userId,
                script1Enabled: script1_enabled,
                script2Enabled: script2_enabled,
                script3Enabled: script3_enabled,
                simplePlotEnabled: simple_plot_enabled,
                browserPlotEnabled: browser_plot_enabled,
                script4Enabled: script4_enabled // Add this line
            });
            if (response.data.status === "success") {
                alert("Permissions updated successfully");
            } else {
                alert("Failed to update permissions");
            }
        } catch (error) {
            console.error("Error updating permissions", error);
        }
    };
    

    const handlePermissionChange = (userId, script) => {
        setPermissions((prevPermissions) => ({
            ...prevPermissions,
            [userId]: {
                ...prevPermissions[userId],
                [script]: !prevPermissions[userId][script],
            },
        }));
    };

    const removeUser = async (userId) => {
        try {
            const response = await axios.delete(`${backendBaseUrl}/admin/users/${userId}`);
            if (response.data.status === "success") {
                setUsers(users.filter(user => user.id !== userId));
                const { [userId]: removedUser, ...remainingPermissions } = permissions;
                setPermissions(remainingPermissions);
                alert("User removed successfully");
            } else {
                alert("Failed to remove user");
            }
        } catch (error) {
            console.error("Error removing user", error);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-form">
                    <h2>Admin Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={loginDetails.username}
                                onChange={(e) => setLoginDetails({ ...loginDetails, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginDetails.password}
                                onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
                localStorage.removeItem('user'); 
                sessionStorage.removeItem('user'); 
                navigate("/");
            };

    return (
        <div className="admin-panel">
            <button className="admin-logout-button" onClick={handleLogout}>Logout</button>
            <h2>Admin Panel</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Script 1</th>
                        <th>Script 2</th>
                        <th>Script 3</th>
                        <th>Simple Plot</th>
                        <th>Browser Plot</th>
                        <th>Script  4</th>
                        <th>Update</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.script1_enabled || false}
                                    onChange={() => handlePermissionChange(user.id, "script1_enabled")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.script2_enabled || false}
                                    onChange={() => handlePermissionChange(user.id, "script2_enabled")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.script3_enabled || false}
                                    onChange={() => handlePermissionChange(user.id, "script3_enabled")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.simple_plot_enabled || false}
                                    onChange={() => handlePermissionChange(user.id, "simple_plot_enabled")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.browser_plot_enabled || false}
                                    onChange={() => handlePermissionChange(user.id, "browser_plot_enabled")}
                                />
                            </td>
                            <td>
                                 <input
                                    type="checkbox"
                                    checked={permissions[user.id]?.script4_enabled || false}  // Add this line
                                    onChange={() => handlePermissionChange(user.id, "script4_enabled")}
                                />
                           </td>

                            <td>
                                <button onClick={() => updatePermissions(user.id)}>Update</button>
                            </td>
                            <td>
                                <button onClick={() => removeUser(user.id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Admin;

