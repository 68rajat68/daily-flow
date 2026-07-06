import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export default function SettingsScreen() {
  const { user, logout } = useTaskStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    if (!confirmLogout) { setConfirmLogout(true); return; }
    await logout();
  };

  return (
    <div>
      <div className="screen-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-item">
          <div className="left">
            <span className="si-icon">👤</span>
            <span>{user ? user.email : ''}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Actions</h3>
        <div className="settings-item" onClick={handleLogout}>
          <div className="left">
            <span className="si-icon">🚪</span>
            <span>{confirmLogout ? 'Tap again to confirm' : 'Logout'}</span>
          </div>
          <span className="right">{'>'}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <div className="settings-item">
          <div className="left">
            <span className="si-icon">📅</span>
            <span>DayFlow</span>
          </div>
          <span className="right">v1.0.0</span>
        </div>
        <div className="settings-item">
          <div className="left">
            <span className="si-icon">⚡</span>
            <span>Built with React + Firebase</span>
          </div>
        </div>
      </div>

      <div className="version">DayFlow v1.0.0 ¹ Made with ❤️</div>
    </div>
  );
}