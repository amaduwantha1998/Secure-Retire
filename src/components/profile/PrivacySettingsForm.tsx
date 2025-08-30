import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, Share2, Database, Cookie } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrivacySettingsFormProps {
  settings: any;
  onUpdate: () => void;
}

export function PrivacySettingsForm({ settings, onUpdate }: PrivacySettingsFormProps) {
  const privacy = settings?.privacy || {};

  const updatePrivacySetting = async (key: string, value: any) => {
    try {
      const updatedPrivacy = {
        ...privacy,
        [key]: value,
      };

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: settings?.user_id,
          privacy: updatedPrivacy,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Privacy settings updated');
      onUpdate();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Data Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
            </div>
            <Select 
              value={privacy.profileVisibility || 'private'}
              onValueChange={(value) => updatePrivacySetting('profileVisibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="advisors">Advisors Only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Financial Data Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control access to your financial information
              </p>
            </div>
            <Select 
              value={privacy.financialVisibility || 'private'}
              onValueChange={(value) => updatePrivacySetting('financialVisibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="advisors">Advisors Only</SelectItem>
                <SelectItem value="aggregated">Aggregated Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Activity Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Allow tracking of your app usage for improvements
              </p>
            </div>
            <Switch
              checked={privacy.activityTracking || false}
              onCheckedChange={(checked) => updatePrivacySetting('activityTracking', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Data Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Third-Party Integrations</Label>
              <p className="text-sm text-muted-foreground">
                Allow data sharing with integrated financial services
              </p>
            </div>
            <Switch
              checked={privacy.thirdPartySharing || false}
              onCheckedChange={(checked) => updatePrivacySetting('thirdPartySharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Communications</Label>
              <p className="text-sm text-muted-foreground">
                Receive personalized marketing and product updates
              </p>
            </div>
            <Switch
              checked={privacy.marketingComms || false}
              onCheckedChange={(checked) => updatePrivacySetting('marketingComms', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Research Participation</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymized data use for financial research
              </p>
            </div>
            <Switch
              checked={privacy.researchParticipation || false}
              onCheckedChange={(checked) => updatePrivacySetting('researchParticipation', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Advisor Referrals</Label>
              <p className="text-sm text-muted-foreground">
                Share basic info with potential financial advisors
              </p>
            </div>
            <Switch
              checked={privacy.advisorReferrals || false}
              onCheckedChange={(checked) => updatePrivacySetting('advisorReferrals', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Essential Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Required for basic app functionality
              </p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Help us understand how you use the app
              </p>
            </div>
            <Switch
              checked={privacy.analyticsCookies || false}
              onCheckedChange={(checked) => updatePrivacySetting('analyticsCookies', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Used to show relevant ads and content
              </p>
            </div>
            <Switch
              checked={privacy.marketingCookies || false}
              onCheckedChange={(checked) => updatePrivacySetting('marketingCookies', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Personalization Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Remember your preferences and settings
              </p>
            </div>
            <Switch
              checked={privacy.personalizationCookies || true}
              onCheckedChange={(checked) => updatePrivacySetting('personalizationCookies', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data Retention Period</Label>
            <Select 
              value={privacy.dataRetention || '7years'}
              onValueChange={(value) => updatePrivacySetting('dataRetention', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="3years">3 Years</SelectItem>
                <SelectItem value="5years">5 Years</SelectItem>
                <SelectItem value="7years">7 Years (Recommended)</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How long we keep your data after account closure
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Delete Inactive Data</Label>
              <p className="text-sm text-muted-foreground">
                Automatically remove data after periods of inactivity
              </p>
            </div>
            <Switch
              checked={privacy.autoDelete || false}
              onCheckedChange={(checked) => updatePrivacySetting('autoDelete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Consent</Label>
              <p className="text-sm text-muted-foreground">
                Allow encrypted backups for data recovery
              </p>
            </div>
            <Switch
              checked={privacy.backupConsent || true}
              onCheckedChange={(checked) => updatePrivacySetting('backupConsent', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}