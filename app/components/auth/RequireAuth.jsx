import { Navigate } from 'react-router-dom';
import { getAuthToken } from '~/utils/api';

const RequireAuth = ({ children }) => {
    if (!getAuthToken()) {
        return <Navigate to="/welcome" replace />;
    }
    return children;
};

export default RequireAuth;
