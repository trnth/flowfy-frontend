// hooks/useTimeAgo.js
import { useEffect, useState } from "react";
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

export function useTimeAgo(date) {
  const [timeAgo, setTimeAgo] = useState("");
  const { t } = useLanguage();
  const target = new Date(date);

  const getTime = () => {
    const now = new Date();

    const seconds = differenceInSeconds(now, target);
    const minutes = differenceInMinutes(now, target);
    const hours = differenceInHours(now, target);
    const days = differenceInDays(now, target);
    const weeks = differenceInWeeks(now, target);
    const months = differenceInMonths(now, target);
    const years = differenceInYears(now, target);

    if (seconds < 60) return t('time.justNow');
    if (minutes < 60) return t('time.minutesAgo').replace('{count}', minutes);
    if (hours < 24) return t('time.hoursAgo').replace('{count}', hours);
    if (days === 1) return t('time.yesterday');
    if (days < 7) return t('time.daysAgo').replace('{count}', days);
    if (weeks < 4) return t('time.weeksAgo').replace('{count}', weeks);
    if (months < 12) return t('time.monthsAgo').replace('{count}', months);
    return t('time.yearsAgo').replace('{count}', years);
  };

  useEffect(() => {
    setTimeAgo(getTime());

    let interval = 60000;
    const now = new Date();
    const diffSec = differenceInSeconds(now, target);

    if (diffSec < 60) interval = 1000;
    else if (diffSec < 3600) interval = 60000;
    else if (diffSec < 86400) interval = 3600000;
    else if (diffSec < 604800) interval = 86400000;
    else interval = 604800000;

    const timer = setInterval(() => setTimeAgo(getTime()), interval);
    return () => clearInterval(timer);
  }, [date, t]);

  return timeAgo;
}
