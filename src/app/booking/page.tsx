'use client';

import { Suspense } from 'react';
import BookingPageComponent from './booking-component';

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 text-center">Loading booking details...</div>}>
      <BookingPageComponent />
    </Suspense>
  );
}

    