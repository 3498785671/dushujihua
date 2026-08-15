/**
 * 计划表单组件（对话框）
 * 用于创建和编辑计划
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
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { Plan, PlanFormData, PlanType, PlanStatus, Priority } from '../../types';
import { PLAN_TYPE_CONFIG, PLAN_STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { useStore } from '../../store/useStore';

interface PlanFormProps {
  open: boolean;
  plan: Plan | null; // null = 创建模式
  onClose: () => void;
  onSubmit: (data: PlanFormData) => void;
}

export default function PlanForm({ open, plan, onClose, onSubmit }: PlanFormProps) {
  const isEdit = plan !== null;

  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    description: '',
    type: 'shortTerm',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'active',
  });
  const [errors, setErrors] = useState<{
    title?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    if (open) {
      if (plan) {
        setFormData({
          title: plan.title,
          description: plan.description || '',
          type: plan.type,
          startDate: plan.startDate || '',
          endDate: plan.endDate || '',
          priority: plan.priority,
          status: plan.status,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          type: 'shortTerm',
          startDate: '',
          endDate: '',
          priority: 'medium',
          status: 'active',
        });
      }
      setErrors({});
    }
  }, [open, plan]);

  const updateField = <K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入计划标题';
    }

    // 验证截止日期不早于开始日期
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = '截止日期不能早于开始日期';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? '编辑计划' : '新建计划'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* 标题 */}
          <TextField
            label="计划标题"
            required
            fullWidth
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            autoFocus
            placeholder="输入计划名称..."
          />

          {/* 描述 */}
          <TextField
            label="描述"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="添加计划详情（可选）..."
          />

          {/* 计划类型 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              计划类型
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={formData.type}
              onChange={(_, value: PlanType | null) => value && updateField('type', value)}
              size="small"
            >
              {(Object.keys(PLAN_TYPE_CONFIG) as PlanType[]).map((type) => (
                <ToggleButton
                  key={type}
                  value={type}
                  sx={{
                    color: PLAN_TYPE_CONFIG[type].color,
                    borderColor: `${PLAN_TYPE_CONFIG[type].color}40`,
                    '&.Mui-selected': {
                      bgcolor: `${PLAN_TYPE_CONFIG[type].color}20`,
                      color: PLAN_TYPE_CONFIG[type].color,
                      fontWeight: 700,
                    },
                  }}
                >
                  {PLAN_TYPE_CONFIG[type].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 日期范围 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="开始日期"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="截止日期"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputLabelProps={{ shrink: true }}
            />
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

          {/* 计划状态 */}
          <FormControl fullWidth size="small">
            <InputLabel>状态</InputLabel>
            <Select
              value={formData.status}
              label="状态"
              onChange={(e) => updateField('status', e.target.value as PlanStatus)}
            >
              {(Object.keys(PLAN_STATUS_CONFIG) as PlanStatus[]).map((status) => (
                <MenuItem key={status} value={status}>
                  {PLAN_STATUS_CONFIG[status].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
