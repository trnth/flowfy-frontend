import {
  isToday,
  isYesterday,
  format,
  differenceInCalendarDays,
} from "date-fns";
import { vi } from "date-fns/locale";

export function formatDateForSeparator(date) {
  const d = new Date(date);

  if (isToday(d)) return `Hôm nay lúc ${format(d, "HH:mm", { locale: vi })}`;
  if (isYesterday(d))
    return `Hôm qua lúc ${format(d, "HH:mm", { locale: vi })}`;

  const diffDays = differenceInCalendarDays(new Date(), d);

  if (diffDays < 7) {
    // trong tuần gần đây
    return `${format(d, "EEEE", { locale: vi })} lúc ${format(d, "HH:mm", {
      locale: vi,
    })}`;
  }

  if (diffDays < 365) {
    // trong năm
    return `${format(d, "dd/MM", { locale: vi })} lúc ${format(d, "HH:mm", {
      locale: vi,
    })}`;
  }

  // khác năm
  return `${format(d, "dd/MM/yyyy", { locale: vi })} lúc ${format(d, "HH:mm", {
    locale: vi,
  })}`;
}
