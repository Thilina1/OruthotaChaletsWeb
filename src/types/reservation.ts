export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'Booked';

export interface Reservation {
  id: string;
  guest_id: string;
  room_id: string;
  room_title: string;
  guest_name: string;
  guest_email: string;
  id_card_number: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_cost: number;
  status: ReservationStatus;
  special_requests?: string;
  created_at?: string;
}
