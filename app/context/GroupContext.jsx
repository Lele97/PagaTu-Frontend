import { createContext, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_PATH, groupPath } from '~/utils/routes';

const GroupContext = createContext(null);

export const GroupProvider = ({ children }) => {
    const navigate = useNavigate();

    const openGroup = useCallback((groupName) => {
        if (!groupName) {
            return;
        }
        navigate(groupPath(groupName));
    }, [navigate]);

    const replaceGroup = useCallback((groupName) => {
        if (!groupName) {
            return;
        }
        navigate(groupPath(groupName), { replace: true });
    }, [navigate]);

    const leaveToHome = useCallback(() => {
        navigate(HOME_PATH);
    }, [navigate]);

    const value = useMemo(() => ({
        openGroup,
        replaceGroup,
        leaveToHome,
    }), [openGroup, replaceGroup, leaveToHome]);

    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroup = () => {
    const ctx = useContext(GroupContext);
    if (!ctx) {
        throw new Error('useGroup must be used within GroupProvider');
    }
    return ctx;
};
