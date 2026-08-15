/**
 * 标签管理页面
 */

import { Box, Typography } from '@mui/material';
import TagManager from '../components/Tag/TagManager';
import { useStore } from '../store/useStore';

export default function TagsPage() {
  const { tags } = useStore();

  return (
    <Box>
      {/* 页面标题 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          标签管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {tags.length} 个标签，用于分类和筛选任务
        </Typography>
      </Box>

      {/* 标签管理器 */}
      <TagManager />
    </Box>
  );
}
