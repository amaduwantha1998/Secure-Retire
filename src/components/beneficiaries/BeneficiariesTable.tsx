import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Crown, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Beneficiary {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string | null;
  contact_email: string;
  percentage: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (beneficiary: Beneficiary) => void;
  loading?: boolean;
}

export default function BeneficiariesTable({ 
  beneficiaries, 
  onEdit, 
  onDelete, 
  loading = false 
}: BeneficiariesTableProps) {
  const getRelationshipLabel = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1).replace('_', ' ');
  };

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A';
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return `${age} years`;
  };

  const isOutdated = (updatedAt: string) => {
    const lastUpdated = new Date(updatedAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastUpdated < oneYearAgo;
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="text-center py-12">
        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Beneficiaries Added</h3>
        <p className="text-muted-foreground">
          Add beneficiaries to ensure your assets are distributed according to your wishes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total Allocation</p>
          <p className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
            {totalPercentage.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
          <p className="text-2xl font-bold">{beneficiaries.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Primary Beneficiaries</p>
          <p className="text-2xl font-bold">{beneficiaries.filter(b => b.is_primary).length}</p>
        </div>
      </div>

      {/* Validation Alerts */}
      {totalPercentage !== 100 && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            {totalPercentage < 100 
              ? `Allocation incomplete: ${(100 - totalPercentage).toFixed(1)}% unallocated`
              : `Over-allocated by ${(totalPercentage - 100).toFixed(1)}%`
            }
          </p>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {beneficiary.is_primary && (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    )}
                    <span>{beneficiary.full_name}</span>
                    {isOutdated(beneficiary.updated_at) && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{getRelationshipLabel(beneficiary.relationship)}</TableCell>
                <TableCell>{getAge(beneficiary.date_of_birth)}</TableCell>
                <TableCell>{beneficiary.contact_email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{beneficiary.percentage}%</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={beneficiary.is_primary ? 'default' : 'secondary'}>
                    {beneficiary.is_primary ? 'Primary' : 'Contingent'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(beneficiary.updated_at), { addSuffix: true })}
                  {isOutdated(beneficiary.updated_at) && (
                    <Badge variant="outline" className="ml-2 text-orange-600">
                      Outdated
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(beneficiary)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(beneficiary)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}