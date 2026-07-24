import React, { useEffect, useState } from 'react';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, Chip } from '@mui/material';
import { Header } from '../../components/common/Header';
import { getUsers } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

export const UserManagementPage = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([
    { uid: 'u1', fullName: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@orthocenter.org', role: ROLES.ORTHODONTIST, hospitalName: 'St. Jude Orthodontics' },
    { uid: 'u2', fullName: 'Prof. Marcus Vance', email: 'marcus.vance@dentalresearch.edu', role: ROLES.RESEARCHER, hospitalName: 'Dental Research Institute' },
    { uid: 'u3', fullName: 'System Admin', email: 'admin@bamportho.ai', role: ROLES.ADMINISTRATOR, hospitalName: 'Platform Central' }
  ]);

  useEffect(() => {
    getUsers()
      .then((res) => {
        if (res.data && res.data.length > 0) setUsers(res.data);
      })
      .catch((err) => console.warn(err));
  }, []);

  return (
    <Box>
      <Header
        title="User Administration & Role Management"
        subtitle="Manage platform users, assign roles (Administrator, Orthodontist, Researcher), and verify permissions."
      />

      <Card sx={{ borderRadius: '16px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Full Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Hospital / Institution</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell sx={{ fontWeight: 600 }}>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.hospitalName}</TableCell>
                <TableCell>
                  <Chip label={u.role} color={u.role === ROLES.ADMINISTRATOR ? 'secondary' : 'primary'} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};
