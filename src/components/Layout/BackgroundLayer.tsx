/**
 * 毛玻璃背景层
 * 固定全屏的渐变 + 彩色光斑，供上层半透明面板做 backdrop-filter 模糊
 */

import { Box } from '@mui/material';
import { useStore } from '../../store/useStore';

export default function BackgroundLayer() {
  const { themeMode } = useStore();
  const isDark = themeMode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* 基础渐变 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(160deg, #0b1020 0%, #111827 40%, #1e1b4b 100%)'
            : 'linear-gradient(160deg, #eef2ff 0%, #f8fafc 35%, #fdf2f8 100%)',
        }}
      />

      {/* 彩色光斑 */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 320, md: 560 },
          height: { xs: 320, md: 560 },
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: isDark ? 0.35 : 0.55,
          background: '#6366f1',
          top: '-12%',
          left: '-8%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 300, md: 480 },
          height: { xs: 300, md: 480 },
          borderRadius: '50%',
          filter: 'blur(90px)',
          opacity: isDark ? 0.28 : 0.45,
          background: '#ec4899',
          top: '30%',
          right: '-10%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 320, md: 520 },
          height: { xs: 320, md: 520 },
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: isDark ? 0.25 : 0.4,
          background: '#14b8a6',
          bottom: '-15%',
          left: '20%',
        }}
      />
    </Box>
  );
}
