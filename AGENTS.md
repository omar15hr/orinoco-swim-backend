# Sistema de Reservas — Clases de Natación

## ¿De qué va el proyecto?

Plataforma para gestionar la reserva de horas de clases de natación en una academia con **3 sedes** en Chile. El sistema resuelve un problema operativo concreto: coordinar qué alumno puede entrar a qué clase, en qué sede, validando que tenga acceso vigente (pago al día) y que no exceda la cantidad de clases que su plan le permite al mes.

Existen dos roles que interactúan con el sistema: **Administrador** y **Alumno**. El administrador tiene control total de la operación (alumnos, pagos, reservas, horarios); el alumno tiene un rol acotado: reservar y confirmar sus propias clases.

El negocio funciona bajo un ciclo **mensual y manual**: el alumno paga la mensualidad por fuera de la plataforma (efectivo, transferencia, etc.), y el administrador es quien registra ese pago y habilita el acceso dentro del sistema. No hay pasarela de pago ni automatización de cobro.

---

## Roles y funcionalidades

### Administrador

**Gestión de alumnos**

- Crear, editar y eliminar alumnos. Los alumnos **no se registran solos** — toda cuenta nace de una acción del administrador.
- Asignar a cada alumno: un plan (cantidad de clases mensuales) y las sedes a las que tiene acceso (un alumno puede tener acceso a 1, 2 o las 3 sedes).
- Habilitar o deshabilitar el acceso de un alumno a la plataforma.
- Confirmar o quitar la confirmación del pago mensual de un alumno.
- Acciones masivas: habilitar a todos, deshabilitar a todos, confirmar pago a todos, quitar confirmación de pago a todos.
- Buscar/filtrar alumnos por nombre y por RUT.

**Gestión de reservas**

- Ver todas las reservas de todos los alumnos.
- Crear una reserva en nombre de un alumno.
- Modificar o eliminar (cancelar) una reserva existente.
- Crear una "clase de prueba" — una reserva especial para alguien que quiere probar antes de inscribirse. Puede asignarla a un alumno ya existente o crear una cuenta nueva en el mismo momento, sin pasar por el flujo normal de alta.

**Visibilidad operativa (dashboard)**

- Total de alumnos registrados.
- Total de alumnos habilitados (con acceso activo).
- Total de alumnos con pago confirmado en el mes actual.
- Total de alumnos sin pago confirmado.
- Vista de calendario: sede, horario, cupos disponibles, y una etiqueta visual de "disponible" o "sin cupos".
- Ocupación por sede (cuántos cupos usados/disponibles tiene cada sede).
- Vista de horarios disponibles, pensada específicamente para ubicar dónde crear una clase de prueba.
- Tabla de alumnos con: nombre, correo, estado de pago, estado de habilitación, sedes asignadas, un switch para habilitar/deshabilitar directo desde la tabla, y acciones (editar/eliminar).

**Nota de visibilidad importante:** los cupos ocupados/disponibles de cada clase **solo los puede ver el administrador**. El alumno nunca ve cuántos cupos quedan ni cuántos alumnos hay inscritos en una clase — solo si la clase está disponible o no.

### Alumno

- Ver y editar algunos de sus propios datos (no todos — campos como plan, sedes asignadas o estado de habilitación son de solo lectura para el alumno, los gestiona exclusivamente el admin).
- Ver sus propias reservas.
- Reservar una clase, dentro de las sedes que tiene asignadas y mientras no exceda el límite de su plan para ese mes.
- Confirmar una reserva — el botón de confirmar solo se habilita **el mismo día** de la clase, no antes.
- **No puede cancelar una reserva por sí mismo.** Si necesita cancelar, debe ser el administrador quien la cancele. Una vez cancelada por el admin, el alumno puede volver a reservar normalmente, excepto esa instancia exacta (mismo horario y misma fecha) que le fue cancelada — esa no se puede volver a tomar.

---

## Lógica de negocio

### Ciclo de vida de una reserva (estados)

Una reserva pasa por los siguientes estados:

1. **Reservada** — el alumno agendó la clase.
2. **Confirmada** — el alumno confirmó su asistencia, dentro de la ventana permitida.
3. **Asistió** — se asigna automáticamente en el momento en que la confirmación se realiza correctamente (no es un estado posterior que alguien marca a mano).
4. **No asistió** — se asigna automáticamente si llegó la clase y el alumno nunca confirmó a tiempo.
5. **Cancelada** — el administrador canceló la reserva manualmente.

### Regla de confirmación (las 5 horas)

