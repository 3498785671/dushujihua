/**
 * 全局状态管理
 * - 认证：用户登录/注册/退出，token 持久化
 * - 数据：任务/计划/标签/每日记录，登录后从后端加载，增删改同步后端
 * - 主题与通知
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
  User,
} from '../types';
import { api, setAuthToken } from '../api/client';
import { storage } from '../utils/storage';

// ==================== 类型定义 ====================

interface AppNotification {
  key: number;
  message: string;
  severity: SnackbarSeverity;
}

interface AppState {
  user: User | null;
  authLoading: boolean;
  tasks: Task[];
  plans: Plan[];
  tags: Tag[];
  dailyRecords: DailyRecord[];
  themeMode: ThemeMode;
  notification: AppNotification | null;
}

type Action =
  // 认证
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  // 数据
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
  // 主题
  | { type: 'TOGGLE_THEME' }
  // 通知
  | { type: 'SHOW_NOTIFICATION'; payload: AppNotification }
  | { type: 'HIDE_NOTIFICATION' };

interface StoreContextValue extends AppState {
  // 认证
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  // Task
  addTask: (data: TaskFormData) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  // Plan
  addPlan: (data: PlanFormData) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  // Tag
  addTag: (data: TagFormData) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  // DailyRecord
  addDailyRecord: (data: DailyRecordFormData) => Promise<void>;
  updateDailyRecord: (id: string, updates: Partial<DailyRecord>) => Promise<void>;
  deleteDailyRecord: (id: string) => Promise<void>;
  getDailyRecordByDate: (date: string) => DailyRecord | undefined;
  // Theme
  toggleTheme: () => void;
  // Notification
  notify: (message: string, severity?: SnackbarSeverity) => void;
  closeNotification: () => void;
}

// ==================== 工具函数 ====================

/** 生成唯一 ID */
const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;

/** 获取当前 ISO 时间戳 */
const nowISO = (): string => new Date().toISOString();

const TOKEN_KEY = 'dushu_plan_token';
const THEME_KEY = 'dushu_plan_theme';

const initialState: AppState = {
  user: null,
  authLoading: true,
  tasks: [],
  plans: [],
  tags: [],
  dailyRecords: [],
  themeMode: storage.get<ThemeMode>(THEME_KEY, 'light'),
  notification: null,
};

