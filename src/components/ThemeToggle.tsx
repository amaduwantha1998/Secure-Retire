import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export const ThemeToggle: React.FC<{ className?: string }>= ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Sun className="h-4 w-4 text-foreground" aria-hidden="true" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={async () => { await toggleTheme(); }}
        aria-label={t('theme.toggle', 'Toggle dark mode')}
        className="data-[state=checked]:bg-primary"
      />
      <Moon className="h-4 w-4 text-foreground" aria-hidden="true" />
    </div>
  );
};

export default ThemeToggle;
