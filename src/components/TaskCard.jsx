import { useState, useEffect } from "react";
import {
  Check,
  Briefcase,
  User,
  Heart,
  Pin,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Repeat2,
} from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import ConfirmModal from "./ConfirmModal";

function fmtSec(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => (n < 10 ? "0" + n : "" + n);
  return h > 0 ? h + ":" + p(m) + ":" + p(sec) : p(m) + ":" + p(sec);
}

function fmtDur(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  return m + "m";
}

const catMap = {
  work: "badge-work",
  personal: "badge-personal",
  health: "badge-health",
  other: "badge-other",
};
const catIcon = { work: Briefcase, personal: User, health: Heart, other: Pin };

export default function TaskCard({ task, onAutoComplete }) {
  const { toggleComplete, deleteTask, startTimer, pauseTimer, resetTimer } =
    useTaskStore();
  const [remaining, setRemaining] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const CatIcon = catIcon[task.category] || Pin;

  useEffect(() => {
    if (!task.durationMinutes) return;
    if (task.timerRunning && task.timerStartedAt) {
      const calc = () => {
        const elapsed = Math.floor(
          (Date.now() - task.timerStartedAt.toMillis()) / 1000,
        );
        const rem = task.durationMinutes * 60 - elapsed;
        setRemaining(rem);
        if (rem <= 0) onAutoComplete(task.id);
      };
      calc();
      const iv = setInterval(calc, 1000);
      return () => clearInterval(iv);
    } else if (task.timerPausedRemaining != null) {
      setRemaining(task.timerPausedRemaining);
    } else {
      setRemaining(task.durationMinutes * 60);
    }
  }, [
    task.timerRunning,
    task.timerStartedAt,
    task.timerPausedRemaining,
    task.durationMinutes,
  ]);

  const hasTimer = task.durationMinutes && task.durationMinutes > 0;
  const totalSec = task.durationMinutes * 60;
  const progress =
    hasTimer && totalSec > 0
      ? Math.min(100, ((totalSec - remaining) / totalSec) * 100)
      : 0;

  return (
    <div
      className={
        "task-card" +
        (task.isCompleted ? " completed" : "") +
        " priority-" +
        (task.priority || "medium")
      }
    >
      <div className="task-top">
        <div
          className="task-check"
          onClick={() => !task.timerRunning && toggleComplete(task.id)}
        >
          {task.isCompleted && <Check />}
        </div>
        <div className="task-body">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            <span
              className={
                "task-badge " + (catMap[task.category] || "badge-other")
              }
            >
              <CatIcon /> {task.category || "other"}
            </span>
            {task.time && (
              <span className="task-time">
                <Clock /> {task.time}
              </span>
            )}
            {task.repeat === "daily" && (
              <span className="task-badge badge-daily">
                <Repeat2 /> daily
              </span>
            )}
            {hasTimer &&
              !task.timerRunning &&
              !(task.timerPausedRemaining > 0) &&
              !task.isCompleted && (
                <span className="task-time">
                  <Clock size={12} /> {fmtDur(task.durationMinutes)}
                </span>
              )}
          </div>
          {hasTimer && !task.isCompleted && (
            <div className="timer-section">
              <div className="timer-row">
                <span
                  className={
                    "timer-display" + (task.timerRunning ? " running" : "")
                  }
                >
                  {fmtSec(remaining)}
                </span>
                {!task.timerRunning && !(task.timerPausedRemaining > 0) && (
                  <button
                    className="timer-btn timer-btn-play"
                    onClick={() => startTimer(task.id)}
                  >
                    <Play /> Start
                  </button>
                )}
                {task.timerRunning && (
                  <button
                    className="timer-btn timer-btn-pause"
                    onClick={() => pauseTimer(task.id)}
                  >
                    <Pause /> Pause
                  </button>
                )}
                {!task.timerRunning && task.timerPausedRemaining > 0 && (
                  <>
                    <button
                      className="timer-btn timer-btn-play"
                      onClick={() => startTimer(task.id)}
                    >
                      <Play /> Resume
                    </button>
                    <button
                      className="timer-btn timer-btn-reset"
                      onClick={() => resetTimer(task.id)}
                    >
                      <RotateCcw />
                    </button>
                  </>
                )}
              </div>
              {(task.timerRunning || task.timerPausedRemaining > 0) && (
                <div className="timer-bar">
                  <div
                    className="timer-bar-fill"
                    style={{ width: progress + "%" }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
        <button className="task-delete" onClick={() => setConfirmDelete(true)}>
          <Trash2 />
        </button>
      </div>
      <ConfirmModal
        open={confirmDelete}
        title={task.repeat === "daily" ? "Delete daily task?" : "Delete task?"}
        message={
          task.repeat === "daily"
            ? "This removes the task from today and all future days."
            : "This task will be permanently removed."
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteTask(task.id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
