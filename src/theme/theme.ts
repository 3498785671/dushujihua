/**
 * MUI 主题配置（毛玻璃风格）
 * 主色调：蓝紫色系 (#6366f1)
 * 面板采用半透明 + backdrop-filter 模糊的毛玻璃效果，支持亮色/暗色
 */

import { createTheme, type Theme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const isLight = mode === 'light';

  // 毛玻璃面板样式
  const glassBg = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(30,41,59,0.5)';
  const glassBgStrong = isLight ? 'rgba(255,255,255,0.78)' : 'rgba(30,41,59,0.82)';
  const glassBorder = isLight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.08)';
  const glassBlur = 'blur(20px) saturate(160%)';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
        contrastText: '#ffffff',
      },
      success: { main: '#22c55e', light: '#4ade80', dark: '#16a34a' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
      error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
      info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
      ...(isLight
        ? {
            background: { default: 'rgba(0,0,0,0)', paper: 'rgba(0,0,0,0)' },
            text: { primary: '#1e293b', secondary: '#64748b' },
            divider: 'rgba(100,116,139,0.18)',
          }
        : {
            background: { default: 'rgba(0,0,0,0)', paper: 'rgba(0,0,0,0)' },
            text: { primary: '#f1f5f9', secondary: '#94a3b8' },
            divider: 'rgba(148,163,184,0.16)',
          }),
    },
    typography: {
      fontFamily:
        '"Inter", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontSize: '2rem', fontWeight: 700 },
      h2: { fontSize: '1.75rem', fontWeight: 700 },
      h3: { fontSize: '1.5rem', fontWeight: 600 },
      h4: { fontSize: '1.25rem', fontWeight: 600 },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { background: 'transparent' },
          body: {
            background: 'transparent',
            scrollbarColor: isLight ? '#c7d2fe #f8fafc' : '#475569 #0f172a',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${glassBorder}`,
            boxShadow: isLight
              ? '0 4px 24px rgba(99,102,241,0.08)'
              : '0 4px 24px rgba(0,0,0,0.25)',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${glassBorder}`,
            boxShadow: isLight
              ? '0 4px 24px rgba(99,102,241,0.08)'
              : '0 4px 24px rgba(0,0,0,0.25)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: glassBgStrong,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            border: `1px solid ${glassBorder}`,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: glassBg,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
            borderBottom: `1px solid ${glassBorder}`,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { backdropFilter: 'none', WebkitBackdropFilter: 'none' },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: glassBgStrong,
            backdropFilter: glassBlur,
            WebkitBackdropFilter: glassBlur,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
          contained: { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
    },
  });
};
