/**
 * 应用主布局
 * 桌面端：侧边栏 + 内容区
 * 移动端：内容区 + 底部导航栏
 * 包含全局 Snackbar 通知
 */

import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStore } from '../../store/useStore';

/** 移动端底部导航配置 */
const BOTTOM_NAV_ITEMS = [
  { path: '/', label: '仪表盘', icon: <DashboardOutlinedIcon /> },
  { path: '/calendar', label: '日历', icon: <CalendarMonthOutlinedIcon /> },
  { path: '/tasks', label: '任务', icon: <CheckCircleOutlineIcon /> },
  { path: '/plans', label: '计划', icon: <FlagOutlinedIcon /> },
  { path: '/tags', label: '标签', icon: <LocalOfferOutlinedIcon /> },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, toggleTheme, notification, closeNotification, user, logout } = useStore();

  // 当前激活的底部导航索引
  const currentNavIndex = Math.max(
    0,
    BOTTOM_NAV_ITEMS.findIndex((item) => item.path === location.pathname)
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && <Sidebar />}

      {/* 主内容区 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 移动端顶部栏 */}
        {isMobile && (
          <AppBar
            position="static"
            color="transparent"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar sx={{ minHeight: '56px !important' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  mr: 1,
                }}
              >
                独
              </Box>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                独属计划
              </Typography>
              {user && (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {user.username}
                </Typography>
              )}
              <IconButton onClick={toggleTheme} color="inherit">
                {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
              <IconButton onClick={handleLogout} color="inherit" title="退出登录">
                <LogoutIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {/* 页面内容 */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            pb: isMobile ? 7 : 0, // 底部导航栏高度
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
            <Outlet />
          </Box>
        </Box>

        {/* 移动端底部导航 */}
        {isMobile && (
          <BottomNavigation
            value={currentNavIndex}
            onChange={(_, newValue) => {
              navigate(BOTTOM_NAV_ITEMS[newValue].path);
            }}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              zIndex: 1100,
              height: 64,
            }}
          >
            {BOTTOM_NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                sx={{
                  '&.Mui-selected': { color: 'primary.main' },
                  minWidth: 'auto',
                }}
              />
            ))}
          </BottomNavigation>
        )}
      </Box>

      {/* 全局通知 Snackbar */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={3000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: isMobile ? 80 : 24 }}
      >
        {notification ? (
          <Alert
            onClose={closeNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
