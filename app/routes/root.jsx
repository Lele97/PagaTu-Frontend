import React, { useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Footer from '../components/footer/footer.jsx';
import { ThemeProvider } from '~/context/ThemeContext.jsx';
import { SettingsProvider, useSettings } from '~/context/SettingsContext.jsx';

import '../styles/app.css';
import '../styles/themes.css';

const SettingsUrlHandler = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { openUserSettings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        const tab = searchParams.get('settings');
        if (tab && location.pathname === '/home') {
            openUserSettings(tab);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, location.pathname, openUserSettings, setSearchParams]);

    return children;
};

const Root = () => {
    const location = useLocation();
    const isSplash = location.pathname === '/';

    return (
        <ThemeProvider>
            <SettingsProvider>
                <SettingsUrlHandler>
                    <div className="appWrapper">
                        <Outlet />
                        {!isSplash && <Footer />}
                    </div>
                </SettingsUrlHandler>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default Root;