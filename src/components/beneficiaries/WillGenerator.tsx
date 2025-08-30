import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditGuard } from '@/components/credits/CreditGuard';
import { getCreditOperation } from '@/utils/creditOperations';

interface Beneficiary {
  id: string;
  full_name: string;
  relationship: string;
  percentage: number;
  is_primary: boolean;
}

interface WillGeneratorProps {
  beneficiaries: Beneficiary[];
  onGenerateWill: (willData: WillData) => void;
  onSendForSignature: (willData: WillData) => void;
  loading?: boolean;
}

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

const JURISDICTIONS = [
  { value: 'US-CA', label: 'California, USA' },
  { value: 'US-NY', label: 'New York, USA' },
  { value: 'US-TX', label: 'Texas, USA' },
  { value: 'US-FL', label: 'Florida, USA' },
  { value: 'CA-ON', label: 'Ontario, Canada' },
  { value: 'CA-BC', label: 'British Columbia, Canada' },
  { value: 'UK-EN', label: 'England & Wales' },
  { value: 'UK-SC', label: 'Scotland' },
  { value: 'AU-NSW', label: 'New South Wales, Australia' },
  { value: 'AU-VIC', label: 'Victoria, Australia' }
];

export default function WillGenerator({ 
  beneficiaries, 
  onGenerateWill, 
  onSendForSignature, 
  loading = false 
}: WillGeneratorProps) {
  const [willData, setWillData] = useState<WillData>({
    jurisdiction: '',
    testatorName: '',
    testatorAddress: '',
    executorName: '',
    executorEmail: '',
    specificBequests: '',
    residuaryClause: '',
    guardianshipClause: '',
    witnessRequirements: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const canGenerateWill = totalPercentage === 100 && beneficiaries.length > 0;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!willData.jurisdiction) newErrors.jurisdiction = 'Jurisdiction is required';
    if (!willData.testatorName.trim()) newErrors.testatorName = 'Testator name is required';
    if (!willData.testatorAddress.trim()) newErrors.testatorAddress = 'Testator address is required';
    if (!willData.executorName.trim()) newErrors.executorName = 'Executor name is required';
    if (!willData.executorEmail.trim()) {
      newErrors.executorEmail = 'Executor email is required';
    } else if (!/\S+@\S+\.\S+/.test(willData.executorEmail)) {
      newErrors.executorEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateWill = () => {
    if (validateForm()) {
      onGenerateWill(willData);
    }
  };

  const handleSendForSignature = () => {
    if (validateForm()) {
      onSendForSignature(willData);
    }
  };

  const getJurisdictionRequirements = (jurisdiction: string) => {
    const requirements: Record<string, string> = {
      'US-CA': 'Requires 2 witnesses or notarization',
      'US-NY': 'Requires 2 witnesses and notarization',
      'US-TX': 'Requires 2 witnesses or can be holographic',
      'US-FL': 'Requires 2 witnesses and notarization',
      'CA-ON': 'Requires 2 witnesses',
      'CA-BC': 'Requires 2 witnesses',
      'UK-EN': 'Requires 2 witnesses',
      'UK-SC': 'Requires 2 witnesses',
      'AU-NSW': 'Requires 2 witnesses',
      'AU-VIC': 'Requires 2 witnesses'
    };
    return requirements[jurisdiction] || 'Check local requirements';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Will & Trust Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canGenerateWill && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {beneficiaries.length === 0 
                  ? 'Add beneficiaries before generating a will.'
                  : `Beneficiary percentages must total 100% (currently ${totalPercentage}%).`
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                <Select
                  value={willData.jurisdiction}
                  onValueChange={(value) => {
                    setWillData({ 
                      ...willData, 
                      jurisdiction: value,
                      witnessRequirements: getJurisdictionRequirements(value)
                    });
                  }}
                >
                  <SelectTrigger className={errors.jurisdiction ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map((jurisdiction) => (
                      <SelectItem key={jurisdiction.value} value={jurisdiction.value}>
                        {jurisdiction.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jurisdiction && (
                  <p className="text-sm text-destructive">{errors.jurisdiction}</p>
                )}
                {willData.jurisdiction && (
                  <Badge variant="outline" className="text-xs">
                    {getJurisdictionRequirements(willData.jurisdiction)}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="testatorName">Your Full Name *</Label>
                <Input
                  id="testatorName"
                  value={willData.testatorName}
                  onChange={(e) => setWillData({ ...willData, testatorName: e.target.value })}
                  className={errors.testatorName ? 'border-destructive' : ''}
                />
                {errors.testatorName && (
                  <p className="text-sm text-destructive">{errors.testatorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="testatorAddress">Your Address *</Label>
                <Textarea
                  id="testatorAddress"
                  value={willData.testatorAddress}
                  onChange={(e) => setWillData({ ...willData, testatorAddress: e.target.value })}
                  className={errors.testatorAddress ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.testatorAddress && (
                  <p className="text-sm text-destructive">{errors.testatorAddress}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="executorName">Executor Name *</Label>
                <Input
                  id="executorName"
                  value={willData.executorName}
                  onChange={(e) => setWillData({ ...willData, executorName: e.target.value })}
                  className={errors.executorName ? 'border-destructive' : ''}
                />
                {errors.executorName && (
                  <p className="text-sm text-destructive">{errors.executorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="executorEmail">Executor Email *</Label>
                <Input
                  id="executorEmail"
                  type="email"
                  value={willData.executorEmail}
                  onChange={(e) => setWillData({ ...willData, executorEmail: e.target.value })}
                  className={errors.executorEmail ? 'border-destructive' : ''}
                />
                {errors.executorEmail && (
                  <p className="text-sm text-destructive">{errors.executorEmail}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specificBequests">Specific Bequests</Label>
                <Textarea
                  id="specificBequests"
                  placeholder="List any specific items or amounts to be given to specific people..."
                  value={willData.specificBequests}
                  onChange={(e) => setWillData({ ...willData, specificBequests: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residuaryClause">Residuary Estate Instructions</Label>
                <Textarea
                  id="residuaryClause"
                  placeholder="Instructions for the remainder of your estate after specific bequests..."
                  value={willData.residuaryClause}
                  onChange={(e) => setWillData({ ...willData, residuaryClause: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianshipClause">Guardianship (if applicable)</Label>
                <Textarea
                  id="guardianshipClause"
                  placeholder="Guardianship arrangements for minor children..."
                  value={willData.guardianshipClause}
                  onChange={(e) => setWillData({ ...willData, guardianshipClause: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Beneficiaries</h4>
                <div className="space-y-1">
                  {beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="flex justify-between text-sm">
                      <span>{beneficiary.full_name} ({beneficiary.relationship})</span>
                      <Badge variant={beneficiary.is_primary ? 'default' : 'secondary'}>
                        {beneficiary.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <CreditGuard
              operation={getCreditOperation('WILL_GENERATION')}
              onProceed={handleGenerateWill}
            >
              <Button
                disabled={!canGenerateWill || loading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Will (PDF)'}
              </Button>
            </CreditGuard>
            
            <CreditGuard
              operation={getCreditOperation('DOCUMENT_GENERATION')}
              onProceed={handleSendForSignature}
            >
              <Button
                disabled={!canGenerateWill || loading}
                variant="outline"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send for DocuSign
              </Button>
            </CreditGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}