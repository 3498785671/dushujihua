/**
 * 每日记录视图组件
 * 展示和编辑指定日期的笔记、心情、已完成事项
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import type { Mood, DailyRecordFormData } from '../../types';
import { MOOD_CONFIG } from '../../types';
import { useStore } from '../../store/useStore';
import { formatDate, formatDateChinese } from '../../utils/date';
import CompletedList from './CompletedList';

interface DailyRecordViewProps {
  date: string; // yyyy-MM-dd
}

export default function DailyRecordView({ date }: DailyRecordViewProps) {
  const {
    tasks,
    getDailyRecordByDate,
    addDailyRecord,
    updateDailyRecord,
  } = useStore();

  const existingRecord = getDailyRecordByDate(date);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);

  // 初始化/同步表单数据
  useEffect(() => {
    if (existingRecord) {
      setNotes(existingRecord.notes);
      setMood(existingRecord.mood || null);
    } else {
      setNotes('');
      setMood(null);
    }
    setIsEditing(false);
  }, [date, existingRecord]);

  // 当日已完成的任务
  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status !== 'done' || !t.completedAt) return false;
        return formatDate(t.completedAt, 'yyyy-MM-dd') === date;
      })
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  }, [tasks, date]);

  // 当日截止的任务
  const dueTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === date);
  }, [tasks, date]);

  /** 保存记录 */
  const handleSave = () => {
    const data: DailyRecordFormData = {
      date,
      notes: notes.trim(),
      mood: mood || undefined,
    };

    if (existingRecord) {
      updateDailyRecord(existingRecord.id, {
        notes: data.notes,
        mood: data.mood,
      });
    } else {
      addDailyRecord(data);
    }
    setIsEditing(false);
  };

  /** 取消编辑 */
  const handleCancel = () => {
    if (existingRecord) {
      setNotes(existingRecord.notes);
      setMood(existingRecord.mood || null);
    } else {
      setNotes('');
      setMood(null);
    }
    setIsEditing(false);
  };

  const hasRecord = existingRecord && (existingRecord.notes || existingRecord.mood);

  return (
    <Stack spacing={2}>
      {/* 日期标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatDateChinese(date)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {date}
          </Typography>
        </Box>
        {!isEditing && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            {hasRecord ? '编辑' : '添加记录'}
          </Button>
        )}
      </Box>

      {/* 心情 + 笔记 */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          {isEditing ? (
            <Stack spacing={2}>
              {/* 心情选择 */}
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  今日心情
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={mood}
                  onChange={(_, value: Mood | null) => setMood(value)}
                  size="small"
                  sx={{ flexWrap: 'wrap' }}
                >
                  {(Object.keys(MOOD_CONFIG) as Mood[]).map((m) => (
                    <ToggleButton
                      key={m}
                      value={m}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                        py: 0.75,
                        px: 1.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{MOOD_CONFIG[m].emoji}</span>
                      {MOOD_CONFIG[m].label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* 笔记输入 */}
              <TextField
                label="今日笔记"
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录今天发生的事、想法、感悟..."
              />

              {/* 操作按钮 */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  保存
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box>
              {hasRecord ? (
                <Stack spacing={1.5}>
                  {existingRecord!.mood && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        心情：
                      </Typography>
                      <span style={{ fontSize: '1.5rem' }}>
                        {MOOD_CONFIG[existingRecord!.mood!].emoji}
                      </span>
                      <Typography variant="body2">
                        {MOOD_CONFIG[existingRecord!.mood!].label}
                      </Typography>
                    </Box>
                  )}
                  {existingRecord!.notes ? (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: 'text.primary',
                        lineHeight: 1.7,
                      }}
                    >
                      {existingRecord!.notes}
                    </Typography>
                  ) : (
                    !existingRecord!.mood && (
                      <Typography variant="body2" color="text.secondary">
                        点击「添加记录」开始记录今天
                      </Typography>
                    )
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  还没有记录，点击「添加记录」开始吧
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider />

      {/* 已完成事项 */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          今日已完成 ({completedTasks.length})
        </Typography>
        <CompletedList
          tasks={completedTasks}
          emptyText="今天还没有完成任何任务"
        />
      </Box>

      {/* 今日截止任务 */}
      {dueTasks.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            今日截止 ({dueTasks.length})
          </Typography>
          <Stack spacing={0.5}>
            {dueTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor:
                      task.status === 'done'
                        ? '#22c55e'
                        : task.status === 'inProgress'
                        ? '#f59e0b'
                        : '#94a3b8',
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    color: task.status === 'done' ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {task.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
