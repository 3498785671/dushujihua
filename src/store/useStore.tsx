/**
 * 全局状态管理（单机版）
 * 数据本地持久化（localStorage），无后端、无登录
 * 主题 + 通知
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  Task,
  Plan,
  Tag,
  DailyRecord,
  TaskStatus,
  TaskFormData,
  PlanFormData,
  TagFormData,
  DailyRecordFormData,
  ThemeMode,
  SnackbarSeverity,
} from '../types';
import { storage } from '../utils/storage';

// ==================== 类型定义 ====================

interface AppNotification {
  key: number;
  message: string;
  severity: SnackbarSeverity;
}

interface AppState {
  tasks: Task[];
  plans: Plan[];
  tags: Tag[];
  dailyRecords: DailyRecord[];
  themeMode: ThemeMode;
  notification: AppNotification | null;
}

type Action =
  | { type: 'LOAD_STATE'; payload: { tasks: Task[]; plans: Plan[]; tags: Tag[]; dailyRecords: DailyRecord[] } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_PLAN'; payload: Plan }
  | { type: 'UPDATE_PLAN'; payload: Plan }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'ADD_DAILY_RECORD'; payload: DailyRecord }
  | { type: 'UPDATE_DAILY_RECORD'; payload: DailyRecord }
  | { type: 'DELETE_DAILY_RECORD'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SHOW_NOTIFICATION'; payload: AppNotification }
  | { type: 'HIDE_NOTIFICATION' };

interface StoreContextValue extends AppState {
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  addPlan: (data: PlanFormData) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  addTag: (data: TagFormData) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addDailyRecord: (data: DailyRecordFormData) => void;
  updateDailyRecord: (id: string, updates: Partial<DailyRecord>) => void;
  deleteDailyRecord: (id: string) => void;
  getDailyRecordByDate: (date: string) => DailyRecord | undefined;
  toggleTheme: () => void;
  notify: (message: string, severity?: SnackbarSeverity) => void;
  closeNotification: () => void;
}

// ==================== 工具函数 ====================

const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;

const nowISO = (): string => new Date().toISOString();

const STORAGE_KEY = 'app_state';
const THEME_KEY = 'theme';

const defaultTags: Tag[] = [
  { id: 'tag-default-work', name: '工作', color: '#3b82f6', createdAt: nowISO() },
  { id: 'tag-default-life', name: '生活', color: '#22c55e', createdAt: nowISO() },
  { id: 'tag-default-study', name: '学习', color: '#8b5cf6', createdAt: nowISO() },
  { id: 'tag-default-health', name: '健康', color: '#ef4444', createdAt: nowISO() },
];

const initialState: AppState = {
  tasks: [],
  plans: [],
  tags: defaultTags,
  dailyRecords: [],
  themeMode: storage.get<ThemeMode>(THEME_KEY, 'light'),
  notification: null,
};

// ==================== Reducer ====================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.payload] };
    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: state.plans.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PLAN':
      return {
        ...state,
        plans: state.plans.filter((p) => p.id !== action.payload),
        tasks: state.tasks.map((t) => (t.planId === action.payload ? { ...t, planId: undefined } : t)),
      };

    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.payload),
        tasks: state.tasks.map((t) =>
          t.tags.includes(action.payload)
            ? { ...t, tags: t.tags.filter((id) => id !== action.payload) }
            : t
        ),
      };

    case 'ADD_DAILY_RECORD':
      return { ...state, dailyRecords: [...state.dailyRecords, action.payload] };
    case 'UPDATE_DAILY_RECORD':
      return {
        ...state,
        dailyRecords: state.dailyRecords.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'DELETE_DAILY_RECORD':
      return {
        ...state,
        dailyRecords: state.dailyRecords.filter((r) => r.id !== action.payload),
      };

    case 'TOGGLE_THEME':
      return { ...state, themeMode: state.themeMode === 'light' ? 'dark' : 'light' };

    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.payload };
    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };

    default:
      return state;
  }
}

// ==================== Context ====================

const StoreContext = createContext<StoreContextValue | null>(null);

// ==================== Provider ====================

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const saved = storage.get<Partial<AppState>>(STORAGE_KEY, {});
    return {
      ...init,
      ...saved,
      notification: null,
      tags: saved.tags && saved.tags.length > 0 ? saved.tags : init.tags,
    };
  });

  // 数据持久化到 localStorage
  useEffect(() => {
    const { notification, ...persist } = state;
    storage.set(STORAGE_KEY, persist);
  }, [state]);

  // 主题持久化
  useEffect(() => {
    storage.set(THEME_KEY, state.themeMode);
  }, [state.themeMode]);

  const notify = useCallback((message: string, severity: SnackbarSeverity = 'success'): void => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { key: Date.now(), message, severity } });
  }, []);

  const closeNotification = useCallback((): void => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  }, []);

  // ---------- Task ----------
  const addTask = useCallback(
    (data: TaskFormData): void => {
      const now = nowISO();
      const task: Task = {
        id: generateId(),
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        tags: data.tags,
        planId: data.planId,
        order: Date.now(),
        createdAt: now,
        updatedAt: now,
        ...(data.status === 'done' ? { completedAt: now } : {}),
      };
      dispatch({ type: 'ADD_TASK', payload: task });
      notify('任务已创建');
    },
    [notify]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>): void => {
      const current = state.tasks.find((t) => t.id === id);
      if (!current) return;
      const merged: Task = { ...current, ...updates, updatedAt: nowISO() };
      if (updates.status === 'done') {
        merged.completedAt = nowISO();
      } else if (updates.status) {
        merged.completedAt = undefined;
      }
      dispatch({ type: 'UPDATE_TASK', payload: merged });
      notify('任务已更新');
    },
    [state.tasks, notify]
  );

  const deleteTask = useCallback(
    (id: string): void => {
      dispatch({ type: 'DELETE_TASK', payload: id });
      notify('任务已删除');
    },
    [notify]
  );

  const toggleTaskStatus = useCallback(
    (id: string): void => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const nextStatus: TaskStatus =
        task.status === 'todo' ? 'inProgress' : task.status === 'inProgress' ? 'done' : 'todo';
      const merged: Task = {
        ...task,
        status: nextStatus,
        updatedAt: nowISO(),
        completedAt: nextStatus === 'done' ? nowISO() : undefined,
      };
      dispatch({ type: 'UPDATE_TASK', payload: merged });
    },
    [state.tasks]
  );

  // ---------- Plan ----------
  const addPlan = useCallback(
    (data: PlanFormData): void => {
      const now = nowISO();
      const plan: Plan = {
        id: generateId(),
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_PLAN', payload: plan });
      notify('计划已创建');
    },
    [notify]
  );

  const updatePlan = useCallback(
    (id: string, updates: Partial<Plan>): void => {
      const current = state.plans.find((p) => p.id === id);
      if (!current) return;
      dispatch({ type: 'UPDATE_PLAN', payload: { ...current, ...updates, updatedAt: nowISO() } });
      notify('计划已更新');
    },
    [state.plans, notify]
  );

  const deletePlan = useCallback(
    (id: string): void => {
      dispatch({ type: 'DELETE_PLAN', payload: id });
      notify('计划已删除');
    },
    [notify]
  );

  // ---------- Tag ----------
  const addTag = useCallback(
    (data: TagFormData): void => {
      const tag: Tag = { id: generateId(), name: data.name, color: data.color, createdAt: nowISO() };
      dispatch({ type: 'ADD_TAG', payload: tag });
      notify('标签已创建');
    },
    [notify]
  );

  const updateTag = useCallback(
    (id: string, updates: Partial<Tag>): void => {
      const current = state.tags.find((t) => t.id === id);
      if (!current) return;
      dispatch({ type: 'UPDATE_TAG', payload: { ...current, ...updates } });
      notify('标签已更新');
    },
    [state.tags, notify]
  );

  const deleteTag = useCallback(
    (id: string): void => {
      dispatch({ type: 'DELETE_TAG', payload: id });
      notify('标签已删除');
    },
    [notify]
  );

  // ---------- DailyRecord ----------
  const addDailyRecord = useCallback(
    (data: DailyRecordFormData): void => {
      const now = nowISO();
      const record: DailyRecord = {
        id: generateId(),
        date: data.date,
        notes: data.notes,
        mood: data.mood,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD_DAILY_RECORD', payload: record });
      notify('记录已保存');
    },
    [notify]
  );

  const updateDailyRecord = useCallback(
    (id: string, updates: Partial<DailyRecord>): void => {
      const current = state.dailyRecords.find((r) => r.id === id);
      if (!current) return;
      dispatch({
        type: 'UPDATE_DAILY_RECORD',
        payload: { ...current, ...updates, updatedAt: nowISO() },
      });
      notify('记录已更新');
    },
    [state.dailyRecords, notify]
  );

  const deleteDailyRecord = useCallback(
    (id: string): void => {
      dispatch({ type: 'DELETE_DAILY_RECORD', payload: id });
      notify('记录已删除');
    },
    [notify]
  );

  const getDailyRecordByDate = useCallback(
    (date: string): DailyRecord | undefined => state.dailyRecords.find((r) => r.date === date),
    [state.dailyRecords]
  );

  const toggleTheme = useCallback((): void => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const contextValue = useMemo<StoreContextValue>(
    () => ({
      ...state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      addPlan,
      updatePlan,
      deletePlan,
      addTag,
      updateTag,
      deleteTag,
      addDailyRecord,
      updateDailyRecord,
      deleteDailyRecord,
      getDailyRecordByDate,
      toggleTheme,
      notify,
      closeNotification,
    }),
    [
      state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      addPlan,
      updatePlan,
      deletePlan,
      addTag,
      updateTag,
      deleteTag,
      addDailyRecord,
      updateDailyRecord,
      deleteDailyRecord,
      getDailyRecordByDate,
      toggleTheme,
      notify,
      closeNotification,
    ]
  );

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

// ==================== Hook ====================

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore 必须在 StoreProvider 内部使用');
  }
  return ctx;
}
