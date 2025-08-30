import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Search } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  not_helpful: number;
  tags: string[];
}

interface FAQSectionProps {
  searchQuery: string;
}

export function FAQSection({ searchQuery }: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());

  // Mock FAQ data
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add a beneficiary to my account?',
      answer: 'To add a beneficiary, navigate to the Beneficiaries page from your dashboard. Click "Add Beneficiary" and fill in the required information including name, relationship, and percentage allocation. Make sure the total allocation equals 100%.',
      category: 'beneficiaries',
      helpful: 45,
      not_helpful: 2,
      tags: ['beneficiary', 'estate planning']
    },
    {
      id: '2',
      question: 'What investment options are available?',
      answer: 'We offer a wide range of investment options including stocks, bonds, ETFs, mutual funds, and alternative investments. You can view detailed information about each option in the Investment Settings page, including risk levels and historical performance.',
      category: 'investment',
      helpful: 38,
      not_helpful: 1,
      tags: ['investment', 'portfolio', 'options']
    },
    {
      id: '3',
      question: 'How is my data protected?',
      answer: 'We use bank-level encryption (256-bit SSL) to protect your data. All financial information is encrypted both in transit and at rest. We also offer two-factor authentication and biometric login options for additional security.',
      category: 'security',
      helpful: 52,
      not_helpful: 0,
      tags: ['security', 'privacy', 'encryption']
    },
    {
      id: '4',
      question: 'Can I schedule a consultation with a financial advisor?',
      answer: 'Yes! Go to the Consultations page and click "Book Consultation". You can choose from financial planning, tax advice, or estate planning sessions. All consultations include video calls and follow-up documentation.',
      category: 'consultations',
      helpful: 29,
      not_helpful: 3,
      tags: ['consultation', 'advisor', 'booking']
    },
    {
      id: '5',
      question: 'How do I export my financial data?',
      answer: 'You can export your data from the Profile Settings page under the Data Management tab. Select the data types you want to export and click "Export Data". This feature complies with GDPR and CCPA regulations.',
      category: 'data',
      helpful: 41,
      not_helpful: 1,
      tags: ['export', 'data', 'GDPR', 'privacy']
    }
  ];

  const categories = ['all', 'beneficiaries', 'investment', 'security', 'consultations', 'data'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVote = (faqId: string, helpful: boolean) => {
    if (votedItems.has(faqId)) return;
    
    setVotedItems(prev => new Set([...prev, faqId]));
    // In real implementation, this would update the database
    console.log(`Voted ${helpful ? 'helpful' : 'not helpful'} for FAQ ${faqId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="space-y-2">
                      <div>{faq.question}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{faq.category}</Badge>
                        {faq.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Was this helpful?
                        </div>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(faq.id, true)}
                            disabled={votedItems.has(faq.id)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {faq.helpful}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(faq.id, false)}
                            disabled={votedItems.has(faq.id)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            {faq.not_helpful}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}