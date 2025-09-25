// utils/groupMessagesByTime.js
import { formatDateForSeparator } from "./formatDateForSeparator";
import { isSameDay } from "date-fns";

export function groupMessagesByTime(messages, { thresholdMinutes = 30 } = {}) {
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
        label: formatDateForSeparator(createdAt),
        _id: `sep-${createdAt.getTime()}`,
      });
    }

    lastMessageTime = createdAt;
  }

  return groups;
}
