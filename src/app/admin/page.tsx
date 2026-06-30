"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { createUser, hashPassword } from "@/lib/auth";
import { getSession, clearSession } from "@/lib/auth";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// @ts-expect-error - dynamic import ssr false
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });
import "react-datepicker/dist/react-datepicker.css";

interface User {
  id: string;
  username: string;
  plan_id: string;
  race_distance: number;
  race_date: string;
  race_name: string;
  start_date: string;
  created_at: string;
  role?: string;
  plans?: any;
  is_active?: boolean;
}

interface Plan {
  id: string;
  name: string;
  level: string;
  sessions?: any[];
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string;
  target_username: string;
  details: string;
  created_at: string;
}

type SortField = "username" | "created_at" | "plan_level" | "race_date";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive" | "deleted";

const USERS_PER_PAGE = 20;

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [planLevel, setPlanLevel] = useState<'beginner' | 'intermediate' | 'pro'>('beginner');
  const [raceDistance, setRaceDistance] = useState<number>(7);
  const [raceDate, setRaceDate] = useState('');
  const [raceName, setRaceName] = useState('Carrera Recreativa');
  const [startDate, setStartDate] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRaceDistance, setEditRaceDistance] = useState<number>(7);
  const [editRaceDate, setEditRaceDate] = useState('');
  const [editRaceName, setEditRaceName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editPlanId, setEditPlanId] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editIsActive, setEditIsActive] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [_loadingProgress, setLoadingProgress] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [hardDelete, setHardDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<'single' | 'all'>('single');
  const [notificationUserId, setNotificationUserId] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const [showPlanPreviewModal, setShowPlanPreviewModal] = useState(false);
  const [previewSessions, setPreviewSessions] = useState<any[]>([]);

  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const session = getSession();
      const [usersRes, plansRes] = await Promise.all([
        supabase.from('users').select(`
          id, username, plan_id, race_distance, race_date, race_name, start_date, created_at, role, is_active,
          plans:plan_id (name, level)
        `).order('created_at', { ascending: false }),
        supabase.from('plans').select('id, name, level')
      ]);

      if (usersRes.data) setUsers(usersRes.data as unknown as User[]);
      if (plansRes.data) setPlans(plansRes.data);

      if (session?.userId) {
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (logs) setAuditLogs(logs as unknown as AuditLog[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action: string, targetUserId: string, targetUsername: string, details: string) => {
    const session = getSession();
    if (!session?.userId) return;

    await supabase.from('audit_logs').insert({
      admin_id: session.userId,
      action,
      target_user_id: targetUserId,
      target_username: targetUsername,
      details
    });

    setAuditLogs(prev => [{
      id: Date.now().toString(),
      admin_id: session.userId,
      action,
      target_user_id: targetUserId,
      target_username: targetUsername,
      details,
      created_at: new Date().toISOString()
    }, ...prev]);
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedUser(null);
    setUserProgress([]);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/iniciar-sesion");
      return;
    }
    if (session.role !== 'admin') {
      router.replace("/plan");
      return;
    }
    loadData();
  }, [router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeProgressModal();
        closeEditModal();
        setShowDeleteModal(false);
        setShowResetPasswordModal(false);
        setShowNotificationModal(false);
        setShowPlanPreviewModal(false);
        setShowAuditLogsModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim() || !password) {
      setMessage({ type: 'error', text: 'Usuario y contraseña requeridos' });
      return;
    }

    if (startDate && raceDate && new Date(startDate) > new Date(raceDate)) {
      setMessage({ type: 'error', text: 'La fecha de inicio debe ser anterior a la fecha de la carrera' });
      return;
    }

    const result = await createUser(username.trim(), password, planLevel, raceDistance, raceDate, raceName, userRole, startDate);
    if (result.success) {
      const { data: newUser } = await supabase.from('users').select('id').eq('username', username.toLowerCase()).single();
      setMessage({ type: 'success', text: `Usuario ${username} creado exitosamente` });
      setUsername("");
      setPassword("");
      setUserRole('user');
      logAudit('CREATE_USER', newUser?.id || '', username, `Created user with role ${userRole}`);
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al crear usuario' });
    }
  };

  const handleDeleteUser = (userId: string, userName: string, isHardDelete = false) => {
    setUserToDelete({ id: userId, username: userName } as User);
    setHardDelete(isHardDelete);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUserId(userToDelete.id);

    if (hardDelete) {
      const { error: progressError } = await supabase.from('user_progress').delete().eq('user_id', userToDelete.id);
      if (progressError) {
        console.error('Error deleting user progress:', progressError);
        setMessage({ type: 'error', text: 'Error al eliminar progreso del usuario' });
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeletingUserId(null);
        return;
      }

      const { error: profileError } = await supabase.from('user_profiles').delete().eq('id', userToDelete.id);
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        setMessage({ type: 'error', text: 'Error al eliminar perfil del usuario' });
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeletingUserId(null);
        return;
      }

      const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
      if (error) {
        setMessage({ type: 'error', text: 'Error al eliminar usuario' });
      } else {
        setMessage({ type: 'success', text: 'Usuario eliminado permanentemente' });
        logAudit('HARD_DELETE', userToDelete.id, userToDelete.username, 'Permanently deleted user');
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userToDelete.id);

      if (error) {
        setMessage({ type: 'error', text: 'Error al desactivar usuario' });
      } else {
        setMessage({ type: 'success', text: 'Usuario desactivado' });
        logAudit('DEACTIVATE', userToDelete.id, userToDelete.username, 'Soft deleted (deactivated) user');
        loadData();
      }
    }

    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeletingUserId(null);
  };

  const handleActivateUser = async (userId: string, username: string) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) {
      setMessage({ type: 'error', text: 'Error al activar usuario' });
    } else {
      setMessage({ type: 'success', text: 'Usuario activado' });
      logAudit('ACTIVATE', userId, username, 'Reactivated user');
      loadData();
    }
  };

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    const selectedIds = Array.from(selectedUsers);
    setDeletingUserId(selectedIds[0]);

    for (const id of selectedIds) {
      const user = users.find(u => u.id === id);
      if (action === 'delete') {
        await supabase.from('users').update({ is_active: false }).eq('id', id);
        logAudit('BULK_DEACTIVATE', id, user?.username || '', 'Bulk deactivated');
      } else if (action === 'activate') {
        await supabase.from('users').update({ is_active: true }).eq('id', id);
        logAudit('BULK_ACTIVATE', id, user?.username || '', 'Bulk activated');
      } else if (action === 'deactivate') {
        await supabase.from('users').update({ is_active: false }).eq('id', id);
        logAudit('BULK_DEACTIVATE', id, user?.username || '', 'Bulk deactivated');
      }
    }

    setMessage({ type: 'success', text: `${selectedIds.length} usuarios actualizados` });
    setSelectedUsers(new Set());
    setDeletingUserId(null);
    loadData();
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    const { error } = await supabase.from('users').update({ password_hash: passwordHash }).eq('id', resetPasswordUser.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al resetear contraseña' });
    } else {
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      logAudit('RESET_PASSWORD', resetPasswordUser.id, resetPasswordUser.username, 'Password reset by admin');
      setShowResetPasswordModal(false);
      setResetPasswordUser(null);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setMessage({ type: 'error', text: 'Título y mensaje son requeridos' });
      return;
    }

    let targetUserIds: string[] = [];

    if (notificationTarget === 'single' && notificationUserId) {
      targetUserIds = [notificationUserId];
    } else {
      targetUserIds = users.filter(u => u.is_active !== false).map(u => u.id);
    }

    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      title: notificationTitle,
      message: notificationMessage
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
      setMessage({ type: 'error', text: 'Error al enviar notificación' });
    } else {
      setMessage({ type: 'success', text: `Notificación enviada a ${targetUserIds.length} usuarios` });
      logAudit('SEND_NOTIFICATION', notificationTarget === 'single' ? notificationUserId : 'ALL', notificationTarget === 'single' ? users.find(u => u.id === notificationUserId)?.username || '' : 'ALL_USERS', `Sent notification: ${notificationTitle}`);
      setShowNotificationModal(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationUserId('');
    }
  };

  const loadPlanPreview = async (planId: string) => {
    if (!planId) {
      setPreviewSessions([]);
      return;
    }

    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('plan_id', planId)
      .order('session_order', { ascending: true });

    setPreviewSessions(data || []);
  };

  const handlePlanSelect = (planId: string) => {
    setEditPlanId(planId);
    loadPlanPreview(planId);
  };

  const loadUserProgress = async (userId: string) => {
    setLoadingProgress(true);
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, plan_id, race_distance, race_date, race_name, start_date, plans:plan_id (name, level)')
        .eq('id', userId)
        .single();

      if (userError || !user) return;

      const { data: progress } = await supabase
        .from('user_progress')
        .select('id, session_id, completed, actual_time, actual_pace, feeling, notes, actual_distance, sessions:session_id (session_order, workout, date, distance, target_pace)')
        .eq('user_id', userId);

      const enrichedProgress = (progress || []).map((p: any) => ({
        id: p.id,
        sessionId: p.session_id,
        completed: p.completed,
        actualTime: p.actual_time,
        actualPace: p.actual_pace,
        feeling: p.feeling,
        notes: p.notes,
        actualDistance: p.actual_distance,
        sessionOrder: p.sessions?.session_order,
        workout: p.sessions?.workout,
        date: p.sessions?.date,
        distance: p.sessions?.distance,
        targetPace: p.sessions?.target_pace,
      }));

      setSelectedUser(user as unknown as User);
      setUserProgress(enrichedProgress);
      setShowProgressModal(true);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoadingProgress(false);
      setLoadingUserId(null);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRaceDistance(user.race_distance || 7);
    setEditRaceDate(user.race_date || '');
    setEditRaceName(user.race_name || 'Carrera Recreativa');
    setEditStartDate(user.start_date || '');
    setEditPlanId(user.plan_id || '');
    setEditRole((user.role as 'user' | 'admin') || 'user');
    setEditIsActive(user.is_active !== false);
    setShowEditModal(true);
    if (user.plan_id) {
      loadPlanPreview(user.plan_id);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (editStartDate && editRaceDate && new Date(editStartDate) > new Date(editRaceDate)) {
      setMessage({ type: 'error', text: 'La fecha de inicio debe ser anterior a la fecha de la carrera' });
      return;
    }

    try {
      const updateData: any = {
        race_distance: editRaceDistance,
        race_date: editRaceDate || null,
        race_name: editRaceName,
        start_date: editStartDate || null,
        role: editRole,
        is_active: editIsActive
      };

      if (editPlanId && editPlanId.length > 0) {
        updateData.plan_id = editPlanId;
      } else {
        updateData.plan_id = null;
      }

      const { data: _data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id)
        .select();

      if (error) {
        console.error('Error updating user:', JSON.stringify(error, null, 2));
        setMessage({ type: 'error', text: `Error al actualizar: ${error.message || 'Error desconocido'}` });
        return;
      }

      if (editPlanId) {
        const selectedPlan = plans.find(p => p.id === editPlanId);
        if (selectedPlan) {
          const experienceLevel = selectedPlan.level === 'pro' ? 'advanced' :
                                  selectedPlan.level === 'intermediate' ? 'intermediate' : 'beginner';

          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', editingUser.id)
            .single();

          if (existingProfile) {
            await supabase
              .from('user_profiles')
              .update({
                experience_level: experienceLevel,
                updated_at: new Date().toISOString()
              })
              .eq('id', editingUser.id);
          } else {
            await supabase
              .from('user_profiles')
              .insert({
                id: editingUser.id,
                experience_level: experienceLevel,
                current_weekly_km: 0,
                available_days_per_week: 3,
                minutes_per_session: 60,
                has_injuries: false,
                updated_at: new Date().toISOString()
              });
          }
        }
      }

      logAudit('UPDATE_USER', editingUser.id, editingUser.username, 'Updated user profile');
      setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
      setShowEditModal(false);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: `Error inesperado: ${err.message || 'Desconocido'}` });
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/iniciar-sesion");
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Plan', 'Nivel', 'Distancia', 'Fecha Carrera', 'Nombre Carrera', 'Fecha Inicio', 'Rol', 'Estado', 'Fecha Registro'];
    const csvRows = [headers.join(',')];

    filteredUsers.forEach(user => {
      csvRows.push([
        user.username,
        (user.plans as any)?.name || '',
        (user.plans as any)?.level || '',
        user.race_distance || '',
        user.race_date || '',
        user.race_name || '',
        user.start_date || '',
        user.role || '',
        user.is_active === false ? 'Inactivo' : 'Activo',
        user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : ''
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'CSV exportado correctamente' });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPlanLevel = (user: User) => {
    const plan = user.plans as any;
    return plan?.level || '';
  };

  const stats = useMemo(() => {
    const activeUsers = users.filter(u => u.is_active !== false);
    return {
      total: users.length,
      active: activeUsers.length,
      inactive: users.filter(u => u.is_active === false).length,
      beginner: activeUsers.filter(u => getPlanLevel(u) === 'beginner').length,
      intermediate: activeUsers.filter(u => getPlanLevel(u) === 'intermediate').length,
      pro: activeUsers.filter(u => getPlanLevel(u) === 'pro').length,
    };
  }, [users]);

  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter(u => u.created_at?.startsWith(dateStr)).length;
      last7Days.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        usuarios: count
      });
    }
    return last7Days;
  }, [users]);

  const pieData = useMemo(() => [
    { name: 'Principiantes', value: stats.beginner, color: '#f59e0b' },
    { name: 'Intermedios', value: stats.intermediate, color: '#3b82f6' },
    { name: 'Pro', value: stats.pro, color: '#8b5cf6' },
  ], [stats]);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(u => {
      const matchesSearch = searchQuery === "" ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.race_name && u.race_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLevel = filterLevel === "all" || getPlanLevel(u) === filterLevel;
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && u.is_active !== false) ||
        (statusFilter === "inactive" && u.is_active === false) ||
        (statusFilter === "deleted" && u.is_active === false);
      return matchesSearch && matchesLevel && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'username':
          aVal = a.username.toLowerCase();
          bVal = b.username.toLowerCase();
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
        case 'plan_level':
          aVal = getPlanLevel(a);
          bVal = getPlanLevel(b);
          break;
        case 'race_date':
          aVal = new Date(a.race_date || 0).getTime();
          bVal = new Date(b.race_date || 0).getTime();
          break;
        default:
          return 0;
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [users, searchQuery, filterLevel, statusFilter, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="text-sm font-mono text-muted-foreground tracking-wider">CARGANDO...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                PANEL DE ADMINISTRACIÓN
              </h1>
              <p className="text-sm font-mono text-muted-foreground tracking-wide">GESTIÓN DE USUARIOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuditLogsModal(true)}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-surface/50 hover:bg-surface transition-all font-mono text-sm tracking-wide"
              title="Ver logs de auditoría"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              LOGS
            </button>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-surface/50 hover:bg-surface transition-all font-mono text-sm tracking-wide"
              title="Enviar notificación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              NOTIFICAR
            </button>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-surface/50 hover:bg-surface transition-all font-mono text-sm tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              CERRAR SESIÓN
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {([
            {
              label: "Total Usuarios",
              value: stats.total,
              subValue: `${stats.active} activos`,
              valueClass: "text-foreground",
              borderClass: "border-border/50 hover:border-border",
              accentClass: "bg-foreground/8 text-foreground",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              ),
              delay: 0.1,
            },
            {
              label: "Principiantes",
              value: stats.beginner,
              subValue: "",
              valueClass: "text-warning",
              borderClass: "border-border/50 hover:border-warning/40",
              accentClass: "bg-warning/10 text-warning",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ),
              delay: 0.15,
            },
            {
              label: "Intermedios",
              value: stats.intermediate,
              subValue: "",
              valueClass: "text-info",
              borderClass: "border-border/50 hover:border-info/40",
              accentClass: "bg-info/10 text-info",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              delay: 0.2,
            },
            {
              label: "Pro",
              value: stats.pro,
              subValue: "",
              valueClass: "text-primary",
              borderClass: "border-border/50 hover:border-primary/30",
              accentClass: "bg-primary/10 text-primary",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              ),
              delay: 0.25,
            },
          ] as const).map(({ label, value, subValue, valueClass, borderClass, accentClass, icon, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              className={`relative p-5 rounded-2xl bg-surface border ${borderClass} overflow-hidden transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${accentClass} flex items-center justify-center`}>
                  {icon}
                </div>
              </div>
              <div className={`text-3xl font-black ${valueClass}`} style={{ fontFamily: "var(--font-urbanist)" }}>
                {value}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mt-1">{label}</div>
              {subValue && <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{subValue}</div>}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-surface border border-border/50 lg:col-span-2"
          >
            <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">REGISTROS (ÚLTIMOS 7 DÍAS)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="usuarios" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-2xl bg-surface border border-border/50"
          >
            <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">DISTRIBUCIÓN POR NIVEL</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {pieData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                  <span className="text-[10px] font-mono text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 p-6 rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm"
        >
          <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase mb-6">CREAR NUEVO USUARIO</h2>

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nombre.usuario"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Plan</label>
                <select
                  value={planLevel}
                  onChange={(e) => setPlanLevel(e.target.value as any)}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Distancia</label>
                <select
                  value={raceDistance}
                  onChange={(e) => setRaceDistance(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                >
                  <option value={3}>3 km</option>
                  <option value={5}>5 km</option>
                  <option value={7}>7 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={21}>21 km</option>
                  <option value={42}>42 km</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha Inicio</label>
                <DatePicker
                  selected={startDate ? new Date(startDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setStartDate(date.toISOString().split("T")[0]);
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  calendarClassName="dark-datepicker"
                  showPopperArrow={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha Carrera</label>
                <DatePicker
                  selected={raceDate ? new Date(raceDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setRaceDate(date.toISOString().split("T")[0]);
                    }
                  }}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  calendarClassName="dark-datepicker"
                  showPopperArrow={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Nombre</label>
                <input
                  type="text"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  placeholder="Mi Carrera"
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Rol</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'user' | 'admin')}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="group relative px-6 py-3 rounded-xl font-mono text-sm font-semibold tracking-wide text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  CREAR USUARIO
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>

              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`text-sm font-mono tracking-wide ${message.type === 'success' ? 'text-success' : 'text-danger'}`}
                  >
                    {message.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-surface/80 border border-border/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase">
              USUARIOS ({filteredUsers.length})
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar..."
                  className="w-full sm:w-48 rounded-lg border border-border/50 bg-background/50 pl-9 pr-3 py-2 text-xs font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="pro">Pro</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
                className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
              >
                <option value="all">Todos estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-xs font-mono hover:bg-background transition-all"
                title="Exportar CSV"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                CSV
              </button>
            </div>
          </div>

          {selectedUsers.size > 0 && (
            <div className="px-6 py-3 bg-primary/10 border-b border-border/50 flex items-center justify-between">
              <span className="text-xs font-mono text-primary">
                {selectedUsers.size} usuario(s) seleccionado(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-mono hover:bg-success/20 transition-all"
                >
                  Activar
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-mono hover:bg-warning/20 transition-all"
                >
                  Desactivar
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-mono hover:bg-danger/20 transition-all"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground text-xs font-mono hover:bg-muted/30 transition-all"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-mono text-muted-foreground">No hay usuarios que coincidan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border/50"
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('username')}
                      >
                        Usuario {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Plan
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground hidden lg:table-cell"
                        onClick={() => handleSort('plan_level')}
                      >
                        Nivel {sortField === 'plan_level' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground hidden sm:table-cell"
                        onClick={() => handleSort('race_date')}
                      >
                        Carrera {sortField === 'race_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('created_at')}
                      >
                        Registro {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`hover:bg-background/30 transition-colors ${user.is_active === false ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                            className="rounded border-border/50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold">{user.username}</p>
                                {user.role === 'admin' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-mono tracking-wider border border-primary/20">ADMIN</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs font-mono text-muted-foreground">{(user.plans as any)?.name || 'Sin plan'}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {(user.plans as any)?.level && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono tracking-wider border ${
                              (user.plans as any).level === 'pro'
                                ? 'bg-primary/8 text-primary border-primary/20'
                                : (user.plans as any).level === 'intermediate'
                                ? 'bg-info/8 text-info border-info/20'
                                : 'bg-warning/8 text-warning border-warning/20'
                            }`}>
                              {(user.plans as any).level === 'pro' ? 'PRO' : (user.plans as any).level === 'intermediate' ? 'INTER' : 'INICIO'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs font-mono text-muted-foreground">
                            {user.race_distance}K · {user.race_date ? new Date(user.race_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono text-muted-foreground">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono tracking-wider ${
                            user.is_active === false
                              ? 'bg-danger/10 text-danger border border-danger/20'
                              : 'bg-success/10 text-success border border-success/20'
                          }`}>
                            {user.is_active === false ? 'INACTIVO' : 'ACTIVO'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(user)}
                              className="w-7 h-7 rounded-lg text-warning bg-warning/5 hover:bg-warning/12 border border-warning/20 flex items-center justify-center transition-all"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setLoadingUserId(user.id);
                                loadUserProgress(user.id);
                              }}
                              disabled={loadingUserId !== null}
                              className="w-7 h-7 rounded-lg text-primary bg-primary/5 hover:bg-primary/12 border border-primary/20 flex items-center justify-center transition-all disabled:opacity-50"
                              title="Ver progreso"
                            >
                              {loadingUserId === user.id ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="block w-3 h-3 border border-primary border-t-transparent rounded-full" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setResetPasswordUser(user);
                                setShowResetPasswordModal(true);
                              }}
                              className="w-7 h-7 rounded-lg text-info bg-info/5 hover:bg-info/12 border border-info/20 flex items-center justify-center transition-all"
                              title="Resetear contraseña"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                              </svg>
                            </button>
                            {user.is_active === false ? (
                              <button
                                onClick={() => handleActivateUser(user.id, user.username)}
                                className="w-7 h-7 rounded-lg text-success bg-success/5 hover:bg-success/12 border border-success/20 flex items-center justify-center transition-all"
                                title="Activar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.username, false)}
                                disabled={deletingUserId !== null}
                                className="w-7 h-7 rounded-lg text-danger bg-danger/5 hover:bg-danger/12 border border-danger/20 flex items-center justify-center transition-all disabled:opacity-50"
                                title="Desactivar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username, true)}
                              disabled={deletingUserId !== null}
                              className="w-7 h-7 rounded-lg text-muted-foreground bg-muted/5 hover:bg-muted/12 border border-muted/20 flex items-center justify-center transition-all disabled:opacity-50"
                              title="Eliminar permanentemente"
                            >
                              {deletingUserId === user.id ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="block w-3 h-3 border border-muted-foreground border-t-transparent rounded-full" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 text-xs font-mono hover:bg-background transition-all disabled:opacity-50"
                    >
                      ← Anterior
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'border border-border/50 bg-background/50 hover:bg-background'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 text-xs font-mono hover:bg-background transition-all disabled:opacity-50"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showProgressModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeProgressModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>{selectedUser.username}</h2>
                  <p className="text-xs font-mono text-muted-foreground tracking-wide">PLAN: {(selectedUser.plans as any)?.name || 'Sin plan'}</p>
                </div>
                <button onClick={closeProgressModal} aria-label="Cerrar" className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/30 text-center">
                    <div className="text-2xl font-black text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>{userProgress.length}</div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">SESIONES</div>
                  </div>
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                    <div className="text-2xl font-black text-success" style={{ fontFamily: "var(--font-urbanist)" }}>{userProgress.filter(s => s.completed).length}</div>
                    <div className="text-[10px] font-mono text-success tracking-widest uppercase">COMPLETADAS</div>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border/30 text-center">
                    <div className="text-2xl font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                      {userProgress.filter(s => s.completed).reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0).toFixed(1)}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">KM TOTALES</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">DETALLE DE SESIONES</h3>
                  {userProgress.map(session => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border ${session.completed ? 'bg-success/5 border-success/20' : 'bg-background/30 border-border/30'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            SESIÓN {session.sessionOrder}: {session.workout}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            {session.date} · {session.distance}km · {session.targetPace}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider ${session.completed ? 'bg-success/10 text-success' : 'bg-muted/50 text-muted-foreground'}`}>
                          {session.completed ? 'COMPLETADA' : 'PENDIENTE'}
                        </span>
                      </div>
                      {session.completed && (session.actualTime || session.actualPace) && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-4 text-xs font-mono text-muted-foreground">
                          {session.actualTime && (
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {session.actualTime}
                            </span>
                          )}
                          {session.actualPace && (
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                              </svg>
                              {session.actualPace}
                            </span>
                          )}
                          {session.feeling && (
                            <span className="flex items-center gap-0.5">
                              {[...Array(session.feeling)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-warning" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>EDITAR USUARIO</h2>
                  <p className="text-xs font-mono text-muted-foreground tracking-wide">{editingUser.username}</p>
                </div>
                <button onClick={closeEditModal} aria-label="Cerrar" className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Distancia</label>
                  <select
                    value={editRaceDistance}
                    onChange={(e) => setEditRaceDistance(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                  >
                    <option value={3}>3 km</option>
                    <option value={5}>5 km</option>
                    <option value={7}>7 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                    <option value={21}>21 km</option>
                    <option value={42}>42 km</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha de Inicio</label>
                    <DatePicker
                      selected={editStartDate ? new Date(editStartDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setEditStartDate(date.toISOString().split("T")[0]);
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Seleccionar"
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                      calendarClassName="dark-datepicker"
                      showPopperArrow={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha de Carrera</label>
                    <DatePicker
                      selected={editRaceDate ? new Date(editRaceDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setEditRaceDate(date.toISOString().split("T")[0]);
                        }
                      }}
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Seleccionar"
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                      calendarClassName="dark-datepicker"
                      showPopperArrow={false}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Nombre de la Carrera</label>
                  <input
                    type="text"
                    value={editRaceName}
                    onChange={(e) => setEditRaceName(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Plan</label>
                    {editPlanId && (
                      <button
                        type="button"
                        onClick={() => setShowPlanPreviewModal(true)}
                        className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
                      >
                        Ver preview del plan →
                      </button>
                    )}
                  </div>
                  <select
                    value={editPlanId}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                  >
                    <option value="">Sin plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name} ({plan.level})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Rol</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Estado</label>
                    <select
                      value={editIsActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditIsActive(e.target.value === 'active')}
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleUpdateUser}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all mt-2"
                >
                  GUARDAR CAMBIOS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                      {hardDelete ? 'Eliminar Permanentemente' : 'Desactivar Usuario'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hardDelete ? 'Esta acción no se puede deshacer' : 'Podrás reactivarlo más adelante'}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {hardDelete
                    ? `¿Estás seguro de que deseas eliminar permanentemente a ${userToDelete.username}? Se eliminarán todos sus datos.`
                    : `¿Estás seguro de que deseas desactivar a ${userToDelete.username}?`}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    disabled={deletingUserId !== null}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-mono font-semibold tracking-wide transition-all disabled:opacity-50 ${
                      hardDelete
                        ? 'bg-danger text-white hover:bg-danger/80'
                        : 'bg-warning text-white hover:bg-warning/80'
                    }`}
                  >
                    {deletingUserId !== null ? 'PROCESANDO...' : hardDelete ? 'ELIMINAR' : 'DESACTIVAR'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetPasswordModal && resetPasswordUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => { setShowResetPasswordModal(false); setResetPasswordUser(null); setNewPassword(''); setConfirmPassword(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50">
                <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>RESETEAR CONTRASEÑA</h2>
                <p className="text-xs font-mono text-muted-foreground tracking-wide">{resetPasswordUser.username}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir contraseña"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <button
                  onClick={handleResetPassword}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all"
                >
                  ACTUALIZAR CONTRASEÑA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => { setShowNotificationModal(false); setNotificationTitle(''); setNotificationMessage(''); setNotificationUserId(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>ENVIAR NOTIFICACIÓN</h2>
                <button onClick={() => setShowNotificationModal(false)} className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Destinatario</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNotificationTarget('single')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                        notificationTarget === 'single'
                          ? 'bg-primary text-white'
                          : 'border border-border/50 bg-background/50 hover:bg-background'
                      }`}
                    >
                      Usuario
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationTarget('all')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                        notificationTarget === 'all'
                          ? 'bg-primary text-white'
                          : 'border border-border/50 bg-background/50 hover:bg-background'
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>

                {notificationTarget === 'single' && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Usuario</label>
                    <select
                      value={notificationUserId}
                      onChange={(e) => setNotificationUserId(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                    >
                      <option value="">Seleccionar usuario</option>
                      {users.filter(u => u.is_active !== false).map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Título</label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Título de la notificación"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Mensaje</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Contenido del mensaje..."
                    rows={3}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleSendNotification}
                  className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-mono font-semibold tracking-wide hover:bg-primary/90 transition-all"
                >
                  ENVIAR NOTIFICACIÓN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlanPreviewModal && previewSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowPlanPreviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>PREVIEW DEL PLAN</h2>
                  <p className="text-xs font-mono text-muted-foreground tracking-wide">{plans.find(p => p.id === editPlanId)?.name}</p>
                </div>
                <button onClick={() => setShowPlanPreviewModal(false)} className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-2 max-h-[400px]">
                  {previewSessions.map((session, index) => (
                    <div
                      key={session.id || index}
                      className="p-4 rounded-xl bg-background/30 border border-border/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            SESIÓN {session.session_order}: {session.workout}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            {session.date} · {session.distance}km · {session.target_pace}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuditLogsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAuditLogsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-border/50 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>LOGS DE AUDITORÍA</h2>
                <button onClick={() => setShowAuditLogsModal(false)} className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-mono text-muted-foreground">No hay logs registrados</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px]">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-background/30 border border-border/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono uppercase">
                                {log.action.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm font-semibold">
                              {log.target_username || 'Sistema'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.details}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('es-ES')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
