import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import MiniCalendar from '../components/MiniCalendar';
import { format, getDateSummary } from '../utils/dateHelpers';

export default function MonthViewScreen() {
  const { selectedDate, setSelectedDate, navigate, fetchMonthTasks } = useTaskStore();
  const [monthDate, setMonthDate] = useState(new Date(selectedDate + 'T12:00:00'));
  const [monthTasks, setMonthTasks] = useState([]);
  const [selSummary, setSelSummary] = useState(null);

  const loadMonth = async () => {
    const tasks = await fetchMonthTasks(monthDate.getFullYear(), monthDate.getMonth());
    setMonthTasks(tasks);
  };

  useEffect(() => { loadMonth(); }, [monthDate]);

  useEffect(() => {
    const sum = getDateSummary(monthTasks, selectedDate);
    setSelSummary(sum);
  }, [selectedDate, monthTasks]);

  const handleSelectDate = (ds) => {
    setSelectedDate(ds);
  };

  const goToDate = () => {
    navigate('home');
  };

  const barColor = selSummary && selSummary.rate >= 0 ? (selSummary.rate === 1 ? '#16A34A' : selSummary.rate > 0 ? '#F59E0B' : '#DC2626') : '#E5E7EB';

  return (
    <div>
      <div className="screen-header">
        <h1>Calendar</h1>
      </div>
      <MiniCalendar
        monthDate={monthDate}
        onChangeMonth={setMonthDate}
        onSelectDate={handleSelectDate}
        selectedDate={selectedDate}
        monthTasks={monthTasks}
      />
      {selSummary && selSummary.rate >= 0 && (
        <div className="day-summary">
          <h3>{format(new Date(selectedDate + 'T12:00:00'), 'd MMM yyyy')} Summary</h3>
          <div className="summary-row">
            <span>✅ Completed</span>
            <span className="val">{selSummary.done} / {selSummary.total}</span>
          </div>
          <div className="summary-row">
            <span>⬜ Pending</span>
            <span className="val">{selSummary.total - selSummary.done}</span>
          </div>
          <div className="summary-bar">
            <div className="summary-bar-fill" style={{ width: (selSummary.rate * 100) + '%', background: barColor }}></div>
          </div>
          <button className="btn btn-primary" style={{marginTop:14}} onClick={goToDate}>View Full Day</button>
        </div>
      )}
      {selSummary && selSummary.rate === -1 && (
        <div className="day-summary">
          <h3>{format(new Date(selectedDate + 'T12:00:00'), 'd MMM yyyy')}</h3>
          <p style={{color:'var(--text3)',fontSize:14,marginTop:4}}>No tasks for this day</p>
        </div>
      )}
    </div>
  );
}