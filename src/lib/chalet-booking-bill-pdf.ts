import { format, parseISO } from 'date-fns';

// Booking confirmation PDF for a chalet booking: downloaded on the booking
// page and attached to the booking emails. Amounts are in the bill currency
// (USD for non Sri Lankan guests). It is not a tax invoice.
export type ChaletBookingBill = {
  bookingRef: string;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  nationality: string;
  // 'yyyy-MM-dd' or an already formatted date
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: 'LKR' | 'USD';
  rooms: { name: string; packageName: string; adults: number; children: number; amount: number }[];
  subtotal: number;
  promoDiscount: number;
  promoCode?: string | null;
  serviceCharge: number;
  vat: number;
  sscl: number;
  totalAmount: number;
  paymentOption: 'half' | 'full';
  paymentRequiredAmount: number;
  paymentBalanceAmount: number;
  // Whether the amount due now has been paid (online payments), and how.
  paymentStatus?: 'paid' | 'unpaid' | string | null;
  paymentMethod?: string | null;
};

const HOTEL = {
  name: 'Oruthota Chalets',
  company: 'Eco Lanka Resorts (Pvt) Ltd',
  location: 'Kandy, Sri Lanka',
  phone: '+94 812 375 396',
  email: 'inquiries@oruthotachalets.com',
  website: 'oruthotachalets.com',
};

type Rgb = [number, number, number];
const GREEN: Rgb = [40, 54, 24];
const OLIVE: Rgb = [96, 108, 56];
const CREAM: Rgb = [247, 245, 239];
const LINE: Rgb = [226, 221, 208];
const INK: Rgb = [28, 25, 23];
const MUTED: Rgb = [120, 113, 108];
const AMBER: Rgb = [188, 108, 37];

