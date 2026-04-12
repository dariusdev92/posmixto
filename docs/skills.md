# Registro de Skills ("Knowledge Items")

Este archivo guarda un registro de los flujos de trabajo, componentes o *skills* ya implementados o que se resolvieron previamente a lo largo de las fases de desarrollo. Sirve de documentación viva para asegurar que la inteligencia base sepa re-utilizar la lógica establecida frente a nuevos requerimientos.

## Persistencia de Estado (Storage y Sesiones)
- Todos los juegos de anotar (Truco, Generala) **deben mantener y persistir su estado general** para evitar pérdidas de progreso en caso de Cierre, Refresh o Navegación en la PWA.
- La abstracción requerida se aplica usando el singleton `GameSessionService` alojado en `common/services/`.
- El servicio de estado de la feature (ej: `TrucoService`, `GeneralaStateService`) carga en su iniciación con `loadGame`, modifica su memoria en la UI, y guarda transparentemente hacia `saveGame`. Solo vuelve al estado inicial mediante uso explícito del botón "Reiniciar", invocando a `clearGame`.

## Componentes y Dominio
1. **Generala e interfaces Drag & Drop**:
   - Reestructurado usando Spartan NG Primitives.
   - Reorganizado con Tailwind CSS (Ej config: *Spartan Card Directive* para la cuadrícula y las celdas de puntuación).
   - Componentes dinámicos resueltos para el modal y los diálogos (usando Spartan u alternativas provistas por CDK si Spartan está limitado).

2. **Truco Scorekeeper UI ("Anotador")**:
   - **Lógica Divisoria**: Pantalla dividida en "malas" (primeras 15) y "buenas" (últimas 15).
   - **Renderizado Visual**: Implementación mediante "palitos" agrupados cada 5 para llevar el score tradicional, resolviendo la abstracción matemática a su visualización semántica sin necesidad de etiquetas superfluas.
   - **Grillas**: Desarrollado sobre CSS Grid para escalar eficientemente a cualquier dispositivo.

3. **Shared Datatable Component**:
   - Resuelto e implementado en `shared/datatable`.
   - Se provee base funcional mediante `datatable-base`. Debe ser utilizada como un pilar fundamental para listar interfaces que exhiban reportes o grids estructurados similares.
