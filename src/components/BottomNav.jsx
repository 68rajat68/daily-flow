import { Home, CalendarDays, BarChart3, Settings } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { format } from "date-fns";

const tabs = [
  { key: "home", Icon: Home, label: "Home" },
  { key: "month", Icon: CalendarDays, label: "Calendar" },
  { key: "stats", Icon: BarChart3, label: "Stats" },
  { key: "settings", Icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const { screen, navigate, setSelectedDate } = useTaskStore();
  const handleTap = (key) => {
    if (key === "home") setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    navigate(key);
  };
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={"nav-item" + (screen === t.key ? " active" : "")}
          onClick={() => handleTap(t.key)}
        >
          <t.Icon />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
