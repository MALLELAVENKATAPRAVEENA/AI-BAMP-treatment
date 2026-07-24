import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography } from '@mui/material';
import {
  Dashboard, People, CloudUpload, Polyline, Insights, Assessment,
  ViewInAr, Description, AdminPanelSettings, Analytics, Settings, History, SmartToy
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const menuGroups = [
    {
      title: 'DASHBOARDS',
      items: [
        { label: 'Orthodontist Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['Orthodontist', 'Administrator'] },
        { label: 'Admin Workspace', icon: <AdminPanelSettings />, path: '/admin/dashboard', roles: ['Administrator'] },
        { label: 'Researcher Analytics', icon: <Analytics />, path: '/researcher/dashboard', roles: ['Researcher', 'Administrator'] }
      ]
    },
    {
      title: 'PATIENT CLINIC',
      items: [
        { label: 'Patient Directory', icon: <People />, path: '/patients', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: 'Register Patient', icon: <People />, path: '/patients/add', roles: ['Orthodontist', 'Administrator'] },
      ]
    },
    {
      title: 'AI WORKFLOW',
      items: [
        { label: 'Upload X-Ray', icon: <CloudUpload />, path: '/ai/xray-upload', roles: ['Orthodontist', 'Administrator'] },
        { label: 'Landmark Detection', icon: <Polyline />, path: '/ai/landmark-detection', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: 'Cephalometric Analysis', icon: <Assessment />, path: '/ai/cephalometric-analysis', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: 'AI Outcome Prediction', icon: <Insights />, path: '/ai/prediction-results', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: 'SHAP Feature Drivers', icon: <Insights />, path: '/ai/shap-explanation', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: '3D Craniofacial Mesh', icon: <ViewInAr />, path: '/ai/3d-visualization', roles: ['Orthodontist', 'Administrator', 'Researcher'] },
        { label: 'AI Assistant Chat', icon: <SmartToy />, path: '/ai/chat', roles: ['Orthodontist', 'Administrator', 'Researcher'] }
      ]
    },
    {
      title: 'REPORTS & MANAGEMENT',
      items: [
        { label: 'PDF Reports List', icon: <Description />, path: '/reports', roles: ['Orthodontist', 'Administrator'] },
        { label: 'Generate PDF Report', icon: <Description />, path: '/reports/generate', roles: ['Orthodontist', 'Administrator'] },
        { label: 'User Administration', icon: <AdminPanelSettings />, path: '/admin/users', roles: ['Administrator'] },
        { label: 'Audit Logs', icon: <History />, path: '/admin/audit-logs', roles: ['Administrator', 'Researcher'] },
        { label: 'System Settings', icon: <Settings />, path: '/settings/profile', roles: ['Orthodontist', 'Administrator', 'Researcher'] }
      ]
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        }
      }}
    >
      <Box p={3} display="flex" alignItems="center" gap={1.5}>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          AI BAMP PREDICTOR
        </Typography>
      </Box>
      <Divider />

      <Box sx={{ overflowY: 'auto', p: 1 }}>
        {menuGroups.map((group, idx) => (
          <Box key={idx} mb={2}>
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700 }}>
              {group.title}
            </Typography>
            <List size="small">
              {group.items
                .filter((item) => !role || item.roles.includes(role))
                .map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItemButton
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      selected={isActive}
                      sx={{
                        borderRadius: '10px',
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: '#fff',
                          '& .MuiListItemIcon-root': { color: '#fff' }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#fff' : 'primary.main', minWidth: 36 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }} />
                    </ListItemButton>
                  );
                })}
            </List>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
};
