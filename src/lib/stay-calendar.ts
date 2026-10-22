// How a stay looks in the booking date calendars: the check-in and check-out
// days are solid pills (rounded on their outer side), the nights between are
// a light band, and a lone check-in (no check-out yet) is a full circle.
type Stay = { from?: Date; to?: Date } | undefined;

function dayKey(date: Date) {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

export function stayDayModifiers(stay: Stay, hoveredCheckOut?: Date) {
  const from = stay?.from ? dayKey(stay.from) : null;
  const to = stay?.to && stay.from && stay.to > stay.from ? dayKey(stay.to) : null;
  const hovered = !to && hoveredCheckOut ? dayKey(hoveredCheckOut) : null;
  return {
    stayStart: (date: Date) => from !== null && to !== null && dayKey(date) === from,
    stayEnd: (date: Date) => to !== null && dayKey(date) === to,
    stayMiddle: (date: Date) => from !== null && to !== null && dayKey(date) > from && dayKey(date) < to,
    stayOnly: (date: Date) => from !== null && to === null && dayKey(date) === from,
    // While choosing a check-out: the nights up to the hovered day.
    stayPreview: (date: Date) => from !== null && hovered !== null && dayKey(date) > from && dayKey(date) <= hovered,
  };
}

export const stayDayClassNames = {
  stayStart: '!rounded-l-full !rounded-r-none !bg-[#f39c34] !text-white',
  stayEnd: '!rounded-r-full !rounded-l-none !bg-[#f39c34] !text-white',
  stayMiddle: '!rounded-none !bg-[#f39c34]/20 !text-stone-950',
  stayOnly: '!rounded-full !bg-[#f39c34] !text-white',
  stayPreview: '!rounded-none !bg-[#f39c34]/15 !text-stone-950',
};

// The library's own selected/range looks are switched off; the stay
// modifiers above draw the selection. Cells keep a small gap between days.
export const stayCalendarDayClassNames = {
  cell: 'h-10 w-10 p-0 px-[1.5px] text-center text-sm relative',
  day_selected: '',
  day_range_start: '',
  day_range_middle: '',
  day_range_end: '',
  day_today: 'underline underline-offset-4',
};
