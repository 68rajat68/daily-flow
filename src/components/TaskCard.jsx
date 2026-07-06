import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';

function formatTimerSec(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n < 10 ? '0' + n : '' + n;
  return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
}

function formatDuration(mins) {
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return h + 'h ' + m + 'm';
  if (h > 0) return h + 'h';
  return m + 'm';
}

const catMap = { work: 'badge-work', personal: 'badge-personal', health: 'badge-health', other: 'badge-other' };
const catIcons = { work: '💼', personal: '👤', health: '💚', other: '📌' };

export default function TaskCard({ task, onAutoComplete }) {
  const { toggleComplete, deleteTask, startTimer, pauseTimer, resetTimer } = useTaskStore();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!task.durationMinutes) return;
    if (task.timerRunning && task.timerStartedAt) {
      const calc = () => {
        const elapsed = Math.floor((Date.now() - task.timerStartedAt.toMillis()) / 1000);
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
  }, [task.timerRunning, task.timerStartedAt, task.timerPausedRemaining, task.durationMinutes]);

  const hasTimer = task.durationMinutes && task.durationMinutes > 0;
  const totalSec = task.durationMinutes * 60;
  const progress = hasTimer && totalSec > 0 ? Math.min(100, ((totalSec - remaining) / totalSec) * 100) : 0;

  return (
    <div className={'task-card' + (task.isCompleted ? ' completed' : '') + ' priority-' + (task.priority || 'medium')}>
      <div className="task-top">
        <div className="task-check" onClick={() => !task.timerRunning && toggleComplete(task.id)}>
          {task.isCompleted ? '✓' : ''}
        </div>
        <div className="task-body">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            <span className={'task-badge ' + (catMap[task.category] || 'badge-other')}>
              {catIcons[task.category] || '📌'} {task.category || 'other'}
            </span>
            {task.time && <span className="task-time">🕒 {task.time}</span>}
            {hasTimer && !task.timerRunning && !(task.timerPausedRemaining > 0) && !task.isCompleted &&
              <span className="task-time">⏱ {formatDuration(task.durationMinutes)}</span>}
          </div>
          {hasTimer && !task.isCompleted && (
            <div className="timer-section">
              <div className="timer-row">
                <span className={'timer-display' + (task.timerRunning ? ' running' : '')}>
                  {formatTimerSec(remaining)}
                </span>
                {!task.timerRunning && !(task.timerPausedRemaining > 0) && (
                  <button className="timer-btn timer-btn-play" onClick={() => startTimer(task.id)}>▶ Start</button>
                )}
                {task.timerRunning && (
                  <button className="timer-btn timer-btn-pause" onClick={() => pauseTimer(task.id)}>⏸ Pause</button>
                )}
                {!task.timerRunning && task.timerPausedRemaining > 0 && (
                  <>
                    <button className="timer-btn timer-btn-play" onClick={() => startTimer(task.id)}>▶ Resume</button>
                    <button className="timer-btn timer-btn-reset" onClick={() => resetTimer(task.id)}>⏹ Reset</button>
                  </>
                )}
              </div>
              {(task.timerRunning || task.timerPausedRemaining > 0) && (
                <div className="timer-bar"><div className="timer-bar-fill" style={{ width: progress + '%' }}></div></div>
              )}
            </div>
          )}
        </div>
        <button className="task-delete" onClick={() => deleteTask(task.id)}>🗑</button>
      </div>
    </div>
  );
}