import { useState } from "react";
import {
  ArrowLeft,
  Sunrise,
  Sun,
  Moon,
  Briefcase,
  User,
  Heart,
  Pin,
  Timer,
  Repeat2,
} from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";

const timeSlots = [
  { key: "morning", Icon: Sunrise },
  { key: "afternoon", Icon: Sun },
  { key: "evening", Icon: Moon },
];
const categories = [
  { key: "work", Icon: Briefcase },
  { key: "personal", Icon: User },
  { key: "health", Icon: Heart },
  { key: "other", Icon: Pin },
];
const priorities = ["low", "medium", "high"];

export default function AddTaskScreen() {
  const { navigate, addTask, selectedDate } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState("medium");
  const [time, setTime] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [timerH, setTimerH] = useState(0);
  const [timerM, setTimerM] = useState(30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      timeSlot,
      category,
      priority,
      time: time || null,
      repeat: repeatDaily ? "daily" : "once",
      durationMinutes: timerOn ? timerH * 60 + timerM : null,
    };
    if (data.durationMinutes === 0) data.durationMinutes = null;
    await addTask(data);
    setSaving(false);
    navigate("home");
  };

  return (
    <div className="form-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate("home")}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Add Task</h1>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label>Task Name *</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
          />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
          />
        </div>
      </div>

      <div className="form-card">
        <h3>Time Slot</h3>
        <div className="toggle-group">
          {timeSlots.map((s) => (
            <button
              key={s.key}
              className={"toggle-btn" + (timeSlot === s.key ? " active" : "")}
              onClick={() => setTimeSlot(s.key)}
            >
              <s.Icon /> {s.key.charAt(0).toUpperCase() + s.key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Category</h3>
        <div className="toggle-group">
          {categories.map((c) => (
            <button
              key={c.key}
              className={"toggle-btn" + (category === c.key ? " active" : "")}
              onClick={() => setCategory(c.key)}
            >
              <c.Icon /> {c.key.charAt(0).toUpperCase() + c.key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Priority</h3>
        <div className="radio-group">
          {priorities.map((p) => (
            <label
              key={p}
              className={"radio-label" + (priority === p ? " active" : "")}
              onClick={() => setPriority(p)}
            >
              <span className="radio-dot"></span>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Time (optional)</h3>
        <input
          className="form-input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="form-card">
        <div className="timer-toggle-row">
          <span>
            <Repeat2 /> Daily Task
          </span>
          <div
            className={"switch" + (repeatDaily ? " on" : "")}
            onClick={() => setRepeatDaily(!repeatDaily)}
            role="switch"
            aria-checked={repeatDaily}
          ></div>
        </div>
        {repeatDaily && (
          <p className="form-hint">
            This task will show every day from the selected date.
          </p>
        )}
      </div>

      <div className="form-card">
        <div className="timer-toggle-row">
          <span>
            <Timer /> Set Timer
          </span>
          <div
            className={"switch" + (timerOn ? " on" : "")}
            onClick={() => setTimerOn(!timerOn)}
          ></div>
        </div>
        {timerOn && (
          <div className="timer-inputs">
            <div className="form-group">
              <label>Hours</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="23"
                value={timerH}
                onChange={(e) =>
                  setTimerH(Math.max(0, parseInt(e.target.value) || 0))
                }
              />
            </div>
            <span className="colon">:</span>
            <div className="form-group">
              <label>Minutes</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="59"
                value={timerM}
                onChange={(e) =>
                  setTimerM(
                    Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                  )
                }
              />
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving || !title.trim()}
        style={{ marginTop: 8 }}
      >
        {saving ? "Saving..." : "Save Task"}
      </button>
    </div>
  );
}
