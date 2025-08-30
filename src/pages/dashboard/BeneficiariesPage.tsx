import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BeneficiariesTable from '@/components/beneficiaries/BeneficiariesTable';
import BeneficiaryForm from '@/components/beneficiaries/BeneficiaryForm';
import WillGenerator from '@/components/beneficiaries/WillGenerator';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

interface WillData {
  jurisdiction: string;
  testatorName: string;
  testatorAddress: string;
  executorName: string;
  executorEmail: string;
  specificBequests: string;
  residuaryClause: string;
  guardianshipClause: string;
  witnessRequirements: string;
}

export default function BeneficiariesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dt } = useDynamicTranslation();
  const [activeTab, setActiveTab] = useState('beneficiaries');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);

  const {
    beneficiaries,
    loading,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    generateWill,
    sendForSignature,
    willLoading,
    error
  } = useBeneficiaries();

  const handleAddBeneficiary = async (beneficiaryData: any) => {
    try {
      await addBeneficiary(beneficiaryData);
      toast({
        title: "Success",
        description: "Beneficiary added successfully.",
      });
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add beneficiary.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBeneficiary = async (beneficiaryData: any) => {
    if (!editingBeneficiary) return;
    
    try {
      await updateBeneficiary(editingBeneficiary.id, beneficiaryData);
      toast({
        title: "Success",
        description: "Beneficiary updated successfully.",
      });
      setEditingBeneficiary(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update beneficiary.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBeneficiary = async (beneficiary: any) => {
    if (window.confirm(`Are you sure you want to delete ${beneficiary.full_name}?`)) {
      try {
        await deleteBeneficiary(beneficiary.id);
        toast({
          title: "Success",
          description: "Beneficiary deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete beneficiary.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditBeneficiary = (beneficiary: any) => {
    setEditingBeneficiary(beneficiary);
    setIsFormOpen(true);
  };

  const handleGenerateWill = async (willData: WillData) => {
    try {
      await generateWill(willData);
      toast({
        title: "Success",
        description: "Will generated successfully and saved to your documents.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate will. Please check your DocuSign credentials.",
        variant: "destructive",
      });
    }
  };

  const handleSendForSignature = async (willData: WillData) => {
    try {
      await sendForSignature(willData);
      toast({
        title: "Success",
        description: "Will sent for signature via DocuSign.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send for signature. Please check your DocuSign setup.",
        variant: "destructive",
      });
    }
  };

  const currentTotalPercentage = beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
  const availablePercentage = 100 - currentTotalPercentage + (editingBeneficiary?.percentage || 0);

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Beneficiaries</h1>
          <p className="text-muted-foreground">
            Manage your beneficiaries and generate legal documents.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to manage your beneficiaries.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Beneficiaries</h1>
          <p className="text-muted-foreground">
            Manage your beneficiaries and generate legal documents.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load beneficiaries. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{dt('Beneficiaries')}</h1>
          <p className="text-muted-foreground">
            {dt('Manage your beneficiaries and generate wills or trusts with multi-jurisdiction support.')}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingBeneficiary(null);
            setIsFormOpen(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{dt('Add Beneficiary')}</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Wills & Trusts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiaries" className="space-y-6">
          <BeneficiariesTable
            beneficiaries={beneficiaries}
            onEdit={handleEditBeneficiary}
            onDelete={handleDeleteBeneficiary}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <WillGenerator
            beneficiaries={beneficiaries}
            onGenerateWill={handleGenerateWill}
            onSendForSignature={handleSendForSignature}
            loading={willLoading}
          />
        </TabsContent>
      </Tabs>

      <BeneficiaryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        beneficiary={editingBeneficiary}
        onSubmit={editingBeneficiary ? handleUpdateBeneficiary : handleAddBeneficiary}
        existingPercentages={currentTotalPercentage}
        loading={loading}
      />
    </div>
  );
}