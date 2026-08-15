/**
 * 计划页面
 * 计划列表 + 筛选 + CRUD 操作
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlanList from '../components/Plan/PlanList';
import PlanForm from '../components/Plan/PlanForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useStore } from '../store/useStore';
import type { Plan, PlanFormData, PlanType, PlanStatus } from '../types';
import { PLAN_TYPE_CONFIG, PLAN_STATUS_CONFIG } from '../types';

export default function PlansPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { plans, addPlan, updatePlan, deletePlan } = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  // 筛选状态
  const [typeFilter, setTypeFilter] = useState<PlanType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');

  // 筛选后的计划
  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        if (typeFilter !== 'all' && plan.type !== typeFilter) return false;
        if (statusFilter !== 'all' && plan.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // 按状态排序：active > completed > archived
        const statusOrder: Record<PlanStatus, number> = {
          active: 0,
          completed: 1,
          archived: 2,
        };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        // 按优先级排序
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [plans, typeFilter, statusFilter]);

  // 打开创建表单
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  // 打开编辑表单
  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  // 提交表单
  const handleSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updatePlan(editingPlan.id, data);
    } else {
      addPlan(data);
    }
    setFormOpen(false);
  };

  // 确认删除
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePlan(deleteTarget.id);
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
            计划
          </Typography>
          <Typography variant="body2" color="text.secondary">
            共 {plans.length} 个计划
          </Typography>
        </Box>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            新建计划
          </Button>
        )}
      </Box>

      {/* 筛选栏 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        {/* 类型筛选 */}
        <ToggleButtonGroup
          exclusive
          size="small"
          value={typeFilter}
          onChange={(_, value: PlanType | 'all' | null) =>
            value && setTypeFilter(value)
          }
        >
          <ToggleButton value="all" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem' }}>
            全部类型
          </ToggleButton>
          {(Object.keys(PLAN_TYPE_CONFIG) as PlanType[]).map((type) => (
            <ToggleButton
              key={type}
              value={type}
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: '0.8rem',
                color: PLAN_TYPE_CONFIG[type].color,
                '&.Mui-selected': {
                  bgcolor: `${PLAN_TYPE_CONFIG[type].color}20`,
                  color: PLAN_TYPE_CONFIG[type].color,
                },
              }}
            >
              {PLAN_TYPE_CONFIG[type].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* 状态筛选 */}
        <ToggleButtonGroup
          exclusive
          size="small"
          value={statusFilter}
          onChange={(_, value: PlanStatus | 'all' | null) =>
            value && setStatusFilter(value)
          }
        >
          <ToggleButton value="all" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem' }}>
            全部状态
          </ToggleButton>
          {(Object.keys(PLAN_STATUS_CONFIG) as PlanStatus[]).map((status) => (
            <ToggleButton
              key={status}
              value={status}
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: '0.8rem',
                color: PLAN_STATUS_CONFIG[status].color,
                '&.Mui-selected': {
                  bgcolor: `${PLAN_STATUS_CONFIG[status].color}20`,
                  color: PLAN_STATUS_CONFIG[status].color,
                },
              }}
            >
              {PLAN_STATUS_CONFIG[status].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* 计划列表 */}
      <PlanList
        plans={filteredPlans}
        onEdit={handleOpenEdit}
        onDelete={(plan) => setDeleteTarget(plan)}
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

      {/* 计划表单 */}
      <PlanForm
        open={formOpen}
        plan={editingPlan}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除计划"
        content={
          deleteTarget
            ? `确定要删除计划「${deleteTarget.title}」吗？关联的任务将解除关联（不会被删除）。此操作不可撤销。`
            : ''
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
