-- =============================================================================
-- Cleanup: Borrar todos los usuarios no-admin y sus datos asociados
-- =============================================================================
-- PELIGRO: Esto es destructivo. Solo correr en dev/staging.
--
-- Paso 1: Revisá el preview (queries de solo lectura) y verificá que:
--   - Haya al menos un admin en public.users (role='admin' AND is_active=true)
--   - Los counts del preview sean los esperados
--
-- Paso 2: Descomentar el bloque BEGIN/COMMIT y correr el DELETE.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Safety check: debe haber al menos un admin activo.
-- -----------------------------------------------------------------------------
SELECT id, username, email, role, is_active
FROM public.users
WHERE role = 'admin' AND is_active = true;

-- Si la query de arriba devuelve 0 filas, PARÁ. No seguir.

-- -----------------------------------------------------------------------------
-- 1) Preview: usuarios que se van a borrar.
-- -----------------------------------------------------------------------------
SELECT id, username, email, role, is_active, created_at
FROM public.users
WHERE NOT (role = 'admin' AND is_active = true)
ORDER BY created_at DESC;

-- -----------------------------------------------------------------------------
-- 2) Preview: cantidad de filas a borrar por tabla.
-- -----------------------------------------------------------------------------
SELECT 'public.user_profiles'       AS tabla, COUNT(*) AS filas
  FROM public.user_profiles
  WHERE id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.user_plans',
  COUNT(*) FROM public.user_plans
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.user_progress',
  COUNT(*) FROM public.user_progress
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.notifications',
  COUNT(*) FROM public.notifications
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.race_results',
  COUNT(*) FROM public.race_results
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.user_achievements',
  COUNT(*) FROM public.user_achievements
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.audit_logs (actor no-admin)',
  COUNT(*) FROM public.audit_logs
  WHERE admin_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true)
UNION ALL
SELECT 'public.users (no-admin)',
  COUNT(*) FROM public.users
  WHERE NOT (role = 'admin' AND is_active = true)
UNION ALL
SELECT 'auth.identities (no-admin)',
  COUNT(*) FROM auth.identities
  WHERE user_id IN (SELECT id FROM public.users WHERE NOT (role = 'admin' AND is_active = true))
UNION ALL
SELECT 'auth.users (no-admin)',
  COUNT(*) FROM auth.users
  WHERE id IN (SELECT id FROM public.users WHERE NOT (role = 'admin' AND is_active = true));

-- =============================================================================
-- 3) DELETE: solo correr después de revisar los counts de arriba.
-- =============================================================================
-- Descomentar el bloque siguiente para ejecutar.

/*
BEGIN;

-- Hijos de public.users primero (para evitar violaciones de FK).
DELETE FROM public.user_profiles
  WHERE id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.user_plans
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.user_progress
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.notifications
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.race_results
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.user_achievements
  WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

DELETE FROM public.audit_logs
  WHERE admin_id NOT IN (SELECT id FROM public.users WHERE role = 'admin' AND is_active = true);

-- Padres: public.users no-admin.
DELETE FROM public.users
  WHERE NOT (role = 'admin' AND is_active = true);

-- auth.users no-admin (CASCADE borra auth.identities asociado).
DELETE FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.users);

-- Belt-and-suspenders: orphan identities por si el CASCADE no dispara.
DELETE FROM auth.identities
  WHERE user_id NOT IN (SELECT id FROM auth.users);

COMMIT;
*/

-- =============================================================================
-- 4) Verificación post-borrado (correr después del DELETE).
-- =============================================================================
/*
SELECT COUNT(*) AS public_users_no_admin
  FROM public.users
  WHERE NOT (role = 'admin' AND is_active = true);

SELECT COUNT(*) AS auth_users_no_admin
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.users);

SELECT COUNT(*) AS orphan_identities
  FROM auth.identities
  WHERE user_id NOT IN (SELECT id FROM auth.users);
*/
