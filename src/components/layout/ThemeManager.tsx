'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function ThemeManager() {
    const { theme } = useGameStore();

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (t: 'light' | 'dark' | 'system') => {
            if (t === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.setAttribute('data-theme', systemTheme);
            } else {
                root.setAttribute('data-theme', t);
            }
        };

        applyTheme(theme);

        // Listen for system theme changes if set to system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return null;
}
