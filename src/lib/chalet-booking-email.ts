import nodemailer from 'nodemailer';
import { chaletBookingBillPdfBuffer, type ChaletBookingBill } from '@/lib/chalet-booking-bill-pdf';

type EmailAttachment = {
  filename: string;
  content: Buffer;
};

type EmailPayload = {
  to: string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

type BookingEmailDetails = {
  id: string;
  bookingRef?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  nationality?: string | null;
  checkIn: string;
  checkOut: string;
  nights?: number | null;
  status: string;
  paymentStatus?: string | null;
  paymentOption?: 'half' | 'full' | string | null;
  currency?: string | null;
  ratePerNight?: number | null;
  subtotal?: number | null;
  promoDiscount?: number | null;
  totalAmount?: number | null;
  paymentRequiredAmount?: number | null;
  paymentBalanceAmount?: number | null;
  serviceCharge?: number | null;
  serviceChargePct?: number | null;
  vat?: number | null;
  vatPct?: number | null;
  sscl?: number | null;
  ssclPct?: number | null;
  refundAmount?: number | null;
  refundServiceChargeRetained?: number | null;
  refundNotes?: string | null;
  // For the booking confirmation PDF attached to the booking emails.
  rooms?: ChaletBookingBill['rooms'] | null;
  promoCode?: string | null;
  paymentMethod?: string | null;
};

const HOTEL = {
  name: 'Oruthota Chalets',
  tagline: 'The Aura of Tranquility',
  address: 'Rajawella, Digana, Kandy, Sri Lanka',
  phone: '+94 812 375 396',
  mobile: '+94 77 634 7922',
  email: 'inquiries@oruthotachalets.com',
  website: 'https://oruthotachalets.com',
};

function resolveCurrency(details: BookingEmailDetails): 'LKR' | 'USD' {
  if (details.currency === 'USD' || details.currency === 'LKR') return details.currency;
  return details.nationality === 'Non Sri Lankan' ? 'USD' : 'LKR';
}

function money(value?: number | null, currency: 'LKR' | 'USD' = 'LKR') {
  if (value == null) return 'Not available';
  return `${currency} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function getSiteOrigin() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || HOTEL.website;
  return origin.startsWith('http') ? origin : `https://${origin}`;
}

function escapeHtml(value?: string | number | null) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAdminRecipients() {
  return (process.env.BOOKING_ADMIN_EMAIL || process.env.MAIL_FROM || 'inquiries@oruthotachalets.com')
    .split(',')
    .map(email => email.trim())
    .filter(Boolean);
}

async function sendEmail(payload: EmailPayload) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || (gmailUser ? `Oruthota Chalets <${gmailUser}>` : 'Oruthota Chalets <inquiries@oruthotachalets.com>');

  if (gmailUser && gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments?.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: 'application/pdf',
      })),
    });

    return { skipped: false };
  }

  if (!apiKey) {
    console.warn('Email skipped: Gmail SMTP or RESEND_API_KEY is not configured.', {
      subject: payload.subject,
      to: payload.to,
    });
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments?.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content.toString('base64'),
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email send failed: ${text}`);
  }

  return { skipped: false };
}

function detailRow(label: string, value?: string | number | null) {
  return `
    <tr>
      <td style="padding:10px 0;color:#6b6258;font-size:13px;border-bottom:1px solid #eee8df">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#1c1917;font-size:13px;font-weight:700;text-align:right;border-bottom:1px solid #eee8df">${escapeHtml(value || 'Not provided')}</td>
    </tr>
  `;
}

function billRow(label: string, value?: number | null, currency: 'LKR' | 'USD' = 'LKR', strong = false) {
  return `
    <tr>
      <td style="padding:${strong ? '14px 0' : '9px 0'};color:${strong ? '#1c1917' : '#6b6258'};font-size:${strong ? '16px' : '13px'};font-weight:${strong ? '800' : '500'};border-bottom:1px solid #eee8df">${escapeHtml(label)}</td>
      <td style="padding:${strong ? '14px 0' : '9px 0'};color:${strong ? '#102a5c' : '#1c1917'};font-size:${strong ? '17px' : '13px'};font-weight:${strong ? '900' : '700'};text-align:right;border-bottom:1px solid #eee8df">${escapeHtml(money(value, currency))}</td>
    </tr>
  `;
}

function bookingRows(details: BookingEmailDetails) {
  const currency = resolveCurrency(details);
  return `
    ${detailRow('Booking reference', details.bookingRef || details.id)}
    ${detailRow('Guest name', details.customerName)}
    ${detailRow('Email', details.customerEmail || 'Not provided')}
    ${detailRow('Mobile number', details.customerPhone || 'Not provided')}
    ${detailRow('Nationality / rate type', details.nationality || (currency === 'USD' ? 'Non Sri Lankan' : 'Sri Lankan'))}
    ${detailRow('Billing currency', currency === 'USD' ? 'USD - foreign guest rate' : 'LKR - local guest rate')}
    ${detailRow('Check-in', details.checkIn)}
    ${detailRow('Check-out', details.checkOut)}
    ${detailRow('No. of nights', details.nights ?? 'Not provided')}
    ${detailRow('Booking status', details.status)}
    ${detailRow('Payment status', details.paymentStatus || 'unpaid')}
    ${detailRow('Payment option', details.paymentOption === 'half' ? 'Half payment' : 'Full payment')}
  `;
}

function billRows(details: BookingEmailDetails) {
  const currency = resolveCurrency(details);
  const serviceChargeLabel = details.serviceChargePct != null ? `Service charge (${details.serviceChargePct}%)` : 'Service charge';
  const vatLabel = details.vatPct != null ? `VAT (${details.vatPct}%)` : 'VAT';
  const ssclLabel = details.ssclPct != null ? `SSCL (${details.ssclPct}%)` : 'SSCL';
  return `
    ${billRow('Rate per night', details.ratePerNight, currency)}
    ${billRow('Room subtotal', details.subtotal, currency)}
    ${details.promoDiscount ? billRow('Promo discount', -Math.abs(details.promoDiscount), currency) : ''}
    ${details.serviceCharge ? billRow(serviceChargeLabel, details.serviceCharge, currency) : ''}
    ${details.vat ? billRow(vatLabel, details.vat, currency) : ''}
    ${details.sscl ? billRow(ssclLabel, details.sscl, currency) : ''}
    ${billRow('Grand total', details.totalAmount, currency, true)}
    ${billRow(details.paymentStatus === 'paid' ? 'Amount paid' : 'Amount payable now', details.paymentRequiredAmount, currency, true)}
    ${billRow('Balance payable at hotel', details.paymentBalanceAmount, currency)}
  `;
}

function emailShell(title: string, intro: string, body: string) {
  const siteOrigin = getSiteOrigin();
  const logoUrl = `${siteOrigin}/IMG_8148.PNG`;
  return `
    <div style="margin:0;padding:0;background:#f5f1ea;font-family:Arial,Helvetica,sans-serif;color:#1c1917;line-height:1.5">
      <div style="max-width:720px;margin:0 auto;padding:24px 14px">
        <div style="background:#ffffff;border:1px solid #e7dccd">
          <div style="background:#283618;padding:26px 28px;color:#ffffff">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="vertical-align:middle">
                  <img src="${logoUrl}" alt="${HOTEL.name}" width="88" style="display:block;max-width:88px;height:auto" />
                </td>
                <td style="vertical-align:middle;text-align:right">
                  <div style="font-size:22px;font-weight:800;letter-spacing:.3px">${HOTEL.name}</div>
                  <div style="font-size:13px;opacity:.86">${HOTEL.tagline}</div>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:28px">
            <div style="display:inline-block;background:#eef3e5;color:#283618;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:7px 10px;margin-bottom:14px">Booking notice</div>
            <h1 style="margin:0 0 8px;font-size:26px;line-height:1.2;color:#102a5c">${escapeHtml(title)}</h1>
            <p style="margin:0 0 22px;color:#5c554e;font-size:15px">${escapeHtml(intro)}</p>
            ${body}
          </div>

          <div style="background:#fbf8f3;border-top:1px solid #e7dccd;padding:22px 28px">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size:13px;color:#5c554e;vertical-align:top">
                  <strong style="color:#1c1917">${HOTEL.name}</strong><br />
                  ${HOTEL.address}<br />
                  Website: <a href="${HOTEL.website}" style="color:#102a5c;text-decoration:none">${HOTEL.website}</a>
                </td>
                <td style="font-size:13px;color:#5c554e;text-align:right;vertical-align:top">
                  Tel: <a href="tel:${HOTEL.phone.replace(/\s/g, '')}" style="color:#102a5c;text-decoration:none">${HOTEL.phone}</a><br />
                  Mobile / WhatsApp: <a href="tel:${HOTEL.mobile.replace(/\s/g, '')}" style="color:#102a5c;text-decoration:none">${HOTEL.mobile}</a><br />
                  Email: <a href="mailto:${HOTEL.email}" style="color:#102a5c;text-decoration:none">${HOTEL.email}</a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bookingSummaryCard(details: BookingEmailDetails) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="vertical-align:top;width:50%;padding-right:12px">
          <h2 style="margin:0 0 10px;font-size:16px;color:#283618">Guest and Stay Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${bookingRows(details)}</table>
        </td>
        <td style="vertical-align:top;width:50%;padding-left:12px">
          <h2 style="margin:0 0 10px;font-size:16px;color:#283618">Standard Bill Summary</h2>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${billRows(details)}</table>
        </td>
      </tr>
    </table>
  `;
}

// Sends one email and logs a failure instead of throwing, so one failed email
// (e.g. to the hotel) does not stop the other (to the guest).
async function sendEmailSafely(label: string, payload: EmailPayload) {
  try {
    const result = await sendEmail(payload);
    return { label, sent: !result?.skipped };
  } catch (error) {
    console.error(`Chalet ${label} email failed:`, error);
    return { label, sent: false };
  }
}

// Booking confirmation PDF for the booking emails. A failure here only means
// the emails go out without the attachment.
async function bookingConfirmationAttachment(details: BookingEmailDetails): Promise<EmailAttachment[]> {
  try {
    const bookingNumber = details.bookingRef || details.id;
    const currency = details.currency === 'USD' ? 'USD' : 'LKR';
    const content = await chaletBookingBillPdfBuffer({
      bookingRef: bookingNumber,
      createdAt: new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Colombo', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
      }).format(new Date()),
      guestName: details.customerName,
      guestEmail: details.customerEmail || '',
      guestPhone: details.customerPhone || '',
      nationality: details.nationality || '',
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      nights: Number(details.nights || 0),
      currency,
      rooms: details.rooms ?? [],
      subtotal: Number(details.subtotal || 0),
      promoDiscount: Number(details.promoDiscount || 0),
      promoCode: details.promoCode ?? null,
      serviceCharge: Number(details.serviceCharge || 0),
      vat: Number(details.vat || 0),
      sscl: Number(details.sscl || 0),
      totalAmount: Number(details.totalAmount || 0),
      paymentOption: details.paymentOption === 'half' ? 'half' : 'full',
      paymentRequiredAmount: Number(details.paymentRequiredAmount || 0),
      paymentBalanceAmount: Number(details.paymentBalanceAmount || 0),
      paymentStatus: details.paymentStatus ?? null,
      paymentMethod: details.paymentMethod ?? null,
    });
    return [{ filename: `Oruthota-Chalets-Booking-${bookingNumber}.pdf`, content }];
  } catch (error) {
    console.error('Booking confirmation PDF failed:', error);
    return [];
  }
}

export async function sendBookingRequestEmails(details: BookingEmailDetails) {
  const adminRecipients = getAdminRecipients();
  const attachments = await bookingConfirmationAttachment(details);
  const paid = details.paymentStatus === 'paid';
  const bookingNumber = details.bookingRef || details.id;
  const html = emailShell(
    paid ? 'New chalet booking - paid online' : 'New chalet booking request',
    paid
      ? `A guest booked and paid online. Booking ${bookingNumber}. Please assign chalets and confirm the booking.`
      : 'A guest has submitted a chalet booking request. Please review availability, payment status, and guest details before confirming.',
    `
      ${bookingSummaryCard(details)}
      <div style="margin-top:24px;padding:16px;background:#f5f1ea;border-left:4px solid #102a5c;color:#4b453f;font-size:14px">
        ${paid
          ? 'The payment was received online through PayHere. Chalets are not assigned yet.'
          : 'This request is not fully guaranteed until the hotel confirms availability and payment.'}
      </div>
      <p style="margin:24px 0 0">
        <a href="${getSiteOrigin()}/dashboard/chalet/bookings" style="display:inline-block;background:#102a5c;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:800">Open booking dashboard</a>
      </p>
    `,
  );

  const results = [await sendEmailSafely('booking (hotel)', {
    to: adminRecipients,
    subject: paid
      ? `New paid chalet booking ${bookingNumber} - ${details.customerName}`
      : `New chalet booking request - ${details.customerName}`,
    html,
    attachments,
  })];

  if (details.customerEmail) {
    results.push(await sendEmailSafely('booking (guest)', {
      to: [details.customerEmail],
      subject: paid
        ? `Your Oruthota Chalets booking ${bookingNumber} - payment received`
        : 'We received your Oruthota Chalets booking request',
      html: emailShell(
        paid ? 'Payment received - booking placed' : 'Booking request received',
        paid
          ? `Thank you for choosing Oruthota Chalets. We received your payment and your booking ${bookingNumber} is placed. Our reservations team will contact you shortly with your chalet details.`
          : 'Thank you for choosing Oruthota Chalets. We received your request and our reservations team will contact you shortly to confirm availability and payment.',
        `
          ${bookingSummaryCard(details)}
          <div style="margin-top:24px;padding:16px;background:#f5f1ea;border-left:4px solid #283618;color:#4b453f;font-size:14px">
            ${attachments.length ? 'Your booking confirmation is attached as a PDF. ' : ''}Please keep this email for your records. For urgent changes, contact us by phone or WhatsApp using the numbers below.
          </div>
        `,
      ),
      attachments,
    }));
  }
  return results;
}

export async function sendBookingConfirmedEmails(details: BookingEmailDetails) {
  const recipients = [...getAdminRecipients(), ...(details.customerEmail ? [details.customerEmail] : [])];
  await sendEmail({
    to: recipients,
    subject: `Booking confirmed - ${details.customerName}`,
    html: emailShell(
      'Booking confirmed',
      'Your booking is now confirmed. We look forward to welcoming you to Oruthota Chalets.',
      bookingSummaryCard(details),
    ),
  });
}

export async function sendBookingRefundEmails(details: BookingEmailDetails) {
  const currency = resolveCurrency(details);
  const recipients = [...getAdminRecipients(), ...(details.customerEmail ? [details.customerEmail] : [])];
  await sendEmail({
    to: recipients,
    subject: `Booking refund processed - ${details.customerName}`,
    html: emailShell(
      'Refund processed',
      'The booking has been cancelled and refund details were recorded. Service charges are retained and not returned.',
      `
        ${bookingSummaryCard(details)}
        <h2 style="margin:24px 0 10px;font-size:16px;color:#283618">Refund Summary</h2>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${billRow('Refund amount', details.refundAmount, currency, true)}
          ${billRow('Service charge retained', details.refundServiceChargeRetained, currency)}
          ${detailRow('Refund notes', details.refundNotes || 'None')}
        </table>
      `,
    ),
  });
}
