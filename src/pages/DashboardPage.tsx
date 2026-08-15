/**
 * 仪表盘页面
 * 展示今日任务概览、即将到期任务、统计数据
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { todayKey, isOverdue, isDateThisWeek, formatDate, getRelativeDateLabel } from '../utils/date';
import { STATUS_CONFIG, PRIORITY_CONFIG, PLAN_TYPE_CONFIG, PLAN_STATUS_CONFIG } from '../types';
import EmptyState from '../components/common/EmptyState';
import type { TaskStatus } from '../types';

/** 统计卡片配置 */
interface StatCardConfig {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, plans, tags } = useStore();
  const today = todayKey();

  // 统计数据
  const stats = useMemo(() => {
    const total = tasks.length;
    const todayTasks = tasks.filter((t) => t.dueDate === today);
    const overdue = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done');
    const inProgress = tasks.filter((t) => t.status === 'inProgress');
    const done = tasks.filter((t) => t.status === 'done');
    const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0;

    return {
      total,
      todayCount: todayTasks.length,
      overdueCount: overdue.length,
      inProgressCount: inProgress.length,
      doneCount: done.length,
      completionRate,
      todayTasks,
      overdueTasks: overdue,
    };
  }, [tasks, today]);

  // 即将到期任务（未来7天）
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'done' || !t.dueDate) return false;
        return isDateThisWeek(t.dueDate);
      })
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 5);
  }, [tasks]);

  // 活跃计划
  const activePlans = useMemo(() => {
    return plans.filter((p) => p.status === 'active').slice(0, 3);
  }, [plans]);

  // 统计卡片
  const statCards: StatCardConfig[] = [
    {
      label: '今日任务',
      value: stats.todayCount,
      icon: <CalendarTodayIcon />,
      color: '#6366f1',
    },
    {
      label: '进行中',
      value: stats.inProgressCount,
      icon: <PendingActionsIcon />,
      color: '#f59e0b',
    },
    {
      label: '已逾期',
      value: stats.overdueCount,
      icon: <WarningAmberIcon />,
      color: '#ef4444',
    },
    {
      label: '已完成',
      value: stats.doneCount,
      icon: <CheckCircleIcon />,
      color: '#22c55e',
    },
  ];

  // 状态图标
  const statusIcons: Record<TaskStatus, ReactNode> = {
    todo: <RadioButtonUncheckedIcon sx={{ color: STATUS_CONFIG.todo.color, fontSize: 20 }} />,
    inProgress: <PendingIcon sx={{ color: STATUS_CONFIG.inProgress.color, fontSize: 20 }} />,
    done: <CheckCircleIcon sx={{ color: STATUS_CONFIG.done.color, fontSize: 20 }} />,
  };

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          欢迎回来 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(new Date(), 'yyyy年 M月 d日 EEEE')}
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={6} md={3} key={card.label}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: card.color }}>
                    {card.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 左侧：今日任务 + 即将到期 */}
        <Grid item xs={12} md={8}>
          {/* 今日任务 */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                今日任务
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/tasks')}
              >
                查看全部
              </Button>
            </Box>

            {stats.todayTasks.length === 0 ? (
              <EmptyState
                title="今天没有任务"
                description="享受轻松的一天，或添加新任务"
                actionLabel="添加任务"
                onAction={() => navigate('/tasks')}
              />
            ) : (
              <List>
                {stats.todayTasks.slice(0, 5).map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {statusIcons[task.status]}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: {
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? 'text.secondary' : 'text.primary',
                          fontWeight: 500,
                        },
                      }}
                    />
                    <Chip
                      label={PRIORITY_CONFIG[task.priority].label}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        color: PRIORITY_CONFIG[task.priority].color,
                        borderColor: `${PRIORITY_CONFIG[task.priority].color}50`,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* 即将到期任务 */}
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              本周即将到期
            </Typography>
            {upcomingTasks.length === 0 ? (
              <EmptyState title="本周没有即将到期的任务" />
            ) : (
              <List>
                {upcomingTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {statusIcons[task.status]}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    />
                    <Chip
                      label={getRelativeDateLabel(task.dueDate)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        bgcolor: 'action.hover',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* 右侧：完成率 + 计划概览 */}
        <Grid item xs={12} md={4}>
          {/* 完成率 */}
          <Paper sx={{ p: 2.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                任务完成率
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: stats.completionRate >= 70 ? 'success.main' : 'primary.main',
                }}
              >
                {stats.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.doneCount} / {stats.total} 已完成
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                标签数
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {tags.length}
              </Typography>
            </Stack>
          </Paper>

          {/* 活跃计划 */}
          <Paper sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlagOutlinedIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  活跃计划
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/plans')}
              >
                全部
              </Button>
            </Box>
            {activePlans.length === 0 ? (
              <EmptyState
                title="暂无活跃计划"
                description="创建计划来组织你的目标"
                actionLabel="新建计划"
                onAction={() => navigate('/plans')}
              />
            ) : (
              <Stack spacing={1.5}>
                {activePlans.map((plan) => {
                  const planTasks = tasks.filter((t) => t.planId === plan.id);
                  const doneCount = planTasks.filter((t) => t.status === 'done').length;
                  const typeConfig = PLAN_TYPE_CONFIG[plan.type];
                  return (
                    <Box
                      key={plan.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderLeft: 3,
                        borderLeftColor: typeConfig.color,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {plan.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={typeConfig.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: `${typeConfig.color}20`,
                            color: typeConfig.color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {doneCount}/{planTasks.length} 任务
                        </Typography>
                        {plan.endDate && (
                          <Typography variant="caption" color="text.secondary">
                            · {getRelativeDateLabel(plan.endDate)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 快捷操作 */}
      <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks')}
        >
          添加任务
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          onClick={() => navigate('/calendar')}
        >
          查看日历
        </Button>
        <Button
          variant="outlined"
          startIcon={<FlagOutlinedIcon />}
          onClick={() => navigate('/plans')}
        >
          管理计划
        </Button>
      </Box>
    </Box>
  );
}
