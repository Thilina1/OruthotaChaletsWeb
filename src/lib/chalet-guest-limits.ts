// Guest limits for a chalet room category, as set in the admin app
// (Dashboard → Chalet → Rooms: Adults / Children / Guests max).
export type ChaletGuestLimitSource = {
  max_adults?: number | null;
  max_children?: number | null;
  max_guests?: number | null;
};

export type ChaletGuestLimits = {
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
};

export function chaletGuestLimits(category?: ChaletGuestLimitSource | null): ChaletGuestLimits {
  const maxGuestsSetting = category?.max_guests != null && category.max_guests > 0 ? category.max_guests : null;
  const maxAdults = Math.max(1, Math.min(category?.max_adults ?? maxGuestsSetting ?? 4, maxGuestsSetting ?? Infinity));
  const maxChildren = Math.max(0, Math.min(category?.max_children ?? 0, maxGuestsSetting ?? Infinity));
  return {
    maxAdults,
    maxChildren,
    maxGuests: maxGuestsSetting ?? maxAdults + maxChildren,
  };
}

// Keeps adults/children within the limits; when the total is over the guest
// limit, children are reduced first (same as the admin booking form).
export function clampChaletGuests(limits: ChaletGuestLimits, adults: number, children: number) {
  const nextAdults = Math.min(Math.max(1, Math.floor(adults) || 1), limits.maxAdults);
  const nextChildren = Math.min(Math.max(0, Math.floor(children) || 0), limits.maxChildren);
  if (nextAdults + nextChildren <= limits.maxGuests) return { adults: nextAdults, children: nextChildren };
  return { adults: nextAdults, children: Math.max(0, limits.maxGuests - nextAdults) };
}

// Children still allowed after choosing this many adults.
export function maxChildrenFor(limits: ChaletGuestLimits, adults: number) {
  return Math.max(0, Math.min(limits.maxChildren, limits.maxGuests - adults));
}
