import { create } from "zustand";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { eachDayOfInterval, format } from "date-fns";

const TC = "tasks";

function dailyStateFor(task, date) {
  return task.dailyState?.[date] || {};
}

function taskForDate(task, date) {
  if (task.repeat !== "daily") return task;
  const state = dailyStateFor(task, date);
  return {
    ...task,
    date,
    instanceDate: date,
    isDaily: true,
    isCompleted: !!state.isCompleted,
    completedAt: state.completedAt || null,
    timerRunning: !!state.timerRunning,
    timerStartedAt: state.timerStartedAt || null,
    timerPausedRemaining: state.timerPausedRemaining ?? null,
  };
}

function shouldShowDailyTask(task, date) {
  return task.repeat === "daily" && (!task.date || task.date <= date);
}

function mergeTasksForDate(oneTimeTasks, dailyTasks, date) {
  return [
    ...dailyTasks.filter((t) => shouldShowDailyTask(t, date)),
    ...oneTimeTasks,
  ]
    .map((task) => taskForDate(task, date))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export const useTaskStore = create((set, get) => ({
  user: null,
  tasks: [],
  loading: true,
  tasksLoading: true,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  screen: "home",
  screenParams: {},
  unsub: null,

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
      if (user) get().subscribeTasks();
      else {
        const { unsub } = get();
        if (unsub) unsub();
        set({ tasks: [], tasksLoading: false, unsub: null });
      }
    });
  },

  subscribeTasks: () => {
    const { user, selectedDate, unsub } = get();
    if (!user) return;
    if (unsub) unsub();
    set({ tasksLoading: true });
    let dateLoaded = false;
    let dailyLoaded = false;
    let oneTimeTasks = [];
    let dailyTasks = [];
    const publish = () => {
      if (!dateLoaded || !dailyLoaded) return;
      set({
        tasks: mergeTasksForDate(oneTimeTasks, dailyTasks, selectedDate),
        tasksLoading: false,
      });
    };
    const dateQuery = query(
      collection(db, "users", user.uid, TC),
      where("date", "==", selectedDate),
    );
    const dailyQuery = query(
      collection(db, "users", user.uid, TC),
      where("repeat", "==", "daily"),
    );
    const unsubDate = onSnapshot(dateQuery, (snap) => {
      oneTimeTasks = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.repeat !== "daily");
      dateLoaded = true;
      publish();
    });
    const unsubDaily = onSnapshot(dailyQuery, (snap) => {
      dailyTasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      dailyLoaded = true;
      publish();
    });
    const u = () => {
      unsubDate();
      unsubDaily();
    };
    set({ unsub: u });
  },

  navigate: (screen, params) => set({ screen, screenParams: params || {} }),

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().subscribeTasks();
  },

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },
  signup: async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  },
  logout: async () => {
    await signOut(auth);
    set({ tasks: [], unsub: null, screen: "home" });
  },

  addTask: async (data) => {
    const { user, tasks } = get();
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, TC), {
      ...data,
      repeat: data.repeat || "once",
      dailyState: data.repeat === "daily" ? {} : null,
      isCompleted: false,
      completedAt: null,
      timerRunning: false,
      timerStartedAt: null,
      timerPausedRemaining: null,
      order: tasks.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  updateTask: async (id, updates) => {
    const { user } = get();
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, TC, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  deleteTask: async (id) => {
    const { user } = get();
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, TC, id));
  },

  toggleComplete: async (id) => {
    const { tasks, selectedDate, user } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    if (t.repeat === "daily") {
      await updateDoc(doc(db, "users", user.uid, TC, id), {
        [`dailyState.${selectedDate}`]: {
          ...dailyStateFor(t, selectedDate),
          isCompleted: !t.isCompleted,
          completedAt: !t.isCompleted ? serverTimestamp() : null,
          timerRunning: false,
          timerPausedRemaining: null,
        },
        updatedAt: serverTimestamp(),
      });
      return;
    }
    const updates = {
      isCompleted: !t.isCompleted,
      timerRunning: false,
      timerPausedRemaining: null,
    };
    if (!t.isCompleted) updates.completedAt = serverTimestamp();
    else updates.completedAt = null;
    get().updateTask(id, updates);
  },

  startTimer: async (id) => {
    const { tasks, selectedDate, user } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t || !t.durationMinutes) return;
    let ts;
    if (t.timerPausedRemaining && t.timerPausedRemaining > 0) {
      const paused = t.durationMinutes * 60 - t.timerPausedRemaining;
      ts = Timestamp.fromMillis(Date.now() - paused * 1000);
    } else {
      ts = serverTimestamp();
    }
    if (t.repeat === "daily") {
      await updateDoc(doc(db, "users", user.uid, TC, id), {
        [`dailyState.${selectedDate}.timerRunning`]: true,
        [`dailyState.${selectedDate}.timerStartedAt`]: ts,
        [`dailyState.${selectedDate}.timerPausedRemaining`]: null,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    get().updateTask(id, {
      timerRunning: true,
      timerStartedAt: ts,
      timerPausedRemaining: null,
    });
  },

  pauseTimer: async (id) => {
    const { tasks, selectedDate, user } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t || !t.timerRunning || !t.timerStartedAt) return;
    const elapsed = Math.floor(
      (Date.now() - t.timerStartedAt.toMillis()) / 1000,
    );
    const remaining = Math.max(0, t.durationMinutes * 60 - elapsed);
    if (t.repeat === "daily") {
      await updateDoc(doc(db, "users", user.uid, TC, id), {
        [`dailyState.${selectedDate}.timerRunning`]: false,
        [`dailyState.${selectedDate}.timerPausedRemaining`]: remaining,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    get().updateTask(id, {
      timerRunning: false,
      timerPausedRemaining: remaining,
    });
  },

  resetTimer: async (id) => {
    const { tasks, selectedDate, user } = get();
    const t = tasks.find((x) => x.id === id);
    if (t?.repeat === "daily") {
      await updateDoc(doc(db, "users", user.uid, TC, id), {
        [`dailyState.${selectedDate}.timerRunning`]: false,
        [`dailyState.${selectedDate}.timerStartedAt`]: null,
        [`dailyState.${selectedDate}.timerPausedRemaining`]: null,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    get().updateTask(id, {
      timerRunning: false,
      timerStartedAt: null,
      timerPausedRemaining: null,
    });
  },

  fetchMonthTasks: async (year, month) => {
    const { user } = get();
    if (!user) return [];
    const start = format(new Date(year, month, 1), "yyyy-MM-dd");
    const end = format(new Date(year, month + 1, 0), "yyyy-MM-dd");
    const onceQuery = query(
      collection(db, "users", user.uid, TC),
      where("date", ">=", start),
      where("date", "<=", end),
    );
    const dailyQuery = query(
      collection(db, "users", user.uid, TC),
      where("repeat", "==", "daily"),
    );
    const [onceSnap, dailySnap] = await Promise.all([
      getDocs(onceQuery),
      getDocs(dailyQuery),
    ]);
    const onceTasks = onceSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((t) => t.repeat !== "daily");
    const dailyTasks = dailySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const dates = eachDayOfInterval({
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    }).map((d) => format(d, "yyyy-MM-dd"));
    const repeated = dates.flatMap((date) =>
      dailyTasks
        .filter((task) => shouldShowDailyTask(task, date))
        .map((task) => taskForDate(task, date)),
    );
    return [...onceTasks, ...repeated];
  },
}));
