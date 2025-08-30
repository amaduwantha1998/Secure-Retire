import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

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

interface BookingData {
  consultationType: string;
  date: Date;
  timeSlot: string;
  notes: string;
  timezone: string;
}

export function useConsultations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch consultations
  const {
    data: consultations,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as Consultation[];
    },
    enabled: !!user?.id
  });

  // Book consultation mutation
  const bookConsultationMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Combine date and time
      const dateTime = dayjs(`${bookingData.date.toISOString().split('T')[0]} ${bookingData.timeSlot}`)
        .tz(bookingData.timezone)
        .utc()
        .toISOString();

      // Create consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          date: dateTime,
          status: 'scheduled',
          notes: bookingData.notes || null
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // Generate Zoom meeting
      try {
        const { data: zoomData, error: zoomError } = await supabase.functions.invoke('create-zoom-meeting', {
          body: {
            consultation_id: consultation.id,
            topic: `${bookingData.consultationType} Consultation`,
            start_time: dateTime,
            duration: getConsultationDuration(bookingData.consultationType),
            timezone: bookingData.timezone
          }
        });

        if (!zoomError && zoomData?.join_url) {
          // Update consultation with meeting URL
          await supabase
            .from('consultations')
            .update({ meeting_url: zoomData.join_url })
            .eq('id', consultation.id);
        }
      } catch (zoomError) {
        console.warn('Failed to create Zoom meeting:', zoomError);
        // Continue without Zoom link - can be added manually later
      }

      return consultation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });

  // Reschedule consultation mutation
  const rescheduleConsultationMutation = useMutation({
    mutationFn: async ({ id, newDate, newTime, timezone }: { 
      id: string; 
      newDate: Date; 
      newTime: string; 
      timezone: string;
    }) => {
      const dateTime = dayjs(`${newDate.toISOString().split('T')[0]} ${newTime}`)
        .tz(timezone)
        .utc()
        .toISOString();

      const { data, error } = await supabase
        .from('consultations')
        .update({ 
          date: dateTime,
          status: 'rescheduled'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });

  // Cancel consultation mutation
  const cancelConsultationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('consultations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    }
  });

  // Join meeting function
  const joinMeeting = (consultation: Consultation) => {
    if (consultation.meeting_url) {
      window.open(consultation.meeting_url, '_blank');
    }
  };

  const getConsultationDuration = (type: string): number => {
    switch (type) {
      case 'financial': return 60;
      case 'tax': return 45;
      case 'legal': return 45;
      default: return 60;
    }
  };

  return {
    consultations: consultations || [],
    loading,
    error,
    bookConsultation: bookConsultationMutation.mutate,
    rescheduleConsultation: rescheduleConsultationMutation.mutate,
    cancelConsultation: cancelConsultationMutation.mutate,
    joinMeeting,
    isBooking: bookConsultationMutation.isPending,
    isRescheduling: rescheduleConsultationMutation.isPending,
    isCancelling: cancelConsultationMutation.isPending
  };
}