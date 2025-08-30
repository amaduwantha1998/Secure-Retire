import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type BeneficiaryRow = Database['public']['Tables']['beneficiaries']['Row'];
type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert'];
type BeneficiaryUpdate = Database['public']['Tables']['beneficiaries']['Update'];
type RelationshipType = Database['public']['Enums']['relationship_type'];

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

export function useBeneficiaries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [willLoading, setWillLoading] = useState(false);

  // Fetch beneficiaries
  const {
    data: beneficiaries,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['beneficiaries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('percentage', { ascending: false });
      
      if (error) throw error;
      return data as BeneficiaryRow[];
    },
    enabled: !!user?.id
  });

  // Add beneficiary mutation
  const addBeneficiaryMutation = useMutation({
    mutationFn: async (beneficiaryData: Omit<BeneficiaryInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const insertData: BeneficiaryInsert = {
        ...beneficiaryData,
        user_id: user.id,
        relationship: beneficiaryData.relationship as RelationshipType,
        date_of_birth: beneficiaryData.date_of_birth || null
      };

      const { data, error } = await supabase
        .from('beneficiaries')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    }
  });

  // Update beneficiary mutation
  const updateBeneficiaryMutation = useMutation({
    mutationFn: async ({ id, ...beneficiaryData }: { id: string } & Partial<BeneficiaryUpdate>) => {
      const updateData: BeneficiaryUpdate = {
        ...beneficiaryData,
        relationship: beneficiaryData.relationship as RelationshipType | undefined,
        date_of_birth: beneficiaryData.date_of_birth || null
      };

      const { data, error } = await supabase
        .from('beneficiaries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    }
  });

  // Delete beneficiary mutation
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    }
  });

  // Generate will function
  const generateWill = async (willData: WillData) => {
    if (!user?.id || !beneficiaries) throw new Error('Missing data');

    setWillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-will-document', {
        body: {
          user_id: user.id,
          beneficiaries,
          will_data: willData,
          action: 'generate'
        }
      });

      if (error) throw error;
      
      // Download the generated PDF
      if (data.document_url) {
        const link = document.createElement('a');
        link.href = data.document_url;
        link.download = `will-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return data;
    } finally {
      setWillLoading(false);
    }
  };

  // Send for signature function
  const sendForSignature = async (willData: WillData) => {
    if (!user?.id || !beneficiaries) throw new Error('Missing data');

    setWillLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-will-document', {
        body: {
          user_id: user.id,
          beneficiaries,
          will_data: willData,
          action: 'docusign'
        }
      });

      if (error) throw error;
      
      // Open DocuSign signing ceremony in new tab
      if (data.signing_url) {
        window.open(data.signing_url, '_blank');
      }

      return data;
    } finally {
      setWillLoading(false);
    }
  };

  return {
    beneficiaries: beneficiaries || [],
    loading,
    willLoading,
    error,
    addBeneficiary: addBeneficiaryMutation.mutate,
    updateBeneficiary: (id: string, data: any) => updateBeneficiaryMutation.mutate({ id, ...data }),
    deleteBeneficiary: deleteBeneficiaryMutation.mutate,
    generateWill,
    sendForSignature,
    isAdding: addBeneficiaryMutation.isPending,
    isUpdating: updateBeneficiaryMutation.isPending,
    isDeleting: deleteBeneficiaryMutation.isPending
  };
}