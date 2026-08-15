/**
 * 独属计划 - 类型定义
 * 所有 TypeScript 类型集中定义于此文件
 */

// ==================== 基础枚举类型 ====================

/** 任务状态 */
export type TaskStatus = 'todo' | 'inProgress' | 'done';

/** 优先级 */
export type Priority = 'high' | 'medium' | 'low';

/** 计划类型 */
export type PlanType = 'shortTerm' | 'longTerm';

/** 计划状态 */
export type PlanStatus = 'active' | 'completed' | 'archived';

/** 心情 */
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

/** 主题模式 */
export type ThemeMode = 'light' | 'dark';

/** 通知严重级别 */
export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

/** 用户 */
export interface User {
  id: string;
  username: string;
}

// ==================== 核心数据模型 ====================

/** 任务 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date string (yyyy-MM-dd)
  tags: string[]; // tag ids
  planId?: string; // 关联计划 ID
  order: number; // 排序序号
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** 计划 */
export interface Plan {
  id: string;
  title: string;
  description?: string;
  type: PlanType;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  priority: Priority;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

/** 每日记录 */
export interface DailyRecord {
  id: string;
  date: string; // yyyy-MM-dd
  notes: string;
  mood?: Mood;
  createdAt: string;
  updatedAt: string;
}

// ==================== 筛选与表单类型 ====================

/** 任务筛选条件 */
export interface TaskFilterCriteria {
  keyword: string;
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  tagIds: string[];
}

/** 任务表单数据 */
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  planId?: string;
}

/** 计划表单数据 */
export interface PlanFormData {
  title: string;
  description?: string;
  type: PlanType;
  startDate?: string;
  endDate?: string;
  priority: Priority;
  status: PlanStatus;
}

/** 标签表单数据 */
export interface TagFormData {
  name: string;
  color: string;
}

/** 每日记录表单数据 */
export interface DailyRecordFormData {
  date: string;
  notes: string;
  mood?: Mood;
}

// ==================== 配置常量 ====================

/** 任务状态配置 */
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: '未开始', color: '#94a3b8' },
  inProgress: { label: '进行中', color: '#f59e0b' },
  done: { label: '已完成', color: '#22c55e' },
};

/** 优先级配置 */
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: '高', color: '#ef4444' },
  medium: { label: '中', color: '#f59e0b' },
  low: { label: '低', color: '#64748b' },
};

/** 计划类型配置 */
export const PLAN_TYPE_CONFIG: Record<PlanType, { label: string; color: string }> = {
  shortTerm: { label: '短期计划', color: '#3b82f6' },
  longTerm: { label: '长期计划', color: '#8b5cf6' },
};

/** 计划状态配置 */
export const PLAN_STATUS_CONFIG: Record<PlanStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: '#22c55e' },
  completed: { label: '已完成', color: '#6366f1' },
  archived: { label: '已归档', color: '#94a3b8' },
};

/** 心情配置 */
export const MOOD_CONFIG: Record<Mood, { label: string; emoji: string }> = {
  great: { label: '很棒', emoji: '😄' },
  good: { label: '不错', emoji: '🙂' },
  neutral: { label: '一般', emoji: '😐' },
  bad: { label: '不太好', emoji: '😔' },
  terrible: { label: '糟糕', emoji: '😣' },
};

/** 标签预设颜色 */
export const TAG_COLORS: string[] = [
  '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b',
  '#06b6d4', '#d946ef', '#84cc16', '#eab308', '#f43f5e',
];

/** 导航项类型 */
export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
