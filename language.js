(function () {
    const LANGUAGE_STORAGE_KEY = 'preferred-language';
    const DEFAULT_LANGUAGE = 'en';
    const root = document.documentElement;
    const subscribers = new Set();
    let currentLanguage = DEFAULT_LANGUAGE;
    let elementsInitialized = false;

    const attrNameToKey = (attrName) => attrName
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const getStoredLanguage = () => {
        try {
            const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            return stored === 'pt' ? 'pt' : stored === 'en' ? 'en' : null;
        } catch (error) {
            return null;
        }
    };

    const storeLanguage = (lang) => {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch (error) {
            // Ignored (private mode, etc.)
        }
    };

    const initTextNodes = () => {
        if (elementsInitialized) {
            return;
        }

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const mode = element.dataset.i18nMode === 'html' ? 'html' : 'text';
            if (!element.dataset.i18nEn) {
                element.dataset.i18nEn = mode === 'html'
                    ? element.innerHTML
                    : element.textContent;
            }
        });

        document.querySelectorAll('[data-i18n-attrs]').forEach((element) => {
            const attrList = element.getAttribute('data-i18n-attrs');
            if (!attrList) {
                return;
            }

            attrList
                .split(',')
                .map((attr) => attr.trim())
                .filter(Boolean)
                .forEach((attrName) => {
                    const datasetKey = `i18nEn${attrNameToKey(attrName)}`;
                    if (!element.dataset[datasetKey]) {
                        element.dataset[datasetKey] = element.getAttribute(attrName) || '';
                    }
                });
        });

        elementsInitialized = true;
    };

    const updateSwitchLabels = () => {
        document.querySelectorAll('.language-switch').forEach((button) => {
            const enLabel = button.dataset.labelEn || 'Switch to Portuguese';
            const ptLabel = button.dataset.labelPt || 'Alternar para inglês';
            const nextLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
            button.setAttribute('aria-label', nextLanguage === 'pt' ? enLabel : ptLabel);
            button.setAttribute('aria-pressed', currentLanguage === 'pt' ? 'true' : 'false');
        });
    };

    const applyLanguage = (nextLanguage, persist = true) => {
        initTextNodes();

        const normalized = nextLanguage === 'pt' ? 'pt' : 'en';
        if (normalized === currentLanguage && persist) {
            updateSwitchLabels();
            return;
        }

        currentLanguage = normalized;
        const langAttr = normalized === 'pt' ? 'pt-BR' : 'en';
        root.dataset.language = normalized;
        root.setAttribute('lang', langAttr);

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const datasetKey = normalized === 'pt' ? 'i18nPt' : 'i18nEn';
            const value = element.dataset[datasetKey];
            if (value === undefined) {
                return;
            }

            if (element.dataset.i18nMode === 'html') {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        });

        document.querySelectorAll('[data-i18n-attrs]').forEach((element) => {
            const attrList = element.getAttribute('data-i18n-attrs');
            if (!attrList) {
                return;
            }

            attrList
                .split(',')
                .map((attr) => attr.trim())
                .filter(Boolean)
                .forEach((attrName) => {
                    const datasetKey = `i18n${normalized === 'pt' ? 'Pt' : 'En'}${attrNameToKey(attrName)}`;
                    const value = element.dataset[datasetKey];
                    if (value !== undefined) {
                        element.setAttribute(attrName, value);
                    }
                });
        });

        updateSwitchLabels();

        if (persist) {
            storeLanguage(normalized);
        }

        subscribers.forEach((listener) => {
            try {
                listener(normalized);
            } catch (error) {
                console.error('Language listener error:', error);
            }
        });
    };

    const handleToggle = (event) => {
        event.preventDefault();
        applyLanguage(currentLanguage === 'pt' ? 'en' : 'pt');
    };

    const initSwitches = () => {
        document.querySelectorAll('.language-switch').forEach((button) => {
            button.addEventListener('click', handleToggle);
        });

        updateSwitchLabels();
    };

    const init = () => {
        initTextNodes();
        const stored = getStoredLanguage();
        applyLanguage(stored || DEFAULT_LANGUAGE, false);
        initSwitches();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SiteLanguage = {
        applyLanguage,
        getCurrentLanguage: () => currentLanguage,
        subscribe: (fn) => {
            if (typeof fn !== 'function') {
                return () => {};
            }

            subscribers.add(fn);
            fn(currentLanguage);

            return () => subscribers.delete(fn);
        },
    };

    try {
        window.dispatchEvent(new Event('site-language-ready'));
    } catch (error) {
        const legacyEvent = document.createEvent('Event');
        legacyEvent.initEvent('site-language-ready', true, true);
        window.dispatchEvent(legacyEvent);
    }
})();
