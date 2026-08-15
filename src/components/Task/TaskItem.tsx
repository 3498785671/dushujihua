/**
 * 任务列表项组件
 * 展示单个任务信息，支持状态切换、编辑、删除
 */

import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { Task } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { useStore } from '../../store/useStore';
import { getRelativeDateLabel, isOverdue } from '../../utils/date';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** 状态图标映射 */
const STATUS_ICONS = {
  todo: <RadioButtonUncheckedIcon />,
  inProgress: <PendingIcon />,
  done: <CheckCircleIcon />,
};

export default function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const { toggleTaskStatus, tags } = useStore();

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const dueLabel = getRelativeDateLabel(task.dueDate);

  // 获取任务关联的标签对象
  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <Card
      className="fade-in"
      sx={{
        mb: 1.5,
        opacity: task.status === 'done' ? 0.65 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.light',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* 状态切换按钮 */}
          <Tooltip title={`点击切换状态（当前：${statusConfig.label}）`}>
            <IconButton
              size="small"
              onClick={() => toggleTaskStatus(task.id)}
              sx={{
                color: statusConfig.color,
                mt: -0.5,
                '&:hover': { bgcolor: `${statusConfig.color}15` },
              }}
            >
              {STATUS_ICONS[task.status]}
            </IconButton>
          </Tooltip>

          {/* 任务信息 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                color: task.status === 'done' ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </Typography>

            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.description}
              </Typography>
            )}

            {/* 元信息行 */}
            <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
              {/* 优先级 */}
              <Chip
                label={priorityConfig.label}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  color: priorityConfig.color,
                  borderColor: `${priorityConfig.color}50`,
                  fontWeight: 600,
                }}
              />

              {/* 截止日期 */}
              {dueLabel && (
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: '0.9rem !important' }} />}
                  label={dueLabel}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    color: overdue ? 'error.main' : 'text.secondary',
                    bgcolor: overdue ? 'rgba(239, 68, 68, 0.08)' : 'action.hover',
                    fontWeight: overdue ? 700 : 500,
                  }}
                />
              )}

              {/* 标签 */}
              {taskTags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: `${tag.color}20`,
                    color: tag.color,
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* 操作按钮 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title="编辑">
              <IconButton size="small" onClick={() => onEdit(task)} color="inherit">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除">
              <IconButton size="small" onClick={() => onDelete(task)} color="error">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
