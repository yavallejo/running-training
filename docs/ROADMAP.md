# RunPlan Pro - Roadmap de Desarrollo

> Último actualizado: 2026-05-01
> Status: En Implementación

---

## Visión General

Sistema de entrenamiento personalizado que adapta los planes de running según el nivel real del corredor, su disponibilidad y objetivos. El sistema debe ser lo suficientemente inteligente para generar planes apropiados sin necesidad de crear templates manuales para cada combinación de parámetros.

---

## Fases de Desarrollo

### Fase 1: Modelo de Datos Extendido ✅ COMPLETADO
**Prioridad:** ALTA
**Estado:** COMPLETED

#### Objetivos
- [x] Tabla `users` con campos básicos (start_date, race_date, race_distance)
- [x] Tabla `user_profiles` con datos de evaluación
- [x] Índices y relaciones en Supabase

#### Campos para `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  current_weekly_km DECIMAL,
  available_days_per_week INTEGER CHECK (available_days_per_week BETWEEN 2 AND 7),
  minutes_per_session INTEGER,
  has_injuries BOOLEAN DEFAULT FALSE,
  injury_description TEXT,
  weight DECIMAL,
  resting_heart_rate INTEGER,
  max_heart_rate INTEGER,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Fase 2: Quiz de Evaluación Inicial ✅ COMPLETADO
**Prioridad:** ALTA
**Estado:** COMPLETED

#### Objetivos
- [x] Crear flujo de onboarding que capture información del usuario antes de generar su plan
- [x] Implementar wizard de 5 pasos
- [x] Integrar con generación de plan automático

#### Preguntas del Quiz

**Paso 1: Experiencia Running**
1. ¿Cuánto tiempo llevas corriendo de forma regular?
2. ¿Cuántos kilómetros correrías aproximadamente por semana?

**Paso 2: Objetivo**
3. ¿Para qué distancia te estás preparando?
4. ¿Cuándo es tu carrera objetivo?
5. ¿Ya tienes nombre para la carrera?

**Paso 3: Disponibilidad**
6. ¿Cuántos días por semana puedes entrenar?
7. ¿Cuánto tiempo tienes disponible por sesión?

**Paso 4: Condiciones Físicas**
8. ¿Tienes alguna lesión o condición médica?

**Paso 5: Confirmación**
- Resumen de datos ingresados
- Botón para generar plan

#### Archivo: `/src/app/onboarding/page.tsx`
- Wizard de 5 pasos con navegación
- Al final: generación de plan automático
- Guardado en `user_profiles` y actualización de `users`

#### Lógica de Asignación de Nivel
```typescript
function calculateExperienceLevel(timeRunning: string, weeklyKm: number): string {
  const isBeginner = timeRunning === 'never' || timeRunning === 'less-3-months' || weeklyKm < 10;
  const isAdvanced = (timeRunning === 'more-1-year' || timeRunning === '6-12-months') && weeklyKm >= 30;
  
  if (isBeginner) return 'beginner';
  if (isAdvanced) return 'advanced';
  return 'intermediate';
}
```

---

### Fase 3: Página de Perfil de Usuario ✅ COMPLETADO
**Prioridad:** MEDIA
**Estado:** COMPLETED

#### Objetivos
- [x] Crear `/profile` page
- [x] Permitir edición de información personal
- [x] Ver estadísticas del plan actual
- [x] Botón para regenerar/recalcular plan

#### Campos Editables
- Nombre de usuario
- Nivel de experiencia
- Kilómetros actuales por semana
- Días disponibles
- Minutos por sesión
- Lesiones/condiciones

#### Diseño
- Card con avatar placeholder (ver PENDIENTES.md)
- Secciones colapsables para cada grupo de datos
- Botón "Guardar Cambios"
- Al guardar, mostrar opción de "Recalcular Plan"

---

### Fase 4: Generación Algorítmica Mejorada ✅ COMPLETADO
**Prioridad:** ALTA
**Estado:** COMPLETED

#### Objetivos
- [x] Reescribir `generateTrainingPlan()` para considerar múltiples variables
- [x] Usar `experience_level` para ajustar intensidades
- [x] Usar `available_days_per_week` para decidir sesiones/semana
- [x] Usar `minutes_per_session` para escalar distancias

