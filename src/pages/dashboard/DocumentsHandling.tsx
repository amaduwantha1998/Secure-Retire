import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import html2pdf from 'html2pdf.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  Scan,
  Calendar,
  Tag,
  Filter,
  AlertCircle,
  Shield,
  FileCheck,
  Clock,
  Search,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  type: string;
  user_id: string;
  file_url: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  size_bytes: number;
  mime_type: string;
  ocr_text: string;
  renewal_date: string;
  is_template: boolean;
  tags: string[];
  encryption_key: string;
}

interface Beneficiary {
  id: string;
  full_name: string;
  relationship: string;
  percentage: number;
  contact_email: string;
  date_of_birth: string;
}

export default function DocumentsHandling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isGeneratingWill, setIsGeneratingWill] = useState(false);
  const [renewalReminders, setRenewalReminders] = useState<Document[]>([]);

  const documentTypes = [
    { value: 'will', label: 'Will', icon: '📜' },
    { value: 'deed', label: 'Property Deed', icon: '🏠' },
    { value: 'tax_return', label: 'Tax Return', icon: '📊' },
    { value: 'insurance', label: 'Insurance Policy', icon: '🛡️' },
    { value: 'investment', label: 'Investment Document', icon: '📈' },
    { value: 'bank_statement', label: 'Bank Statement', icon: '🏦' },
    { value: 'passport', label: 'Passport', icon: '📘' },
    { value: 'birth_certificate', label: 'Birth Certificate', icon: '📄' },
    { value: 'other', label: 'Other', icon: '📁' },
  ];

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user?.id,
  });

  // Fetch beneficiaries for will generation
  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data as Beneficiary[];
    },
    enabled: !!user?.id,
  });

  // Check for renewal reminders
  useEffect(() => {
    if (documents) {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const expiringSoon = documents.filter(doc => {
        if (!doc.renewal_date) return false;
        const renewalDate = new Date(doc.renewal_date);
        return renewalDate <= thirtyDaysFromNow && renewalDate >= today;
      });
      
      setRenewalReminders(expiringSoon);
    }
  }, [documents]);

  // Upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setUploadProgress(75);

      // Process OCR if it's an image or PDF
      let ocrText = '';
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        ocrText = await processOCR(file);
      }

      setUploadProgress(90);

      // Save document metadata
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user?.id,
          type: selectedDocType as 'will' | 'tax_return' | 'bank_statement' | 'other' | 'trust' | 'insurance_policy' | 'investment_statement',
          file_url: publicUrl,
          size_bytes: file.size,
          mime_type: file.type,
          ocr_text: ocrText,
          metadata: {
            original_name: file.name,
            upload_date: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (docError) throw docError;

      setUploadProgress(100);
      return docData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document uploaded successfully',
        description: 'Your document has been securely stored and processed.',
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your document. Please try again.',
        variant: 'destructive',
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // OCR processing
  const processOCR = async (file: File): Promise<string> => {
    setIsProcessingOCR(true);
    setOcrProgress(0);

    try {
      const worker = await Tesseract.createWorker('eng');
      
      worker.setParameters({
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);

      await worker.terminate();
      setIsProcessingOCR(false);
      setOcrProgress(0);
      
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      setIsProcessingOCR(false);
      setOcrProgress(0);
      return '';
    }
  };

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (document: Document) => {
      // Delete from storage
      const filePath = document.file_url.split('/').slice(-2).join('/');
      await supabase.storage.from('documents').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document deleted',
        description: 'The document has been permanently removed.',
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the document.',
        variant: 'destructive',
      });
    },
  });

  // Generate will template
  const generateWillTemplate = async () => {
    if (!beneficiaries || beneficiaries.length === 0) {
      toast({
        title: 'No beneficiaries found',
        description: 'Please add beneficiaries first to generate a will template.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingWill(true);

    try {
      const willHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 30px;">LAST WILL AND TESTAMENT</h1>
          <p><strong>I, [YOUR FULL NAME], </strong>of sound mind and disposing memory, do hereby make, publish and declare this to be my Last Will and Testament.</p>
          
          <h2>ARTICLE I - REVOCATION</h2>
          <p>I hereby revoke all former wills and codicils made by me.</p>
          
          <h2>ARTICLE II - BENEFICIARIES</h2>
          <p>I give, devise and bequeath my estate to the following beneficiaries:</p>
          <ul>
            ${beneficiaries.map(b => `
              <li><strong>${b.full_name}</strong> (${b.relationship}) - ${b.percentage}% of estate</li>
            `).join('')}
          </ul>
          
          <h2>ARTICLE III - EXECUTOR</h2>
          <p>I nominate and appoint [EXECUTOR NAME] as the Executor of this Will.</p>
          
          <h2>ARTICLE IV - SIGNATURES</h2>
          <div style="margin-top: 50px;">
            <p>Testator Signature: ___________________________ Date: ___________</p>
            <p style="margin-top: 30px;">Witness 1 Signature: ___________________________ Date: ___________</p>
            <p>Witness 2 Signature: ___________________________ Date: ___________</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is a template and should be reviewed by a qualified attorney before use.
          </p>
        </div>
      `;

      const opt = {
        margin: 1,
        filename: 'will_template.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(willHTML).save();

      toast({
        title: 'Will template generated',
        description: 'Your will template has been downloaded. Please review with an attorney.',
      });
    } catch (error) {
      console.error('Will generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'There was an error generating the will template.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingWill(false);
    }
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && selectedDocType) {
      uploadDocumentMutation.mutate(acceptedFiles[0]);
    } else if (!selectedDocType) {
      toast({
        title: 'Select document type',
        description: 'Please select a document type before uploading.',
        variant: 'destructive',
      });
    }
  }, [selectedDocType, uploadDocumentMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.metadata?.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ocr_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  if (!user) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access document management features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents Handling</h1>
        <p className="text-muted-foreground">
          Securely store, organize, and manage your important financial documents.
        </p>
      </div>

      {/* Renewal Reminders */}
      {renewalReminders.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>{renewalReminders.length} document(s)</strong> require renewal within 30 days.
            <div className="mt-2 space-y-1">
              {renewalReminders.map(doc => (
                <div key={doc.id} className="text-sm">
                  {doc.metadata?.original_name} - Due: {new Date(doc.renewal_date).toLocaleDateString()}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Securely stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((documents?.reduce((sum, doc) => sum + (doc.size_bytes || 0), 0) || 0) / 1024 / 1024)}MB
            </div>
            <p className="text-xs text-muted-foreground">Encrypted storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OCR Processed</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents?.filter(doc => doc.ocr_text).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Searchable text</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewalReminders.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload & Manage</TabsTrigger>
          <TabsTrigger value="generate">Generate Templates</TabsTrigger>
          <TabsTrigger value="search">Search & Filter</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Upload Section */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {isDragActive ? (
                    <p>Drop the file here...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, Images, DOC files (max 10MB)</p>
                    </div>
                  )}
                </div>

                {(isUploading || isProcessingOCR) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{isProcessingOCR ? 'Processing OCR...' : 'Uploading...'}</span>
                      <span>{isProcessingOCR ? ocrProgress : uploadProgress}%</span>
                    </div>
                    <Progress value={isProcessingOCR ? ocrProgress : uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Grid */}
            <div className="md:col-span-2">
              {documentsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {documentTypes.find(t => t.value === doc.type)?.icon || '📄'}
                              </span>
                              <h4 className="font-medium text-sm line-clamp-1">
                                {doc.metadata?.original_name || 'Untitled Document'}
                              </h4>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Type: {documentTypes.find(t => t.value === doc.type)?.label}</p>
                              <p>Size: {Math.round((doc.size_bytes || 0) / 1024)}KB</p>
                              <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                              {doc.renewal_date && (
                                <p className="text-orange-600">
                                  Renewal: {new Date(doc.renewal_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{doc.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteDocumentMutation.mutate(doc)}
                              disabled={deleteDocumentMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Generate Templates Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Will Template</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate a basic will template using your beneficiary information.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {beneficiaries && beneficiaries.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Beneficiaries to include:</h4>
                    <div className="space-y-2">
                      {beneficiaries.map(b => (
                        <div key={b.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{b.full_name} ({b.relationship})</span>
                          <Badge>{b.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={generateWillTemplate}
                      className="mt-4"
                      disabled={isGeneratingWill}
                    >
                      {isGeneratingWill ? 'Generating...' : 'Generate Will Template'}
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No beneficiaries found. Please add beneficiaries in the Beneficiaries section first.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Legal Notice:</strong> This is a basic template for informational purposes only. 
                    Please consult with a qualified attorney to ensure your will meets all legal requirements.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search & Filter Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search documents, OCR text, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Found {filteredDocuments.length} document(s)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}