import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Users } from 'lucide-react';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Intercom?: any;
    intercomSettings?: any;
  }
}

export function LiveChatWidget() {
  useEffect(() => {
    // Initialize Intercom if API key is available
    const intercomAppId = 'YOUR_INTERCOM_APP_ID'; // This would come from environment/secrets
    
    if (intercomAppId && intercomAppId !== 'YOUR_INTERCOM_APP_ID') {
      // Load Intercom script
      const script = document.createElement('script');
      script.innerHTML = `
        window.intercomSettings = {
          app_id: "${intercomAppId}",
          name: "Financial User",
          email: "user@example.com"
        };
        (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${intercomAppId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
      `;
      document.head.appendChild(script);
    }
  }, []);

  const openLiveChat = () => {
    if (window.Intercom) {
      window.Intercom('show');
    } else {
      // Fallback for when Intercom is not available
      alert('Live chat is currently unavailable. Please try again later or contact support@sunwise.com');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Live Chat Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect with our financial experts for personalized assistance. Our support team is available to help with account questions, technical issues, and financial guidance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                Average response time under 2 minutes
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Certified financial advisors available
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <MessageCircle className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-medium">24/7 Available</h3>
              <p className="text-sm text-muted-foreground">
                Support available around the clock
              </p>
            </div>
          </div>

          <Button onClick={openLiveChat} className="w-full" size="lg">
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Live Chat
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alternative Support Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Email Support</h4>
              <p className="text-sm text-muted-foreground">support@sunwise.com</p>
            </div>
            <Button variant="outline" size="sm">
              Send Email
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Phone Support</h4>
              <p className="text-sm text-muted-foreground">1-800-SUNWISE</p>
            </div>
            <Button variant="outline" size="sm">
              Call Now
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Schedule Callback</h4>
              <p className="text-sm text-muted-foreground">We'll call you back</p>
            </div>
            <Button variant="outline" size="sm">
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}