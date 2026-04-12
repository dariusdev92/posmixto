# Arquitectura del Proyecto

Este proyecto Angular sigue una arquitectura modular y escalable, diseñada para desacoplar responsabilidades y facilitar su mantenimiento.

## Estructura de Directorios

- `src/app/core/`: 
  - Contiene los **servicios singleton**, guardas, inyectores, interceptores y toda la configuración global.
  - Solo debe importarse una única vez en el `AppModule` (o equivalente a nivel aplicación).
  - *No* debe contener declaraciones de componentes de vista (UI).

- `src/app/shared/`:
  - Contiene componentes, directivas, y utilidades visuales reusables (ej. datatables, modales genéricos, botones customizados).
  - Importado en los distintos módulos de `features` que los requieran.
  - Aislado por completo del dominio del negocio y de la lógica de servicios específicos.

- `src/app/features/`:
  - Código específico por dominio de negocio de la aplicación (ej: `generala`, `truco`, `home`).
  - Cada *feature* asume el control de su propia lógica de presentación y flujo, y se encarga de acoplar la UI de `shared` con los servicios de `core`.

- `src/styles/`:
  - Directorio exclusivo para alojar las variables globales, temas y estilos generales, promoviendo una arquitectura de estilos limpia.

## Path Aliases en TypeScript

El proyecto tiene soporte para *paths* absolutos definidos en TS usando referencias como `@shared/*`, `@features/*`, etc., para garantizar importaciones limpias e independientes de su profundidad en la estructura de carpetas.
