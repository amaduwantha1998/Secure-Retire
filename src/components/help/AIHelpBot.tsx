import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Lightbulb } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function AIHelpBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI financial assistant. I can help you with account questions, explain features, and guide you through common tasks. What would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'How do I add a beneficiary?',
        'What investment options do you offer?',
        'How do I schedule a consultation?',
        'Explain retirement planning'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];

    if (lowerMessage.includes('beneficiary') || lowerMessage.includes('beneficiaries')) {
      response = 'To add a beneficiary: 1) Go to the Beneficiaries page, 2) Click "Add Beneficiary", 3) Fill in their details and percentage allocation. Remember, total allocations must equal 100%. You can also generate wills and legal documents from this page.';
      suggestions = ['Generate a will', 'Edit existing beneficiary', 'What is primary beneficiary?'];
    } else if (lowerMessage.includes('investment') || lowerMessage.includes('portfolio')) {
      response = 'Our investment options include stocks, bonds, ETFs, mutual funds, and alternative investments. You can view detailed analysis in Investment Settings, set up automatic rebalancing, and get AI-powered recommendations based on your risk profile.';
      suggestions = ['Show my portfolio', 'Risk assessment', 'Rebalancing options'];
    } else if (lowerMessage.includes('consultation') || lowerMessage.includes('advisor')) {
      response = 'You can book consultations for financial planning, tax advice, or estate planning. Go to Consultations page, select your preferred time, and choose between video or phone calls. All sessions include follow-up documentation.';
      suggestions = ['Book consultation now', 'View upcoming appointments', 'Cancel appointment'];
    } else if (lowerMessage.includes('retirement') || lowerMessage.includes('retire')) {
      response = 'Our retirement calculator helps you plan for the future. Input your current savings, desired retirement age, and target income. We\'ll show projections and suggest optimal contribution strategies for 401(k), IRA, and other accounts.';
      suggestions = ['Open retirement calculator', 'Update retirement goals', 'Tax implications'];
    } else if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
      response = 'Your security is our priority. We use 256-bit SSL encryption, offer 2FA and biometric login, and never store sensitive data unencrypted. You can review and update security settings in your profile.';
      suggestions = ['Enable 2FA', 'Privacy settings', 'Data export options'];
    } else {
      response = 'I can help you with account management, investment planning, beneficiary setup, consultations, and security settings. Could you be more specific about what you\'d like to know?';
      suggestions = ['Account overview', 'Investment help', 'Security questions', 'Tutorial videos'];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const botResponse = generateBotResponse(inputMessage);

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Financial Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your financial account..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}