/**
 * 日历页面
 * 日历视图 + 选中日期详情 + 每日记录
 */

import { useState, useMemo } from 'react';
import { Box, Grid, Paper, Typography, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarView from '../components/Calendar/CalendarView';
import DailyRecordView from '../components/DailyRecord/DailyRecordView';
import TaskItem from '../components/Task/TaskItem';
import TaskForm from '../components/Task/TaskForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/date';
import type { Task, TaskFormData } from '../types';

export default function CalendarPage() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const selectedDateKey = formatDate(selectedDate, 'yyyy-MM-dd');

  // 选中日期的任务
  const selectedDateTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === selectedDateKey)
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { todo: 0, inProgress: 1, done: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
  }, [tasks, selectedDateKey]);

  // 提交任务表单
  const handleSubmitTask = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setTaskFormOpen(false);
  };

  // 确认删除
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        日历
      </Typography>

      <Grid container spacing={3}>
        {/* 日历主体 */}
        <Grid item xs={12} md={7}>
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </Grid>

        {/* 选中日期详情 */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5 }}>
            {/* 日期标题 + 快速添加 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                当日任务
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTask(null);
                  setTaskFormOpen(true);
                }}
              >
                添加
              </Button>
            </Box>

            {/* 当日任务列表 */}
            {selectedDateTasks.length === 0 ? (
              <EmptyState
                icon={<EventNoteIcon sx={{ fontSize: 36 }} />}
                title="当日无任务"
                description="点击上方「添加」创建任务"
              />
            ) : (
              <Stack spacing={1}>
                {selectedDateTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setTaskFormOpen(true);
                    }}
                    onDelete={(t) => setDeleteTarget(t)}
                  />
                ))}
              </Stack>
            )}

            {/* 分隔线 */}
            <Box sx={{ my: 2, borderTop: 1, borderColor: 'divider' }} />

            {/* 每日记录 */}
            <DailyRecordView date={selectedDateKey} />
          </Paper>
        </Grid>
      </Grid>

      {/* 任务表单 */}
      <TaskForm
        open={taskFormOpen}
        task={editingTask}
        defaultDate={selectedDateKey}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={handleSubmitTask}
      />

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除任务"
        content={
          deleteTarget
            ? `确定要删除任务「${deleteTarget.title}」吗？此操作不可撤销。`
            : ''
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
