import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, MessageSquare, Video, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConsultationList from '@/components/consultations/ConsultationList';
import BookingForm from '@/components/consultations/BookingForm';
import AIAssistant from '@/components/consultations/AIAssistant';
import { useConsultations } from '@/hooks/useConsultations';
import dayjs from 'dayjs';

interface BookingData {
  consultationType: string;
  date: Date;
  timeSlot: string;
  notes: string;
  timezone: string;
}

export default function Consultations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('consultations');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const {
    consultations,
    loading,
    bookConsultation,
    rescheduleConsultation,
    cancelConsultation,
    joinMeeting,
    isBooking,
    isRescheduling,
    isCancelling,
    error
  } = useConsultations();

  const handleBookConsultation = async (bookingData: BookingData) => {
    try {
      await bookConsultation(bookingData);
      toast({
        title: "Consultation Booked",
        description: "Your consultation has been scheduled successfully. You'll receive a confirmation email shortly.",
      });
      setIsBookingOpen(false);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinMeeting = (consultation: any) => {
    joinMeeting(consultation);
    toast({
      title: "Joining Meeting",
      description: "Opening your consultation meeting in a new tab.",
    });
  };

  const handleReschedule = async (consultation: any) => {
    // For now, just show a message - could implement a reschedule dialog
    toast({
      title: "Reschedule Request",
      description: "Please contact support to reschedule your consultation.",
    });
  };

  const handleCancel = async (consultation: any) => {
    if (window.confirm(`Are you sure you want to cancel your consultation on ${dayjs(consultation.date).format('MMM DD, YYYY')}?`)) {
      try {
        await cancelConsultation(consultation.id);
        toast({
          title: "Consultation Cancelled",
          description: "Your consultation has been cancelled.",
        });
      } catch (error) {
        toast({
          title: "Cancellation Failed",
          description: "Failed to cancel consultation. Please contact support.",
          variant: "destructive",
        });
      }
    }
  };

  // Separate consultations by status
  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && dayjs(c.date).isAfter(dayjs())
  );
  const pastConsultations = consultations.filter(c => 
    c.status === 'completed' || dayjs(c.date).isBefore(dayjs())
  );

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">
            Book expert consultations for financial planning, tax advice, and legal guidance.
          </p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to book consultations and access your appointments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">
            Book expert consultations for financial planning, tax advice, and legal guidance.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load consultations. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">
            Book expert consultations for financial planning, tax advice, and legal guidance with timezone support and video calls.
          </p>
        </div>
        <Button 
          onClick={() => setIsBookingOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Book Consultation</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="consultations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Consultations
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultations" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upcoming Consultations</h3>
                <ConsultationList
                  consultations={upcomingConsultations}
                  onJoinMeeting={handleJoinMeeting}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  loading={loading}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Past Consultations</h3>
                <ConsultationList
                  consultations={pastConsultations}
                  onJoinMeeting={handleJoinMeeting}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  loading={loading}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <AIAssistant />
        </div>
      </div>

      <BookingForm
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        onSubmit={handleBookConsultation}
        loading={isBooking}
      />
    </div>
  );
}