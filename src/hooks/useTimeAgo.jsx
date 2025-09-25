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

export function useTimeAgo(date) {
  const [timeAgo, setTimeAgo] = useState("");
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

    if (seconds < 60) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày`;
    if (weeks < 4) return `${weeks} tuần`;
    if (months < 12) return `${months} tháng`;
    return `${years} năm`;
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
  }, [date]);

  return timeAgo;
}
