/**
 * 应用根组件（单机版）
 * StoreProvider + ThemeProvider + 毛玻璃背景 + 路由（无登录）
 */

import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/useStore';
import { createAppTheme } from './theme/theme';
import BackgroundLayer from './components/Layout/BackgroundLayer';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import PlansPage from './pages/PlansPage';
import TagsPage from './pages/TagsPage';

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
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/tags" element={<TagsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
