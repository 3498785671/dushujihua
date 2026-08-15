/**
 * 日历视图主组件
 * 月历形式展示，标注有任务/记录的日期
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Chip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Task, DailyRecord } from '../../types';
import { useStore } from '../../store/useStore';
import { getMonthGrid, isSameMonthDate, formatDate, WEEKDAY_LABELS, addMonths, subMonths } from '../../utils/date';
import DayCell from './DayCell';

interface CalendarViewProps {
  /** 日历选中日期变化时的回调 */
  onDateSelect: (date: Date) => void;
  /** 当前选中的日期 */
  selectedDate: Date;
}

export default function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const { tasks, dailyRecords } = useStore();
  // 当前展示的月份
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  /** 获取日历网格（42天） */
  const monthGrid = useMemo(() => getMonthGrid(currentMonth), [currentMonth]);

  /** 按日期分组任务 */
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = [];
        map[task.dueDate].push(task);
      }
    });
    return map;
  }, [tasks]);

  /** 按日期分组记录 */
  const recordsByDate = useMemo(() => {
    const map: Record<string, DailyRecord[]> = {};
    dailyRecords.forEach((record) => {
      if (!map[record.date]) map[record.date] = [];
      map[record.date].push(record);
    });
    return map;
  }, [dailyRecords]);

  /** 上个月 */
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  /** 下个月 */
  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  /** 回到今天 */
  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  }, [onDateSelect]);

  /** 处理日期点击 */
  const handleDateClick = useCallback(
    (date: Date) => {
      onDateSelect(date);
      // 点击相邻月份的日期时，自动切换到对应月份，实现随心选日期
      if (!isSameMonthDate(date, currentMonth)) {
        setCurrentMonth(date);
      }
    },
    [onDateSelect, currentMonth]
  );

  // 当前月份任务统计
  const monthTaskCount = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return isSameMonthDate(d, currentMonth);
    }).length;
  }, [tasks, currentMonth]);

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
      {/* 日历头部 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatDate(currentMonth, 'yyyy年M月')}
          </Typography>
          <Chip
            label={`${monthTaskCount} 个任务`}
            size="small"
            sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main', fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={handleToday} sx={{ borderRadius: 2, px: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              今天
            </Typography>
          </IconButton>
          <IconButton size="small" onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 星期表头 */}
      <Grid container columns={7} spacing={0} sx={{ mb: 1 }}>
        {WEEKDAY_LABELS.map((label) => (
          <Grid item xs={1} key={label}>
            <Box
              sx={{
                textAlign: 'center',
                py: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 日历网格 */}
      <Grid container columns={7} spacing={0.5}>
        {monthGrid.map((date) => {
          const dateKey = formatDate(date, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const dayRecords = recordsByDate[dateKey] || [];
          const isInCurrentMonth = isSameMonthDate(date, currentMonth);
          const isSelected =
            formatDate(date, 'yyyy-MM-dd') === formatDate(selectedDate, 'yyyy-MM-dd');

          return (
            <Grid item xs={1} key={dateKey}>
              <Box
                sx={{
                  borderRadius: 1.5,
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  overflow: 'hidden',
                }}
              >
                <DayCell
                  date={date}
                  tasks={dayTasks}
                  records={dayRecords}
                  isInCurrentMonth={isInCurrentMonth}
                  onClick={handleDateClick}
                />
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* 图例 */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          { color: '#94a3b8', label: '未开始' },
          { color: '#f59e0b', label: '进行中' },
          { color: '#22c55e', label: '已完成' },
          { color: '#8b5cf6', label: '有记录' },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: item.color,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
