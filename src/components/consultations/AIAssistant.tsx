import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User } from 'lucide-react';
import { CreditGuard } from '@/components/credits/CreditGuard';
import { getCreditOperation } from '@/utils/creditOperations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

const QUICK_RESPONSES = [
  "How do I prepare for my consultation?",
  "What documents should I bring?",
  "Can I reschedule my appointment?",
  "What types of consultations do you offer?",
  "How much do consultations cost?"
];

export default function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your financial consultation assistant. I can help you prepare for your upcoming consultation or answer questions about our services. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simple rule-based chatbot responses
  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('prepare') || input.includes('preparation')) {
      return "To prepare for your consultation:\n\n1. Gather your financial documents (bank statements, investment accounts, insurance policies)\n2. Prepare a list of your financial goals\n3. Note any specific questions or concerns\n4. Ensure you have a stable internet connection for the video call\n\nWould you like more specific guidance for any consultation type?";
    }

    if (input.includes('documents') || input.includes('bring')) {
      return "Please gather these documents before your consultation:\n\n📄 Recent bank statements\n📊 Investment account statements\n💼 Insurance policies\n🏠 Mortgage/loan documents\n💰 Tax returns (last 2 years)\n📋 Estate planning documents\n\nYou can upload these securely through our Documents section if needed.";
    }

    if (input.includes('reschedule') || input.includes('cancel')) {
      return "You can reschedule or cancel your appointment:\n\n1. Go to your consultations list\n2. Click 'Reschedule' or 'Cancel' on your appointment\n3. Select a new time slot if rescheduling\n\nPlease note: Cancellations must be made at least 24 hours in advance to avoid fees.";
    }

    if (input.includes('types') || input.includes('services')) {
      return "We offer three types of consultations:\n\n💰 Financial Planning (60 min - $150)\n• Investment strategy\n• Retirement planning\n• Budget optimization\n\n📋 Tax Consultation (45 min - $100)\n• Tax planning strategies\n• Deduction optimization\n• Tax law updates\n\n⚖️ Legal Consultation (45 min - $200)\n• Estate planning\n• Will and trust review\n• Legal document guidance";
    }

    if (input.includes('cost') || input.includes('price') || input.includes('fee')) {
      return "Our consultation fees are:\n\n💰 Financial Planning: $150 (60 minutes)\n📋 Tax Consultation: $100 (45 minutes)\n⚖️ Legal Consultation: $200 (45 minutes)\n\nAll consultations include:\n✅ Video call session\n✅ Session recording (if requested)\n✅ Follow-up summary\n✅ Action plan recommendations";
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help you with your consultation questions. Feel free to ask about:\n\n• Consultation preparation\n• Required documents\n• Scheduling and rescheduling\n• Service types and pricing\n\nWhat would you like to know?";
    }

    if (input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with regarding your consultation? I'm here to make sure you're fully prepared.";
    }

    if (input.includes('zoom') || input.includes('video') || input.includes('call')) {
      return "Your consultation will be conducted via Zoom video call:\n\n🔗 Meeting link will be provided 24 hours before your appointment\n📱 You can join from computer, tablet, or smartphone\n🎥 Please test your camera and microphone beforehand\n🌐 Ensure stable internet connection\n\nThe meeting link will also be available in your consultation details.";
    }

    // Default response
    return "I understand you're asking about: \"" + userInput + "\"\n\nI can help you with:\n• Consultation preparation\n• Required documents\n• Scheduling questions\n• Service information\n• Technical support\n\nCould you please be more specific about what you'd like to know?";
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickResponse = (response: string) => {
    setInputText(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-80 pr-3">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-primary" />}
                    {message.sender === 'user' && <User className="h-4 w-4 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_RESPONSES.map((response, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleQuickResponse(response)}
              >
                {response}
              </Badge>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about consultations..."
              disabled={isTyping}
            />
            <CreditGuard
              operation={getCreditOperation('AI_CONSULTATION')}
              showConfirmation={false}
              onProceed={handleSendMessage}
            >
              <Button disabled={!inputText.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </CreditGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}