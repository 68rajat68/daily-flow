import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { format, addMonths, subMonths } from 'date-fns';
import { calcStreak, getWeeklyTrends, getCategoryStats } from '../utils/dateHelpers';
import ProgressRing from '../components/ProgressRing';

const catColors = { work: '#2563EB', personal: '#7C3AED', health: '#16A34A', other: '#6B7280' };

export default function StatsScreen() {
  const { fetchMonthTasks } = useTaskStore();
  const [monthDate, setMonthDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const t = await fetchMonthTasks(monthDate.getFullYear(), monthDate.getMonth());
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, [monthDate]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const total = tasks.length;
  const done = tasks.filter(t => t.isCompleted).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const streak = calcStreak(tasks);
  const weeks = getWeeklyTrends(tasks);
  const cats = getCategoryStats(tasks);

  return (
    <div>
      <div className="screen-header">
        <h1>Stats</h1>
      </div>

      <div className="cal-header">
        <h2>{format(monthDate, 'MMMM yyyy')}</h2>
        <div className="cal-nav">
          <button onClick={() => setMonthDate(subMonths(monthDate, 1))}>&#8249;</button>
          <button onClick={() => setMonthDate(addMonths(monthDate, 1))}>&#8250;</button>
        </div>
      </div>

      <div className="stats-card">
        <ProgressRing percent={pct} size={80} stroke={6} />
        <div className="big-num" style={{marginTop:8}}>{pct}%</div>
        <div className="label">Overall Completion</div>
        {streak > 0 && <div className="streak-badge" style={{marginTop:12}}>🔥 {streak} day streak</div>}
      </div>

      <div className="stats-grid">
        <div className="stats-mini">
          <div className="num">{total}</div>
          <div className="label">Total Tasks</div>
        </div>
        <div className="stats-mini">
          <div className="num" style={{color:'#16A34A'}}>{done}</div>
          <div className="label">Completed</div>
        </div>
      </div>

      {weeks.length > 0 && (
        <div className="trend-list">
          <h3>Weekly Trend</h3>
          {weeks.map(w => (
            <div key={w.label} className="trend-item">
              <span className="trend-label">{w.label}</span>
              <div className="trend-bar">
                <div className="trend-bar-fill" style={{ width: Math.max(8, w.rate * 100) + '%' }}>
                  {Math.round(w.rate * 100) + '%'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cats.length > 0 && (
        <div className="cat-list">
          <h3>By Category</h3>
          {cats.map(c => (
            <div key={c.name} className="cat-item">
              <span className="cat-name">{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</span>
              <div className="cat-bar">
                <div className="cat-bar-fill" style={{ width: Math.max(4, c.rate * 100) + '%', background: catColors[c.name] || '#6B7280' }}></div>
              </div>
              <span className="cat-pct">{Math.round(c.rate * 100) + '%'}</span>
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <div className="empty-state">
          <div className="icon">📊</div>
          <h3>No data yet</h3>
          <p>Add tasks to see your stats</p>
        </div>
      )}
    </div>
  );
}