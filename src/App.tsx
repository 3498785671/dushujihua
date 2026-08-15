/**
 * 应用根组件
 * 包含 StoreProvider、ThemeProvider、毛玻璃背景层、路由与鉴权守卫
 */

import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { StoreProvider, useStore } from './store/useStore';
import { createAppTheme } from './theme/theme';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import PlansPage from './pages/PlansPage';
import TagsPage from './pages/TagsPage';

/** 启动加载页 */
function SplashScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.8rem',
          boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
        }}
      >
        独
      </Box>
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        正在加载…
      </Typography>
    </Box>
  );
}

/** 鉴权守卫：未登录跳转登录页 */
function RequireAuth() {
  const { user } = useStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

/** 路由（等待初始认证检查完成后渲染） */
function AppRoutes() {
  const { authLoading } = useStore();
  if (authLoading) {
    return <SplashScreen />;
  }
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/tags" element={<TagsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** 主题化应用 */
function ThemedApp() {
  const { themeMode } = useStore();
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundLayer />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

/** 应用根组件 */
export default function App() {
  return (
    <StoreProvider>
      <ThemedApp />
    </StoreProvider>
  );
}
