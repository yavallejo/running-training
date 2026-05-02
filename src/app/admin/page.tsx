"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { createUser } from "@/lib/auth";
import { getSession, clearSession } from "@/lib/auth";

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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, plansRes] = await Promise.all([
        supabase.from('users').select(`
          id, username, plan_id, race_distance, race_date, race_name, start_date, created_at,
          plans:plan_id (name, level)
        `).order('created_at', { ascending: false }),
        supabase.from('plans').select('*')
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
    if (!confirm(`¿Eliminar usuario ${userName}?`)) return;

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      setMessage({ type: 'error', text: 'Error al eliminar usuario' });
    } else {
      setMessage({ type: 'success', text: 'Usuario eliminado' });
      loadData();
    }
  };

  const loadUserProgress = async (userId: string) => {
    setLoadingProgress(true);
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, plan_id, plans:plan_id (name)')
        .eq('id', userId)
        .single();

      if (userError || !user) return;

      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('plan_id', user.plan_id)
        .order('session_order', { ascending: true });

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const mergedProgress = (sessions || []).map((session: any) => {
        const sessionProgress = (progress || []).find((p: any) => p.session_id === session.id);
        return {
          id: session.id,
          sessionOrder: session.session_order,
          date: session.date,
          dayLabel: session.day_label,
          workout: session.workout,
          distance: session.distance,
          targetPace: session.target_pace,
          completed: sessionProgress?.completed || false,
          actualTime: sessionProgress?.actual_time,
          actualPace: sessionProgress?.actual_pace,
          feeling: sessionProgress?.feeling,
          notes: sessionProgress?.notes,
        };
      });

      setSelectedUser(user as unknown as User);
      setUserProgress(mergedProgress);
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
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const { error } = await supabase
      .from('users')
      .update({
        race_distance: editRaceDistance,
        race_date: editRaceDate,
        race_name: editRaceName,
        start_date: editStartDate
      })
      .eq('id', editingUser.id);
    if (!error) {
      setShowEditModal(false);
      setEditingUser(null);
      loadData();
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
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

  const stats = {
    total: users.length,
    beginner: users.filter(u => (u.plans as any)?.[0]?.level === 'beginner').length,
    intermediate: users.filter(u => (u.plans as any)?.[0]?.level === 'intermediate').length,
    pro: users.filter(u => (u.plans as any)?.[0]?.level === 'pro').length,
  };

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-5 rounded-2xl bg-surface border border-border/50 overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">Total</div>
              <div className="text-3xl font-black text-foreground" style={{ fontFamily: "var(--font-urbanist)" }}>{stats.total}</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative p-5 rounded-2xl bg-surface border border-border/50 overflow-hidden group hover:border-secondary/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">Principiante</div>
              <div className="text-3xl font-black text-secondary" style={{ fontFamily: "var(--font-urbanist)" }}>{stats.beginner}</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-5 rounded-2xl bg-surface border border-border/50 overflow-hidden group hover:border-accent/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">Intermedio</div>
              <div className="text-3xl font-black text-accent" style={{ fontFamily: "var(--font-urbanist)" }}>{stats.intermediate}</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative p-5 rounded-2xl bg-surface border border-border/50 overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">Pro</div>
              <div className="text-3xl font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>{stats.pro}</div>
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
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha Carrera</label>
                <input
                  type="date"
                  value={raceDate}
                  onChange={(e) => setRaceDate(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
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
                    className={`text-sm font-mono tracking-wide ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
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
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                      <span className="text-sm font-black text-primary" style={{ fontFamily: "var(--font-urbanist)" }}>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{user.username}</p>
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-mono tracking-wider">ADMIN</span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {(user.plans as any)?.[0]?.name || 'Sin plan'} · {user.race_distance || 7}km · Inicio: {user.start_date || 'No definido'} · Carrera: {user.race_date || 'No definido'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 transition-all"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={() => {
                        setLoadingUserId(user.id);
                        loadUserProgress(user.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-all"
                      disabled={loadingUserId !== null}
                    >
                      {loadingUserId === user.id ? '...' : 'PROGRESO'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-all"
                    >
                      ELIMINAR
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
                  <p className="text-xs font-mono text-muted-foreground tracking-wide">PLAN: {(selectedUser.plans as any)?.[0]?.name}</p>
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
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
                    <div className="text-2xl font-black text-green-500" style={{ fontFamily: "var(--font-urbanist)" }}>{userProgress.filter(s => s.completed).length}</div>
                    <div className="text-[10px] font-mono text-green-500 tracking-widest uppercase">COMPLETADAS</div>
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
                      className={`p-4 rounded-xl border ${session.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-background/30 border-border/30'}`}
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
                        <span className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-mono tracking-wider ${session.completed ? 'bg-green-500/10 text-green-500' : 'bg-muted/50 text-muted-foreground'}`}>
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
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-muted-foreground tracking-wide uppercase">Fecha de Carrera</label>
                  <input
                    type="date"
                    value={editRaceDate}
                    onChange={(e) => setEditRaceDate(e.target.value)}
                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono focus:border-primary/50 focus:bg-background transition-all"
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
    </main>
  );
}