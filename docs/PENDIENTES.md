# RunPlan Pro - Features Pendientes

> Último actualizado: 2026-05-01
> Status: Implementaciones Completadas y Pendientes

---

## ✅ Features Implementados (Recientes)

### 1. Datepicker para Fecha de Carrera
**Prioridad:** ALTA
**Status:** ✅ COMPLETADO
**Fecha:** 2026-05-01

#### Descripción
Se agregó `react-datepicker` al quiz de onboarding para seleccionar la fecha de la carrera de forma más intuitiva.

#### Cambios Realizados
- [x] Instalar `react-datepicker` (ya existía en package.json)
- [x] Importar DatePicker y CSS en onboarding
- [x] Reemplazar input nativo con DatePicker
- [x] Configurar minDate, locale, formato

#### Archivos Modificados
- `src/app/onboarding/page.tsx`

---

### 2. Link de Editar Perfil en Plan
**Prioridad:** ALTA
**Status:** ✅ COMPLETADO
**Fecha:** 2026-05-01

#### Descripción
Se agregó botón de "Perfil" en el header del plan para acceder a la página de perfil y editar información.

#### Cambios Realizados
- [x] Agregar botón Perfil junto al botón Salir
- [x] Icono de usuario con link a /profile
- [x] Responsive en desktop y mobile

#### Archivos Modificados
- `src/components/PlanHeader.tsx`

---

### 3. Algoritmo Prioritario sobre Plantillas Estáticas
**Prioridad:** ALTA - CRÍTICA
**Status:** ✅ COMPLETADO
**Fecha:** 2026-05-01

#### Descripción
Se refactorizó `generateTrainingPlan` para que cuando el usuario tiene datos de perfil (completó el quiz), se use el algoritmo de generación dinámica en lugar de las plantillas estáticas de Supabase.

#### Problema Original
- El sistema buscaba plantillas estáticas en `training_sessions` PRIMERO
- Si existían, las usaba ignorando el perfil del usuario
- La fecha de carrera y otros datos del quiz NO se usaban

#### Solución Implementada
1. **Prioridad al algoritmo:** Si `profile.experience_level` existe, usar algoritmo
2. **Fallback a plantillas:** Solo si NO hay perfil (usuario no completó quiz)
3. **Datos dinámicos:** Fechas calculadas según `raceDate` del usuario
4. **Personalización:** Distancias, ritmos y tipos de workout según perfil

#### Archivos Modificados
- `src/lib/training-plan.ts`

#### Flujo Nuevo
```
[Quiz] → Guarda perfil en user_profiles
              ↓
[Plan Page] → loadUserProfile(userId)
              ↓
         ¿Tiene perfil?
           ↓ SÍ          ↓ NO
    Usar ALGORITMO    Buscar plantillas
    (genera dinámico)   (fallback)
```

---

## 🔧 Próximos Pasos Sugeridos

1. **Probar flujo completo:** Registro → Login → Quiz → Verificar plan generado
2. **Eliminar plantillas estáticas de Supabase:** Si ya no se necesitan
3. **Validar planes:** Verificar que los planes generados son apropiados para cada nivel

---

## Features que Pueden Esperar

### 1. Avatar de Perfil
**Prioridad:** BAJA
**Status:** PENDIENTE
**Bloqueado por:** Configuración de Storage en Supabase

#### Descripción
Permitir a los usuarios subir una foto de perfil que se muestre en:
- Header de la aplicación
- Página de perfil
- Estadísticas de progreso

#### Requisitos Previos
- [ ] Configurar bucket de storage en Supabase
- [ ] Crear políticas de acceso (RLS)
- [ ] Implementar componente de upload
- [ ] Manejar redimensionamiento de imágenes
- [ ] Agregar campo `avatar_url` a tabla `users`

#### Notas
- Usar Supabase Storage para alojar imágenes
- Máximo 5MB por imagen
- Formatos: JPG, PNG, WebP
- Mostrar avatar placeholder si no hay imagen

---

### 2. Recuperación de Contraseña
**Prioridad:** MEDIA
**Status:** PENDIENTE
**Bloqueado por:** Configuración de email en Supabase

#### Descripción
Flujo completo de recuperación de contraseña:
1. Usuario solicita recuperación
2. Se envía email con token
3. Usuario ingresa nueva contraseña
4. Se actualiza la contraseña

#### Requisitos Previos
- [ ] Configurar SMTP en Supabase
- [ ] Crear página de solicitud de recuperación
- [ ] Crear página de nueva contraseña
- [ ] Implementar lógica de validación de token

