'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Clock, Users, Calendar, Send, Utensils, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEAL_TYPES = [
  { label: 'Breakfast', time: '07:30 AM – 10:00 AM', icon: '🌅' },
  { label: 'Lunch', time: '12:30 PM – 03:00 PM', icon: '☀️' },
  { label: 'High Tea', time: '03:00 PM – 05:00 PM', icon: '🍵' },
  { label: 'Dinner', time: '07:30 PM – 10:30 PM', icon: '🌙' },
];

interface TableBookingModalProps {
  open: boolean;
  onClose: () => void;
}

export function TableBookingModal({ open, onClose }: TableBookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMeal) {
      toast({ variant: 'destructive', title: 'Please select a meal type.' });
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      date: formData.get('date') as string,
      meal_type: selectedMeal,
      guests: parseInt(formData.get('guests') as string, 10) || 2,
    };

    const phone = formData.get('phone') as string;
    const comments = formData.get('comments') as string;
    if (phone) data.phone = phone;
    if (comments) data.comments = comments;

    try {
      const { error } = await supabase.from('table_bookings').insert([data]);
      if (error) throw error;

      toast({
        title: '🍽️ Table Reserved!',
        description: `We'll confirm your ${selectedMeal} reservation shortly.`,
      });
      (e.target as HTMLFormElement).reset();
      setSelectedMeal('');
      onClose();
    } catch (error: any) {
      console.warn('Table booking error:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error?.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        <DialogTitle className="sr-only">Book a Buffet – in Oruthota Chalets</DialogTitle>

        <div className="flex flex-col max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="relative bg-[#283618] px-8 py-10 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <Utensils className="w-5 h-5 text-[#DDA15E]" />
              <span className="text-xs tracking-[0.25em] text-[#DDA15E] font-bold uppercase">Oruthota Chalets</span>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl text-white">Book a Buffet</h2>
            <p className="text-white/70 mt-2 text-sm leading-relaxed">
              Reserve your spot at our scenic Al Fresco dining experience.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Meal Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[#283618]">Select Meal <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MEAL_TYPES.map((meal) => (
                  <button
                    key={meal.label}
                    type="button"
                    onClick={() => setSelectedMeal(meal.label)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200',
                      selectedMeal === meal.label
                        ? 'border-[#606C38] bg-[#606C38]/10 text-[#283618]'
                        : 'border-stone-200 hover:border-[#606C38]/40 text-muted-foreground'
                    )}
                  >
                    <span className="text-xl">{meal.icon}</span>
                    <span className="text-xs font-bold tracking-wide">{meal.label}</span>
                    <span className="text-[10px] leading-tight opacity-70">{meal.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Guests */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-[#283618] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date" name="date" type="date"
                  min={today}
                  required
                  className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests" className="text-sm font-semibold text-[#283618] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Guests <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guests" name="guests" type="number"
                  min={1} max={20} defaultValue={2}
                  required
                  className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]"
                />
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-[#283618]">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="John Doe" required className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-[#283618]">Email <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-[#283618]">
                Phone <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input id="phone" name="phone" type="tel" placeholder="+94 77 123 4567" className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-semibold text-[#283618]">
                Special Requests / Comments <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Textarea
                id="comments" name="comments"
                placeholder="Dietary requirements, seating preferences, special occasions..."
                className="min-h-[100px] rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38] resize-none"
              />
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground bg-stone-50 rounded-xl p-4 leading-relaxed">
              📱 You may also reach our reservations team via{' '}
              <a href="https://wa.me/94776347922" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold hover:underline">
                WhatsApp
              </a>{' '}
              for instant confirmation.
            </p>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 bg-[#283618] hover:bg-[#3a4e22] text-white rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 py-4"
            >
              {isSubmitting ? 'Reserving...' : <><Send className="w-4 h-4" /> Confirm Reservation</>}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
