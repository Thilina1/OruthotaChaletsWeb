export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'Booked';

export interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  roomTitle: string;
  guestName: string;
  guestEmail: string;
  idCardNumber: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalCost: number;
  bookingDate: string;
  status: ReservationStatus;
  specialRequests?: string;
}
