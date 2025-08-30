import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useThemeStore, ThemeMode } from '@/stores/themeStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/utils/sentry';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme: setThemeInStore } = useThemeStore();
  const { user } = useAuth();

  const applyThemeClass = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, []);

  // Apply current theme on mount and when it changes
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme, applyThemeClass]);

  // Load theme preference from Supabase if available
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from('settings')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        const remoteTheme = (data?.theme as ThemeMode | null) ?? null;
        if (remoteTheme && remoteTheme !== theme) {
          setThemeInStore(remoteTheme);
          applyThemeClass(remoteTheme);
        }
      } catch (e) {
        logError(e as Error, { context: 'loadUserTheme' });
      }
    };
    loadUserTheme();
  }, [user, theme, setThemeInStore, applyThemeClass]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeInStore(mode);
      applyThemeClass(mode);
      if (user) {
        // First try to update existing record, then insert if it doesn't exist
        const { error: updateError } = await supabase
          .from('settings')
          .update({ theme: mode })
          .eq('user_id', user.id);
        
        if (updateError) {
          // If update fails, try insert (for new users)
          const { error: insertError } = await supabase
            .from('settings')
            .insert({ user_id: user.id, theme: mode });
          
          if (insertError) throw insertError;
        }
      }
    } catch (e) {
      logError(e as Error, { context: 'setTheme' });
    }
  }, [setThemeInStore, applyThemeClass, user]);

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
