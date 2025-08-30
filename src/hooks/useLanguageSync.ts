import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('language')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading user language:', error);
            return;
          }

          const savedLanguage = data?.language || localStorage.getItem('language') || 'en';
          if (savedLanguage && savedLanguage !== i18n.language) {
            await i18n.changeLanguage(savedLanguage);
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
        }
      }
    };

    loadUserLanguage();
  }, [user, i18n]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time sync for language changes
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newLanguage = payload.new?.language;
          if (newLanguage && newLanguage !== i18n.language) {
            i18n.changeLanguage(newLanguage);
            localStorage.setItem('language', newLanguage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, i18n]);
};