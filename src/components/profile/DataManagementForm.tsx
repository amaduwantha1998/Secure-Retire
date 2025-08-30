import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Database,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function DataManagementForm() {
  const { user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);

  const dataTypes = [
    { id: 'profile', label: 'Profile Information', description: 'Personal details, contact info' },
    { id: 'financial', label: 'Financial Data', description: 'Assets, debts, income sources' },
    { id: 'beneficiaries', label: 'Beneficiaries', description: 'Beneficiary information and allocations' },
    { id: 'documents', label: 'Documents', description: 'Uploaded files and metadata' },
    { id: 'consultations', label: 'Consultations', description: 'Meeting history and notes' },
    { id: 'settings', label: 'Settings & Preferences', description: 'App settings and preferences' },
  ];

  const handleDataExport = async () => {
    try {
      setExportLoading(true);

      const exportData: any = {};
      
      // Export profile data
      if (selectedDataTypes.includes('profile')) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        exportData.profile = profile;
      }

      // Export financial data
      if (selectedDataTypes.includes('financial')) {
        const [assets, debts, income, retirement] = await Promise.all([
          supabase.from('assets').select('*').eq('user_id', user.id),
          supabase.from('debts').select('*').eq('user_id', user.id),
          supabase.from('income_sources').select('*').eq('user_id', user.id),
          supabase.from('retirement_savings').select('*').eq('user_id', user.id),
        ]);
        
        exportData.financial = {
          assets: assets.data,
          debts: debts.data,
          income: income.data,
          retirement: retirement.data,
        };
      }

      // Export beneficiaries data
      if (selectedDataTypes.includes('beneficiaries')) {
        const { data: beneficiaries } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', user.id);
        exportData.beneficiaries = beneficiaries;
      }

      // Export documents data (metadata only for privacy)
      if (selectedDataTypes.includes('documents')) {
        const { data: documents } = await supabase
          .from('documents')
          .select('id, type, created_at, updated_at, metadata, tags')
          .eq('user_id', user.id);
        exportData.documents = documents;
      }

      // Export consultations data
      if (selectedDataTypes.includes('consultations')) {
        const { data: consultations } = await supabase
          .from('consultations')
          .select('*')
          .eq('user_id', user.id);
        exportData.consultations = consultations;
      }

      // Export settings data
      if (selectedDataTypes.includes('settings')) {
        const { data: settings } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id);
        exportData.settings = settings;
      }

      // Add export metadata
      exportData._metadata = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        version: '1.0',
        dataTypes: selectedDataTypes,
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sunwise-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      setDeleteLoading(true);

      // Delete user data from all tables
      await Promise.all([
        supabase.from('assets').delete().eq('user_id', user.id),
        supabase.from('debts').delete().eq('user_id', user.id),
        supabase.from('income_sources').delete().eq('user_id', user.id),
        supabase.from('retirement_savings').delete().eq('user_id', user.id),
        supabase.from('beneficiaries').delete().eq('user_id', user.id),
        supabase.from('documents').delete().eq('user_id', user.id),
        supabase.from('consultations').delete().eq('user_id', user.id),
        supabase.from('portfolio_allocations').delete().eq('user_id', user.id),
        supabase.from('portfolio_performance').delete().eq('user_id', user.id),
        supabase.from('settings').delete().eq('user_id', user.id),
        supabase.from('users').delete().eq('id', user.id),
      ]);

      // Delete auth user (this will also sign them out)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export (GDPR/CCPA Compliance)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Download a copy of your personal data. Select the types of data you want to include in your export.
          </p>

          <div className="space-y-3">
            <Label>Select Data Types to Export:</Label>
            {dataTypes.map((type) => (
              <div key={type.id} className="flex items-start space-x-3">
                <Checkbox
                  id={type.id}
                  checked={selectedDataTypes.includes(type.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDataTypes([...selectedDataTypes, type.id]);
                    } else {
                      setSelectedDataTypes(selectedDataTypes.filter(id => id !== type.id));
                    }
                  }}
                />
                <div className="space-y-1">
                  <Label htmlFor={type.id} className="text-sm font-medium">
                    {type.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleDataExport}
            disabled={exportLoading || selectedDataTypes.length === 0}
            className="w-full"
          >
            {exportLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exporting Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Selected Data
              </>
            )}
          </Button>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your exported data will be in JSON format. Keep this file secure as it contains 
              personal information. The export does not include actual document files for security reasons.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Portability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Transfer your data to another service or platform.
          </p>

          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF Report
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              CSV exports are formatted for easy import into spreadsheet applications. 
              PDF reports provide a human-readable summary of your financial data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action is permanent and cannot be undone. 
              All your data, including financial records, documents, and account information will be permanently deleted.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-confirm"
                checked={deleteConfirm}
                onCheckedChange={(checked) => setDeleteConfirm(checked === true)}
              />
              <Label htmlFor="delete-confirm" className="text-sm">
                I understand that this action is permanent and will delete all my data
              </Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Before deleting your account, consider:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Exporting your data for your records</li>
                <li>• Downloading important documents</li>
                <li>• Informing your financial advisors</li>
                <li>• Updating beneficiary information elsewhere</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              onClick={handleAccountDeletion}
              disabled={!deleteConfirm || deleteLoading}
              className="w-full"
            >
              {deleteLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}