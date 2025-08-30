import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationSettingsFormProps {
  settings: any;
  onUpdate: () => void;
}

export function NotificationSettingsForm({ settings, onUpdate }: NotificationSettingsFormProps) {
  const notifications = settings?.notifications || {};

  const updateNotificationSetting = async (key: string, value: any) => {
    try {
      const updatedNotifications = {
        ...notifications,
        [key]: value,
      };

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: settings?.user_id,
          notifications: updatedNotifications,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Notification settings updated');
      onUpdate();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Portfolio Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your investment portfolio
              </p>
            </div>
            <Switch
              checked={notifications.emailPortfolio || false}
              onCheckedChange={(checked) => updateNotificationSetting('emailPortfolio', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Consultation Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming consultations
              </p>
            </div>
            <Switch
              checked={notifications.emailConsultations || false}
              onCheckedChange={(checked) => updateNotificationSetting('emailConsultations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Document Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications when documents require attention
              </p>
            </div>
            <Switch
              checked={notifications.emailDocuments || false}
              onCheckedChange={(checked) => updateNotificationSetting('emailDocuments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Important security notifications and alerts
              </p>
            </div>
            <Switch
              checked={notifications.emailSecurity || true}
              onCheckedChange={(checked) => updateNotificationSetting('emailSecurity', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email Frequency</Label>
            <Select 
              value={notifications.emailFrequency || 'immediate'}
              onValueChange={(value) => updateNotificationSetting('emailFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Critical Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Urgent security and account alerts via SMS
              </p>
            </div>
            <Switch
              checked={notifications.smsCritical || false}
              onCheckedChange={(checked) => updateNotificationSetting('smsCritical', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Consultation Reminders</Label>
              <p className="text-sm text-muted-foreground">
                SMS reminders for upcoming appointments
              </p>
            </div>
            <Switch
              checked={notifications.smsConsultations || false}
              onCheckedChange={(checked) => updateNotificationSetting('smsConsultations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Document Signatures</Label>
              <p className="text-sm text-muted-foreground">
                SMS notifications for documents requiring signature
              </p>
            </div>
            <Switch
              checked={notifications.smsDocuments || false}
              onCheckedChange={(checked) => updateNotificationSetting('smsDocuments', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications directly to your device
              </p>
            </div>
            <Switch
              checked={notifications.pushEnabled || false}
              onCheckedChange={(checked) => updateNotificationSetting('pushEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Market Updates</Label>
              <p className="text-sm text-muted-foreground">
                Important market news and portfolio changes
              </p>
            </div>
            <Switch
              checked={notifications.pushMarket || false}
              onCheckedChange={(checked) => updateNotificationSetting('pushMarket', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminders for pending tasks and actions
              </p>
            </div>
            <Switch
              checked={notifications.pushTasks || false}
              onCheckedChange={(checked) => updateNotificationSetting('pushTasks', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={notifications.quietStart || '22:00'}
                onValueChange={(value) => updateNotificationSetting('quietStart', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={notifications.quietEnd || '08:00'}
                onValueChange={(value) => updateNotificationSetting('quietEnd', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {`${i.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}