---

### 3. Notificaciones Push
**Prioridad:** BAJA
**Status:** PENDIENTE

#### Descripción
Enviar notificaciones al usuario:
- Recordatorio de entrenamientos
- Logros desbloqueados
- Actualizaciones de progreso

#### Requisitos Previos
- [ ] Configurar Firebase Cloud Messaging o similar
- [ ] Solicitar permisos de notificación
- [ ] Almacenar tokens de dispositivo
- [ ] Implementar lógica de envío

---

### 4. Modo Offline
**Prioridad:** BAJA
**Status:** PENDIENTE

#### Descripción
Permitir acceso al plan sin conexión:
- Cache de sesiones de entrenamiento
- Sincronización al reconectar
- Indicador de estado de conexión

#### Requisitos Previos
- [ ] Implementar Service Worker
- [ ] Usar IndexedDB para almacenamiento local
- [ ] Crear lógica de sincronización
- [ ] Manejar conflictos de datos

---

### 5. Estadísticas Avanzadas
**Prioridad:** MEDIA
**Status:** PENDIENTE

#### Descripción
Métricas adicionales de progreso:
- Gráficos de kilometraje semanal
- Evolución de pace
- Comparación entre períodos
- Predicciones de rendimiento

#### Requisitos Previos
- [ ] Agregar librería de gráficos (Chart.js, Recharts)
- [ ] Crear componentes de visualización
- [ ] Implementar cálculos estadísticos
- [ ] Crear página de estadísticas dedicada

---

### 6. Integración con Dispositivos
**Prioridad:** BAJA
**Status:** PENDIENTE

#### Descripción
Conectar con:
- Garmin Connect
- Apple Health
- Google Fit
- Strava

#### Requisitos Previos
- [ ] Obtener credenciales de APIs
- [ ] Implementar OAuth flows
- [ ] Crear webhooks para sincronización
- [ ] Mapear datos entre formatos

---

### 7. Entrenamiento en Tiempo Real
**Prioridad:** BAJA
**Status:** PENDIENTE

#### Descripción
Durante una sesión de entrenamiento:
- Cronómetro integrado
- Tracking de pace en tiempo real
- Feedback de audio
- Mapa de ruta (GPS)

#### Requisitos Previos
- [ ] Acceso a GPS del dispositivo
- [ ] Integración con Web Audio API
- [ ] Crear UI de entrenamiento
- [ ] Guardar datos de sesión

---

### 8. Social Features
**Prioridad:** BAJA
**Status:** PENDIENTE

#### Descripción
Funcionalidades sociales:
- Compartir progreso en redes
- Rankings entre amigos
- Grupos de entrenamiento
- Eventos comunitarios

#### Requisitos Previos
- [ ] Crear sistema de amigos/seguidores
- [ ] Implementar rankings
- [ ] Crear feed de actividad
- [ ] Integrar APIs de redes sociales

---

## Archivos Relacionados

| Feature | Archivos a Modificar |
|---------|---------------------|
| Avatar | `src/lib/supabase.ts`, `src/components/Header.tsx` |
| Recuperación | `src/app/recover-password/page.tsx`, `src/lib/auth.ts` |
| Notificaciones | `src/lib/notifications.ts`, `src/components/NotificationBell.tsx` |
| Offline | `src/app/sw.js`, `src/lib/offline-storage.ts` |
| Estadísticas | `src/app/stats/page.tsx`, `src/components/Charts.tsx` |
| Integración | `src/lib/integrations/*.ts`, `src/app/settings/page.tsx` |
| Tiempo Real | `src/app/workout/live/page.tsx`, `src/lib/workout-tracker.ts` |
| Social | `src/app/social/page.tsx`, `src/lib/social.ts` |

---

## Notas de Implementación

### Priorización
Los features están priorizados según:
1. **Impacto en usuario** - Cuánto mejora la experiencia
2. **Complejidad** - Cuánto tiempo lleva implementar
3. **Dependencias** - Qué necesita estar listo primero

### Decisiones Técnicas
- **Storage:** Usar Supabase Storage para avatares (más simple que S3)
- **Notificaciones:** Firebase Cloud Messaging para push (amplio soporte)
- **Offline:** Service Workers + IndexedDB (estándar web)
- **Gráficos:** Recharts (basado en D3, más ligero que Chart.js)

### Consideraciones de UX
- Todos los features opcionales deben poder desactivarse
- Los datos offline deben sincronizarse transparente
- Las notificaciones deben ser respetuosas (no spam)
- Los features sociales deben ser opt-in