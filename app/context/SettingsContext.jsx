import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [userSettingsOpen, setUserSettingsOpen] = useState(false);
    const [userSettingsTab, setUserSettingsTab] = useState('profile');
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);

    const openUserSettings = useCallback((tab = 'profile') => {
        setGroupSettingsOpen(false);
        setUserSettingsTab(tab);
        setUserSettingsOpen(true);
    }, []);

    const closeUserSettings = useCallback(() => setUserSettingsOpen(false), []);

    const openGroupSettings = useCallback(() => {
        setUserSettingsOpen(false);
        setGroupSettingsOpen(true);
    }, []);
    const closeGroupSettings = useCallback(() => setGroupSettingsOpen(false), []);

    const value = useMemo(() => ({
        userSettingsOpen,
        userSettingsTab,
        groupSettingsOpen,
        openUserSettings,
        closeUserSettings,
        openGroupSettings,
        closeGroupSettings,
    }), [userSettingsOpen, userSettingsTab, groupSettingsOpen, openUserSettings, closeUserSettings, openGroupSettings, closeGroupSettings]);

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