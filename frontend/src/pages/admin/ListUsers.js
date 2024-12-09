import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash } from 'react-bootstrap-icons';
import { jwtDecode } from "jwt-decode";
import AdminNavbar from './AdminNavbar';

const ListUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAdminAndFetchUsers();
    }, []);

    const checkAdminAndFetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const decoded = jwtDecode(token);
            if (decoded.role !== 'admin') {
                throw new Error('Unauthorized: Admin access required');
            }

            fetchUsers();
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/admin/users',
                getAuthConfig()
            );
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleDelete = async (userId, userType) => {
        try {
            await axios.delete(
                'http://localhost:5000/api/admin/users/',
                {
                    ...getAuthConfig(),
                    data: { userId, userType }
                }
            );
            // Refresh the user list after successful deletion
            fetchUsers();
        } catch (err) {
            setError(`Failed to delete user: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading users...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-danger text-center mt-5" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
        <AdminNavbar/>
        
        <div className="container" style={{marginTop:"100px"}}>
            <h1 className="text-center mb-4">All Users</h1>
            {users.length === 0 ? (
                <div className="alert alert-info text-center">
                    No users found.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>User Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge bg-${
                                            user.userType === 'admin' ? 'danger' :
                                            user.userType === 'advertiser' ? 'primary' : 'success'
                                        }`}>
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(user._id, user.userType)}
                                            disabled={user.userType === 'admin'} // Prevent deleting admin users
                                        >
                                            <Trash size={16} className="me-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
};

export default ListUsers;