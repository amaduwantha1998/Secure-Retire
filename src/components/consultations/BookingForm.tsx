import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, FileText, Scale, Video } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (bookingData: BookingData) => void;
  loading?: boolean;
}

interface BookingData {
  consultationType: string;
  date: Date;
  timeSlot: string;
  notes: string;
  timezone: string;
}

const CONSULTATION_TYPES = [
  {
    id: 'financial',
    name: 'Financial Planning',
    description: 'Comprehensive financial planning and investment advice',
    duration: 60,
    price: 150,
    icon: DollarSign
  },
  {
    id: 'tax',
    name: 'Tax Consultation', 
    description: 'Tax planning and optimization strategies',
    duration: 45,
    price: 100,
    icon: FileText
  },
  {
    id: 'legal',
    name: 'Legal Consultation',
    description: 'Estate planning and legal document review',
    duration: 45,
    price: 200,
    icon: Scale
  }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
];

export default function BookingForm({ open, onOpenChange, onSubmit, loading = false }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const userTimezone = dayjs.tz.guess();

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !selectedType) return;

    const bookingData: BookingData = {
      consultationType: selectedType,
      date: selectedDate,
      timeSlot: selectedTime,
      notes,
      timezone: userTimezone
    };

    onSubmit(bookingData);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const selectedConsultation = CONSULTATION_TYPES.find(type => type.id === selectedType);

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    
    return date >= today && date <= maxDate && date.getDay() !== 0 && date.getDay() !== 6;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Consultation</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Choose Consultation Type</h3>
            <div className="grid gap-4">
              {CONSULTATION_TYPES.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-colors ${
                    selectedType === type.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <type.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {type.duration} min
                          </Badge>
                          <Badge variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${type.price}
                          </Badge>
                          <Badge variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Video Call
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button 
              onClick={() => setStep(2)} 
              disabled={!selectedType}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date & Time</h3>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>

            {selectedConsultation && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <selectedConsultation.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedConsultation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.duration} minutes • ${selectedConsultation.price}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => !isDateAvailable(date)}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Select Time</Label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      disabled={!selectedDate}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                
                {selectedDate && selectedTime && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Selected Time:</p>
                    <p className="text-sm">
                      {dayjs(`${selectedDate.toISOString().split('T')[0]} ${selectedTime}`)
                        .tz(userTimezone)
                        .format('MMM DD, YYYY at h:mm A z')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={() => setStep(3)} 
              disabled={!selectedDate || !selectedTime}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific topics you'd like to discuss or questions you have..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{selectedConsultation?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{selectedConsultation?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span>
                        {selectedDate && selectedTime && 
                          dayjs(`${selectedDate.toISOString().split('T')[0]} ${selectedTime}`)
                            .tz(userTimezone)
                            .format('MMM DD, YYYY at h:mm A z')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedConsultation?.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}