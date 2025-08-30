import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, User, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Consultation {
  id: string;
  user_id: string;
  consultant_id: string | null;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string | null;
  meeting_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ConsultationListProps {
  consultations: Consultation[];
  onJoinMeeting: (consultation: Consultation) => void;
  onReschedule: (consultation: Consultation) => void;
  onCancel: (consultation: Consultation) => void;
  loading?: boolean;
}

export default function ConsultationList({
  consultations,
  onJoinMeeting,
  onReschedule,
  onCancel,
  loading = false
}: ConsultationListProps) {
  const userTimezone = dayjs.tz.guess();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      case 'rescheduled': return 'warning';
      default: return 'secondary';
    }
  };

  const getTimeUntilMeeting = (dateStr: string) => {
    const meetingTime = dayjs(dateStr);
    const now = dayjs();
    const diffMinutes = meetingTime.diff(now, 'minutes');

    if (diffMinutes < 0) return 'Past';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  const canJoinMeeting = (consultation: Consultation) => {
    const meetingTime = dayjs(consultation.date);
    const now = dayjs();
    const diffMinutes = meetingTime.diff(now, 'minutes');
    
    return consultation.status === 'scheduled' && 
           consultation.meeting_url && 
           diffMinutes <= 15 && 
           diffMinutes >= -30; // Can join 15 min before to 30 min after
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Consultations Scheduled</h3>
          <p className="text-muted-foreground">
            Book your first consultation to get expert financial advice.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <Card key={consultation.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Badge variant={getStatusColor(consultation.status) as any}>
                    {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTimeUntilMeeting(consultation.date)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {dayjs(consultation.date).tz(userTimezone).format('MMM DD, YYYY')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dayjs(consultation.date).tz(userTimezone).format('h:mm A z')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Financial Advisor</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.consultant_id || 'To be assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Video Meeting</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.meeting_url ? 'Zoom Link Available' : 'Link Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Timezone</p>
                      <p className="text-sm text-muted-foreground">{userTimezone}</p>
                    </div>
                  </div>
                </div>

                {consultation.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {canJoinMeeting(consultation) && (
                  <Button 
                    onClick={() => onJoinMeeting(consultation)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                )}
                
                {consultation.status === 'scheduled' && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => onReschedule(consultation)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onCancel(consultation)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}