#### Tipos de Workout
| Tipo | Intensidad | Descripción |
|------|------------|-------------|
| `easy` | 60-70% HR | Trote conversacional |
| `steady` | 70-80% HR | Ritmo moderado |
| `tempo` | 80-85% HR | Ritmo incómodo pero mantenible |
| `intervals` | 85-95% HR | Velocidad con recuperación |
| `long_run` | 70-80% HR | La carrera más larga de la semana |
| `recovery` | 55-65% HR | Caminata/trote muy suave |

#### Algoritmo de Distribución Semanal
```typescript
function generateWeeklyStructure(
  availableDays: number,
  sessionsPerWeek: number,
  level: 'beginner' | 'intermediate' | 'advanced'
): WorkoutType[] {
  const templates = {
    beginner: ['easy', 'intervals', 'long_run'],
    intermediate: ['easy', 'steady', 'intervals', 'long_run', 'recovery'],
    advanced: ['recovery', 'easy', 'tempo', 'steady', 'intervals', 'long_run']
  };

  return templates[level].slice(0, sessionsPerWeek);
}
```

#### Progresión por Semanas
```typescript
function calculateWeeklyProgression(
  currentWeek: number,
  totalWeeks: number,
  targetDistance: number,
  level: string
): WeeklyPlan {
  const progressFactor = currentWeek / totalWeeks;
  
  // Progresión según nivel
  const intensityMultiplier = {
    beginner: 0.7,
    intermediate: 0.8,
    advanced: 0.9
  };

  return {
    easyDistance: targetDistance * 0.3 * (0.6 + progressFactor * 0.3),
    steadyDistance: targetDistance * 0.35 * (0.65 + progressFactor * 0.3),
    tempoDistance: targetDistance * 0.4 * (0.7 + progressFactor * 0.2),
    longRunDistance: targetDistance * (0.4 + progressFactor * 0.5)
  };
}
```

---

### Fase 5: Templates de Admin (Futuro)
**Prioridad:** BAJA
**Estado:** PENDING

#### Objetivos
- [ ] CRUD de templates de workout en admin
- [ ] Posibilidad de override manual de sesiones
- [ ] Biblioteca de wokouts predefinidos

---

### Fase 6: Storage para Avatares (Posterior)
**Prioridad:** BAJA
**Estado:** PENDING

Ver archivo `PENDIENTES.md` para detalles.

---

## Archivos Modificados/Modificados

### Nuevos Archivos
| Archivo | Descripción | Status |
|---------|-------------|--------|
| `src/app/onboarding/page.tsx` | Quiz de evaluación inicial | COMPLETED |
| `src/app/profile/page.tsx` | Página de perfil de usuario | PENDING |
| `docs/ROADMAP.md` | Este documento | COMPLETED |
| `docs/PENDIENTES.md` | Features pendientes | COMPLETED |

### Archivos Modificados
| Archivo | Cambios | Status |
|---------|---------|--------|
| `src/lib/training-plan.ts` | Reescribir generación algorítmica | IN_PROGRESS |
| `src/lib/auth.ts` | Agregar lógica de niveles | COMPLETED |
| `src/app/register/page.tsx` | Redirigir a onboarding | COMPLETED |

---

## Métricas de Éxito

- [x] Usuario puede completar quiz en < 3 minutos
- [ ] Plan se genera en < 2 segundos
- [ ] Plan es apropiado para el nivel (validación manual)
- [ ] Usuario puede editar perfil y recalcular plan
- [x] Sin errores de TypeScript
- [x] Build exitoso

---

## Notas

### Sobre el Algoritmo vs Templates
El enfoque es 80% algoritmo / 20% templates. Esto significa:
- El algoritmo genera la estructura general del plan
- Los templates permiten ajustes finos o sesiones específicas
- El admin puede crear sesiones custom si el algoritmo no cubre algún caso

### Sobre Validación de Planes
Antes de considerar "completado", cada plan generado debe ser validado manualmente por al menos:
1. Un corredor principiante (0-3 meses)
2. Un corredor intermedio (6-12 meses)
3. Un corredor avanzado (1+ año)
4. Para cada distancia (3K, 5K, 7K, 10K, 21K, 42K)