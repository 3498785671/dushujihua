/**
 * 日期工具函数
 * 基于 date-fns，统一处理日期格式化与计算
 */

import {
  format,
  parseISO,
  isToday,
  isThisWeek,
  isPast,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  startOfDay,
  isAfter,
  isBefore,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/** 格式化日期为字符串 */
export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, formatStr, { locale: zhCN });
};

/** 格式化为中文日期（如：1月15日 星期一） */
export const formatDateChinese = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, 'M月d日 EEEE', { locale: zhCN });
};

/** 格式化为完整日期时间 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

/** 判断日期是否已逾期 */
export const isOverdue = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return false;
  return isPast(date) && !isToday(date);
};

/** 判断日期是否为今天 */
export const isDateToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return false;
  return isToday(date);
};

/** 判断日期是否在本周内 */
export const isDateThisWeek = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return false;
  return isThisWeek(date, { weekStartsOn: 1 });
};

/** 计算距离某日期的天数（正数=未来，负数=过去） */
export const daysUntil = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return null;
  return differenceInDays(date, new Date());
};

/** 获取相对日期标签（如：今天、明天、3天后、已逾期2天） */
export const getRelativeDateLabel = (dateStr?: string): string => {
  if (!dateStr) return '';
  const days = daysUntil(dateStr);
  if (days === null) return '';
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === -1) return '昨天';
  if (days > 0 && days <= 7) return `${days}天后`;
  if (days < 0) return `已逾期${Math.abs(days)}天`;
  return formatDate(dateStr);
};

/** 获取今天的日期键（yyyy-MM-dd） */
export const todayKey = (): string => format(new Date(), 'yyyy-MM-dd');

/** 获取指定日期所在月的日历网格（42天，6周） */
export const getMonthGrid = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
};

/** 日期是否在同一月 */
export const isSameMonthDate = (date1: Date, date2: Date): boolean => isSameMonth(date1, date2);

/** 日期是否为同一天 */
export const isSameDayDate = (date1: Date, date2: Date): boolean => isSameDay(date1, date2);

/** 日期是否为今天 */
export const isTodayDate = (date: Date): boolean => isToday(date);

/** 月份加减 */
export { addMonths, subMonths, addDays, startOfDay, isAfter, isBefore, parseISO, format };

/** 星期表头（周一到周日） */
export const WEEKDAY_LABELS: string[] = ['一', '二', '三', '四', '五', '六', '日'];