function money(value: number, currency: 'LKR' | 'USD') {
  const amount = (Math.round(Math.abs(value) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? '- ' : ''}${currency} ${amount}`;
}

function displayDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try {
      return format(parseISO(value), 'EEE, dd MMM yyyy');
    } catch {
      return value;
    }
  }
  return value;
}

export async function buildChaletBookingBillPdf(bill: ChaletBookingBill) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const left = 16;
  const right = pageWidth - 16;
  const width = right - left;
  const paid = bill.paymentStatus === 'paid';
  const totalGuests = bill.rooms.reduce((sum, room) => sum + room.adults + room.children, 0);

  const setText = (color: Rgb, size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setTextColor(...color);
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
  };
  const card = (x: number, y: number, w: number, h: number, fill: Rgb = [255, 255, 255]) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
  };

  // Header
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 38, 'F');
  setText([255, 255, 255], 20, 'bold');
  doc.text(HOTEL.name, left, 17);
  setText([212, 219, 184], 9);
  doc.text(`${HOTEL.company}  ·  ${HOTEL.location}`, left, 24);
  doc.text(`${HOTEL.phone}  ·  ${HOTEL.email}`, left, 29.5);
  setText([212, 219, 184], 8, 'bold');
  doc.text('BOOKING', right, 15, { align: 'right' });
  setText([255, 255, 255], 17, 'bold');
  doc.text('CONFIRMATION', right, 22.5, { align: 'right' });
  setText([212, 219, 184], 8.5);
  doc.text(`Issued ${bill.createdAt}`, right, 29.5, { align: 'right' });

  // Booking number + status
  let y = 46;
  card(left, y, width, 22, CREAM);
  setText(MUTED, 7.5, 'bold');
  doc.text('BOOKING NUMBER', left + 6, y + 8);
  setText(GREEN, 16, 'bold');
  doc.text(bill.bookingRef || '-', left + 6, y + 16.5);
  const status = paid
    ? (bill.paymentBalanceAmount > 0 ? 'ADVANCE PAID' : 'PAID IN FULL')
    : 'PAYMENT PENDING';
  const statusColor: Rgb = paid ? OLIVE : AMBER;
  setText([255, 255, 255], 8, 'bold');
  const statusWidth = doc.getTextWidth(status) + 10;
  doc.setFillColor(...statusColor);
  doc.roundedRect(right - 6 - statusWidth, y + 7, statusWidth, 8, 4, 4, 'F');
  doc.text(status, right - 6 - statusWidth / 2, y + 12.4, { align: 'center' });

  // Guest + stay cards
  y += 28;
  const half = (width - 6) / 2;
  const cardHeight = 45;
  card(left, y, half, cardHeight);
  card(left + half + 6, y, half, cardHeight);
  const field = (x: number, rowY: number, label: string, value: string, maxWidth: number) => {
    setText(MUTED, 7, 'bold');
    doc.text(label.toUpperCase(), x, rowY);
    setText(INK, 9.5);
    doc.text(doc.splitTextToSize(value || '-', maxWidth)[0] ?? '-', x, rowY + 4.6);
  };
  setText(GREEN, 10, 'bold');
  doc.text('Guest', left + 6, y + 8);
  field(left + 6, y + 15, 'Name', bill.guestName, half - 12);
  field(left + 6, y + 25, 'Email', bill.guestEmail, half - 12);
  field(left + 6, y + 35 - 0.4, 'Phone', bill.guestPhone, (half - 12) / 2);
  field(left + 6 + (half - 12) / 2, y + 35 - 0.4, 'Nationality', bill.nationality, (half - 12) / 2);

  const sx = left + half + 12;
  setText(GREEN, 10, 'bold');
  doc.text('Your stay', sx, y + 8);
  field(sx, y + 15, 'Check-in', displayDate(bill.checkIn), (half - 12) / 2);
  field(sx + (half - 12) / 2, y + 15, 'Check-out', displayDate(bill.checkOut), (half - 12) / 2);
  field(sx, y + 25, 'Nights', `${bill.nights} night${bill.nights === 1 ? '' : 's'}`, (half - 12) / 2);
  field(sx + (half - 12) / 2, y + 25, 'Rooms', `${bill.rooms.length} room${bill.rooms.length === 1 ? '' : 's'}`, (half - 12) / 2);
  field(sx, y + 35 - 0.4, 'Guests', `${totalGuests} guest${totalGuests === 1 ? '' : 's'}`, (half - 12) / 2);
  field(sx + (half - 12) / 2, y + 35 - 0.4, 'Payment option', bill.paymentOption === 'half' ? 'Half payment' : 'Full payment', (half - 12) / 2);

  // Rooms table
  y += cardHeight + 8;
  setText(GREEN, 10, 'bold');
  doc.text('Rooms', left, y);
  y += 3;
  doc.setFillColor(...GREEN);
  doc.roundedRect(left, y, width, 8, 1.5, 1.5, 'F');
  setText([255, 255, 255], 8, 'bold');
  doc.text('ROOM & MEAL PLAN', left + 4, y + 5.3);
  doc.text('GUESTS', 122, y + 5.3);
  doc.text('NIGHTS', 148, y + 5.3);
  doc.text('AMOUNT', right - 4, y + 5.3, { align: 'right' });
  y += 8;
  bill.rooms.forEach((room, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    if (index % 2 === 1) {
      doc.setFillColor(...CREAM);
      doc.rect(left, y, width, 12, 'F');
    }
    setText(INK, 9.5, 'bold');
    doc.text(`${index + 1}.  ${room.name}`, left + 4, y + 5);
    setText(MUTED, 8);
    doc.text(room.packageName, left + 9, y + 9.5);
    setText(INK, 9);
    doc.text(`${room.adults} adult${room.adults === 1 ? '' : 's'}${room.children ? `, ${room.children} child${room.children === 1 ? '' : 'ren'}` : ''}`, 122, y + 7);
    doc.text(String(bill.nights), 148, y + 7);
    setText(INK, 9.5, 'bold');
    doc.text(money(room.amount, bill.currency), right - 4, y + 7, { align: 'right' });
    y += 12;
  });
  doc.setDrawColor(...LINE);
  doc.line(left, y, right, y);

  // Charges (left) + payment (right)
  y += 8;
  if (y > 215) {
    doc.addPage();
    y = 20;
  }
  const chargeRows: [string, number][] = [[`Room charges (${bill.nights} night${bill.nights === 1 ? '' : 's'})`, bill.subtotal]];
  if (bill.promoDiscount > 0) chargeRows.push([`Discount${bill.promoCode ? ` (${bill.promoCode})` : ''}`, -bill.promoDiscount]);
  if (bill.serviceCharge > 0) chargeRows.push(['Service charge', bill.serviceCharge]);
  if (bill.vat > 0) chargeRows.push(['VAT', bill.vat]);
  if (bill.sscl > 0) chargeRows.push(['SSCL', bill.sscl]);
  const chargesHeight = 14 + chargeRows.length * 6.5 + 12;
  card(left, y, half, chargesHeight);
  setText(GREEN, 10, 'bold');
  doc.text('Charges', left + 6, y + 8);
  let cy = y + 15;
  chargeRows.forEach(([label, value]) => {
    setText(MUTED, 9);
    doc.text(label, left + 6, cy);
    setText(INK, 9);
    doc.text(money(value, bill.currency), left + half - 6, cy, { align: 'right' });
    cy += 6.5;
  });
  doc.setDrawColor(...LINE);
  doc.line(left + 6, cy - 2.5, left + half - 6, cy - 2.5);
  setText(INK, 10.5, 'bold');
  doc.text('Total', left + 6, cy + 4);
  doc.text(money(bill.totalAmount, bill.currency), left + half - 6, cy + 4, { align: 'right' });

  const px = left + half + 6;
  card(px, y, half, chargesHeight, CREAM);
  setText(GREEN, 10, 'bold');
  doc.text('Payment', px + 6, y + 8);
  setText(MUTED, 7, 'bold');
  doc.text((paid ? 'PAID' : 'AMOUNT DUE NOW') + (bill.paymentOption === 'half' ? ' (50%)' : ''), px + 6, y + 15);
  setText(paid ? OLIVE : AMBER, 15, 'bold');
  doc.text(money(bill.paymentRequiredAmount, bill.currency), px + 6, y + 22);
  setText(MUTED, 8.5);
  doc.text(paid ? `via ${bill.paymentMethod || 'online payment'}` : 'Not paid yet', px + 6, y + 27);
  if (bill.paymentBalanceAmount > 0) {
    setText(MUTED, 7, 'bold');
    doc.text('BALANCE DUE AT THE HOTEL', px + 6, y + 35);
    setText(INK, 12, 'bold');
    doc.text(money(bill.paymentBalanceAmount, bill.currency), px + 6, y + 41);
  } else if (paid) {
    setText(OLIVE, 9, 'bold');
    doc.text('Nothing more to pay', px + 6, y + 36);
  }

  // Notes
  y += chargesHeight + 8;
  if (y > 255) {
    doc.addPage();
    y = 20;
  }
  card(left, y, width, 20);
  setText(GREEN, 9, 'bold');
  doc.text('Good to know', left + 6, y + 7);
  setText(MUTED, 8.2);
  doc.text('Our team will contact you by email and phone to confirm your chalet details. Please keep this booking number.', left + 6, y + 12.5);
  doc.text('This is a booking confirmation, not a tax invoice. A tax invoice will be issued by the hotel.', left + 6, y + 17);

  // Footer
  doc.setDrawColor(...LINE);
  doc.line(left, 283, right, 283);
  setText(MUTED, 7.5);
  doc.text(`${HOTEL.name}  ·  ${HOTEL.phone}  ·  ${HOTEL.email}  ·  ${HOTEL.website}`, pageWidth / 2, 289, { align: 'center' });

  return doc;
}

export async function downloadChaletBookingBill(bill: ChaletBookingBill) {
  const doc = await buildChaletBookingBillPdf(bill);
  doc.save(`Oruthota-Chalets-${bill.bookingRef}.pdf`);
}

// PDF bytes for an email attachment (server side).
export async function chaletBookingBillPdfBuffer(bill: ChaletBookingBill) {
  const doc = await buildChaletBookingBillPdf(bill);
  return Buffer.from(doc.output('arraybuffer'));
}
