import { useTaskStore } from '../store/useTaskStore';

const tabs = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'month', icon: '📅', label: 'Calendar' },
  { key: 'stats', icon: '📊', label: 'Stats' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function BottomNav() {
  const { screen, navigate, setSelectedDate } = useTaskStore();
  const handleTap = (key) => {
    if (key === 'home') setSelectedDate(new Date().toISOString().slice(0, 10));
    navigate(key);
  };
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button key={t.key} className={'nav-item' + (screen === t.key ? ' active' : '')} onClick={() => handleTap(t.key)}>
          <span className="nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}