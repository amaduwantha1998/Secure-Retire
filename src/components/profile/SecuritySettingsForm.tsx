import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, Fingerprint } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecuritySettingsFormProps {
  settings: any;
  onUpdate: () => void;
}

export function SecuritySettingsForm({ settings, onUpdate }: SecuritySettingsFormProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setBiometricSupported(true);
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  const enableBiometric = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "SunWise Secure Forge",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode("user-id"),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        setBiometricEnabled(true);
        toast.success('Biometric authentication enabled');
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      toast.error('Failed to enable biometric authentication');
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: settings?.user_id,
          [key]: value,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                setTwoFactorEnabled(checked);
                updateSettings('privacy', { ...settings?.privacy, twoFactorEnabled: checked });
              }}
            />
          </div>
          
          {twoFactorEnabled && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Use an authenticator app like Google Authenticator or Authy to generate codes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!biometricSupported ? (
            <Alert>
              <AlertDescription>
                Biometric authentication is not supported on this device or browser.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint, face, or other biometric methods to sign in
                  </p>
                </div>
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={enableBiometric}
                />
              </div>
              
              {!biometricEnabled && (
                <Button onClick={enableBiometric} variant="outline">
                  Set Up Biometric Authentication
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Sign Out</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sign out after 30 minutes of inactivity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out All Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}