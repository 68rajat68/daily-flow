import { useEffect } from "react";
import { useTaskStore } from "./store/useTaskStore";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import AddTaskScreen from "./screens/AddTaskScreen";
import MonthViewScreen from "./screens/MonthViewScreen";
import StatsScreen from "./screens/StatsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import BottomNav from "./components/BottomNav";
import { AppSkeleton } from "./components/Skeleton";

export default function App() {
  const { user, loading, screen, initAuth } = useTaskStore();
  useEffect(() => {
    initAuth();
  }, []);

  if (loading) return <AppSkeleton />;
  if (!user) return <LoginScreen />;

  return (
    <div className="app">
      <div className="app-content">
        {screen === "home" && <HomeScreen />}
        {screen === "add" && <AddTaskScreen />}
        {screen === "month" && <MonthViewScreen />}
        {screen === "stats" && <StatsScreen />}
        {screen === "settings" && <SettingsScreen />}
      </div>
      <BottomNav />
    </div>
  );
}
