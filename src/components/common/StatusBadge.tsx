/**
 * 状态徽章组件
 * 用于展示任务状态、优先级等标签
 */

import { Chip, Box } from '@mui/material';
import type { TaskStatus, Priority } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'small' | 'medium';
}

/** 任务状态徽章 */
export function TaskStatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: `${config.color}20`,
        color: config.color,
        fontWeight: 600,
        border: 'none',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

/** 优先级徽章 */
export function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Chip
      label={config.label}
      size={size}
      variant="outlined"
      sx={{
        color: config.color,
        borderColor: `${config.color}60`,
        fontWeight: 600,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

/** 圆点指示器 */
export function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
      }}
    />
  );
}