// ==================== Reducer ====================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // 认证
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };

    // 数据加载
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    // Task
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    // Plan
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

    // Tag
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

    // DailyRecord
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

    // 主题
    case 'TOGGLE_THEME':
      return { ...state, themeMode: state.themeMode === 'light' ? 'dark' : 'light' };

    // 通知
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
  const [state, dispatch] = useReducer(reducer, initialState);

  // 主题持久化
  useEffect(() => {
    storage.set(THEME_KEY, state.themeMode);
  }, [state.themeMode]);

  // 通知
  const notify = useCallback((message: string, severity: SnackbarSeverity = 'success'): void => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { key: Date.now(), message, severity } });
  }, []);

  const closeNotification = useCallback((): void => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  }, []);

  /** 统一错误处理 */
  const handleError = useCallback(
    (err: unknown): void => {
      const message = err instanceof Error ? err.message : '操作失败，请稍后重试';
      notify(message, 'error');
    },
    [notify]
  );

  // 初始认证检查：恢复 token 并加载数据
  useEffect(() => {
    const token = storage.get<string | null>(TOKEN_KEY, null);
    if (!token) {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      return;
    }
    setAuthToken(token);
    (async () => {
      try {
        const { user } = await api.me();
        dispatch({ type: 'SET_USER', payload: user });
        const data = await api.getData();
        dispatch({ type: 'LOAD_STATE', payload: data });
      } catch {
        setAuthToken(null);
        storage.remove(TOKEN_KEY);
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    })();
  }, []);

  /** 认证成功后的通用流程 */
  const applyAuth = useCallback(async (token: string, user: User): Promise<void> => {
    setAuthToken(token);
    storage.set(TOKEN_KEY, token);
    dispatch({ type: 'SET_USER', payload: user });
    const data = await api.getData();
    dispatch({ type: 'LOAD_STATE', payload: data });
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      const { token, user } = await api.login(username, password);
      await applyAuth(token, user);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (username: string, password: string): Promise<void> => {
      const { token, user } = await api.register(username, password);
      await applyAuth(token, user);
    },
    [applyAuth]
  );

  const logout = useCallback((): void => {
    setAuthToken(null);
    storage.remove(TOKEN_KEY);
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({
      type: 'LOAD_STATE',
      payload: { tasks: [], plans: [], tags: [], dailyRecords: [] },
    });
  }, []);

  // ---------- Task ----------
  const addTask = useCallback(
    async (data: TaskFormData): Promise<void> => {
      const now = nowISO();
      const task: Partial<Task> = {
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
      };
      try {
        const created = await api.createTask(task);
        dispatch({ type: 'ADD_TASK', payload: created });
        notify('任务已创建');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<void> => {
      try {
        const updated = await api.updateTask(id, updates);
        dispatch({ type: 'UPDATE_TASK', payload: updated });
        notify('任务已更新');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.deleteTask(id);
        dispatch({ type: 'DELETE_TASK', payload: id });
        notify('任务已删除');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const toggleTaskStatus = useCallback(
    async (id: string): Promise<void> => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const nextStatus: TaskStatus =
        task.status === 'todo' ? 'inProgress' : task.status === 'inProgress' ? 'done' : 'todo';
      try {
        const updated = await api.updateTask(id, { status: nextStatus });
        dispatch({ type: 'UPDATE_TASK', payload: updated });
      } catch (err) {
        handleError(err);
      }
    },
    [state.tasks, handleError]
  );

  // ---------- Plan ----------
  const addPlan = useCallback(
    async (data: PlanFormData): Promise<void> => {
      const now = nowISO();
      const plan: Partial<Plan> = {
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
      try {
        const created = await api.createPlan(plan);
        dispatch({ type: 'ADD_PLAN', payload: created });
        notify('计划已创建');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const updatePlan = useCallback(
    async (id: string, updates: Partial<Plan>): Promise<void> => {
      try {
        const updated = await api.updatePlan(id, updates);
        dispatch({ type: 'UPDATE_PLAN', payload: updated });
        notify('计划已更新');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const deletePlan = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.deletePlan(id);
        dispatch({ type: 'DELETE_PLAN', payload: id });
        notify('计划已删除');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  // ---------- Tag ----------
  const addTag = useCallback(
    async (data: TagFormData): Promise<void> => {
      const tag: Partial<Tag> = {
        id: generateId(),
        name: data.name,
        color: data.color,
        createdAt: nowISO(),
      };
      try {
        const created = await api.createTag(tag);
        dispatch({ type: 'ADD_TAG', payload: created });
        notify('标签已创建');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const updateTag = useCallback(
    async (id: string, updates: Partial<Tag>): Promise<void> => {
      try {
        const updated = await api.updateTag(id, updates);
        dispatch({ type: 'UPDATE_TAG', payload: updated });
        notify('标签已更新');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const deleteTag = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.deleteTag(id);
        dispatch({ type: 'DELETE_TAG', payload: id });
        notify('标签已删除');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  // ---------- DailyRecord ----------
  const addDailyRecord = useCallback(
    async (data: DailyRecordFormData): Promise<void> => {
      const now = nowISO();
      const record: Partial<DailyRecord> = {
        id: generateId(),
        date: data.date,
        notes: data.notes,
        mood: data.mood,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const created = await api.createRecord(record);
        dispatch({ type: 'ADD_DAILY_RECORD', payload: created });
        notify('记录已保存');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const updateDailyRecord = useCallback(
    async (id: string, updates: Partial<DailyRecord>): Promise<void> => {
      try {
        const updated = await api.updateRecord(id, updates);
        dispatch({ type: 'UPDATE_DAILY_RECORD', payload: updated });
        notify('记录已更新');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const deleteDailyRecord = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.deleteRecord(id);
        dispatch({ type: 'DELETE_DAILY_RECORD', payload: id });
        notify('记录已删除');
      } catch (err) {
        handleError(err);
      }
    },
    [notify, handleError]
  );

  const getDailyRecordByDate = useCallback(
    (date: string): DailyRecord | undefined => state.dailyRecords.find((r) => r.date === date),
    [state.dailyRecords]
  );

  // ---------- Theme ----------
  const toggleTheme = useCallback((): void => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const contextValue = useMemo<StoreContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
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
      login,
      register,
      logout,
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

/** 获取全局 Store */
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore 必须在 StoreProvider 内部使用');
  }
  return ctx;
}
