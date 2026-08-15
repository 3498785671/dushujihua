/**
 * 任务表单组件（对话框）
 * 用于创建和编辑任务
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText,
} from '@mui/material';
import type { Task, TaskFormData, TaskStatus, Priority } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { useStore } from '../../store/useStore';

interface TaskFormProps {
  open: boolean;
  task: Task | null; // null = 创建模式
  defaultDate?: string; // 默认截止日期（从日历快速创建时使用）
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

export default function TaskForm({ open, task, defaultDate, onClose, onSubmit }: TaskFormProps) {
  const { tags, plans } = useStore();
  const isEdit = task !== null;

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: defaultDate || '',
    tags: [],
    planId: '',
  });
  const [errors, setErrors] = useState<{ title?: string }>({});

  // 当对话框打开或 task 变化时，初始化表单
  useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate || '',
          tags: [...task.tags],
          planId: task.planId || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: defaultDate || '',
          tags: [],
          planId: '',
        });
      }
      setErrors({});
    }
  }, [open, task, defaultDate]);

  /** 更新表单字段 */
  const updateField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /** 切换标签选中状态 */
  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  /** 提交表单 */
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setErrors({ title: '请输入任务标题' });
      return;
    }
    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      dueDate: formData.dueDate || undefined,
      planId: formData.planId || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? '编辑任务' : '新建任务'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* 标题 */}
          <TextField
            label="任务标题"
            required
            fullWidth
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            autoFocus
            placeholder="输入任务名称..."
          />

          {/* 描述 */}
          <TextField
            label="描述"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="添加任务详情（可选）..."
          />

          {/* 状态 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              状态
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={formData.status}
              onChange={(_, value: TaskStatus | null) => value && updateField('status', value)}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                <ToggleButton
                  key={status}
                  value={status}
                  sx={{
                    color: STATUS_CONFIG[status].color,
                    borderColor: `${STATUS_CONFIG[status].color}40`,
                    '&.Mui-selected': {
                      bgcolor: `${STATUS_CONFIG[status].color}20`,
                      color: STATUS_CONFIG[status].color,
                      fontWeight: 700,
                    },
                  }}
                >
                  {STATUS_CONFIG[status].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 优先级 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              优先级
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={formData.priority}
              onChange={(_, value: Priority | null) => value && updateField('priority', value)}
              size="small"
            >
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((priority) => (
                <ToggleButton
                  key={priority}
                  value={priority}
                  sx={{
                    color: PRIORITY_CONFIG[priority].color,
                    borderColor: `${PRIORITY_CONFIG[priority].color}40`,
                    '&.Mui-selected': {
                      bgcolor: `${PRIORITY_CONFIG[priority].color}20`,
                      color: PRIORITY_CONFIG[priority].color,
                      fontWeight: 700,
                    },
                  }}
                >
                  {PRIORITY_CONFIG[priority].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 截止日期 */}
          <TextField
            label="截止日期"
            type="date"
            fullWidth
            value={formData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* 关联计划 */}
          <FormControl fullWidth size="small">
            <InputLabel>关联计划</InputLabel>
            <Select
              value={formData.planId || ''}
              label="关联计划"
              onChange={(e) => updateField('planId', e.target.value)}
            >
              <MenuItem value="">
                <em>无</em>
              </MenuItem>
              {plans
                .filter((p) => p.status === 'active')
                .map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* 标签选择 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              标签
            </Typography>
            {tags.length === 0 ? (
              <FormHelperText>暂无标签，请先在标签页创建</FormHelperText>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => {
                  const selected = formData.tags.includes(tag.id);
                  return (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      clickable
                      onClick={() => toggleTag(tag.id)}
                      sx={{
                        bgcolor: selected ? `${tag.color}30` : 'transparent',
                        color: selected ? tag.color : 'text.secondary',
                        border: `1px solid ${selected ? tag.color : 'divider'}`,
                        fontWeight: selected ? 600 : 400,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? '保存' : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
