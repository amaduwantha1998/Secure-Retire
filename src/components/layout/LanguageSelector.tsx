import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const [isChanging, setIsChanging] = React.useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    if (isChanging || languageCode === i18n.language) return;
    
    try {
      setIsChanging(true);
      
      // Update i18n immediately for responsive UI
      await i18n.changeLanguage(languageCode);
      
      // Save to localStorage as fallback
      localStorage.setItem('language', languageCode);
      
      // Save to Supabase if user is authenticated
      if (user) {
        const { error } = await supabase
          .from('settings')
          .upsert({ 
            user_id: user.id, 
            language: languageCode 
          }, {
            onConflict: 'user_id'
          });
          
        if (error && error.code !== '23505') {
          console.error('Error saving language preference:', error);
          toast.error(t('common.languageUpdateFailed', 'Failed to save language preference'));
        } else {
          toast.success(t('common.languageUpdated', 'Language updated successfully'));
        }
      }

      // Trigger real-time translation update
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }));
      
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(t('common.languageChangeFailed', 'Failed to change language'));
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-1 backdrop-blur-md bg-background/30 hover:bg-background/40 transition-all duration-200 hover:shadow-xl"
          aria-label={t('common.selectLanguage')}
          disabled={isChanging}
        >
          {isChanging ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="hidden sm:inline text-xs md:text-sm">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 backdrop-blur-md bg-background/95 border border-border/50 shadow-xl rounded-xl"
        aria-live="polite"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-3 cursor-pointer text-xs md:text-sm transition-all duration-200 rounded-lg mx-1 ${
              currentLanguage.code === language.code 
                ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                : 'hover:bg-accent/50 hover:shadow-sm'
            } ${isChanging ? 'opacity-50 pointer-events-none' : ''}`}
            tabIndex={0}
            role="menuitem"
            aria-current={currentLanguage.code === language.code ? 'true' : 'false'}
          >
            <span className="text-lg w-8 flex justify-center">{language.flag}</span>
            <span className="flex-1 font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};