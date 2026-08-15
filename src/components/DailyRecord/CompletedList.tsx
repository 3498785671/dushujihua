/**
 * 已完成事项列表组件
 * 展示指定日期已完成的任务
 */

import { Box, Typography, Stack, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import EmptyState from '../common/EmptyState';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface CompletedListProps {
  tasks: Task[];
  emptyText?: string;
}

export default function CompletedList({ tasks, emptyText }: CompletedListProps) {
  if (tasks.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <EmptyState
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 36 }} />}
          title="暂无已完成事项"
          description={emptyText || '完成的任务将显示在这里'}
        />
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {tasks.map((task) => {
        const priorityConfig = PRIORITY_CONFIG[task.priority];
        return (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
              px: 1.5,
              borderRadius: 1.5,
              bgcolor: 'rgba(34, 197, 94, 0.08)',
              '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.12)' },
            }}
          >
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                textDecoration: 'line-through',
                color: 'text.secondary',
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>
            <Chip
              label={priorityConfig.label}
              size="small"
              variant="outlined"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                color: priorityConfig.color,
                borderColor: `${priorityConfig.color}50`,
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
