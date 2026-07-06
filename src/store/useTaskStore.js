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
import { format } from "date-fns";

const TC = "tasks";

export const useTaskStore = create((set, get) => ({
  user: null,
  tasks: [],
  loading: true,
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  screen: "home",
  screenParams: {},
  unsub: null,

  initAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
      if (user) get().subscribeTasks();
      else set({ tasks: [], unsub: null });
    });
  },

  subscribeTasks: () => {
    const { user, selectedDate, unsub } = get();
    if (!user) return;
    if (unsub) unsub();
    const q = query(
      collection(db, "users", user.uid, TC),
      where("date", "==", selectedDate),
    );
    const u = onSnapshot(q, (snap) => {
      set({
        tasks: snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      });
    });
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
    const { tasks } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
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
    const { tasks } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t || !t.durationMinutes) return;
    let ts;
    if (t.timerPausedRemaining && t.timerPausedRemaining > 0) {
      const paused = t.durationMinutes * 60 - t.timerPausedRemaining;
      ts = Timestamp.fromMillis(Date.now() - paused * 1000);
    } else {
      ts = serverTimestamp();
    }
    get().updateTask(id, {
      timerRunning: true,
      timerStartedAt: ts,
      timerPausedRemaining: null,
    });
  },

  pauseTimer: async (id) => {
    const { tasks } = get();
    const t = tasks.find((x) => x.id === id);
    if (!t || !t.timerRunning || !t.timerStartedAt) return;
    const elapsed = Math.floor(
      (Date.now() - t.timerStartedAt.toMillis()) / 1000,
    );
    const remaining = Math.max(0, t.durationMinutes * 60 - elapsed);
    get().updateTask(id, {
      timerRunning: false,
      timerPausedRemaining: remaining,
    });
  },

  resetTimer: async (id) => {
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
    const q = query(
      collection(db, "users", user.uid, TC),
      where("date", ">=", start),
      where("date", "<=", end),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
}));
