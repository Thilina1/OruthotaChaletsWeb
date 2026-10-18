// Guest limits for a chalet room category, as set in the admin app
// (Dashboard → Chalet → Rooms: Adults / Children / Guests max).
export type ChaletGuestLimitSource = {
  // Fewest adults the room is offered to (children do not count).
  min_adults?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  max_guests?: number | null;
};

export type ChaletGuestLimits = {
  minAdults: number;
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
};

export function chaletGuestLimits(category?: ChaletGuestLimitSource | null): ChaletGuestLimits {
  const maxGuestsSetting = category?.max_guests != null && category.max_guests > 0 ? category.max_guests : null;
  const maxAdults = Math.max(1, Math.min(category?.max_adults ?? maxGuestsSetting ?? 4, maxGuestsSetting ?? Infinity));
  const maxChildren = Math.max(0, Math.min(category?.max_children ?? 0, maxGuestsSetting ?? Infinity));
  return {
    minAdults: Math.max(1, Math.min(category?.min_adults ?? 1, maxAdults)),
    maxAdults,
    maxChildren,
    maxGuests: maxGuestsSetting ?? maxAdults + maxChildren,
  };
}

// Keeps adults/children within the limits; when the total is over the guest
// limit, children are reduced first (same as the admin booking form).
export function clampChaletGuests(limits: ChaletGuestLimits, adults: number, children: number) {
  const nextAdults = Math.min(Math.max(limits.minAdults, Math.floor(adults) || 1), limits.maxAdults);
  const nextChildren = Math.min(Math.max(0, Math.floor(children) || 0), limits.maxChildren);
  if (nextAdults + nextChildren <= limits.maxGuests) return { adults: nextAdults, children: nextChildren };
  return { adults: nextAdults, children: Math.max(0, limits.maxGuests - nextAdults) };
}

// Children still allowed after choosing this many adults.
export function maxChildrenFor(limits: ChaletGuestLimits, adults: number) {
  return Math.max(0, Math.min(limits.maxChildren, limits.maxGuests - adults));
}

export function guestsFitLimits(limits: ChaletGuestLimits, adults: number, children: number) {
  return adults >= limits.minAdults && adults <= limits.maxAdults && children <= limits.maxChildren && adults + children <= limits.maxGuests;
}

// A room's own limits (Dashboard → Chalet → Rooms). Any max left blank there
// uses the room category's limit instead; a blank min means no minimum.
export function roomGuestLimits(room?: ChaletGuestLimitSource | null, category?: ChaletGuestLimitSource | null): ChaletGuestLimits {
  return chaletGuestLimits({
    min_adults: room?.min_adults ?? null,
    max_adults: room?.max_adults ?? category?.max_adults ?? null,
    max_children: room?.max_children ?? category?.max_children ?? null,
    max_guests: room?.max_guests ?? category?.max_guests ?? null,
  });
}

// The largest of each limit across a room type's rooms, so the guest pickers
// allow what the biggest room takes. Whether a party fits is still checked
// room by room (guestsFitLimits), because no single room may allow every max.
export function combinedGuestLimitSource(limits: ChaletGuestLimits[]): ChaletGuestLimitSource | null {
  if (limits.length === 0) return null;
  return {
    min_adults: Math.min(...limits.map(item => item.minAdults)),
    max_adults: Math.max(...limits.map(item => item.maxAdults)),
    max_children: Math.max(...limits.map(item => item.maxChildren)),
    max_guests: Math.max(...limits.map(item => item.maxGuests)),
  };
}
