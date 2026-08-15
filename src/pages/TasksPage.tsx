/**
 * 任务列表页面
 * 任务筛选 + 列表 + CRUD 操作
 */

import { useState, useMemo } from 'react';
import { Box, Typography, Button, Fab, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskList, { filterTasks } from '../components/Task/TaskList';
import TaskFilter from '../components/Task/TaskFilter';
import TaskForm from '../components/Task/TaskForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useStore } from '../store/useStore';
import type { Task, TaskFilterCriteria, TaskFormData } from '../types';
import { todayKey } from '../utils/date';

const DEFAULT_FILTER: TaskFilterCriteria = {
  keyword: '',
  status: 'all',
  priority: 'all',
  tagIds: [],
};

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { tasks, addTask, updateTask, deleteTask } = useStore();

  const [filter, setFilter] = useState<TaskFilterCriteria>(DEFAULT_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // 筛选后的任务数（用于标题显示）
  const filteredCount = useMemo(
    () => filterTasks(tasks, filter).length,
    [tasks, filter]
  );

  // 打开创建表单
  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  // 打开编辑表单
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  // 提交表单
  const handleSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setFormOpen(false);
  };

  // 确认删除
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      {/* 页面标题 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            任务
          </Typography>
          <Typography variant="body2" color="text.secondary">
            共 {tasks.length} 个任务，显示 {filteredCount} 个
          </Typography>
        </Box>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            新建任务
          </Button>
        )}
      </Box>

      {/* 筛选栏 */}
      <TaskFilter filter={filter} onFilterChange={setFilter} />

      {/* 任务列表 */}
      <TaskList
        tasks={tasks}
        filter={filter}
        onEdit={handleOpenEdit}
        onDelete={(task) => setDeleteTarget(task)}
      />

      {/* 移动端 FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={handleOpenCreate}
          sx={{
            position: 'fixed',
            bottom: 76,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* 任务表单 */}
      <TaskForm
        open={formOpen}
        task={editingTask}
        defaultDate={todayKey()}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
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
