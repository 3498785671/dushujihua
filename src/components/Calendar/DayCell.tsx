/**
 * 日历单元格组件
 * 展示日期、任务指示器、点击交互
 */

import { Box, Typography, Tooltip } from '@mui/material';
import type { Task, DailyRecord } from '../../types';
import { isTodayDate } from '../../utils/date';

interface DayCellProps {
  date: Date;
  tasks: Task[];
  records: DailyRecord[];
  isInCurrentMonth: boolean;
  onClick: (date: Date) => void;
}

/** 任务状态颜色 */
const STATUS_DOT_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  inProgress: '#f59e0b',
  done: '#22c55e',
};

export default function DayCell({
  date,
  tasks,
  records,
  isInCurrentMonth,
  onClick,
}: DayCellProps) {
  const isToday = isTodayDate(date);
  const dayNumber = date.getDate();
  const hasTasks = tasks.length > 0;
  const hasRecords = records.length > 0;

  // 获取任务状态分布（最多3种状态）
  const statusSet = new Set(tasks.map((t) => t.status));
  const statusColors = Array.from(statusSet)
    .map((s) => STATUS_DOT_COLORS[s])
    .slice(0, 3);

  return (
    <Tooltip
      title={
        tasks.length > 0
          ? `${tasks.length} 个任务`
          : hasRecords
          ? '有记录'
          : '无任务'
      }
      arrow
    >
      <Box
        onClick={() => onClick(date)}
        sx={{
          minHeight: { xs: 56, sm: 72 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pt: 1,
          cursor: 'pointer',
          borderRadius: 1.5,
          bgcolor: isToday ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
          border: 1,
          borderColor: isToday ? 'primary.main' : 'transparent',
          opacity: isInCurrentMonth ? 1 : 0.35,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: isToday ? 'rgba(99, 102, 241, 0.14)' : 'action.hover',
          },
          position: 'relative',
        }}
      >
        {/* 日期数字 */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 700 : 400,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: isToday ? 'primary.main' : 'transparent',
            color: isToday ? '#fff' : 'text.primary',
          }}
        >
          {dayNumber}
        </Typography>

        {/* 任务指示器（圆点） */}
        {hasTasks && (
          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '80%',
            }}
          >
            {statusColors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: color,
                }}
              />
            ))}
            {tasks.length > 3 && (
              <Typography
                variant="caption"
                sx={{ fontSize: '0.6rem', lineHeight: 1, color: 'text.secondary' }}
              >
                +{tasks.length - 3}
              </Typography>
            )}
          </Box>
        )}

        {/* 记录指示器 */}
        {hasRecords && !hasTasks && (
          <Box
            sx={{
              mt: 0.5,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
            }}
          />
        )}

        {/* 记录指示器（有任务时用小条） */}
        {hasRecords && hasTasks && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              width: 16,
              height: 2,
              borderRadius: 1,
              bgcolor: 'secondary.main',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
