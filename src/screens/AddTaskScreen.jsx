import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { format } from 'date-fns';

const timeSlots = ['morning', 'afternoon', 'evening'];
const categories = ['work', 'personal', 'health', 'other'];
const priorities = ['low', 'medium', 'high'];

export default function AddTaskScreen() {
  const { navigate, addTask, selectedDate } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [time, setTime] = useState('');
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
      durationMinutes: timerOn ? (timerH * 60 + timerM) : null
    };
    if (data.durationMinutes === 0) data.durationMinutes = null;
    await addTask(data);
    setSaving(false);
    navigate('home');
  };

  return (
    <div className="form-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => navigate('home')}>←</button>
        <h1>Add Task</h1>
        <div style={{width:32}}></div>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label>Task Name *</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you need to do?" />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details..." />
        </div>
      </div>

      <div className="form-card">
        <h3>Time Slot</h3>
        <div className="toggle-group">
          {timeSlots.map(s => (
            <button key={s} className={'toggle-btn' + (timeSlot === s ? ' active' : '')} onClick={() => setTimeSlot(s)}>
              {s === 'morning' ? '🌅' : s === 'afternoon' ? '☀️' : '🌃'} {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Category</h3>
        <div className="toggle-group">
          {categories.map(c => (
            <button key={c} className={'toggle-btn' + (category === c ? ' active' : '')} onClick={() => setCategory(c)}>
              {c === 'work' ? '💼' : c === 'personal' ? '👤' : c === 'health' ? '💚' : '📌'} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Priority</h3>
        <div className="radio-group">
          {priorities.map(p => (
            <label key={p} className={'radio-label' + (priority === p ? ' active' : '')} onClick={() => setPriority(p)}>
              <span className="radio-dot"></span>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Time (optional)</h3>
        <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>

      <div className="form-card">
        <div className="timer-toggle-row">
          <span>⏱ Set Timer</span>
          <div className={'switch' + (timerOn ? ' on' : '')} onClick={() => setTimerOn(!timerOn)}></div>
        </div>
        {timerOn && (
          <div className="timer-inputs">
            <div className="form-group">
              <label>Hours</label>
              <input className="form-input" type="number" min="0" max="23" value={timerH} onChange={e => setTimerH(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <span>:</span>
            <div className="form-group">
              <label>Minutes</label>
              <input className="form-input" type="number" min="0" max="59" value={timerM} onChange={e => setTimerM(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} />
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving || !title.trim()} style={{marginTop:8}}>
        {saving ? 'Saving...' : 'Save Task'}
      </button>
    </div>
  );
}