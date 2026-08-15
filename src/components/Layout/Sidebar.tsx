/**
 * 侧边导航栏（毛玻璃）
 * 桌面端使用，展示应用 logo、导航菜单、用户信息与退出
 */

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Avatar,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

const NAV_ITEMS = [
  { path: '/', label: '仪表盘', icon: <DashboardOutlinedIcon /> },
  { path: '/calendar', label: '日历', icon: <CalendarMonthOutlinedIcon /> },
  { path: '/tasks', label: '任务', icon: <CheckCircleOutlineIcon /> },
  { path: '/plans', label: '计划', icon: <FlagOutlinedIcon /> },
  { path: '/tags', label: '标签', icon: <LocalOfferOutlinedIcon /> },
];

export default function Sidebar() {
  const { themeMode, toggleTheme, user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      }}
    >
      {/* Logo 区域 */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 6px 16px rgba(99,102,241,0.4)',
          }}
        >
          独
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            独属计划
          </Typography>
          <Typography variant="caption" color="text.secondary">
            个人计划管理
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* 导航菜单 */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === '/'}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              minHeight: 44,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      {/* 底部：用户信息 + 主题切换 + 退出 */}
      <Box sx={{ p: 1.5 }}>
        {user && (
          <Box
            sx={{
              px: 1,
              py: 1,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              borderRadius: 2,
            }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                我的专属计划
              </Typography>
            </Box>
          </Box>
        )}
        <Tooltip title={themeMode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
          <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 2, minHeight: 44 }}>
            <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center' }}>
              {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </ListItemIcon>
            <ListItemText
              primary={themeMode === 'light' ? '暗色模式' : '亮色模式'}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </Tooltip>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, minHeight: 44 }}>
          <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="退出登录" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}
