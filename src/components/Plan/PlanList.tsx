/**
 * 计划列表组件
 * 展示计划卡片，包含关联任务统计、编辑/删除操作
 */

import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useState } from 'react';
import type { Plan } from '../../types';
import {
  PLAN_TYPE_CONFIG,
  PLAN_STATUS_CONFIG,
  PRIORITY_CONFIG,
} from '../../types';
import { useStore } from '../../store/useStore';
import { formatDate, getRelativeDateLabel, daysUntil } from '../../utils/date';
import EmptyState from '../common/EmptyState';

interface PlanListProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

export default function PlanList({ plans, onEdit, onDelete }: PlanListProps) {
  const { tasks } = useStore();
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; planId: string } | null>(null);

  // 计算每个计划的关联任务统计
  const planStats = useMemo(() => {
    const stats: Record<string, { total: number; done: number }> = {};
    plans.forEach((plan) => {
      stats[plan.id] = { total: 0, done: 0 };
    });
    tasks.forEach((task) => {
      if (task.planId && stats[task.planId]) {
        stats[task.planId].total++;
        if (task.status === 'done') stats[task.planId].done++;
      }
    });
    return stats;
  }, [plans, tasks]);

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<FlagOutlinedIcon sx={{ fontSize: 40 }} />}
        title="还没有计划"
        description="创建短期或长期计划，将相关任务组织在一起"
      />
    );
  }

  return (
    <Box>
      {plans.map((plan) => {
        const typeConfig = PLAN_TYPE_CONFIG[plan.type];
        const statusConfig = PLAN_STATUS_CONFIG[plan.status];
        const priorityConfig = PRIORITY_CONFIG[plan.priority];
        const stats = planStats[plan.id] || { total: 0, done: 0 };
        const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
        const daysLeft = daysUntil(plan.endDate);
        const isArchived = plan.status === 'archived';

        return (
          <Card
            key={plan.id}
            className="fade-in"
            sx={{
              mb: 2,
              opacity: isArchived ? 0.6 : 1,
              borderLeft: 4,
              borderLeftColor: typeConfig.color,
              '&:hover': { boxShadow: 2 },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* 左侧：计划信息 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip
                      label={typeConfig.label}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        bgcolor: `${typeConfig.color}20`,
                        color: typeConfig.color,
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        bgcolor: `${statusConfig.color}20`,
                        color: statusConfig.color,
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={`${priorityConfig.label}优`}
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
                  </Stack>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {plan.title}
                  </Typography>

                  {plan.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {plan.description}
                    </Typography>
                  )}

                  {/* 日期信息 */}
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {plan.startDate && (
                      <Typography variant="caption" color="text.secondary">
                        开始：{formatDate(plan.startDate)}
                      </Typography>
                    )}
                    {plan.endDate && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: daysLeft !== null && daysLeft < 0 && plan.status === 'active'
                            ? 'error.main'
                            : 'text.secondary',
                          fontWeight: daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && plan.status === 'active'
                            ? 700
                            : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <EventAvailableIcon sx={{ fontSize: '0.85rem' }} />
                        截止：{formatDate(plan.endDate)}
                        {plan.status === 'active' && getRelativeDateLabel(plan.endDate) && (
                          `（${getRelativeDateLabel(plan.endDate)}）`
                        )}
                      </Typography>
                    )}
                  </Stack>

                  {/* 任务进度 */}
                  {stats.total > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          任务进度
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.done}/{stats.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* 右侧：操作菜单 */}
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor({ el: e.currentTarget, planId: plan.id })}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* 操作菜单 */}
      <Menu
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor?.el || null}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            const plan = plans.find((p) => p.id === menuAnchor?.planId);
            if (plan) onEdit(plan);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>编辑</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const plan = plans.find((p) => p.id === menuAnchor?.planId);
            if (plan) onDelete(plan);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
