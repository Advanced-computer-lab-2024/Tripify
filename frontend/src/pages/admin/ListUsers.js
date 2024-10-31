import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash } from 'react-bootstrap-icons';

const ListUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDelete = async (userId, userType) => {
        try {
            await axios.delete('http://localhost:5000/api/admin/users/delete', {
                data: { userId, userType }
            });
            // Refresh the user list after successful deletion
            fetchUsers();
        } catch (err) {
            setError(`Failed to delete user: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading users...</div>;
    }

    if (error) {
        return <div className="text-danger text-center mt-5">Error: {error}</div>;
    }

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">All Users</h1>
            <table className="table table-striped table-bordered">
                <thead className="thead-light">
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
                            <td>{user.userType}</td>
                            <td>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(user._id, user.userType)}
                                >
                                    <Trash size={16} /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListUsers;