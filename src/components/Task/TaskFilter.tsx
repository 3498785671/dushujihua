/**
 * 任务筛选栏组件
 * 提供关键词搜索、状态/优先级/标签筛选
 */

import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  Popover,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import type { TaskFilterCriteria, TaskStatus, Priority } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types';
import { useStore } from '../../store/useStore';

interface TaskFilterProps {
  filter: TaskFilterCriteria;
  onFilterChange: (filter: TaskFilterCriteria) => void;
}

export default function TaskFilter({ filter, onFilterChange }: TaskFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { tags } = useStore();
  const [tagPopoverAnchor, setTagPopoverAnchor] = useState<HTMLElement | null>(null);

  /** 更新筛选条件 */
  const updateFilter = (updates: Partial<TaskFilterCriteria>) => {
    onFilterChange({ ...filter, ...updates });
  };

  /** 是否有活跃的筛选条件 */
  const hasActiveFilter =
    filter.keyword !== '' ||
    filter.status !== 'all' ||
    filter.priority !== 'all' ||
    filter.tagIds.length > 0;

  /** 清除所有筛选 */
  const clearFilter = () => {
    onFilterChange({
      keyword: '',
      status: 'all',
      priority: 'all',
      tagIds: [],
    });
  };

  /** 切换标签筛选 */
  const toggleTagFilter = (tagId: string) => {
    updateFilter({
      tagIds: filter.tagIds.includes(tagId)
        ? filter.tagIds.filter((id) => id !== tagId)
        : [...filter.tagIds, tagId],
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* 搜索框 */}
      <TextField
        fullWidth
        size="small"
        placeholder="搜索任务标题或描述..."
        value={filter.keyword}
        onChange={(e) => updateFilter({ keyword: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: hasActiveFilter && (
            <InputAdornment position="end">
              <CloseIcon
                fontSize="small"
                color="action"
                sx={{ cursor: 'pointer' }}
                onClick={clearFilter}
              />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
      />

      {/* 筛选行 */}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={1.5} sx={{ alignItems: isMobile ? 'stretch' : 'center' }}>
        {/* 状态筛选 */}
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter.status}
          onChange={(_, value: TaskStatus | 'all' | null) =>
            value && updateFilter({ status: value })
          }
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem' }}>
            全部
          </ToggleButton>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
            <ToggleButton
              key={status}
              value={status}
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: '0.8rem',
                color: STATUS_CONFIG[status].color,
                '&.Mui-selected': {
                  bgcolor: `${STATUS_CONFIG[status].color}20`,
                  color: STATUS_CONFIG[status].color,
                },
              }}
            >
              {STATUS_CONFIG[status].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* 优先级筛选 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>优先级</InputLabel>
          <Select
            value={filter.priority}
            label="优先级"
            onChange={(e) => updateFilter({ priority: e.target.value as Priority | 'all' })}
          >
            <MenuItem value="all">全部</MenuItem>
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((priority) => (
              <MenuItem key={priority} value={priority}>
                {PRIORITY_CONFIG[priority].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 标签筛选 */}
        <Button
          size="small"
          variant={filter.tagIds.length > 0 ? 'contained' : 'outlined'}
          color={filter.tagIds.length > 0 ? 'primary' : 'inherit'}
          startIcon={<FilterListIcon />}
          onClick={(e) => setTagPopoverAnchor(e.currentTarget)}
          sx={{ textTransform: 'none' }}
        >
          标签{filter.tagIds.length > 0 ? ` (${filter.tagIds.length})` : ''}
        </Button>
      </Stack>

      {/* 已选标签展示 */}
      {filter.tagIds.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {filter.tagIds.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Chip
                key={tagId}
                label={tag.name}
                size="small"
                onDelete={() => toggleTagFilter(tagId)}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: `${tag.color}20`,
                  color: tag.color,
                }}
              />
            );
          })}
        </Box>
      )}

      {/* 标签选择弹出层 */}
      <Popover
        open={Boolean(tagPopoverAnchor)}
        anchorEl={tagPopoverAnchor}
        onClose={() => setTagPopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.length === 0 ? (
              <Box sx={{ py: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                暂无标签
              </Box>
            ) : (
              tags.map((tag) => {
                const selected = filter.tagIds.includes(tag.id);
                return (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    clickable
                    onClick={() => toggleTagFilter(tag.id)}
                    sx={{
                      bgcolor: selected ? `${tag.color}30` : 'transparent',
                      color: selected ? tag.color : 'text.secondary',
                      border: `1px solid ${selected ? tag.color : 'divider'}`,
                    }}
                  />
                );
              })
            )}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
