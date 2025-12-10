/**
 * Formats a date/time for chat messages
 * Shows: "Today 2:00 PM", "Yesterday 3:25 AM", or "Dec 9, 2024 2:00 PM"
 */
export const formatChatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format time in 12-hour format
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase().replace(/\s/g, ''); // "2:00pm" or "3:25am"
  
  // Check if today
  if (messageDate.getTime() === today.getTime()) {
    return `Today ${timeString}`;
  }
  
  // Check if yesterday
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeString}`;
  }
  
  // Check if within last 7 days - show day name
  const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.
    return `${dayName} ${timeString}`;
  }
  
  // Older than 7 days - show full date
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }); // "Dec 9" or "Dec 9, 2023"
  
  return `${formattedDate} ${timeString}`;
};

