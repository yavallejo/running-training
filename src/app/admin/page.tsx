"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { createUser } from "@/lib/auth";
import { getSession, clearSession } from "@/lib/auth";
import dynamic from "next/dynamic";

// @ts-ignore
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
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, plansRes] = await Promise.all([
        supabase.from('users').select(`
          id, username, plan_id, race_distance, race_date, race_name, start_date, created_at, role,
          plans:plan_id (name, level)
        `).order('created_at', { ascending: false }),
        supabase.from('plans').select('id, name, level')
      ]);

      if (usersRes.data) setUsers(usersRes.data as unknown as User[]);
      if (plansRes.data) setPlans(plansRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
      router.replace("/login");
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

    const result = await createUser(username.trim(), password, planLevel, raceDistance, raceDate, raceName, userRole, startDate);
    if (result.success) {
      setMessage({ type: 'success', text: `Usuario ${username} creado exitosamente` });
      setUsername("");
      setPassword("");
      setUserRole('user');
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al crear usuario' });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setUserToDelete({ id: userId, username: userName } as User);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    // First delete user_progress records
    const { error: progressError } = await supabase.from('user_progress').delete().eq('user_id', userToDelete.id);
    if (progressError) {
      console.error('Error deleting user progress:', progressError);
    }

    // Then delete user_profiles records
    const { error: profileError } = await supabase.from('user_profiles').delete().eq('id', userToDelete.id);
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
    }

    // Finally delete the user
    const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar usuario' });
    } else {
      setMessage({ type: 'success', text: 'Usuario eliminado' });
      loadData();
    }

    setShowDeleteModal(false);
    setUserToDelete(null);
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
        .select('session_id, completed, actual_time, actual_pace, feeling, notes, actual_distance')
        .eq('user_id', userId);

      setSelectedUser(user as unknown as User);
      setUserProgress(progress || []);
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
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData: any = {
        race_distance: editRaceDistance,
        race_date: editRaceDate || null,
        race_name: editRaceName,
        start_date: editStartDate || null,
        role: editRole
      };

      // Only include plan_id if it's a valid UUID
      if (editPlanId && editPlanId.length > 0) {
        updateData.plan_id = editPlanId;
      } else {
        updateData.plan_id = null;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id)
        .select();

      if (error) {
        console.error('Error updating user:', JSON.stringify(error, null, 2));
        setMessage({ type: 'error', text: `Error al actualizar: ${error.message || 'Error desconocido'}` });
        return;
      }

      // Sync experience_level with plan level
      if (editPlanId) {
        const selectedPlan = plans.find(p => p.id === editPlanId);
        if (selectedPlan) {
          const experienceLevel = selectedPlan.level === 'pro' ? 'advanced' : 
                                  selectedPlan.level === 'intermediate' ? 'intermediate' : 'beginner';
          
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', editingUser.id)
            .single();

          if (existingProfile) {
            // Update only experience_level
            await supabase
              .from('user_profiles')
              .update({
                experience_level: experienceLevel,
                updated_at: new Date().toISOString()
              })
              .eq('id', editingUser.id);
          } else {
            // Create profile with defaults
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
    router.push("/login");
  };

  const stats = useMemo(() => ({
    total: users.length,
    beginner: users.filter(u => (u.plans as any)?.level === 'beginner').length,
    intermediate: users.filter(u => (u.plans as any)?.level === 'intermediate').length,
    pro: users.filter(u => (u.plans as any)?.level === 'pro').length,
  }), [users]);

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
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-surface/50 hover:bg-surface transition-all font-mono text-sm tracking-wide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            CERRAR SESIÓN
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {([
            {
              label: "Total Usuarios",
              value: stats.total,
              valueClass: "text-foreground",
              borderClass: "border-border/50 hover:border-border",
              accentClass: "bg-foreground/8 text-foreground",
              barClass: "bg-foreground/60",
              pctClass: "text-muted-foreground",
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
              valueClass: "text-warning",
              borderClass: "border-border/50 hover:border-warning/40",
              accentClass: "bg-warning/10 text-warning",
              barClass: "bg-warning",
              pctClass: "text-warning/70",
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
              valueClass: "text-info",
              borderClass: "border-border/50 hover:border-info/40",
              accentClass: "bg-info/10 text-info",
              barClass: "bg-info",
              pctClass: "text-info/70",
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
              valueClass: "text-primary",
              borderClass: "border-border/50 hover:border-primary/30",
              accentClass: "bg-primary/10 text-primary",
              barClass: "bg-primary",
              pctClass: "text-primary/70",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              ),
              delay: 0.25,
            },
          ] as const).map(({ label, value, valueClass, borderClass, accentClass, barClass, pctClass, icon, delay }) => (
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
                {stats.total > 0 && value > 0 && (
                  <span className={`text-xs font-mono ${pctClass}`}>
                    {Math.round((value / stats.total) * 100)}%
                  </span>
                )}
              </div>
              <div className={`text-3xl font-black ${valueClass}`} style={{ fontFamily: "var(--font-urbanist)" }}>
                {value}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mt-1">{label}</div>
              {stats.total > 0 && (
                <div className="mt-3 h-1 rounded-full bg-border/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barClass} transition-all duration-700`}
                    style={{ width: `${Math.round((value / stats.total) * 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
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

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                  placeholderText="Seleccionar fecha"
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
                  placeholderText="Seleccionar fecha"
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
                className="group relative px-6 py-3 rounded-xl font-mono text-sm font-semibold tracking-wide overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-sm font-mono text-muted-foreground tracking-widest uppercase">
              USUARIOS REGISTRADOS ({users.length})
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-mono text-muted-foreground">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-background/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{user.username}</p>
                        {user.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-mono tracking-wider border border-primary/20">ADMIN</span>
                        )}
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
                        {user.race_distance && (
                          <span className="px-1.5 py-0.5 rounded-md bg-surface-elevated text-muted-foreground text-[9px] font-mono tracking-wider border border-border/50">
                            {user.race_distance}K
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                        {user.race_name || 'Sin carrera'} · {user.race_date ? new Date(user.race_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(user)}
                      className="w-8 h-8 rounded-lg text-warning bg-warning/5 hover:bg-warning/12 border border-warning/20 flex items-center justify-center transition-all"
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
                      className="w-8 h-8 rounded-lg text-primary bg-primary/5 hover:bg-primary/12 border border-primary/20 flex items-center justify-center transition-all"
                      disabled={loadingUserId !== null}
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
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="w-8 h-8 rounded-lg text-danger bg-danger/5 hover:bg-danger/12 border border-danger/20 flex items-center justify-center transition-all"
                      title="Eliminar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
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
                <button onClick={closeProgressModal} className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  ✕
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
                          {session.actualTime && <span>⏱ {session.actualTime}</span>}
                          {session.actualPace && <span>⚡ {session.actualPace}</span>}
                          {session.feeling && <span>{'★'.repeat(session.feeling)}</span>}
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
              className="bg-surface border border-border/50 rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>EDITAR USUARIO</h2>
                  <p className="text-xs font-mono text-muted-foreground tracking-wide">{editingUser.username}</p>
                </div>
                <button onClick={closeEditModal} className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all">
                  ✕
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
                    placeholderText="Seleccionar fecha"
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
                    placeholderText="Seleccionar fecha"
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                    calendarClassName="dark-datepicker"
                    showPopperArrow={false}
                  />
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
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Plan</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all cursor-pointer"
                  >
                    <option value="">Sin plan</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name} ({plan.level})</option>
                    ))}
                  </select>
                </div>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
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
                    <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>Eliminar Usuario</h3>
                    <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  ¿Estás seguro de que deseas eliminar al usuario <strong className="text-foreground">{userToDelete.username}</strong>? Se eliminarán todos sus datos y progreso.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-border/50 bg-background/50 text-sm font-mono tracking-wide hover:bg-background transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="flex-1 px-4 py-3 rounded-xl bg-danger text-white text-sm font-mono font-semibold tracking-wide hover:bg-danger/80 transition-all"
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
