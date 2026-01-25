import { Timestamp } from "firebase/firestore";

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
  bookingDate: Timestamp;
  status: ReservationStatus;
  specialRequests?: string;
}
