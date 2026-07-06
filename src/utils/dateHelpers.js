import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  subDays,
  parseISO,
} from "date-fns";

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning 🌞";
  if (h < 17) return "Good Afternoon ☀️";
  return "Good Evening 🌃";
}

export function getCalendarDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getDateSummary(tasks, dateStr) {
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const total = dayTasks.length;
  const done = dayTasks.filter((t) => t.isCompleted).length;
  if (total === 0) return { total: 0, done: 0, rate: -1 };
  return { total, done, rate: done / total };
}

export function calcStreak(tasks) {
  const dates = [...new Set(tasks.map((t) => t.date))].sort().reverse();
  let streak = 0;
  let check = new Date();
  for (const ds of dates) {
    const expected = format(check, "yyyy-MM-dd");
    if (ds === expected) {
      const dt = tasks.filter((t) => t.date === ds);
      if (dt.length > 0 && dt.every((t) => t.isCompleted)) {
        streak++;
        check = subDays(check, 1);
      } else break;
    } else if (ds < expected) break;
  }
  return streak;
}

export function getWeeklyTrends(tasks) {
  const weeks = {};
  tasks.forEach((t) => {
    const d = parseISO(t.date);
    const weekNum = Math.ceil(d.getDate() / 7);
    const key = "W" + weekNum;
    if (!weeks[key]) weeks[key] = { total: 0, done: 0 };
    weeks[key].total++;
    if (t.isCompleted) weeks[key].done++;
  });
  return Object.entries(weeks).map(([label, v]) => ({
    label,
    total: v.total,
    done: v.done,
    rate: v.total > 0 ? v.done / v.total : 0,
  }));
}

export function getCategoryStats(tasks) {
  const cats = {};
  tasks.forEach((t) => {
    const c = t.category || "other";
    if (!cats[c]) cats[c] = { total: 0, done: 0 };
    cats[c].total++;
    if (t.isCompleted) cats[c].done++;
  });
  return Object.entries(cats).map(([name, v]) => ({
    name,
    total: v.total,
    done: v.done,
    rate: v.total > 0 ? v.done / v.total : 0,
  }));
}

export {
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
};
