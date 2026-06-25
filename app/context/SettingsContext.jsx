import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [userSettingsOpen, setUserSettingsOpen] = useState(false);
    const [userSettingsTab, setUserSettingsTab] = useState('profile');
    const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);

    const openUserSettings = useCallback((tab = 'profile') => {
        setUserSettingsTab(tab);
        setUserSettingsOpen(true);
    }, []);

    const closeUserSettings = useCallback(() => setUserSettingsOpen(false), []);

    const openGroupSettings = useCallback(() => setGroupDrawerOpen(true), []);
    const closeGroupSettings = useCallback(() => setGroupDrawerOpen(false), []);

    const value = useMemo(() => ({
        userSettingsOpen,
        userSettingsTab,
        groupDrawerOpen,
        openUserSettings,
        closeUserSettings,
        openGroupSettings,
        closeGroupSettings,
    }), [userSettingsOpen, userSettingsTab, groupDrawerOpen, openUserSettings, closeUserSettings, openGroupSettings, closeGroupSettings]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};