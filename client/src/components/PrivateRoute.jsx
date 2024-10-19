// App/client/src/components/PrivateRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { auth } = useContext(AuthContext);

    if (!auth.token) {
        // Not logged in
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(auth.role)) {
        // Role not authorized
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
