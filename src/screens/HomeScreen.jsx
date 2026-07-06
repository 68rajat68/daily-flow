import { useEffect } from "react";
import { Sun, Sunrise, Moon, ArrowLeft, FileText, Plus } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { getGreeting, format } from "../utils/dateHelpers";
import TaskCard from "../components/TaskCard";
import ProgressRing from "../components/ProgressRing";

const slots = ["morning", "afternoon", "evening"];
const slotIcon = { morning: Sunrise, afternoon: Sun, evening: Moon };

export default function HomeScreen() {
  const { tasks, selectedDate, navigate, setSelectedDate, toggleComplete } =
    useTaskStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = selectedDate === today;
  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAutoComplete = (id) => {
    toggleComplete(id);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      tasks.forEach((t) => {
        if (t.timerRunning && t.durationMinutes && t.timerStartedAt) {
          const elapsed = (Date.now() - t.timerStartedAt.toMillis()) / 1000;
          if (elapsed >= t.durationMinutes * 60) toggleComplete(t.id);
        }
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [tasks]);

  const grouped = {};
  slots.forEach((s) => {
    grouped[s] = tasks.filter((t) => t.timeSlot === s);
  });

  const GreetingIcon = isToday
    ? new Date().getHours() < 12
      ? Sunrise
      : new Date().getHours() < 17
        ? Sun
        : Moon
    : Sun;

  return (
    <div>
      <div className="greeting">
        <h2>
          <GreetingIcon size={22} />{" "}
          {isToday
            ? getGreeting()
                .replace(/[\u{1F31E}\u{2600}\u{FE0F}\u{1F303}]/g, "")
                .trim()
            : "Task View"}
        </h2>
        <div className="date-text">
          {isToday
            ? format(new Date(), "EEEE, d MMM yyyy")
            : format(new Date(selectedDate + "T12:00:00"), "EEEE, d MMM yyyy")}
        </div>
        {!isToday && (
          <button className="back-today" onClick={() => setSelectedDate(today)}>
            <ArrowLeft size={14} /> Back to Today
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="progress-section">
          <div className="progress-info">
            <div className="pct">{pct}%</div>
            <div className="detail">
              {done} of {total} tasks done
            </div>
          </div>
          <ProgressRing percent={pct} />
        </div>
      )}

      {slots.map((slot) => {
        const st = grouped[slot];
        if (st.length === 0) return null;
        const SlotIcon = slotIcon[slot];
        return (
          <div key={slot}>
            <div className="section-title">
              <SlotIcon /> {slot.charAt(0).toUpperCase() + slot.slice(1)}
            </div>
            {st.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onAutoComplete={handleAutoComplete}
              />
            ))}
          </div>
        );
      })}

      {total === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <FileText />
          </div>
          <h3>No tasks planned</h3>
          <p>Tap + to add your first task</p>
        </div>
      )}

      <button className="fab" onClick={() => navigate("add")}>
        <Plus />
      </button>
    </div>
  );
}
