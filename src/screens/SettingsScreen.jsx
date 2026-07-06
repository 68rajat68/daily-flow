import { useState } from "react";
import { LogOut, CalendarDays, Zap, Shield } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import ConfirmModal from "../components/ConfirmModal";

export default function SettingsScreen() {
  const { user, logout } = useTaskStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <div>
      <div className="screen-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-item">
          <div className="left">
            <Shield />
            <span>{user ? user.email : ""}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Actions</h3>
        <div className="settings-item danger" onClick={() => setConfirmLogout(true)}>
          <div className="left">
            <LogOut />
            <span>Logout</span>
          </div>
          <span className="right">{">"}</span>
        </div>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <div className="settings-item">
          <div className="left">
            <CalendarDays />
            <span>Daily Flow</span>
          </div>
          <span className="right">v1.0.0</span>
        </div>
        <div className="settings-item">
          <div className="left">
            <Zap />
            <span>Built with React + Firebase</span>
          </div>
        </div>
      </div>

      <div className="version">
        Daily Flow v1.0.0 &middot; Made with &hearts;
      </div>
      <ConfirmModal
        open={confirmLogout}
        title="Logout?"
        message="You will need to sign in again to access your tasks."
        confirmLabel="Logout"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={async () => {
          await logout();
          setConfirmLogout(false);
        }}
      />
    </div>
  );
}
