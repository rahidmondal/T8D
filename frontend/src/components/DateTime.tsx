import { useEffect, useState } from 'react';

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'long' });
  const year = String(date.getFullYear());
  return `${day} - ${month} - ${year}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function DateTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right text-sm text-slate-600 dark:text-slate-400 font-medium">
      <div>{formatDate(now)}</div>
      <div className="tracking-widest">{formatTime(now)}</div>
    </div>
  );
}
