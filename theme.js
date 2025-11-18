(function () {
    const THEME_STORAGE_KEY = 'preferred-theme';
    const root = document.documentElement;

    const getStoredTheme = () => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (error) {
            return null;
        }
    };

    const storeTheme = (theme) => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (error) {
            // ignore storage errors (private mode, etc.)
        }
    };

    const updateToggleState = (theme) => {
        document.querySelectorAll('.theme-toggle').forEach((button) => {
            const isLight = theme === 'light';
            button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
            button.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        });
    };

    const updateThemeAssets = (theme) => {
        document.querySelectorAll('[data-logo-dark][data-logo-light]').forEach((img) => {
            const nextSrc = theme === 'light'
                ? img.getAttribute('data-logo-light')
                : img.getAttribute('data-logo-dark');

            if (nextSrc && img.getAttribute('src') !== nextSrc) {
                img.setAttribute('src', nextSrc);
            }
        });
    };

    const applyTheme = (theme, persist = false) => {
        const normalized = theme === 'light' ? 'light' : 'dark';
        if (root.getAttribute('data-theme') !== normalized) {
            root.setAttribute('data-theme', normalized);
        }

        updateToggleState(normalized);
        updateThemeAssets(normalized);

        if (persist) {
            storeTheme(normalized);
        }
    };

    const initTheme = () => {
        const storedTheme = getStoredTheme();
        const initialTheme = storedTheme || root.getAttribute('data-theme') || 'dark';
        applyTheme(initialTheme, false);

        document.querySelectorAll('.theme-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
                applyTheme(nextTheme, true);
            });
        });
    };

    const initSite = () => {
        initTheme();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }

    window.SiteTheme = {
        applyTheme,
    };
})();
