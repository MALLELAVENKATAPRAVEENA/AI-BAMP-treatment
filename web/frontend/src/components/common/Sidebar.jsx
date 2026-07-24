import React, { useState, useEffect } from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider,
  Typography, IconButton, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import {
  Dashboard, People, CloudUpload, Polyline, Insights, Assessment,
  ViewInAr, Description, Settings, Menu, ChevronLeft, SmartToy
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Collapsible Sidebar State (Remembers state, auto-collapses on mobile)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? JSON.parse(saved) : isMobile;
  });

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', JSON.stringify(nextState));
  };

  const menuGroups = [
    {
      title: 'CLINICAL DASHBOARD',
      items: [
        { label: 'Orthodontist Dashboard', icon: <Dashboard />, path: '/dashboard' }
      ]
    },
    {
      title: 'PATIENT CLINIC',
      items: [
        { label: 'Patient Directory', icon: <People />, path: '/patients' },
        { label: 'Register New Patient', icon: <People />, path: '/patients/add' }
      ]
    },
    {
      title: 'AI CLINICAL WORKFLOW',
      items: [
        { label: 'Upload X-Ray Radiograph', icon: <CloudUpload />, path: '/ai/xray-upload' },
        { label: 'Landmark Detection Overlay', icon: <Polyline />, path: '/ai/landmark-detection' },
        { label: 'Cephalometric Measurements', icon: <Assessment />, path: '/ai/cephalometric-analysis' },
        { label: 'AI Outcome Predictor', icon: <Insights />, path: '/ai/prediction-results' },
        { label: 'SHAP Feature Drivers', icon: <Insights />, path: '/ai/shap-explanation' },
        { label: '3D Craniofacial AI Mesh', icon: <ViewInAr />, path: '/ai/3d-visualization' },
        { label: 'AI Assistant Chatbot', icon: <SmartToy />, path: '/ai/chat' }
      ]
    },
    {
      title: 'PDF REPORTS & SETTINGS',
      items: [
        { label: 'Generated PDF Reports', icon: <Description />, path: '/reports' },
        { label: 'Export PDF Report', icon: <Description />, path: '/reports/generate' },
        { label: 'Practitioner Profile Settings', icon: <Settings />, path: '/settings/profile' }
      ]
    }
  ];

  const drawerWidth = collapsed ? 72 : 260;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden'
        }
      }}
    >
      <Box p={2} display="flex" alignItems="center" justifyContent={collapsed ? 'center' : 'space-between'}>
        {!collapsed && (
          <Typography variant="h6" fontWeight={800} color="primary.main" noWrap sx={{ letterSpacing: '0.5px' }}>
            AI BAMP PREDICTOR
          </Typography>
        )}
        <IconButton onClick={toggleSidebar} color="primary" title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          {collapsed ? <Menu /> : <ChevronLeft />}
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ overflowY: 'auto', p: 1 }}>
        {menuGroups.map((group, idx) => (
          <Box key={idx} mb={2}>
            {!collapsed && (
              <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                {group.title}
              </Typography>
            )}
            <List size="small" disablePadding>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const buttonContent = (
                  <ListItemButton
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: '10px',
                      mb: 0.5,
                      px: collapsed ? 1.5 : 2,
                      justifyContent: collapsed ? 'center' : 'initial',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '& .MuiListItemIcon-root': { color: '#fff' }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? '#fff' : 'primary.main', minWidth: collapsed ? 0 : 36, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500, noWrap: true }}
                      />
                    )}
                  </ListItemButton>
                );

                return collapsed ? (
                  <Tooltip key={item.path} title={item.label} placement="right" arrow>
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
};
