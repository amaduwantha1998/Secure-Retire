import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, MessageCircle, Bot } from 'lucide-react';
import { FAQSection } from '@/components/help/FAQSection';
import { AIHelpBot } from '@/components/help/AIHelpBot';
import { LiveChatWidget } from '@/components/help/LiveChatWidget';
import { GuidedTourButton } from '@/components/help/GuidedTourButton';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">
            Get help with FAQs and live support for all your financial management needs.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <GuidedTourButton />
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <FAQSection searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="chat">
          <LiveChatWidget />
        </TabsContent>

        <TabsContent value="bot">
          <AIHelpBot />
        </TabsContent>
      </Tabs>
    </div>
  );
}