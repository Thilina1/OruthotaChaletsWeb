'use client';

import { Suspense } from 'react';
import ChaletBookingComponent from './chalet-booking-component';

export default function ChaletBookingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center text-muted-foreground">Loading booking details...</div>}>
      <ChaletBookingComponent />
    </Suspense>
  );
}