El alumno debe confirmar su asistencia **con al menos 5 horas de anticipación** al inicio de la clase. Si confirma dentro de ese margen, la reserva pasa a "asistió". Si llega el momento de la clase y nunca confirmó (o confirmó fuera de tiempo, es decir, faltando menos de 5 horas), la reserva pasa automáticamente a "no asistió".

Adicionalmente, el botón de confirmación solo se habilita el **mismo día** de la clase — un alumno no puede confirmar con una semana de anticipación, aunque técnicamente cumpliera la regla de las 5 horas.

### Liberación de cupo

Cuando una reserva pasa a "no asistió", el cupo que ocupaba se libera y queda disponible para que cualquier otro alumno lo reserve.

### Cancelación por el administrador

Cuando el administrador cancela una reserva:

- El cupo se libera (otros alumnos pueden tomarlo).
- Esa instancia específica — la combinación exacta de horario y fecha — queda bloqueada únicamente para el alumno al que se le canceló. El alumno puede seguir reservando con normalidad cualquier otro horario o fecha, solo no puede volver a tomar esa instancia puntual.

### Plan y límite mensual de clases

- Cada alumno tiene asignado un plan (ej. "4 clases al mes", "8 clases al mes", "12 clases al mes"). Los planes existentes son fijos, definidos desde el inicio del proyecto.
- El plan determina cuántas reservas puede hacer ese alumno **dentro del mes actual**.
- Las clases no utilizadas **no se acumulan** al mes siguiente — el conteo de uso nace en cero cada nuevo mes.
- El plan asignado a un alumno es **permanente** — no cambia ni se reinicia entre meses. Lo único que cambia mes a mes es si está habilitado o no, y si tiene el pago confirmado o no.

### Pago y habilitación — dos acciones independientes

- El pago se realiza **por fuera de la plataforma**, mensualmente.
- "Pago confirmado" y "habilitado" son dos campos separados, gestionados manualmente por el administrador, **no automáticos entre sí**.
- Existe una regla de dependencia: el sistema **no permite habilitar a un alumno si no tiene el pago del mes actual confirmado**. Es decir, confirmar el pago no habilita automáticamente, pero habilitar sin pago confirmado no está permitido.
- Al cierre de cada mes, es el administrador quien decide deshabilitar a los alumnos (manualmente, no hay automatización por fecha) hasta que vuelvan a pagar y se les confirme el pago del nuevo periodo.

### Sedes y acceso

- Existen 3 sedes, cada una con sus propios horarios. Las sedes son fijas, definidas desde el inicio del proyecto.
- Cada alumno tiene acceso únicamente a las sedes que el administrador le asignó — puede ver y reservar solo en esas, no en las otras.

### Horarios de clases

- Los horarios (día, hora, sede, cupo máximo) son configurados de antemano por el administrador.
- El alumno solo elige entre los horarios ya existentes — no puede crear ni modificar horarios.
- El cupo disponible de un horario en una fecha específica se calcula como: cupo máximo menos la cantidad de reservas activas (reservada, confirmada o asistió) para esa fecha puntual.

### Clases de prueba

- El administrador puede generar una reserva de "clase de prueba" para alguien interesado en probar el servicio.
- Puede asociarla a un alumno que ya existe en el sistema, o crear una cuenta nueva en el mismo flujo si la persona aún no está registrada.

---

## Resumen de quién puede hacer qué

| Acción                                           | Admin                      | Alumno                                          |
| ------------------------------------------------ | -------------------------- | ----------------------------------------------- |
| Crear cuenta de alumno                           | ✅                         | ❌ (no se autoregistra)                         |
| Editar datos de un alumno (plan, sedes, etc.)    | ✅                         | ❌                                              |
| Editar sus propios datos básicos                 | —                          | ✅ (campos limitados)                           |
| Habilitar/deshabilitar acceso                    | ✅                         | ❌                                              |
| Confirmar/quitar pago                            | ✅                         | ❌                                              |
| Ver cupos ocupados/disponibles (números exactos) | ✅                         | ❌ (solo ve disponible/no disponible)           |
| Crear una reserva                                | ✅ (para cualquier alumno) | ✅ (solo para sí mismo)                         |
| Confirmar una reserva                            | ❌                         | ✅ (solo el mismo día, con 5h+ de anticipación) |
| Cancelar una reserva                             | ✅                         | ❌                                              |
| Crear horarios de clases                         | ✅                         | ❌                                              |
| Crear clases de prueba                           | ✅                         | ❌                                              |
