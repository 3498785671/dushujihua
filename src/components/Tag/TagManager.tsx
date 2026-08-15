/**
 * 标签管理组件
 * 提供标签的增删改查功能
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import type { Tag, TagFormData } from '../../types';
import { TAG_COLORS } from '../../types';
import { useStore } from '../../store/useStore';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';

export default function TagManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { tags, tasks, addTag, updateTag, deleteTag } = useStore();

  // 表单对话框状态
  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    color: TAG_COLORS[0],
  });
  const [nameError, setNameError] = useState<string>('');

  // 删除确认对话框状态
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  // 每个标签关联的任务数
  const tagTaskCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    tasks.forEach((task) => {
      task.tags.forEach((tagId) => {
        countMap[tagId] = (countMap[tagId] || 0) + 1;
      });
    });
    return countMap;
  }, [tasks]);

  /** 打开新建对话框 */
  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({ name: '', color: TAG_COLORS[0] });
    setNameError('');
    setFormOpen(true);
  };

  /** 打开编辑对话框 */
  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setNameError('');
    setFormOpen(true);
  };

  /** 提交表单 */
  const handleSubmit = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setNameError('请输入标签名称');
      return;
    }

    // 检查重名（排除自身）
    const duplicate = tags.find(
      (t) => t.name === trimmedName && t.id !== editingTag?.id
    );
    if (duplicate) {
      setNameError('标签名称已存在');
      return;
    }

    if (editingTag) {
      updateTag(editingTag.id, { name: trimmedName, color: formData.color });
    } else {
      addTag({ name: trimmedName, color: formData.color });
    }
    setFormOpen(false);
  };

  /** 确认删除 */
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTag(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (tags.length === 0) {
    return (
      <>
        <EmptyState
          icon={<LocalOfferOutlinedIcon sx={{ fontSize: 40 }} />}
          title="还没有标签"
          description="创建标签来分类管理你的任务"
          actionLabel="创建标签"
          onAction={handleOpenCreate}
        />
        <TagFormDialog
          open={formOpen}
          editingTag={editingTag}
          formData={formData}
          nameError={nameError}
          onFormChange={setFormData}
          onNameErrorChange={setNameError}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  return (
    <>
      {/* 标签网格 */}
      <Grid container spacing={2}>
        {tags.map((tag) => {
          const count = tagTaskCount[tag.id] || 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={tag.id}>
              <Card
                className="fade-in"
                sx={{
                  height: '100%',
                  '&:hover': { boxShadow: 2, borderColor: `${tag.color}60` },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1.5,
                            bgcolor: tag.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LocalOfferOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {tag.name}
                        </Typography>
                      </Stack>
                      <Chip
                        label={`${count} 个任务`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          bgcolor: `${tag.color}15`,
                          color: tag.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <Tooltip title="编辑">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(tag)}
                          color="inherit"
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(tag)}
                          color="error"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 新建标签按钮 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2 }}
        >
          新建标签
        </Button>
      </Box>

      {/* 表单对话框 */}
      <TagFormDialog
        open={formOpen}
        editingTag={editingTag}
        formData={formData}
        nameError={nameError}
        onFormChange={setFormData}
        onNameErrorChange={setNameError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除标签"
        content={
          deleteTarget
            ? `确定要删除标签「${deleteTarget.name}」吗？关联的 ${tagTaskCount[deleteTarget.id] || 0} 个任务将移除该标签。此操作不可撤销。`
            : ''
        }
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

// ==================== 标签表单对话框 ====================

interface TagFormDialogProps {
  open: boolean;
  editingTag: Tag | null;
  formData: TagFormData;
  nameError: string;
  onFormChange: (data: TagFormData) => void;
  onNameErrorChange: (error: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function TagFormDialog({
  open,
  editingTag,
  formData,
  nameError,
  onFormChange,
  onNameErrorChange,
  onClose,
  onSubmit,
}: TagFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editingTag ? '编辑标签' : '新建标签'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* 标签名称 */}
          <TextField
            label="标签名称"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => {
              onFormChange({ ...formData, name: e.target.value });
              onNameErrorChange('');
            }}
            error={!!nameError}
            helperText={nameError}
            autoFocus
            placeholder="如：工作、学习、生活..."
          />

          {/* 颜色选择 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              选择颜色
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 1,
              }}
            >
              {TAG_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => onFormChange({ ...formData, color })}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 2,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? 3 : 0,
                    borderColor: 'background.paper',
                    boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* 预览 */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              预览
            </Typography>
            <Chip
              label={formData.name || '标签名称'}
              sx={{
                bgcolor: `${formData.color}20`,
                color: formData.color,
                fontWeight: 600,
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          取消
        </Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          {editingTag ? '保存' : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
