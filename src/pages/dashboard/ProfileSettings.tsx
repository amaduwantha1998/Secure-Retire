import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, Eye, Accessibility, Download, Crown } from 'lucide-react';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { SecuritySettingsForm } from '@/components/profile/SecuritySettingsForm';
import { NotificationSettingsForm } from '@/components/profile/NotificationSettingsForm';
import { PrivacySettingsForm } from '@/components/profile/PrivacySettingsForm';
import { AccessibilitySettingsForm } from '@/components/profile/AccessibilitySettingsForm';
import { DataManagementForm } from '@/components/profile/DataManagementForm';
import { SubscriptionTab } from '@/components/profile/SubscriptionTab';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Fetch user settings
      const { data: userSettings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setUserData(userProfile);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Loading your profile settings...</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information, security settings, and preferences.
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoForm 
            userData={userData} 
            onUpdate={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsForm 
            settings={settings}
            onUpdate={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm 
            settings={settings}
            onUpdate={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettingsForm 
            settings={settings}
            onUpdate={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilitySettingsForm 
            settings={settings}
            onUpdate={fetchUserData}
          />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab onUpdate={fetchUserData} />
        </TabsContent>

        <TabsContent value="data">
          <DataManagementForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}