// utils/groupMessagesByTime.js
import {
  isToday,
  isYesterday,
  format,
  differenceInCalendarDays,
  isSameDay,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";

function formatDateForSeparator(date, locale = 'vi') {
  const d = new Date(date);
  const currentLocale = locale === 'vi' ? vi : enUS;

  if (isToday(d)) {
    return locale === 'vi' 
      ? `Hôm nay lúc ${format(d, "HH:mm", { locale: currentLocale })}`
      : `Today at ${format(d, "HH:mm", { locale: currentLocale })}`;
  }
  
  if (isYesterday(d)) {
    return locale === 'vi'
      ? `Hôm qua lúc ${format(d, "HH:mm", { locale: currentLocale })}`
      : `Yesterday at ${format(d, "HH:mm", { locale: currentLocale })}`;
  }

  const diffDays = differenceInCalendarDays(new Date(), d);

  if (diffDays < 7) {
    // trong tuần gần đây
    return locale === 'vi'
      ? `${format(d, "EEEE", { locale: currentLocale })} lúc ${format(d, "HH:mm", { locale: currentLocale })}`
      : `${format(d, "EEEE", { locale: currentLocale })} at ${format(d, "HH:mm", { locale: currentLocale })}`;
  }

  if (diffDays < 365) {
    // trong năm
    return locale === 'vi'
      ? `${format(d, "dd/MM", { locale: currentLocale })} lúc ${format(d, "HH:mm", { locale: currentLocale })}`
      : `${format(d, "MM/dd", { locale: currentLocale })} at ${format(d, "HH:mm", { locale: currentLocale })}`;
  }

  // khác năm
  return locale === 'vi'
    ? `${format(d, "dd/MM/yyyy", { locale: currentLocale })} lúc ${format(d, "HH:mm", { locale: currentLocale })}`
    : `${format(d, "MM/dd/yyyy", { locale: currentLocale })} at ${format(d, "HH:mm", { locale: currentLocale })}`;
}

export function groupMessagesByTime(messages, { thresholdMinutes = 30, locale = 'vi' } = {}) {
  if (!messages || messages.length === 0) return [];

  const groups = [];
  const threshold = thresholdMinutes * 60 * 1000;

  const firstTime = new Date(messages[0].createdAt).getTime();
  const lastTime = new Date(messages[messages.length - 1].createdAt).getTime();
  const descending = firstTime > lastTime;

  let lastMessageTime = null;

  for (const msg of messages) {
    const createdAt = new Date(msg.createdAt);

    let needSeparator = false;
    if (!lastMessageTime) {
      needSeparator = true;
    } else {
      const diff = descending
        ? lastMessageTime.getTime() - createdAt.getTime()
        : createdAt.getTime() - lastMessageTime.getTime();

      if (!isSameDay(createdAt, lastMessageTime) || diff > threshold) {
        needSeparator = true;
      }
    }

    groups.push({ type: "message", ...msg });

    if (needSeparator) {
      groups.push({
        type: "separator",
        label: formatDateForSeparator(createdAt, locale),
        _id: `sep-${createdAt.getTime()}`,
      });
    }

    lastMessageTime = createdAt;
  }

  return groups;
}
