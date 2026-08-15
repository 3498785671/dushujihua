/**
 * 任务列表组件
 * 展示筛选排序后的任务列表
 */

import { useMemo } from 'react';
import { Box } from '@mui/material';
import type { Task, TaskFilterCriteria, TaskStatus } from '../../types';
import TaskItem from './TaskItem';
import EmptyState from '../common/EmptyState';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilterCriteria;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** 状态排序权重 */
const STATUS_ORDER: Record<TaskStatus, number> = { todo: 0, inProgress: 1, done: 2 };

/** 优先级排序权重 */
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * 对任务进行筛选
 */
export function filterTasks(tasks: Task[], filter: TaskFilterCriteria): Task[] {
  return tasks.filter((task) => {
    // 关键词搜索
    if (filter.keyword.trim()) {
      const keyword = filter.keyword.trim().toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(keyword);
      const matchDesc = task.description?.toLowerCase().includes(keyword) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }

    // 状态筛选
    if (filter.status !== 'all' && task.status !== filter.status) return false;

    // 优先级筛选
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;

    // 标签筛选（交集）
    if (filter.tagIds.length > 0) {
      const hasTag = filter.tagIds.every((tagId) => task.tags.includes(tagId));
      if (!hasTag) return false;
    }

    return true;
  });
}

/**
 * 对任务进行排序
 * 规则：状态 > 优先级 > 截止日期
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 1. 按状态排序
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;

    // 2. 按优先级排序
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // 3. 按截止日期排序（无截止日期排最后）
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // 4. 按创建时间排序
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export default function TaskList({ tasks, filter, onEdit, onDelete }: TaskListProps) {
  // 筛选 + 排序
  const displayTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filter);
    return sortTasks(filtered);
  }, [tasks, filter]);

  if (displayTasks.length === 0) {
    const isFiltered =
      filter.keyword !== '' ||
      filter.status !== 'all' ||
      filter.priority !== 'all' ||
      filter.tagIds.length > 0;

    return (
      <EmptyState
        icon={<CheckCircleOutlineIcon sx={{ fontSize: 40 }} />}
        title={isFiltered ? '没有匹配的任务' : '还没有任务'}
        description={
          isFiltered
            ? '试试调整筛选条件或清除搜索关键词'
            : '点击右下角的加号按钮，创建你的第一个任务吧'
        }
      />
    );
  }

  return (
    <Box>
      {displayTasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Box>
  );
}
