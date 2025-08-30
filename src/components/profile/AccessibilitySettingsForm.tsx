import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Accessibility, Type, Contrast, Volume, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessibilitySettingsFormProps {
  settings: any;
  onUpdate: () => void;
}

export function AccessibilitySettingsForm({ settings, onUpdate }: AccessibilitySettingsFormProps) {
  const accessibility = settings?.accessibility || {};

  const updateAccessibilitySetting = async (key: string, value: any) => {
    try {
      const updatedAccessibility = {
        ...accessibility,
        [key]: value,
      };

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: settings?.user_id,
          accessibility: updatedAccessibility,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Apply the setting immediately to the DOM
      applyAccessibilitySetting(key, value);
      
      toast.success('Accessibility settings updated');
      onUpdate();
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
      toast.error('Failed to update accessibility settings');
    }
  };

  const applyAccessibilitySetting = (key: string, value: any) => {
    const root = document.documentElement;
    
    switch (key) {
      case 'fontSize':
        root.style.fontSize = `${value}px`;
        break;
      case 'highContrast':
        if (value) {
          root.classList.add('high-contrast');
        } else {
          root.classList.remove('high-contrast');
        }
        break;
      case 'reducedMotion':
        if (value) {
          root.style.setProperty('--animation-duration', '0s');
        } else {
          root.style.removeProperty('--animation-duration');
        }
        break;
    }
  };

  // Apply settings on component mount
  React.useEffect(() => {
    Object.entries(accessibility).forEach(([key, value]) => {
      applyAccessibilitySetting(key, value);
    });
  }, [accessibility]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text and Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <div className="space-y-4">
              <Slider
                value={[accessibility.fontSize || 16]}
                onValueChange={([value]) => updateAccessibilitySetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Small (12px)</span>
                <span>Medium (16px)</span>
                <span>Large (24px)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select 
              value={accessibility.fontFamily || 'default'}
              onValueChange={(value) => updateAccessibilitySetting('fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="serif">Serif (Georgia)</SelectItem>
                <SelectItem value="sans-serif">Sans-serif (Arial)</SelectItem>
                <SelectItem value="monospace">Monospace (Courier)</SelectItem>
                <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Line Height</Label>
            <Select 
              value={accessibility.lineHeight || 'normal'}
              onValueChange={(value) => updateAccessibilitySetting('lineHeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight (1.2)</SelectItem>
                <SelectItem value="normal">Normal (1.5)</SelectItem>
                <SelectItem value="relaxed">Relaxed (1.8)</SelectItem>
                <SelectItem value="loose">Loose (2.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Bold Text</Label>
              <p className="text-sm text-muted-foreground">
                Make all text bold for better readability
              </p>
            </div>
            <Switch
              checked={accessibility.boldText || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('boldText', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="h-5 w-5" />
            Visual Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={accessibility.highContrast || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('highContrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme to reduce eye strain
              </p>
            </div>
            <Switch
              checked={accessibility.darkMode || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('darkMode', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <Select 
              value={accessibility.colorTheme || 'default'}
              onValueChange={(value) => updateAccessibilitySetting('colorTheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="protanopia">Protanopia Friendly</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia Friendly</SelectItem>
                <SelectItem value="tritanopia">Tritanopia Friendly</SelectItem>
                <SelectItem value="monochrome">Monochrome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced focus outlines for keyboard navigation
              </p>
            </div>
            <Switch
              checked={accessibility.focusIndicators || true}
              onCheckedChange={(checked) => updateAccessibilitySetting('focusIndicators', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume className="h-5 w-5" />
            Motion and Animation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={accessibility.reducedMotion || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('reducedMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-playing Media</Label>
              <p className="text-sm text-muted-foreground">
                Prevent videos and animations from auto-playing
              </p>
            </div>
            <Switch
              checked={accessibility.noAutoplay || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('noAutoplay', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Animation Speed</Label>
            <Select 
              value={accessibility.animationSpeed || 'normal'}
              onValueChange={(value) => updateAccessibilitySetting('animationSpeed', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced keyboard shortcuts and navigation
              </p>
            </div>
            <Switch
              checked={accessibility.keyboardNav || true}
              onCheckedChange={(checked) => updateAccessibilitySetting('keyboardNav', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-muted-foreground">
                Optimize for screen readers and assistive technology
              </p>
            </div>
            <Switch
              checked={accessibility.screenReader || true}
              onCheckedChange={(checked) => updateAccessibilitySetting('screenReader', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Click/Tap Timeout</Label>
            <Select 
              value={accessibility.clickTimeout || 'normal'}
              onValueChange={(value) => updateAccessibilitySetting('clickTimeout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1s)</SelectItem>
                <SelectItem value="normal">Normal (3s)</SelectItem>
                <SelectItem value="long">Long (5s)</SelectItem>
                <SelectItem value="none">No Timeout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Sticky Hover</Label>
              <p className="text-sm text-muted-foreground">
                Keep hover states active longer for easier interaction
              </p>
            </div>
            <Switch
              checked={accessibility.stickyHover || false}
              onCheckedChange={(checked) => updateAccessibilitySetting('stickyHover', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}