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

  // Formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [planLevel, setPlanLevel] = useState<'beginner' | 'intermediate' | 'pro'>('beginner');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Progreso de usuario
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, plansRes] = await Promise.all([
        supabase.from('users').select(`
          id,
          username,
          plan_id,
          created_at,
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

    const result = await createUser(username.trim(), password, planLevel);
    if (result.success) {
      setMessage({ type: 'success', text: `Usuario ${username} creado exitosamente` });
      setUsername("");
      setPassword("");
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
        .select(`
          id,
          username,
          plan_id,
          plans:plan_id (name)
        `)
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
    }
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedUser(null);
    setUserProgress([]);
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

        {/* Crear usuario */}
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

          <div className="flex gap-3 items-center">
            <select
              value={planLevel}
              onChange={(e) => setPlanLevel(e.target.value as any)}
              className="rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="pro">Pro</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Crear Usuario
            </button>
          </div>

          {message && (
            <p className={`text-xs ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
        </motion.form>

        {/* Lista de usuarios */}
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
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-foreground/50">
                    Plan: {user.plans?.name || 'Sin plan'} | Creado: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadUserProgress(user.id)}
                    className="text-xs px-2 py-1 rounded text-blue-500 hover:bg-blue-500/10"
                    disabled={loadingProgress}
                  >
                    {loadingProgress ? 'Cargando...' : 'Ver Progreso'}
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

        {/* Estadísticas generales */}
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

      {/* Modal de Progreso */}
      {showProgressModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
                <p className="text-sm text-foreground/50">Plan: {selectedUser.plans?.name}</p>
              </div>
              <button onClick={closeProgressModal} className="text-foreground/50 hover:text-foreground">
                ✕
              </button>
            </div>

            {/* Resumen */}
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

            {/* Lista de sesiones */}
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
    </main>
  );
}
