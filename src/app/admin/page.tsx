"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { createUser } from "@/lib/auth";
import { getSession, clearSession } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [planLevel, setPlanLevel] = useState<'beginner' | 'intermediate' | 'pro'>('beginner');
  const [raceDistance, setRaceDistance] = useState<7 | 11>(7);
  const [raceDate, setRaceDate] = useState('2026-05-17');
  const [raceName, setRaceName] = useState('Carrera Recreativa');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRaceDistance, setEditRaceDistance] = useState<7 | 11>(7);
  const [editRaceDate, setEditRaceDate] = useState('2026-05-17');
  const [editRaceName, setEditRaceName] = useState('');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, plansRes] = await Promise.all([
        supabase.from('users').select(`
          id, username, plan_id, race_distance, race_date, race_name, created_at,
          plans:plan_id (name, level)
        `).order('created_at', { ascending: false }),
        supabase.from('plans').select('*')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (plansRes.data) setPlans(plansRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim() || !password) {
      setMessage({ type: 'error', text: 'Usuario y contraseña requeridos' });
      return;
    }

    const result = await createUser(username.trim(), password, planLevel, raceDistance, raceDate, raceName, userRole);
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

      setSelectedUser(user);
      setUserProgress(mergedProgress);
      setShowProgressModal(true);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoadingProgress(false);
      setLoadingUserId(null);
    }
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedUser(null);
    setUserProgress([]);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditRaceDistance(user.race_distance || 7);
    setEditRaceDate(user.race_date || '2026-05-17');
    setEditRaceName(user.race_name || 'Carrera Recreativa');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const { error } = await supabase
      .from('users')
      .update({
        race_distance: editRaceDistance,
        race_date: editRaceDate,
        race_name: editRaceName
      })
      .eq('id', editingUser.id);
    if (!error) {
      setShowEditModal(false);
      setEditingUser(null);
      loadData();
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </main>
    );
  }

  return (
    <main className="flex-1 px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Admin - Gestión de Usuarios</h1>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-foreground/10 hover:bg-foreground/5"
          >
            Cerrar sesión
          </button>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreateUser}
          className="mb-8 p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] space-y-3"
        >
          <h2 className="text-sm font-medium">Crear Nuevo Usuario</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <select
              value={planLevel}
              onChange={(e) => setPlanLevel(e.target.value as any)}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="pro">Pro</option>
            </select>
            <select
              value={raceDistance}
              onChange={(e) => setRaceDistance(parseInt(e.target.value) as 7 | 11)}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            >
              <option value={7}>7 km</option>
              <option value={11}>11 km</option>
            </select>
            <input
              type="date"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              placeholder="Nombre carrera"
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as 'user' | 'admin')}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Crear Usuario
          </button>

          {message && (
            <p className={`text-xs ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </motion.form>

        <div className="space-y-2">
          <h2 className="text-sm font-medium mb-3">Usuarios Registrados ({users.length})</h2>
          {users.length === 0 ? (
            <p className="text-sm text-foreground/50">No hay usuarios registrados</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-foreground/10 bg-foreground/[0.02]"
              >
                <div>
                  <p className="text-sm font-medium">
                    {user.username}
                    {user.role === 'admin' && <span className="ml-2 text-xs text-yellow-500">⭐ Admin</span>}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Plan: {user.plans?.name || 'Sin plan'} | {user.race_distance || 7}km | {user.race_name || 'Carrera'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-xs px-2 py-1 rounded text-yellow-500 hover:bg-yellow-500/10"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setLoadingUserId(user.id);
                      loadUserProgress(user.id);
                    }}
                    className="text-xs px-2 py-1 rounded text-blue-500 hover:bg-blue-500/10"
                    disabled={loadingUserId !== null}
                  >
                    {loadingUserId === user.id ? '...' : 'Ver Progreso'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-500/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02]">
          <h2 className="text-sm font-medium mb-3">Estadísticas Generales</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-xs text-foreground/50">Total Usuarios</p>
              <p className="text-lg font-semibold">{users.length}</p>
            </div>
            {plans.map(plan => (
              <div key={plan.id} className="p-3 rounded-lg bg-background">
                <p className="text-xs text-foreground/50">{plan.name}</p>
                <p className="text-lg font-semibold">
                  {users.filter(u => u.plan_id === plan.id).length}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showProgressModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeProgressModal}
        >
          <div 
            className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
                <p className="text-sm text-foreground/50">Plan: {selectedUser.plans?.name}</p>
              </div>
              <button onClick={closeProgressModal} className="text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-lg border border-foreground/10 text-center">
                <p className="text-xs text-foreground/50">Sesiones</p>
                <p className="text-lg font-semibold">{userProgress.length}</p>
              </div>
              <div className="p-3 rounded-lg border border-foreground/10 text-center">
                <p className="text-xs text-foreground/50">Completadas</p>
                <p className="text-lg font-semibold text-green-500">
                  {userProgress.filter(s => s.completed).length}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-foreground/10 text-center">
                <p className="text-xs text-foreground/50">Distancia</p>
                <p className="text-lg font-semibold">
                  {userProgress.filter(s => s.completed).reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0).toFixed(1)} km
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Detalle de Sesiones</h3>
              {userProgress.map(session => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border ${session.completed ? 'border-green-500/20 bg-green-500/5' : 'border-foreground/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">
                        Sesión {session.sessionOrder}: {session.workout}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {session.date} | {session.distance} km | {session.targetPace}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${session.completed ? 'bg-green-500/10 text-green-500' : 'bg-foreground/5 text-foreground/50'}`}>
                      {session.completed ? 'Completada' : 'Pendiente'}
                    </span>
                  </div>
                  {session.completed && (session.actualTime || session.actualPace) && (
                    <div className="mt-2 pt-2 border-t border-foreground/5 text-xs text-foreground/70">
                      {session.actualTime && <p>Tiempo: {session.actualTime}</p>}
                      {session.actualPace && <p>Ritmo: {session.actualPace}</p>}
                      {session.feeling && <p>Sensación: {'⭐'.repeat(session.feeling)}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeEditModal}
        >
          <div 
            className="bg-background rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Editar Usuario</h2>
              <button onClick={closeEditModal} className="text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </div>
            <p className="text-sm text-foreground/50 mb-4">Usuario: {editingUser.username}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-foreground/50 block mb-1">Distancia</label>
                <select
                  value={editRaceDistance}
                  onChange={(e) => setEditRaceDistance(parseInt(e.target.value) as 7 | 11)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                >
                  <option value={7}>7 km</option>
                  <option value={11}>11 km</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-foreground/50 block mb-1">Fecha de Carrera</label>
                <input
                  type="date"
                  value={editRaceDate}
                  onChange={(e) => setEditRaceDate(e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-foreground/50 block mb-1">Nombre de la Carrera</label>
                <input
                  type="text"
                  value={editRaceName}
                  onChange={(e) => setEditRaceName(e.target.value)}
                  className="w-full rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={handleUpdateUser}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 mt-2"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
