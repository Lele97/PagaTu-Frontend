import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchPreferences, fetchThemePresets } from '~/services/userApi';

const ThemeContext = createContext(null);

const DEFAULT_THEME = 'classic';

const applyTheme = (themeKey, presets) => {
    const preset = presets?.find((p) => p.key === themeKey) || presets?.[0];
    document.documentElement.setAttribute('data-theme', themeKey || DEFAULT_THEME);
    if (preset?.colors) {
        const root = document.documentElement.style;
        Object.entries(preset.colors).forEach(([key, value]) => {
            root.setProperty(`--theme-${key}`, value);
        });
    }
};

export const ThemeProvider = ({ children }) => {
    const [themeKey, setThemeKey] = useState(DEFAULT_THEME);
    const [presets, setPresets] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const loadTheme = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            applyTheme(DEFAULT_THEME, []);
            setLoaded(true);
            return;
        }
        try {
            const [presetList, prefs] = await Promise.all([
                fetchThemePresets(),
                fetchPreferences(),
            ]);
            setPresets(presetList || []);
            const key = prefs?.themeKey || DEFAULT_THEME;
            setThemeKey(key);
            applyTheme(key, presetList);
        } catch {
            applyTheme(DEFAULT_THEME, []);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadTheme();
    }, [loadTheme]);

    const setTheme = useCallback((key) => {
        setThemeKey(key);
        applyTheme(key, presets);
    }, [presets]);

    const value = useMemo(() => ({
        themeKey,
        presets,
        loaded,
        setTheme,
        reloadTheme: loadTheme,
    }), [themeKey, presets, loaded, setTheme, loadTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};